#!/usr/bin/env python3
"""Translate selectable English PDF text to Simplified Chinese while preserving pages, images and graphics.

This workflow intentionally does not OCR or modify text embedded inside images. It translates only
selectable/vector text, removes only the original glyphs, and re-inserts Chinese text into the original
text rectangles with automatic font fitting.
"""
from __future__ import annotations

import argparse
import json
import os
import re
import sys
import time
import unicodedata
import uuid
from dataclasses import dataclass, asdict
from pathlib import Path
from typing import Dict, Iterable, List, Optional, Sequence, Tuple

import fitz
import requests


CJK_RE = re.compile(r"[\u3400-\u4dbf\u4e00-\u9fff\uf900-\ufaff]")
LONG_EN_RE = re.compile(r"(?:[A-Za-z][A-Za-z0-9'’.,;:()\[\]/&+\-]*\s+){12,}[A-Za-z][A-Za-z0-9'’.,;:()\[\]/&+\-]*")
URL_RE = re.compile(r"(?:https?://|www\.)\S+", re.I)
EMAIL_RE = re.compile(r"[\w.+-]+@[\w.-]+\.[A-Za-z]{2,}")
DOI_RE = re.compile(r"\b10\.\d{4,9}/[-._;()/:A-Za-z0-9]+", re.I)
PAGE_RE = re.compile(r"^\s*Page\s+(\d+)\s+of\s+(\d+)\s*$", re.I)
ROMAN_RE = re.compile(r"^\s*[ivxlcdm]+\s*$", re.I)
MARKER_RE = re.compile(r"^\s*((?:\d+\)|[A-Z]\.|Q\.|A\.))\s*(.*)$")
NUMBERED_ITEM_RE = re.compile(r"^\s*(\d+\)|[A-Z]\.)\s+(.+)$")
DOTTED_TOC_RE = re.compile(r"^(.*?)(\.{5,})\s*([ivxlcdm]+|\d+)\s*$", re.I)
# Acronyms, legal abbreviations, scientific symbols and alphanumeric identifiers.
# Use an explicit acronym set so ordinary all-caps headings (e.g. FACT SHEET) are still translated.
KNOWN_ACRONYMS = {
    "WIV", "ODNI", "DOE", "FBI", "DARPA", "BSL", "RBD", "NIH", "NIAID", "DIA", "DOJ",
    "FOIA", "CARES", "PPP", "EIDL", "UI", "PRAC", "IG", "ARPA", "SBA", "GAO", "PII",
    "SSN", "DHS", "DHA", "IRS", "DOL", "FFCA", "FPUC", "PEUC", "PUA", "ETA", "CVPR",
    "EIN", "USSS", "HHS", "DNP", "SSA", "DMF", "IT", "WHO", "UN", "CCP", "IHR",
    "SNS", "PPE", "DOD", "CDC", "RCT", "FDA", "EUA", "OWS", "VRBPAC", "GNYHA",
    "NYSDOH", "CMS", "ACIP", "BLA", "ADD", "OVRR", "OSHA", "VAERS", "CBER", "BEST",
    "VSD", "ICAN", "VICP", "PREP", "CICP", "HRSA", "SME", "FOMC", "AFT", "NEA",
    "P3CO", "PPP", "ePPP", "PLA", "IC", "ACE2", "MERS", "SARS", "COVID", "GOF",
    "RPPR", "OSTP", "USG", "NATO", "CODEL", "STAFFDEL", "CEO", "DPM", "MD", "PhD",
    "MPH", "LLP", "CATO", "NYC", "NYS", "WHO", "HIV", "AIDS", "PCR", "mRNA"
}
ACRONYM_ALT = "|".join(sorted((re.escape(x) for x in KNOWN_ACRONYMS), key=len, reverse=True))
ACRONYM_RE = re.compile(
    rf"(?<![A-Za-z0-9])(?:COVID-?19|SARS-?CoV-?2|{ACRONYM_ALT}|[A-Z](?:\.[A-Z])+\.?|[A-Za-z]{{0,10}}\d+[A-Za-z0-9.-]*)(?![A-Za-z0-9])"
)

