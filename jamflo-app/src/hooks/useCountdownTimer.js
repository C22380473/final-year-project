import { useEffect, useRef, useState } from "react";
export function useCountdownTimer({
  durationMs,
  initialRemainingMs,
  isRunning,
  onFinish,
  exerciseId,
}) {
  const [remainingMs, setRemainingMs] = useState(
    typeof initialRemainingMs === "number" ? initialRemainingMs : durationMs,
  );

  const endAtRef = useRef(null);
  const intervalRef = useRef(null);
  const finishedRef = useRef(false);
  const prevExerciseRef = useRef(exerciseId);

  // Keep latest onFinish without making the interval effect re-run
  const onFinishRef = useRef(onFinish);
  useEffect(() => { onFinishRef.current = onFinish; }, [onFinish]);

  // Capture remainingMs in a ref so we can read it inside the effect
  // without adding it to the dependency array
  const remainingMsRef = useRef(remainingMs);
  useEffect(() => { remainingMsRef.current = remainingMs; }, [remainingMs]);

  // ── Reset when exercise changes or a restored value arrives ──────────────
  useEffect(() => {
    const next =
      typeof initialRemainingMs === "number" ? initialRemainingMs : durationMs;

    setRemainingMs(next);
    remainingMsRef.current = next;
    endAtRef.current       = null;
    finishedRef.current    = false;

    if (intervalRef.current) clearInterval(intervalRef.current);
    intervalRef.current = null;
  }, [durationMs, initialRemainingMs, exerciseId]);

  // ── Start / stop ticking ─────────────────────────────────────────────────
  // FIX: `remainingMs` removed from deps — use remainingMsRef.current instead.
  useEffect(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    if (!isRunning) {
      endAtRef.current = null;
      return;
    }

    const exerciseChanged = prevExerciseRef.current !== exerciseId;
    prevExerciseRef.current = exerciseId;

    // If exercise just changed while running, restart from its full duration
    const startRemaining = exerciseChanged
      ? typeof initialRemainingMs === "number"
        ? initialRemainingMs
        : durationMs
      : remainingMsRef.current; // ← read from ref, not state

    if (exerciseChanged) {
      finishedRef.current = false;
      setRemainingMs(startRemaining);
      remainingMsRef.current = startRemaining;
    }

    endAtRef.current = Date.now() + startRemaining;

    const tick = () => {
      if (!endAtRef.current) return;
      const next = Math.max(0, endAtRef.current - Date.now());
      setRemainingMs(next);
      remainingMsRef.current = next;

      if (next === 0 && !finishedRef.current) {
        finishedRef.current = true;
        if (intervalRef.current) clearInterval(intervalRef.current);
        intervalRef.current = null;
        onFinishRef.current?.();
      }
    };

    tick();
    intervalRef.current = setInterval(tick, 250);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      intervalRef.current = null;
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isRunning, exerciseId, durationMs, initialRemainingMs]);
  // ↑ remainingMs intentionally omitted — we use remainingMsRef instead

  const seconds = Math.ceil(remainingMs / 1000);
  return { remainingMs, seconds, setRemainingMs };
}