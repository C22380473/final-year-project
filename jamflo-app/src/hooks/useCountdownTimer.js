import { useEffect, useRef, useState } from "react";

export function useCountdownTimer({ durationMs, initialRemainingMs, isRunning, onFinish, exerciseId }) {
  const [remainingMs, setRemainingMs] = useState(
    typeof initialRemainingMs === "number" ? initialRemainingMs : durationMs
  );

  const endAtRef = useRef(null);
  const intervalRef = useRef(null);
  const finishedRef = useRef(false);
  const prevExerciseIdRef = useRef(exerciseId);

  // keep latest onFinish without making the interval effect re-run
  const onFinishRef = useRef(onFinish);
  useEffect(() => {
    onFinishRef.current = onFinish;
  }, [onFinish]);

  // Reset whenever the exercise changes OR you provide a restored value
  useEffect(() => {
    const next = typeof initialRemainingMs === "number" ? initialRemainingMs : durationMs;

    setRemainingMs(next);
    endAtRef.current = null;
    finishedRef.current = false;

    if (intervalRef.current) clearInterval(intervalRef.current);
    intervalRef.current = null;
  }, [durationMs, initialRemainingMs, exerciseId]);

  // Start/stop ticking
  useEffect(() => {
    // always clear any existing interval before possibly starting a new one
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    if (!isRunning) {
      endAtRef.current = null;
      return;
    }

    const exerciseChanged = prevExerciseIdRef.current !== exerciseId;
    prevExerciseIdRef.current = exerciseId;

    // If we just switched exercises while running, restart from the new exercise's starting time
    const startRemaining = exerciseChanged
      ? (typeof initialRemainingMs === "number" ? initialRemainingMs : durationMs)
      : remainingMs;

    if (exerciseChanged) {
      finishedRef.current = false;
      setRemainingMs(startRemaining); // ensures UI matches the new exercise immediately
    }

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
  }, [isRunning, exerciseId, durationMs, initialRemainingMs, remainingMs]);

  const seconds = Math.ceil(remainingMs / 1000);
  return { remainingMs, seconds, setRemainingMs };
}