# Official/consistent translations for repeated institutional and technical terms.
GLOSSARY: Sequence[Tuple[str, str]] = sorted(
    [
        ("Select Subcommittee on the Coronavirus Pandemic", "冠状病毒大流行问题特别小组委员会"),
        ("Committee on Oversight and Accountability", "监督与问责委员会"),
        ("U.S. House of Representatives", "美国众议院"),
        ("United States House of Representatives", "美国众议院"),
        ("Wuhan Institute of Virology", "武汉病毒研究所"),
        ("EcoHealth Alliance, Inc.", "生态健康联盟公司"),
        ("EcoHealth Alliance Inc.", "生态健康联盟公司"),
        ("National Institute of Allergy and Infectious Diseases", "美国国家过敏与传染病研究所"),
        ("U.S. National Institutes of Health", "美国国立卫生研究院"),
        ("National Institutes of Health", "美国国立卫生研究院"),
        ("U.S. Centers for Disease Control and Prevention", "美国疾病控制与预防中心"),
        ("Centers for Disease Control and Prevention", "疾病控制与预防中心"),
        ("U.S. Food and Drug Administration", "美国食品药品监督管理局"),
        ("Food and Drug Administration", "食品药品监督管理局"),
        ("U.S. Department of Health and Human Services", "美国卫生与公众服务部"),
        ("Department of Health and Human Services", "卫生与公众服务部"),
        ("U.S. Small Business Administration", "美国小企业管理局"),
        ("Small Business Administration", "小企业管理局"),
        ("Government Accountability Office", "政府问责局"),
        ("Office of the Director of National Intelligence", "国家情报总监办公室"),
        ("Office of Director of National Intelligence", "国家情报总监办公室"),
        ("Defense Advanced Research Projects Agency", "国防高级研究计划局"),
        ("Federal Bureau of Investigation", "联邦调查局"),
        ("U.S. Department of Energy", "美国能源部"),
        ("Department of Energy", "能源部"),
        ("U.S. Department of Justice", "美国司法部"),
        ("Department of Justice", "司法部"),
        ("U.S. Department of State", "美国国务院"),
        ("Department of State", "国务院"),
        ("World Health Organization", "世界卫生组织"),
        ("Chinese Communist Party", "中国共产党"),
        ("Strategic National Stockpile", "国家战略储备"),
        ("Paycheck Protection Program", "薪资保护计划"),
        ("Economic Injury Disaster Loan Program", "经济损失灾难贷款计划"),
        ("Coronavirus Aid, Relief, and Economic Security Act", "《冠状病毒援助、救济与经济安全法》"),
        ("American Federation of Teachers", "美国教师联合会"),
        ("International Health Regulations", "《国际卫生条例》"),
        ("Freedom of Information Act", "《信息自由法》"),
        ("Operation Warp Speed", "“曲速行动”"),
        ("Emergency Use Authorization", "紧急使用授权"),
        ("Biologics License Application", "生物制品许可申请"),
        ("Vaccine Adverse Event Reporting System", "疫苗不良事件报告系统"),
        ("Countermeasures Injury Compensation Program", "反制措施伤害补偿计划"),
        ("Vaccine Injury Compensation Program", "疫苗伤害补偿计划"),
        ("gain-of-function research", "功能增益研究"),
        ("gain of function research", "功能增益研究"),
        ("gain-of-function", "功能增益"),
        ("gain of function", "功能增益"),
        ("lab leak theory", "实验室泄漏理论"),
        ("lab leak hypothesis", "实验室泄漏假说"),
        ("laboratory leak", "实验室泄漏"),
        ("natural immunity", "自然免疫"),
        ("vaccine mandate", "疫苗强制令"),
        ("vaccine mandates", "疫苗强制令"),
        ("social distancing", "社交距离"),
        ("herd immunity", "群体免疫"),
    ],
    key=lambda x: len(x[0]),
    reverse=True,
)

COVER_OVERRIDES = {
    "AFTER ACTION REVIEW OF THE COVID-19 PANDEMIC:": "COVID-19大流行事后评估：",
    "The Lessons Learned and a Path Forward": "经验教训与前进之路",
    "Final Report of the": "最终报告",
    "Select Subcommittee on the Coronavirus Pandemic": "冠状病毒大流行问题特别小组委员会",
    "Committee on Oversight and Accountability": "监督与问责委员会",
    "U.S. House of Representatives": "美国众议院",
    "December 4, 2024": "2024年12月4日",
}


@dataclass
class TextBlock:
    page_index: int
    block_index: int
    rect: Tuple[float, float, float, float]
    lines: List[str]
    source: str
    font_size: float
    color: Tuple[float, float, float]
    align: int
    line_height: float
    is_bold: bool


@dataclass
class RenderPart:
    source: Optional[str] = None
    literal: Optional[str] = None
    prefix: str = ""
    suffix: str = ""
    separator: str = "\n"


