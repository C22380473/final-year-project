import { useEffect, useMemo, useState, useCallback } from "react";
import {
  collection,
  doc,
  getDoc,
  onSnapshot,
  orderBy,
  query,
  deleteDoc,
  updateDoc,
  serverTimestamp,
} from "firebase/firestore";
import { Alert } from "react-native";
import { db, auth } from "../config/firebaseConfig";
import {
  postRoutineComment as postRoutineCommentService,
  getProfilePhotoViewUrl,
} from "../services/routineService";
import profanityList from "../../assets/profanity-list.json";

function normalizeForModeration(text) {
  return String(text || "")
    .toLowerCase()
    .replace(/[@]/g, "a")
    .replace(/[1!|]/g, "i")
    .replace(/[3]/g, "e")
    .replace(/[4]/g, "a")
    .replace(/[5$]/g, "s")
    .replace(/[0]/g, "o")
    .replace(/[7]/g, "t")
    .replace(/[^a-z]/g, "");
}

function containsInappropriateLanguage(text) {
  const raw = String(text || "").toLowerCase();
  const normalized = normalizeForModeration(text);

  return profanityList.some((word) => {
    const w = String(word || "").toLowerCase();
    return raw.includes(w) || normalized.includes(w);
  });
}

export function useRoutineComments(routineId) {
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");

  const colRef = useMemo(() => {
    if (!routineId) return null;
    return collection(db, "routines", routineId, "comments");
  }, [routineId]);

  useEffect(() => {
    if (!colRef) return;

    const q = query(colRef, orderBy("createdAt", "desc"));

    return onSnapshot(q, async (snap) => {
      const rows = await Promise.all(
        snap.docs.map(async (d) => {
          const data = d.data();
          let authorNameResolved = data.authorName || "User";
          let authorPhotoResolved = data.authorPhotoURL || "";

          if (data.authorId) {
            try {
              const userSnap = await getDoc(doc(db, "users", data.authorId));
              if (userSnap.exists()) {
                const profile = userSnap.data();

                authorNameResolved =
                  String(profile.displayName || "").trim() ||
                  String(profile.username || "").trim() ||
                  data.authorName ||
                  "User";

                if (!authorPhotoResolved) {
                  if (profile.photo?.key) {
                    const view = await getProfilePhotoViewUrl(profile.photo);
                    if (view.success) {
                      authorPhotoResolved = view.url;
                    }
                  } else {
                    authorPhotoResolved = profile.photoURL || "";
                  }
                }
              }
            } catch (e) {
              console.log("comment author lookup failed", e);
            }
          }

          return {
            id: d.id,
            ...data,
            authorNameResolved,
            authorPhotoURL: authorPhotoResolved || data.authorPhotoURL || "",
          };
        })
      );

      setComments(rows);
    });
  }, [colRef]);

  const postComment = useCallback(async () => {
    const text = newComment.trim();
    if (!routineId || !text) return;

    if (containsInappropriateLanguage(text)) {
      Alert.alert(
        "Comment not posted",
        "Please keep comments respectful and avoid inappropriate language."
      );
      return;
    }

    await postRoutineCommentService(routineId, text);
    setNewComment("");
  }, [newComment, routineId]);

  const deleteComment = useCallback(
    async (commentId) => {
      const user = auth.currentUser;
      if (!user || !routineId || !commentId) return;

      await deleteDoc(doc(db, "routines", routineId, "comments", commentId));
    },
    [routineId]
  );

  const editComment = useCallback(
    async (commentId, nextText) => {
      const user = auth.currentUser;
      const clean = String(nextText || "").trim();

      if (!user || !routineId || !commentId || !clean) return;

      if (containsInappropriateLanguage(clean)) {
        Alert.alert(
          "Comment not updated",
          "Please keep comments respectful and avoid inappropriate language."
        );
        return;
      }

      await updateDoc(doc(db, "routines", routineId, "comments", commentId), {
        text: clean,
        updatedAt: serverTimestamp(),
      });
    },
    [routineId]
  );

  return {
    comments,
    newComment,
    setNewComment,
    postComment,
    deleteComment,
    editComment,
  };
}