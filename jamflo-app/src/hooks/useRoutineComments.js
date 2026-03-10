import { useEffect, useMemo, useState, useCallback } from "react";
import { collection, doc, getDoc, onSnapshot, orderBy, query, serverTimestamp, setDoc, deleteDoc, updateDoc } from "firebase/firestore";
import { db } from "../config/firebaseConfig";
import { auth } from "../config/firebaseConfig";

function makeCommentId() {
  return `c_${Date.now()}_${Math.random().toString(16).slice(2)}`;
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

            if (data.authorId) {
              try {
                const userSnap = await getDoc(doc(db, "users", data.authorId));
                if (userSnap.exists()) {
                  const profile = userSnap.data();
                  authorNameResolved =
                    profile.displayName?.trim() ||
                    profile.username?.trim() ||
                    data.authorName ||
                    "User";
                }
              } catch (e) {
                console.log("comment author lookup failed", e);
              }
            }

            return {
              id: d.id,
              ...data,
              authorNameResolved,
            };
          })
        );

        setComments(rows);
    });
  }, [colRef]);

  const postComment = useCallback(async () => {
    const user = auth.currentUser;
    const text = newComment.trim();
    if (!user || !routineId || !text) return;

    const commentId = makeCommentId();
    const ref = doc(db, "routines", routineId, "comments", commentId);

    await setDoc(ref, {
      commentId,
      routineId,
      authorId: user.uid,
      authorName: user.displayName || user.email?.split("@")[0] || "Anonymous",
      authorPhotoURL: user.photoURL || "",
      text,
      likeCount: 0,
      dislikeCount: 0,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

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
    const clean = (nextText || "").trim();
    if (!user || !routineId || !commentId || !clean) return;

    await updateDoc(doc(db, "routines", routineId, "comments", commentId), {
      text: clean,
      updatedAt: serverTimestamp(),
    });
  },
  [routineId]
);

  return { comments, newComment, setNewComment, postComment, deleteComment, editComment };
}
