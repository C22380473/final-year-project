import { useCallback, useMemo, useRef, useState } from "react";

/**
 * Navigation + derived values for a "focusBlocks -> exercises" session.
 *
 * Keeps the screen clean:
 * - safe indices
 * - current block/exercise
 * - duration ms
 * - progress metrics
 * - next/prev/skip
 * - completion detection (and one-shot guard)
 */
export function useExerciseNavigator({
  focusBlocks,
  initialBlockIndex = 0,
  initialExerciseIndex = 0,
  onComplete, // optional
} = {}) {
  const blocks = Array.isArray(focusBlocks) ? focusBlocks : [];

  const [blockIndex, setBlockIndex] = useState(initialBlockIndex);
  const [exerciseIndex, setExerciseIndex] = useState(initialExerciseIndex);

  // Prevent double-firing complete events
  const completedOnceRef = useRef(false);

  // ---------- derived helpers ----------
  const safeBlockIndex = useMemo(() => {
    if (!blocks.length) return 0;
    if (blockIndex < 0) return 0;
    if (blockIndex >= blocks.length) return blocks.length - 1;
    return blockIndex;
  }, [blocks.length, blockIndex]);

  const currentBlock = useMemo(() => {
    return blocks[safeBlockIndex] ?? null;
  }, [blocks, safeBlockIndex]);

  const exercises = useMemo(() => {
    const ex = currentBlock?.exercises;
    return Array.isArray(ex) ? ex : [];
  }, [currentBlock]);

  const safeExerciseIndex = useMemo(() => {
    if (!exercises.length) return 0;
    if (exerciseIndex < 0) return 0;
    if (exerciseIndex >= exercises.length) return exercises.length - 1;
    return exerciseIndex;
  }, [exercises.length, exerciseIndex]);

  const currentExercise = useMemo(() => {
    return exercises[safeExerciseIndex] ?? null;
  }, [exercises, safeExerciseIndex]);

  const durationMs = useMemo(() => {
    const mins = Number(currentExercise?.durationMins);
    const safeMins = Number.isFinite(mins) && mins > 0 ? mins : 5;
    return safeMins * 60 * 1000;
  }, [currentExercise]);

  // Flatten for progress calculations
  const flat = useMemo(() => {
    const list = [];
    blocks.forEach((b, bi) => {
      const exs = Array.isArray(b?.exercises) ? b.exercises : [];
      exs.forEach((e, ei) => {
        list.push({ blockIndex: bi, exerciseIndex: ei, block: b, exercise: e });
      });
    });
    return list;
  }, [blocks]);

  const totalExercises = flat.length;

  const currentFlatIndex = useMemo(() => {
    if (!totalExercises) return 0;
    const found = flat.findIndex((x) => x.blockIndex === safeBlockIndex && x.exerciseIndex === safeExerciseIndex);
    return found >= 0 ? found : 0;
  }, [flat, totalExercises, safeBlockIndex, safeExerciseIndex]);

  const progress = useMemo(() => {
    if (!totalExercises) {
      return {
        totalExercises: 0,
        completedExercises: 0,
        remainingExercises: 0,
        percent: 0,
      };
    }

    const completedExercises = currentFlatIndex; // everything before current
    const remainingExercises = Math.max(totalExercises - completedExercises, 0);
    const percent = Math.round((completedExercises / totalExercises) * 100);

    return { totalExercises, completedExercises, remainingExercises, percent };
  }, [totalExercises, currentFlatIndex]);

  // ---------- internal movement ----------
  const setPosition = useCallback(
    (nextBlockIndex, nextExerciseIndex) => {
      completedOnceRef.current = false; // allow completion again only after moving/resetting
      setBlockIndex(nextBlockIndex);
      setExerciseIndex(nextExerciseIndex);
    },
    []
  );

  const reset = useCallback(() => {
    completedOnceRef.current = false;
    setBlockIndex(0);
    setExerciseIndex(0);
  }, []);

  // Find next position in flattened list
  const nextPosition = useCallback(() => {
    if (!totalExercises) return null;
    const next = flat[currentFlatIndex + 1];
    return next ? { blockIndex: next.blockIndex, exerciseIndex: next.exerciseIndex } : null;
  }, [flat, totalExercises, currentFlatIndex]);

  const prevPosition = useCallback(() => {
    if (!totalExercises) return null;
    const prev = flat[currentFlatIndex - 1];
    return prev ? { blockIndex: prev.blockIndex, exerciseIndex: prev.exerciseIndex } : null;
  }, [flat, totalExercises, currentFlatIndex]);

  // ---------- public actions ----------
  const goNext = useCallback(() => {
    const next = nextPosition();

    if (!next) {
      // We are at the end
      if (!completedOnceRef.current) {
        completedOnceRef.current = true;
        if (typeof onComplete === "function") onComplete();
      }
      return { didComplete: true };
    }

    setPosition(next.blockIndex, next.exerciseIndex);
    return { didComplete: false };
  }, [nextPosition, setPosition, onComplete]);

  const goPrev = useCallback(() => {
    const prev = prevPosition();
    if (!prev) return false;
    setPosition(prev.blockIndex, prev.exerciseIndex);
    return true;
  }, [prevPosition, setPosition]);

  const skipExercise = useCallback(() => {
    // same as next, semantically clearer
    return goNext();
  }, [goNext]);

  // Jump helpers (optional)
  const jumpTo = useCallback(
    ({ blockIndex: bi, exerciseIndex: ei }) => {
      const hasBlock = bi >= 0 && bi < blocks.length;
      const hasExercise =
        hasBlock && Array.isArray(blocks[bi]?.exercises) && ei >= 0 && ei < blocks[bi].exercises.length;

      if (!hasBlock || !hasExercise) return false;

      setPosition(bi, ei);
      return true;
    },
    [blocks, setPosition]
  );

  return {
    // state
    blockIndex,
    exerciseIndex,

    // safe derived
    safeBlockIndex,
    safeExerciseIndex,
    currentBlock,
    currentExercise,
    durationMs,
    exercisesInCurrentBlock: exercises,
    totalExercises,

    // progress
    currentFlatIndex,
    progress, // { totalExercises, completedExercises, remainingExercises, percent }

    // actions
    setPosition,
    jumpTo,
    reset,
    goNext,
    goPrev,
    skipExercise,
  };
}
