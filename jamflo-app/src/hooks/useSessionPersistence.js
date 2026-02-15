import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AppState } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { deleteDoc, doc, getDoc, serverTimestamp, setDoc } from "firebase/firestore";
import { db } from "../config/firebaseConfig";

/**
 * A persistence hook for "active practice session" state.
 *
 * Key ideas (fixes your bugs):
 * - Only restore when `mode === "continue"` (so Start = fresh)
 * - If snapshot says `isCompleted: true`, we clear it immediately and do NOT restore
 * - Provide `markCompleted()` to clear everything when the user finishes
 *
 * Firestore path used (customize if needed):
 * users/{userId}/activeSessions/{routineId}
 */
export function useSessionPersistence({
  routineId,
  userId,

  // "continue" = restore if exists
  // "fresh" = wipe any saved state, do NOT restore
  mode = "continue",

  // Must return a plain JSON snapshot of your session state
  // Example: () => ({ blockIndex, exerciseIndex, remainingMs, bpm, beats, isCompleted:false, updatedAtMs: Date.now() })
  getSnapshot,

  // Called with restored snapshot when we restore successfully
  onRestore,

  // Optional: called after clearing
  onCleared,

  // Optional: report errors
  onError,

  // Save behaviour
  enableFirestore = true,
  enableAutoSave = true,
  saveDebounceMs = 400,
}) {
  const storageKey = useMemo(() => {
    if (!userId || !routineId) return null;
    return `activeSession:${userId}:${routineId}`;
  }, [userId, routineId]);

  const sessionDocRef = useMemo(() => {
    if (!enableFirestore || !userId || !routineId) return null;
    return doc(db, "users", userId, "activeSessions", routineId);
  }, [enableFirestore, userId, routineId]);

  const [restoring, setRestoring] = useState(false);
  const [hasRestoredOnce, setHasRestoredOnce] = useState(false);

  // --- helpers ---
  const safeError = useCallback(
    (e, fallbackMsg) => {
      console.log(fallbackMsg, e);
      if (typeof onError === "function") onError(e);
    },
    [onError]
  );

  const clearSaved = useCallback(async () => {
    try {
      if (storageKey) await AsyncStorage.removeItem(storageKey);
      if (sessionDocRef) await deleteDoc(sessionDocRef);
      if (typeof onCleared === "function") onCleared();
    } catch (e) {
      safeError(e, "Failed to clear saved session");
    }
  }, [storageKey, sessionDocRef, onCleared, safeError]);

  const writeLocal = useCallback(
    async (snapshot) => {
      if (!storageKey) return;
      await AsyncStorage.setItem(storageKey, JSON.stringify(snapshot));
    },
    [storageKey]
  );

  const writeRemote = useCallback(
    async (snapshot) => {
      if (!sessionDocRef) return;
      await setDoc(
        sessionDocRef,
        {
          ...snapshot,
          updatedAt: serverTimestamp(),
        },
        { merge: true }
      );
    },
    [sessionDocRef]
  );

  // Debounced save to avoid spamming storage
  const saveTimerRef = useRef(null);

  const saveNow = useCallback(async () => {
    if (!routineId || !userId) return;
    if (typeof getSnapshot !== "function") return;

    try {
      const snap = getSnapshot();
      if (!snap) return;

      // If a completed snapshot somehow tries to save, clear instead.
      if (snap.isCompleted) {
        await clearSaved();
        return;
      }

      // Ensure we always have an ms timestamp locally
      const snapshot = {
        ...snap,
        updatedAtMs: typeof snap.updatedAtMs === "number" ? snap.updatedAtMs : Date.now(),
      };

      await writeLocal(snapshot);
      if (enableFirestore) await writeRemote(snapshot);
    } catch (e) {
      safeError(e, "Failed to save session");
    }
  }, [routineId, userId, getSnapshot, clearSaved, writeLocal, writeRemote, enableFirestore, safeError]);

  const save = useCallback(() => {
    if (!enableAutoSave) return;
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    saveTimerRef.current = setTimeout(() => {
      saveNow();
    }, saveDebounceMs);
  }, [enableAutoSave, saveDebounceMs, saveNow]);

  const markCompleted = useCallback(async () => {
    // Called when the session finishes successfully.
    await clearSaved();
  }, [clearSaved]);

  // --- restore ---
  const restore = useCallback(async () => {
    if (!routineId || !userId) return;
    if (typeof onRestore !== "function") return;

    setRestoring(true);
    try {
      let local = null;
      let remote = null;

      // local first
      if (storageKey) {
        const raw = await AsyncStorage.getItem(storageKey);
        if (raw) local = JSON.parse(raw);
      }

      // remote second (optional)
      if (sessionDocRef) {
        const snap = await getDoc(sessionDocRef);
        if (snap.exists()) remote = snap.data();
      }

      // Prefer the most recently updated (ms wins; otherwise accept local)
      const localMs = typeof local?.updatedAtMs === "number" ? local.updatedAtMs : 0;

      // Firestore serverTimestamp can't be compared here reliably, so we only prefer remote
      // if it also has an updatedAtMs (store it from the client).
      const remoteMs = typeof remote?.updatedAtMs === "number" ? remote.updatedAtMs : 0;

      const chosen = remote && remoteMs >= localMs ? remote : local;

      // If nothing saved, nothing to restore
      if (!chosen) return;

      // If it was completed, wipe it so "Continue last session" disappears
      if (chosen.isCompleted) {
        await clearSaved();
        return;
      }

      onRestore(chosen);
    } catch (e) {
      safeError(e, "Failed to restore session");
    } finally {
      setRestoring(false);
      setHasRestoredOnce(true);
    }
  }, [routineId, userId, onRestore, storageKey, sessionDocRef, clearSaved, safeError]);

  // Decide restore vs fresh
  useEffect(() => {
    // prevent repeated restores
    if (hasRestoredOnce) return;

    if (!routineId || !userId) return;

    if (mode === "fresh") {
      // Start session from scratch -> kill any existing saved state
      clearSaved();
      setHasRestoredOnce(true);
      return;
    }

    // Continue mode -> attempt restore
    restore();
  }, [mode, routineId, userId, restore, clearSaved, hasRestoredOnce]);

  // Auto save on app background
  useEffect(() => {
    if (!enableAutoSave) return;

    const sub = AppState.addEventListener("change", (state) => {
      if (state === "background" || state === "inactive") {
        saveNow();
      }
    });

    return () => sub.remove();
  }, [enableAutoSave, saveNow]);

  // Cleanup pending debounce timer
  useEffect(() => {
    return () => {
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    };
  }, []);

  return {
    restoring,
    save, // debounced
    saveNow, // immediate
    restore, // manual restore if you want
    clearSaved,
    markCompleted,
  };
}
