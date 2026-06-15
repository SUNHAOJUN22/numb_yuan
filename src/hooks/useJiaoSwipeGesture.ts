import { useRef, useEffect, RefObject } from 'react';

interface SwipeGestureOptions {
  onSwipeUp?: () => void;
  onSwipeDown?: () => void;
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  threshold?: number; // minimum distance to trigger swipe
}

export function useJiaoSwipeGesture(
  ref: RefObject<HTMLElement | null>,
  options: SwipeGestureOptions
) {
  const {
    onSwipeUp,
    onSwipeDown,
    onSwipeLeft,
    onSwipeRight,
    threshold = 50,
  } = options;

  const swipeStartRef = useRef<{ x: number; y: number; time: number } | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const handlePointerDown = (e: PointerEvent) => {
      // Primary button or touch
      if (e.pointerType === 'mouse' && e.button !== 0) return;
      swipeStartRef.current = {
        x: e.clientX,
        y: e.clientY,
        time: Date.now(),
      };
    };

    const handlePointerUp = (e: PointerEvent) => {
      if (!swipeStartRef.current) return;

      const swipeEnd = {
        x: e.clientX,
        y: e.clientY,
        time: Date.now(),
      };

      const start = swipeStartRef.current;
      const dx = swipeEnd.x - start.x;
      const dy = swipeEnd.y - start.y;
      const dt = swipeEnd.time - start.time;

      swipeStartRef.current = null;

      // Must be a fast swipe (under 500ms)
      if (dt > 800) return; // Allow slightly longer for drag

      if (Math.abs(dx) > Math.abs(dy)) {
        // Horizontal swipe
        if (Math.abs(dx) > threshold) {
          if (dx > 0 && onSwipeRight) onSwipeRight();
          if (dx < 0 && onSwipeLeft) onSwipeLeft();
        }
      } else {
        // Vertical swipe
        if (Math.abs(dy) > threshold) {
          if (dy > 0 && onSwipeDown) onSwipeDown();
          if (dy < 0 && onSwipeUp) onSwipeUp();
        }
      }
    };

    const handlePointerCancel = () => {
      swipeStartRef.current = null;
    };

    // Need to cast owing to TS issue with pointer events sometimes
    el.addEventListener('pointerdown', handlePointerDown as EventListener, { passive: true });
    el.addEventListener('pointerup', handlePointerUp as EventListener, { passive: true });
    el.addEventListener('pointercancel', handlePointerCancel as EventListener, { passive: true });

    return () => {
      el.removeEventListener('pointerdown', handlePointerDown as EventListener);
      el.removeEventListener('pointerup', handlePointerUp as EventListener);
      el.removeEventListener('pointercancel', handlePointerCancel as EventListener);
    };
  }, [ref, options]);
}
