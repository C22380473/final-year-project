import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../config/firebaseConfig";

export async function ensureUserProfile(user) {
  if (!user?.uid) return;

  const ref = doc(db, "users", user.uid);
  const snap = await getDoc(ref);

  if (!snap.exists()) {
    const emailHandle = user.email ? user.email.split("@")[0] : "user";

    await setDoc(ref, {
      uid: user.uid,
      username: emailHandle.toLowerCase(),     // stable handle
      displayName: user.displayName || "",     // editable later
      photoURL: user.photoURL || "",
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
  }
}