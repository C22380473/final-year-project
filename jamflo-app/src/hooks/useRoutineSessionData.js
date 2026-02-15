import { useCallback, useEffect, useMemo, useState } from "react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../config/firebaseConfig";

/**
 * Loads a routine doc by ID and exposes a normalized focusBlocks structure.
 * Keeps this hook purely about "routine data" (no session indices / timers / notes).
 */
export function useRoutineSessionData(routineId) {
  // Fallback routine for first render
  const fallbackRoutine = useMemo(
    () => ({
      name: "Practice Session",
      focusBlocks: [],
      resources: [],
    }),
    []
  );

  const [routine, setRoutine] = useState(fallbackRoutine);
  const [loadingRoutine, setLoadingRoutine] = useState(true);
  const [loadError, setLoadError] = useState(null);

  const loadRoutineById = useCallback(async () => {
    setLoadingRoutine(true);
    setLoadError(null);

    if (!routineId) {
      setRoutine(fallbackRoutine);
      setLoadingRoutine(false);
      setLoadError("Missing routineId. Start a session from your routine list.");
      return;
    }

    try {
      const snap = await getDoc(doc(db, "routines", routineId));

      if (!snap.exists()) {
        setRoutine(fallbackRoutine);
        setLoadError("Routine not found (document does not exist).");
        return;
      }

      const data = snap.data();
      setRoutine({
        id: snap.id,
        routineId: snap.id,
        ...data,
      });
    } catch (e) {
      console.log("Error loading routine:", e);
      setRoutine(fallbackRoutine);
      setLoadError(e?.message || "Failed to load routine from Firestore.");
    } finally {
      setLoadingRoutine(false);
    }
  }, [routineId, fallbackRoutine]);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      if (cancelled) return;
      await loadRoutineById();
    })();

    return () => {
      cancelled = true;
    };
  }, [loadRoutineById]);

  // ------------------------
  // Normalisation helpers
  // (moved from PracticeSessionScreen)
  // ------------------------
  const guessResourceType = useCallback((url = "") => {
    const u = String(url).toLowerCase();
    if (u.includes("youtube.com") || u.includes("youtu.be")) return "youtube";
    if (u.endsWith(".pdf")) return "pdf";
    if (u.endsWith(".mp3") || u.endsWith(".wav") || u.endsWith(".m4a")) return "audio";
    if (u.startsWith("http")) return "link";
    return "file";
  }, []);

  const normalizeResource = useCallback(
    (r) => {
      const url = r?.url ?? r?.link ?? r?.href ?? "";
      const type = guessResourceType(url); // prefer inferred from URL

      const name =
        r?.name ??
        r?.title ??
        (type === "youtube"
          ? "YouTube video"
          : type === "pdf"
          ? "PDF"
          : type === "audio"
          ? "Audio"
          : "Link");

      return {
        resourceId: r?.resourceId,
        type,
        url,
        name,
        addedAt: r?.addedAt,
      };
    },
    [guessResourceType]
  );

  const parseExerciseResources = useCallback(
    (ex) => {
      const raw = ex?.resources;
      const items = [];

      const pushIfUrl = (r) => {
        const url = r?.url ?? r?.link ?? r?.href ?? "";
        if (!url) return;
        items.push(normalizeResource({ ...r, url }));
      };

      if (Array.isArray(raw)) {
        raw.forEach((r) => pushIfUrl(r));
      } else if (raw && typeof raw === "object") {
        pushIfUrl(raw);
      }

      return items;
    },
    [normalizeResource]
  );

  const normalizeExercise = useCallback(
    (ex) => {
      const durationNum = Number(ex?.duration);
      const durationMins = Number.isFinite(durationNum) && durationNum > 0 ? durationNum : 5;

      const resources = parseExerciseResources(ex);

      const tempoNum = Number(ex?.tempo);
      const tempo = Number.isFinite(tempoNum) && tempoNum > 0 ? tempoNum : null;

      return {
        id:
          ex?.exerciseId ??
          ex?.id ??
          `${ex?.name ?? "exercise"}-${Math.random().toString(16).slice(2)}`,
        name: ex?.name ?? "Exercise",
        category: ex?.category ?? "Technique",
        notes: ex?.notes ?? "",
        durationMins,
        resources,
        tempo,
      };
    },
    [parseExerciseResources]
  );

  const getFocusBlocksFromRoutine = useCallback(
    (r) => {
      const blocks = Array.isArray(r?.focusBlocks) ? r.focusBlocks : [];

      return blocks.map((b, i) => ({
        id: b?.blockId ?? String(i),
        name: b?.name ?? `Focus Block ${i + 1}`,
        description: b?.description ?? "",
        totalDuration: Number(b?.totalDuration ?? 0),
        exercises: Array.isArray(b?.exercises) ? b.exercises.map(normalizeExercise) : [],
      }));
    },
    [normalizeExercise]
  );

  const focusBlocks = useMemo(() => getFocusBlocksFromRoutine(routine), [routine, getFocusBlocksFromRoutine]);

  return {
    routine,
    focusBlocks,
    loadingRoutine,
    loadError,
    reloadRoutine: loadRoutineById,
  };
}