@dataclass
class BlockPlan:
    page_index: int
    block_index: int
    parts: List[RenderPart]
    mode: str


@dataclass
class LayoutIssue:
    page: int
    block: int
    source: str
    translation: str
    rect: Tuple[float, float, float, float]
    final_font_size: float
    reason: str


def clean_line(raw: str) -> str:
    return re.sub(r"\s+", " ", raw).strip()


def join_pdf_lines(lines: Sequence[str]) -> str:
    out: List[str] = []
    for raw in lines:
        line = clean_line(raw)
        if not line:
            continue
        if out and out[-1].endswith("-") and line and line[0].islower():
            out[-1] = out[-1][:-1] + line
        else:
            out.append(line)
    text = " ".join(out)
    text = re.sub(r"\s+([,.;:!?])", r"\1", text)
    return re.sub(r"\s+", " ", text).strip()


def int_color_to_rgb(value: int) -> Tuple[float, float, float]:
    value = int(value or 0)
    return ((value >> 16 & 255) / 255.0, (value >> 8 & 255) / 255.0, (value & 255) / 255.0)


def infer_alignment(block: dict) -> int:
    lines = block.get("lines") or []
    if not lines:
        return 0
    bx0, _, bx1, _ = block["bbox"]
    width = max(1.0, bx1 - bx0)
    line_boxes = [fitz.Rect(line["bbox"]) for line in lines if line.get("spans")]
    if not line_boxes:
        return 0
    left = sum(r.x0 - bx0 for r in line_boxes) / len(line_boxes)
    right = sum(bx1 - r.x1 for r in line_boxes) / len(line_boxes)
    if left > 0.10 * width and right > 0.10 * width and abs(left - right) < 0.15 * width:
        return 1
    if left > 0.20 * width and right < 0.05 * width:
        return 2
    return 0


def extract_blocks(doc: fitz.Document) -> List[TextBlock]:
    result: List[TextBlock] = []
    for page_index, page in enumerate(doc):
        data = page.get_text("dict", flags=fitz.TEXTFLAGS_DICT)
        for block_index, block in enumerate(data.get("blocks", [])):
            if block.get("type") != 0:
                continue
            lines: List[str] = []
            spans: List[dict] = []
            for line in block.get("lines", []):
                text = "".join(span.get("text", "") for span in line.get("spans", []))
                if text.strip():
                    lines.append(clean_line(text))
                spans.extend(line.get("spans", []))
            source = join_pdf_lines(lines)
            if not source:
                continue
            rect = fitz.Rect(block["bbox"])
            if rect.width < 0.5 or rect.height < 0.5:
                continue
            sizes = [float(s.get("size", 10.0)) for s in spans if s.get("text", "").strip()]
            font_size = max(sizes) if sizes else 10.0
            dominant = max(spans, key=lambda s: len(s.get("text", ""))) if spans else None
            color = int_color_to_rgb(dominant.get("color", 0) if dominant else 0)
            is_bold = any("bold" in str(s.get("font", "")).lower() for s in spans)
            line_count = max(1, len(lines))
            observed = rect.height / line_count
            line_height = min(1.28, max(0.88, observed / max(font_size, 1.0)))
            result.append(
                TextBlock(
                    page_index=page_index,
                    block_index=block_index,
                    rect=(rect.x0, rect.y0, rect.x1, rect.y1),
                    lines=lines,
                    source=source,
                    font_size=font_size,
                    color=color,
                    align=infer_alignment(block),
                    line_height=line_height,
                    is_bold=is_bold,
                )
            )
    return result


def split_sentences(text: str, max_chars: int = 3400) -> List[str]:
    if len(text) <= max_chars:
        return [text]
    pieces = re.split(r"(?<=[.!?;:])\s+", text)
    chunks: List[str] = []
    current = ""
    for piece in pieces:
        piece = piece.strip()
        if not piece:
            continue
        hard_parts = [piece[i : i + max_chars] for i in range(0, len(piece), max_chars)]
        for item in hard_parts:
            candidate = item if not current else f"{current} {item}"
            if len(candidate) <= max_chars:
                current = candidate
            else:
                if current:
                    chunks.append(current)
                current = item
    if current:
        chunks.append(current)
    return chunks or [text]


