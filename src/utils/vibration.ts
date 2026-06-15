/**
 * Utility for safe Web API hand-tuned device vibration (Haptic Feedback) for mobile users.
 * Bypasses non-browser environments and platforms where navigator.vibrate is unsupported.
 */

// Centralized vibration toggle - checks if vibration is supported and safe to trigger
export const isVibrationSupported = (): boolean => {
  return typeof window !== 'undefined' && 
         typeof window.navigator !== 'undefined' && 
         typeof window.navigator.vibrate === 'function';
};

/**
 * Triggers a simple vibrating pulse.
 * @param durationMs Length of the pulse in milliseconds or vibration pattern array.
 */
export const triggerVibrate = (durationMs: number | number[]): boolean => {
  if (!isVibrationSupported()) return false;
  try {
    window.navigator.vibrate(durationMs);
    return true;
  } catch (e) {
    console.warn("Haptic pulse failed or was blocked by browser policies:", e);
    return false;
  }
};

/**
 * Short, sharp tactical feedback when revealing a regular grid cell.
 * Ultra-short duration minimizes battery drain and avoids muddy tactile overlap.
 */
export const vibrateCellReveal = () => {
  triggerVibrate(15);
};

/**
 * Staggered rhythmic haptic patterns synchronized perfectly with victory fireworks.
 * Pattern sequence: [vibrate, pause, vibrate, pause, ...]
 * Timed precisely to match:
 * - Burst 1 (0ms) -> Vibrate 40ms, Pause 160ms (starts next at 200ms)
 * - Burst 2 (200ms) -> Vibrate 50ms, Pause 170ms (starts next at 420ms)
 * - Burst 3 (420ms) -> Vibrate 50ms, Pause 210ms (starts next at 680ms)
 * - Burst 4 (680ms) -> Vibrate 60ms, Pause 210ms (starts next at 950ms)
 * - Burst 5 (950ms) -> Vibrate 80ms
 */
export const vibrateVictoryTheme = () => {
  const customRhythm = [40, 160, 50, 170, 50, 210, 60, 210, 80];
  triggerVibrate(customRhythm);
};
