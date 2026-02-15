import { useEffect, useRef, useState } from "react";

export function useCountdownTimer({ durationMs, initialRemainingMs, isRunning, onFinish, exerciseId }) {
  const [remainingMs, setRemainingMs] = useState(
    typeof initialRemainingMs === "number" ? initialRemainingMs : durationMs
  );

  const endAtRef = useRef(null);
  const intervalRef = useRef(null);
  const finishedRef = useRef(false);

  // keep latest onFinish without making the interval effect re-run
  const onFinishRef = useRef(onFinish);
  useEffect(() => {
    onFinishRef.current = onFinish;
  }, [onFinish]);

  // Reset whenever the exercise changes OR you provide a restored value
  // exerciseId ensures reset even when durationMs stays the same
  useEffect(() => {
    const next = typeof initialRemainingMs === "number" ? initialRemainingMs : durationMs;

    setRemainingMs(next);
    endAtRef.current = null;
    finishedRef.current = false;

    if (intervalRef.current) clearInterval(intervalRef.current);
    intervalRef.current = null;
  }, [durationMs, initialRemainingMs, exerciseId]);

  // Start/stop ticking (DO NOT depend on remainingMs)
  useEffect(() => {
    if (!isRunning) {
      if (intervalRef.current) clearInterval(intervalRef.current);
      intervalRef.current = null;
      endAtRef.current = null;
      return;
    }

    // anchor once, using the current remainingMs at the moment we started
    const startRemaining = remainingMs;
    endAtRef.current = Date.now() + startRemaining;

    const tick = () => {
      if (!endAtRef.current) return;

      const nextRemaining = Math.max(0, endAtRef.current - Date.now());
      setRemainingMs(nextRemaining);

      if (nextRemaining === 0 && !finishedRef.current) {
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
  }, [isRunning]); // only re-run when play/pause changes

  const seconds = Math.ceil(remainingMs / 1000);
  return { remainingMs, seconds, setRemainingMs };
}