def make_qa_plan(lines: Sequence[str]) -> List[RenderPart]:
    parts: List[RenderPart] = []
    i = 0
    while i < len(lines):
        line = lines[i]
        if line in {"Q.", "A."}:
            marker = "问：" if line == "Q." else "答："
            i += 1
            collected: List[str] = []
            while i < len(lines) and lines[i] not in {"Q.", "A.", "***"}:
                collected.append(lines[i])
                i += 1
            source = join_pdf_lines(collected)
            parts.append(RenderPart(source=source or None, literal=None if source else marker, prefix=marker if source else "", separator="\n"))
            continue
        if line == "***":
            parts.append(RenderPart(literal="***", separator="\n"))
        elif ROMAN_RE.match(line) or line.isdigit():
            parts.append(RenderPart(literal=line, separator="\n"))
        else:
            parts.append(RenderPart(source=line, separator="\n"))
        i += 1
    return parts


def make_numbered_plan(lines: Sequence[str]) -> List[RenderPart]:
    parts: List[RenderPart] = []
    pre: List[str] = []
    current_marker: Optional[str] = None
    current_lines: List[str] = []

    def flush_pre() -> None:
        nonlocal pre
        if pre:
            text = join_pdf_lines(pre)
            if text:
                parts.append(RenderPart(source=text, separator="\n"))
            pre = []

    def flush_item() -> None:
        nonlocal current_marker, current_lines
        if current_marker is not None:
            text = join_pdf_lines(current_lines)
            parts.append(RenderPart(source=text or None, literal=current_marker if not text else None, prefix=(current_marker + " ") if text else "", separator="\n"))
        current_marker, current_lines = None, []

    for line in lines:
        m = NUMBERED_ITEM_RE.match(line)
        if m:
            flush_pre()
            flush_item()
            current_marker = m.group(1)
            current_lines = [m.group(2)]
        elif current_marker is not None:
            current_lines.append(line)
        else:
            pre.append(line)
    flush_pre()
    flush_item()
    return parts


def make_toc_plan(lines: Sequence[str]) -> List[RenderPart]:
    parts: List[RenderPart] = []
    for line in lines:
        m = DOTTED_TOC_RE.match(line)
        if m:
            left, dots, pg = m.groups()
            left = left.strip()
            if left:
                parts.append(RenderPart(source=left, suffix=f" {dots} {pg}", separator="\n"))
            else:
                parts.append(RenderPart(literal=f"{dots} {pg}", separator="\n"))
        elif ROMAN_RE.match(line) or re.fullmatch(r"[A-Z]\.", line):
            parts.append(RenderPart(literal=line, separator="\n"))
        else:
            parts.append(RenderPart(source=line, separator="\n"))
    return parts


def make_line_list_plan(lines: Sequence[str]) -> List[RenderPart]:
    parts: List[RenderPart] = []
    for line in lines:
        if ROMAN_RE.match(line) or line.isdigit() or line == "***" or re.fullmatch(r"[A-Z]\.", line):
            parts.append(RenderPart(literal=line, separator="\n"))
            continue
        m = MARKER_RE.match(line)
        if m and m.group(2):
            marker = m.group(1)
            prefix = {"Q.": "问：", "A.": "答："}.get(marker, marker + " ")
            parts.append(RenderPart(source=m.group(2), prefix=prefix, separator="\n"))
        else:
            parts.append(RenderPart(source=line, separator="\n"))
    return parts


def make_plan(block: TextBlock) -> BlockPlan:
    # Cover is precisely typeset and therefore uses reviewed fixed translations.
    if block.page_index == 0 and block.source in COVER_OVERRIDES:
        return BlockPlan(block.page_index, block.block_index, [RenderPart(literal=COVER_OVERRIDES[block.source], separator="")], "cover")

    m = PAGE_RE.match(block.source)
    if m:
        return BlockPlan(block.page_index, block.block_index, [RenderPart(literal=f"第{m.group(1)}页，共{m.group(2)}页", separator="")], "page-number")
    if ROMAN_RE.match(block.source) or block.source.isdigit():
        return BlockPlan(block.page_index, block.block_index, [RenderPart(literal=block.source, separator="")], "literal")

    # Original table of contents occupies PDF pages 4-14.
    if 3 <= block.page_index <= 13 or any(DOTTED_TOC_RE.match(x) for x in block.lines):
        return BlockPlan(block.page_index, block.block_index, make_toc_plan(block.lines), "toc")

    # Preface name lists, hearing lists, interviews and site visits occupy pages 15-37.
    if 14 <= block.page_index <= 36:
        return BlockPlan(block.page_index, block.block_index, make_line_list_plan(block.lines), "line-list")

    if any(x in {"Q.", "A."} for x in block.lines):
        return BlockPlan(block.page_index, block.block_index, make_qa_plan(block.lines), "qa")

    marker_count = sum(1 for x in block.lines if NUMBERED_ITEM_RE.match(x))
    if marker_count >= 2:
        return BlockPlan(block.page_index, block.block_index, make_numbered_plan(block.lines), "numbered-list")

    # Short, list-like blocks are translated line by line; prose remains paragraph-level.
    avg_len = sum(len(x) for x in block.lines) / max(1, len(block.lines))
    if len(block.lines) >= 6 and avg_len <= 42:
        return BlockPlan(block.page_index, block.block_index, make_line_list_plan(block.lines), "short-list")

    paragraph = join_pdf_lines(block.lines)
    chunks = split_sentences(paragraph)
    parts = [RenderPart(source=x, separator=" " if i < len(chunks) - 1 else "") for i, x in enumerate(chunks)]
    return BlockPlan(block.page_index, block.block_index, parts, "paragraph")


