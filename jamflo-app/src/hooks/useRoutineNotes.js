import { useCallback, useEffect, useMemo, useState } from "react";
import { Alert } from "react-native";
import {
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
} from "firebase/firestore";
import { db } from "../config/firebaseConfig";

function makeRoutineNoteId() {
  return `routineNote_${Date.now()}_${Math.random().toString(16).slice(2)}`;
}

/**
 * Routine notes stored at:
 * routines/{routineId}/routineNotes/{routineNoteId}
 *
 * Returns:
 * - routineNotes (live via onSnapshot)
 * - noteText / setNoteText
 * - savingNote
 * - saveNote / deleteNote / editNote
 */
export function useRoutineNotes(routineId, options = {}) {
  const { onError } = options;

  const [routineNotes, setRoutineNotes] = useState([]);
  const [noteText, setNoteText] = useState("");
  const [savingNote, setSavingNote] = useState(false);

  const notesColRef = useMemo(() => {
    if (!routineId) return null;
    return collection(db, "routines", routineId, "routineNotes");
  }, [routineId]);

  // Live listener
  useEffect(() => {
    if (!notesColRef) {
      setRoutineNotes([]);
      return;
    }

    const q = query(notesColRef, orderBy("createdAt", "desc"));

    const unsub = onSnapshot(
      q,
      (snap) => {
        const next = snap.docs.map((d) => ({
          routineNoteId: d.id,
          ...d.data(),
        }));
        setRoutineNotes(next);
      },
      (err) => {
        console.log("routineNotes snapshot error:", err);
        if (typeof onError === "function") onError(err);
        else Alert.alert("Error", "Could not load notes.");
      }
    );

    return unsub;
  }, [notesColRef, onError]);

  const saveNote = useCallback(async () => {
    const clean = noteText.trim();
    if (!clean || !routineId) return;

    setSavingNote(true);
    try {
      const routineNoteId = makeRoutineNoteId();
      const ref = doc(db, "routines", routineId, "routineNotes", routineNoteId);

      await setDoc(ref, {
        routineNoteId, // keep your explicit field
        text: clean,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      setNoteText("");
    } catch (e) {
      console.log(e);
      if (typeof onError === "function") onError(e);
      else Alert.alert("Error", "Could not save note.");
    } finally {
      setSavingNote(false);
    }
  }, [noteText, routineId, onError]);

  const deleteNote = useCallback(
    async (routineNoteId) => {
      if (!routineId || !routineNoteId) return;
      try {
        await deleteDoc(doc(db, "routines", routineId, "routineNotes", routineNoteId));
      } catch (e) {
        console.log(e);
        if (typeof onError === "function") onError(e);
        else Alert.alert("Error", "Could not delete note.");
      }
    },
    [routineId, onError]
  );

  const editNote = useCallback(
    async (routineNoteId, newText) => {
      const clean = String(newText ?? "").trim();
      if (!routineId || !routineNoteId || !clean) return;

      try {
        await updateDoc(doc(db, "routines", routineId, "routineNotes", routineNoteId), {
          text: clean,
          updatedAt: serverTimestamp(),
        });
      } catch (e) {
        console.log(e);
        if (typeof onError === "function") onError(e);
        else Alert.alert("Error", "Could not edit note.");
      }
    },
    [routineId, onError]
  );

  return {
    routineNotes,
    noteText,
    setNoteText,
    savingNote,
    saveNote,
    deleteNote,
    editNote,
  };
}
