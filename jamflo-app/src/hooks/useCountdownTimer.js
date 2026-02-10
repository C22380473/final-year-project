import { useEffect, useRef, useState } from "react";

export function useCountdownTimer({ durationMs, isRunning, onFinish }) {
  const [remainingMs, setRemainingMs] = useState(durationMs);

  const endAtRef = useRef(null);
  const intervalRef = useRef(null);
  const finishedRef = useRef(false);

  useEffect(() => {
    setRemainingMs(durationMs);
    endAtRef.current = null;
    finishedRef.current = false;
    if (intervalRef.current) clearInterval(intervalRef.current);
    intervalRef.current = null;
  }, [durationMs]);

  useEffect(() => {
    if (!isRunning) {
      if (intervalRef.current) clearInterval(intervalRef.current);
      intervalRef.current = null;
      endAtRef.current = null;
      return;
    }

    endAtRef.current = Date.now() + remainingMs;

    const tick = () => {
      const nextRemaining = Math.max(0, endAtRef.current - Date.now());
      setRemainingMs(nextRemaining);

      if (nextRemaining === 0 && !finishedRef.current) {
        finishedRef.current = true;
        if (intervalRef.current) clearInterval(intervalRef.current);
        intervalRef.current = null;
        onFinish?.();
      }
    };

    tick();
    intervalRef.current = setInterval(tick, 250);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      intervalRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isRunning, onFinish]);

  const seconds = Math.ceil(remainingMs / 1000);
  return { remainingMs, seconds };
}