def placeholder_token(index: int) -> str:
    return f"ZXQ{index:05d}QXZ"


def protect_text(text: str) -> Tuple[str, Dict[str, str]]:
    mapping: Dict[str, str] = {}
    counter = 0

    def add(value: str) -> str:
        nonlocal counter
        tok = placeholder_token(counter)
        counter += 1
        mapping[tok] = value
        return tok

    # Reviewed glossary first; restore to Chinese after translation.
    for source, target in GLOSSARY:
        pattern = re.compile(re.escape(source), re.I)
        text = pattern.sub(lambda _m, t=target: add(t), text)

    def protect_match(match: re.Match[str]) -> str:
        value = match.group(0)
        if value.startswith("ZXQ") and value.endswith("QXZ"):
            return value
        return add(value)

    for pattern in (URL_RE, EMAIL_RE, DOI_RE, ACRONYM_RE):
        text = pattern.sub(protect_match, text)
    return text, mapping


def restore_text(text: str, mapping: Dict[str, str]) -> str:
    for token, value in mapping.items():
        # Translation engines may insert spaces around or inside alphanumeric placeholders.
        loose = r"\s*".join(map(re.escape, token))
        text = re.sub(loose, lambda _m, v=value: v, text, flags=re.I)
    return text


def postprocess_zh(text: str) -> str:
    text = unicodedata.normalize("NFKC", text).strip()
    text = text.replace("COVID–19", "COVID-19").replace("COVID—19", "COVID-19")
    text = re.sub(r"COVID\s*[-–—]?\s*19", "COVID-19", text, flags=re.I)
    text = re.sub(r"SARS\s*[-–—]?\s*CoV\s*[-–—]?\s*2", "SARS-CoV-2", text, flags=re.I)
    text = re.sub(r"(?<=[\u3400-\u9fff])\s+(?=[\u3400-\u9fff])", "", text)
    text = re.sub(r"\s+([，。；：！？、）》】])", r"\1", text)
    text = re.sub(r"([《【（])\s+", r"\1", text)
    text = re.sub(r"(?<=[\u3400-\u9fff]),(?=[\u3400-\u9fff])", "，", text)
    text = re.sub(r"(?<=[\u3400-\u9fff]);(?=[\u3400-\u9fff])", "；", text)
    text = re.sub(r"\s+", " ", text)
    # Targeted consistency fixes for common engine variants.
    replacements = {
        "武汉病毒学研究所": "武汉病毒研究所",
        "功能获得研究": "功能增益研究",
        "功能增长研究": "功能增益研究",
        "增益功能研究": "功能增益研究",
        "实验室泄露": "实验室泄漏",
        "科罗纳病毒": "冠状病毒",
        "国家卫生研究院": "美国国立卫生研究院",
    }
    for a, b in replacements.items():
        text = text.replace(a, b)
    return text.strip()


class EdgeTranslator:
    AUTH_URL = "https://edge.microsoft.com/translate/auth"
    API_URL = "https://api-edge.cognitive.microsofttranslator.com/translate"

    def __init__(self, cache_path: Path, max_items: int = 50, max_chars: int = 26000) -> None:
        self.cache_path = cache_path
        self.max_items = max_items
        self.max_chars = max_chars
        self.session = requests.Session()
        self.session.headers.update({"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"})
        self.token = ""
        self.token_time = 0.0
        self.cache: Dict[str, str] = {}
        if cache_path.exists():
            try:
                self.cache = json.loads(cache_path.read_text("utf-8"))
            except Exception:
                self.cache = {}

    def refresh_token(self) -> None:
        for attempt in range(8):
            try:
                response = self.session.get(self.AUTH_URL, timeout=40)
                response.raise_for_status()
                self.token = response.text.strip()
                self.token_time = time.time()
                if not self.token:
                    raise RuntimeError("empty translation token")
                return
            except Exception as exc:
                if attempt == 7:
                    raise
                delay = min(30, 2 ** attempt)
                print(f"auth retry {attempt + 1}: {exc}; sleeping {delay}s", flush=True)
                time.sleep(delay)

    def request(self, protected_texts: Sequence[str]) -> List[str]:
        if not self.token or time.time() - self.token_time > 420:
            self.refresh_token()
        params = {"api-version": "3.0", "from": "en", "to": "zh-Hans"}
        body = [{"Text": x} for x in protected_texts]
        for attempt in range(9):
            headers = {
                "Authorization": f"Bearer {self.token}",
                "Content-Type": "application/json",
                "X-ClientTraceId": str(uuid.uuid4()),
            }
            try:
                response = self.session.post(self.API_URL, params=params, headers=headers, json=body, timeout=100)
                if response.status_code in {401, 403}:
                    self.refresh_token()
                    continue
                if response.status_code in {429, 500, 502, 503, 504}:
                    raise RuntimeError(f"translator HTTP {response.status_code}: {response.text[:300]}")
                response.raise_for_status()
                data = response.json()
                if len(data) != len(protected_texts):
                    raise RuntimeError(f"translator returned {len(data)} results for {len(protected_texts)} inputs")
                return [item["translations"][0]["text"] for item in data]
            except Exception as exc:
                if attempt == 8:
                    raise
                delay = min(60, 2 ** attempt)
                print(f"translation retry {attempt + 1}: {exc}; sleeping {delay}s", flush=True)
                time.sleep(delay)
        raise RuntimeError("unreachable")

    def translate_all(self, sources: Sequence[str]) -> Dict[str, str]:
        unique = list(dict.fromkeys(s for s in sources if s and s.strip()))
        pending = [s for s in unique if s not in self.cache]
        print(f"translation units: {len(unique)}; cached: {len(unique)-len(pending)}; pending: {len(pending)}", flush=True)

        prepared: Dict[str, Tuple[str, Dict[str, str]]] = {}
        for source in pending:
            protected, mapping = protect_text(source)
            prepared[source] = (protected, mapping)

        index = 0
        request_no = 0
        while index < len(pending):
            batch_sources: List[str] = []
            batch_protected: List[str] = []
            chars = 0
            while index < len(pending) and len(batch_sources) < self.max_items:
                source = pending[index]
                protected = prepared[source][0]
                if batch_sources and chars + len(protected) > self.max_chars:
                    break
                batch_sources.append(source)
                batch_protected.append(protected)
                chars += len(protected)
                index += 1
            if not batch_sources:
                source = pending[index]
                batch_sources = [source]
                batch_protected = [prepared[source][0]]
                index += 1
            translated = self.request(batch_protected)
            for source, raw in zip(batch_sources, translated):
                restored = restore_text(raw, prepared[source][1])
                final = postprocess_zh(restored)
                if not final:
                    raise RuntimeError(f"empty translation for: {source[:200]}")
                self.cache[source] = final
            request_no += 1
            self.cache_path.write_text(json.dumps(self.cache, ensure_ascii=False, indent=2), "utf-8")
            print(f"translated units: {index}/{len(pending)} (request {request_no}, chars {chars})", flush=True)
            time.sleep(0.18)
        return self.cache


def render_block(plan: BlockPlan, translations: Dict[str, str]) -> str:
    pieces: List[str] = []
    for part in plan.parts:
        if part.literal is not None:
            value = part.literal
        elif part.source is not None:
            value = translations.get(part.source, "")
            if not value:
                raise RuntimeError(f"missing translation: page {plan.page_index + 1}, block {plan.block_index}: {part.source[:200]}")
        else:
            value = ""
        pieces.append(part.prefix + value + part.suffix + part.separator)
    text = "".join(pieces)
    return text.rstrip(" \n")


def fit_and_insert(
    page: fitz.Page,
    rect: fitz.Rect,
    text: str,
    fontname: str,
    start_size: float,
    line_height: float,
    color: Tuple[float, float, float],
    align: int,
    min_size: float = 2.8,
) -> Tuple[float, float]:
    page_rect = page.rect
    r = fitz.Rect(
        max(page_rect.x0, rect.x0 - 0.7),
        max(page_rect.y0, rect.y0 - 0.5),
        min(page_rect.x1, rect.x1 + 0.7),
        min(page_rect.y1, rect.y1 + 1.2),
    )
    hi = max(min_size, start_size)
    lo = min_size
    best_size = lo
    best_rem = -1.0
    lh = max(0.86, min(1.22, line_height))
    for _ in range(15):
        mid = (lo + hi) / 2.0
        shape = page.new_shape()
        rem = shape.insert_textbox(r, text, fontname=fontname, fontsize=mid, lineheight=lh, color=color, align=align)
        if rem >= 0:
            best_size, best_rem = mid, rem
            lo = mid
        else:
            hi = mid
    shape = page.new_shape()
    rem = shape.insert_textbox(r, text, fontname=fontname, fontsize=best_size, lineheight=lh, color=color, align=align)
    shape.commit(overlay=True)
    return best_size, rem


def rebuild_pdf(
    source_pdf: Path,
    output_pdf: Path,
    blocks: Sequence[TextBlock],
    plans: Dict[Tuple[int, int], BlockPlan],
    translations: Dict[str, str],
    regular_font: Path,
    bold_font: Path,
    issues_path: Path,
) -> List[LayoutIssue]:
    doc = fitz.open(source_pdf)
    by_page: Dict[int, List[TextBlock]] = {}
    for block in blocks:
        by_page.setdefault(block.page_index, []).append(block)

    for page_index, page_blocks in by_page.items():
        page = doc[page_index]
        for block in page_blocks:
            page.add_redact_annot(fitz.Rect(block.rect), fill=False, cross_out=False)
        # Remove text only. Keep images and vector graphics unchanged.
        page.apply_redactions(images=0, graphics=0, text=0)

    issues: List[LayoutIssue] = []
    for page_index, page_blocks in by_page.items():
        page = doc[page_index]
        page.insert_font(fontname="NotoCJK", fontfile=str(regular_font), set_simple=False)
        page.insert_font(fontname="NotoCJKBold", fontfile=str(bold_font), set_simple=False)
        for block in page_blocks:
            plan = plans[(block.page_index, block.block_index)]
            translation = render_block(plan, translations)
            fontname = "NotoCJKBold" if block.is_bold else "NotoCJK"
            start_size = block.font_size * (0.98 if block.is_bold else 0.94)
            final_size, remaining = fit_and_insert(
                page,
                fitz.Rect(block.rect),
                translation,
                fontname,
                start_size,
                block.line_height,
                block.color,
                block.align,
            )
            if remaining < -0.01 or final_size < 3.25:
                issues.append(
                    LayoutIssue(
                        page=page_index + 1,
                        block=block.block_index,
                        source=block.source,
                        translation=translation,
                        rect=block.rect,
                        final_font_size=round(final_size, 3),
                        reason="textbox overflow" if remaining < -0.01 else "very small fitted text",
                    )
                )
        if (page_index + 1) % 25 == 0 or page_index + 1 == len(doc):
            print(f"laid out pages: {page_index + 1}/{len(doc)}", flush=True)

    metadata = doc.metadata or {}
    metadata["title"] = "COVID-19大流行事后评估：经验教训与前进之路（中文翻译版）"
    metadata["subject"] = "原报告可选择文本的简体中文翻译；图像内容保持原样"
    metadata["creator"] = "Layout-preserving Chinese translation workflow"
    doc.set_metadata(metadata)
    doc.save(output_pdf, garbage=4, clean=True, deflate=True, deflate_images=True, deflate_fonts=True, use_objstms=1)
    doc.close()
    issues_path.write_text(json.dumps([asdict(x) for x in issues], ensure_ascii=False, indent=2), "utf-8")
    return issues


def verify(
    source_pdf: Path,
    output_pdf: Path,
    blocks: Sequence[TextBlock],
    translations: Dict[str, str],
    quality_path: Path,
) -> dict:
    src = fitz.open(source_pdf)
    out = fitz.open(output_pdf)
    source_image_counts = [len(p.get_images(full=True)) for p in src]
    output_image_counts = [len(p.get_images(full=True)) for p in out]
    pages_chinese = 0
    pages_text = 0
    long_english: List[dict] = []
    samples: Dict[str, str] = {}
    sample_indices = sorted(set([0, 2, 3, 14, 24, 37, 94, 199, 399, len(out) - 1]))
    for i, page in enumerate(out):
        text = unicodedata.normalize("NFKC", page.get_text("text"))
        if text.strip():
            pages_text += 1
        if CJK_RE.search(text):
            pages_chinese += 1
        matches = [m.group(0).strip() for m in LONG_EN_RE.finditer(text)]
        if matches:
            long_english.append({"page": i + 1, "samples": matches[:4]})
        if i in sample_indices:
            samples[str(i + 1)] = text[:2200]

    unit_issues: List[dict] = []
    for source, translated in translations.items():
        letters = len(re.findall(r"[A-Za-z]", source))
        if letters >= 18 and not CJK_RE.search(translated):
            unit_issues.append({"source": source, "translation": translated, "reason": "no Chinese characters"})
    quality = {"unit_issue_count": len(unit_issues), "unit_issues": unit_issues[:500], "pages_with_long_english_sequences": long_english}
    quality_path.write_text(json.dumps(quality, ensure_ascii=False, indent=2), "utf-8")

    report = {
        "source_pages": len(src),
        "output_pages": len(out),
        "page_count_match": len(src) == len(out),
        "source_text_blocks": len(blocks),
        "translation_units": len(translations),
        "pages_with_selectable_text_after": pages_text,
        "pages_with_chinese_text_after": pages_chinese,
        "image_object_counts_match": source_image_counts == output_image_counts,
        "source_image_objects": sum(source_image_counts),
        "output_image_objects": sum(output_image_counts),
        "source_size_bytes": source_pdf.stat().st_size,
        "output_size_bytes": output_pdf.stat().st_size,
        "translation_unit_issue_count": len(unit_issues),
        "pages_with_long_english_sequences_count": len(long_english),
        "sample_pages": samples,
    }
    src.close()
    out.close()
    if not report["page_count_match"]:
        raise RuntimeError("page count mismatch")
    if not report["image_object_counts_match"]:
        raise RuntimeError("image object counts changed")
    if len(unit_issues) > 0:
        raise RuntimeError(f"{len(unit_issues)} translated units contain no Chinese characters")
    return report


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--input", required=True, type=Path)
    ap.add_argument("--output", required=True, type=Path)
    ap.add_argument("--font", required=True, type=Path)
    ap.add_argument("--bold-font", required=True, type=Path)
    ap.add_argument("--work-dir", required=True, type=Path)
    args = ap.parse_args()

    args.work_dir.mkdir(parents=True, exist_ok=True)
    blocks_path = args.work_dir / "text_blocks.json"
    plans_path = args.work_dir / "translation_plans.json"
    cache_path = args.work_dir / "translation_cache.json"
    issues_path = args.work_dir / "layout_issues.json"
    quality_path = args.work_dir / "translation_quality.json"
    verification_path = args.work_dir / "verification.json"

    started = time.time()
    src = fitz.open(args.input)
    blocks = extract_blocks(src)
    src.close()
    blocks_path.write_text(json.dumps([asdict(x) for x in blocks], ensure_ascii=False, indent=2), "utf-8")
    print(f"extracted selectable text blocks: {len(blocks)}", flush=True)

    plans: Dict[Tuple[int, int], BlockPlan] = {}
    units: List[str] = []
    serializable_plans: List[dict] = []
    for block in blocks:
        plan = make_plan(block)
        plans[(block.page_index, block.block_index)] = plan
        serializable_plans.append(asdict(plan))
        for part in plan.parts:
            if part.source:
                for chunk in split_sentences(part.source):
                    # make_plan already splits prose; this is a final safety guard.
                    units.append(chunk)
    plans_path.write_text(json.dumps(serializable_plans, ensure_ascii=False, indent=2), "utf-8")

    # Every plan part is already <= 3400 chars; translate exact part sources.
    exact_units = [part.source for plan in plans.values() for part in plan.parts if part.source]
    translator = EdgeTranslator(cache_path)
    translations = translator.translate_all(exact_units)

    issues = rebuild_pdf(
        args.input,
        args.output,
        blocks,
        plans,
        translations,
        args.font,
        args.bold_font,
        issues_path,
    )
    report = verify(args.input, args.output, blocks, translations, quality_path)
    report["layout_issue_count"] = len(issues)
    report["elapsed_seconds"] = round(time.time() - started, 2)
    verification_path.write_text(json.dumps(report, ensure_ascii=False, indent=2), "utf-8")
    print(json.dumps(report, ensure_ascii=False, indent=2), flush=True)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
