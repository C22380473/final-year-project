import { addDoc, collection, deleteDoc, doc, getDoc, getDocs, limit, orderBy, query, serverTimestamp, updateDoc, where, runTransaction, setDoc, writeBatch } from 'firebase/firestore';
import { db, auth } from '../config/firebaseConfig';
import { updateProfile } from 'firebase/auth';
import * as ImagePicker from "expo-image-picker";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { storage } from "../config/firebaseConfig";

const ROUTINES_COLLECTION = 'routines';

/**
 * Create a new routine in Firestore
 * @param {string} userId - The authenticated user's ID
 * @param {Object} routineData - The routine data to save
 * @returns {Promise<Object>} Result object with success status and routine ID
 */
export const createRoutine = async (userId, routineData) => {
  try {
    // Prepare routine data with timestamps
    const dataToSave = {
      ...routineData,
      userId,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    };

    // Add document to Firestore
    const docRef = await addDoc(collection(db, ROUTINES_COLLECTION), dataToSave);
    
    console.log('Routine created with ID:', docRef.id);
    return { 
      success: true, 
      id: docRef.id,
      message: 'Routine created successfully!' 
    };
  } catch (error) {
    console.error('Error creating routine:', error);
    return { 
      success: false, 
      error: error.message,
      message: 'Failed to create routine. Please try again.' 
    };
  }
};

/**
 * Get all routines for a specific user
 * @param {string} userId - The user's ID
 * @returns {Promise<Object>} Result object with success status and routines array
 */
export const getUserRoutines = async (userId) => {
  try {
    // Query routines for this user, ordered by most recent
    const q = query(
      collection(db, ROUTINES_COLLECTION),
      where('userId', '==', userId),
      orderBy('updatedAt', 'desc')
    );
    
    const querySnapshot = await getDocs(q);
    const routines = [];
    
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      routines.push({
        routineId: doc.id,
        id: doc.id, 
        ...data,
        // Convert Firestore timestamps to JS dates
        createdAt: data.createdAt?.toDate(),
        updatedAt: data.updatedAt?.toDate()
      });
    });
    
    console.log(`Retrieved ${routines.length} routines for user ${userId}`);
    return { success: true, routines };
  } catch (error) {
    console.error('Error getting user routines:', error);
    return { 
      success: false, 
      error: error.message, 
      routines: [],
      message: 'Failed to load routines.' 
    };
  }
};

/**
 * Get a single routine by ID
 * @param {string} routineId - The routine document ID
 * @returns {Promise<Object>} Result object with success status and routine data
 */
export const getRoutineById = async (routineId) => {
  try {
    const docRef = doc(db, ROUTINES_COLLECTION, routineId);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      const data = docSnap.data();
      const routine = { 
        routineId: docSnap.id,
        id: docSnap.id, 
        ...data,
        createdAt: data.createdAt?.toDate(),
        updatedAt: data.updatedAt?.toDate()
      };
      
      console.log('Retrieved routine:', routine.name);
      return { success: true, routine };
    } else {
      console.log('Routine not found:', routineId);
      return { 
        success: false, 
        error: 'Routine not found',
        message: 'This routine no longer exists.' 
      };
    }
  } catch (error) {
    console.error('Error getting routine:', error);
    return { 
      success: false, 
      error: error.message,
      message: 'Failed to load routine.' 
    };
  }
};

/**
 * Update an existing routine
 * @param {string} routineId - The routine document ID
 * @param {Object} updates - Object containing fields to update
 * @returns {Promise<Object>} Result object with success status
 */
export const updateRoutine = async (routineId, updates) => {
  try {
    const docRef = doc(db, ROUTINES_COLLECTION, routineId);
    
    // Update with new timestamp
    await updateDoc(docRef, {
      ...updates,
      updatedAt: serverTimestamp()
    });
    
    console.log('Routine updated:', routineId);
    return { 
      success: true,
      message: 'Routine updated successfully!' 
    };
  } catch (error) {
    console.error('Error updating routine:', error);
    return { 
      success: false, 
      error: error.message,
      message: 'Failed to update routine. Please try again.' 
    };
  }
};

/**
 * Delete a routine
 * @param {string} routineId - The routine document ID
 * @returns {Promise<Object>} Result object with success status
 */
export const deleteRoutine = async (routineId) => {
  try {
    await deleteDoc(doc(db, ROUTINES_COLLECTION, routineId));
    
    console.log('Routine deleted:', routineId);
    return { 
      success: true,
      message: 'Routine deleted successfully!' 
    };
  } catch (error) {
    console.error('Error deleting routine:', error);
    return { 
      success: false, 
      error: error.message,
      message: 'Failed to delete routine. Please try again.' 
    };
  }
};

/**
 * Get public routines (for community feature)
 * Optionally filter by a specific userId (for profile screen).
 *
 * Backward compatible:
 * - getPublicRoutines(20)
 * - getPublicRoutines({ max: 20, userId: "abc" })
 *
 * @param {number|{max?: number, userId?: string}} arg
 * @returns {Promise<{success: boolean, routines: any[], error?: string, message?: string}>}
 */
export const getPublicRoutines = async (arg = 20) => {
  const opts =
    typeof arg === "number"
      ? { max: arg, userId: undefined }
      : { max: arg?.max ?? 20, userId: arg?.userId };

  const { max, userId } = opts;

  try {
    const constraints = [
      where("isPrivate", "==", false),
      orderBy("updatedAt", "desc"),
      limit(max),
    ];

    // If we want ONLY public routines for a specific user (Profile screen)
    if (userId) {
      constraints.unshift(where("userId", "==", userId));
    }

    const q = query(collection(db, ROUTINES_COLLECTION), ...constraints);

    const querySnapshot = await getDocs(q);

    const routines = querySnapshot.docs.map((docSnap) => {
      const data = docSnap.data();
      return {
        routineId: docSnap.id,
        id: docSnap.id,
        ...data,
        createdAt: data.createdAt?.toDate?.() ?? null,
        updatedAt: data.updatedAt?.toDate?.() ?? null,
      };
    });

    console.log(
      `Retrieved ${routines.length} public routines${userId ? ` for user ${userId}` : ""}`
    );

    return { success: true, routines };
  } catch (error) {
    console.error("Error getting public routines:", error);

    return {
      success: false,
      error: error.message,
      routines: [],
      message: "Failed to load public routines.",
    };
  }
};

/**
 * Duplicate a routine (useful for using someone else's routine as template)
 * @param {string} routineId - The routine to duplicate
 * @param {string} userId - The user creating the duplicate
 * @returns {Promise<Object>} Result object with success status and new routine ID
 */
export const duplicateRoutine = async (routineId, user) => {
  try {
    if (!user?.uid) return { success: false, message: "Not logged in" };

    const { success, routine } = await getRoutineById(routineId);
    if (!success) return { success: false, error: "Original routine not found" };

    const { id, routineId: rid, createdAt, updatedAt, userId: oldUserId, ...routineData } = routine;

    // strip any system ids
    delete routineData.id;
    delete routineData.routineId;

    const newRoutineData = {
      ...routineData,
      name: `${routineData.name} (Copy)`,
      isPrivate: true,
      sourceRoutineId: rid || routineId,
      copiedFromUserId: oldUserId || null,
      authorId: user.uid,
      authorName: user.displayName || "Anonymous",
    };

    return await createRoutine(user.uid, newRoutineData);
  } catch (error) {
    console.error("Error duplicating routine:", error);
    return { success: false, error: error.message, message: "Failed to duplicate routine." };
  }
};



function makeCommentId() {
  return `c_${Date.now()}_${Math.random().toString(16).slice(2)}`;
}

export async function postRoutineComment(routineId, text) {
  const user = auth.currentUser;
  if (!user || !text?.trim()) return;

  const commentId = makeCommentId();
  const ref = doc(db, "routines", routineId, "comments", commentId);

  await setDoc(ref, {
    commentId,
    routineId,
    authorId: user.uid,
    authorName: user.displayName || user.email?.split("@")[0] || "User",
    authorPhotoURL: user.photoURL || "",
    text: text.trim(),
    likeCount: 0,
    dislikeCount: 0,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
}


export async function reactToComment({ routineId, commentId, value }) {
  const user = auth.currentUser;
  if (!user) throw new Error("Not logged in");
  if (![1, -1].includes(value)) throw new Error("Invalid reaction");

  const commentRef = doc(db, "routines", routineId, "comments", commentId);
  const reactionRef = doc(db, "routines", routineId, "comments", commentId, "reactions", user.uid);

  await runTransaction(db, async (tx) => {
    const commentSnap = await tx.get(commentRef);
    if (!commentSnap.exists()) throw new Error("Comment missing");

    const reactionSnap = await tx.get(reactionRef);
    const prev = reactionSnap.exists() ? reactionSnap.data().value : 0;

    // clicking same value again => undo (toggle off)
    const next = prev === value ? 0 : value;

    let likeDelta = 0;
    let dislikeDelta = 0;

    if (prev === 1) likeDelta -= 1;
    if (prev === -1) dislikeDelta -= 1;
    if (next === 1) likeDelta += 1;
    if (next === -1) dislikeDelta += 1;

    tx.set(reactionRef, { value: next, updatedAt: serverTimestamp() }, { merge: true });

    const cur = commentSnap.data();
    tx.update(commentRef, {
      likeCount: Math.max(0, Number(cur.likeCount || 0) + likeDelta),
      dislikeCount: Math.max(0, Number(cur.dislikeCount || 0) + dislikeDelta),
      updatedAt: serverTimestamp(),
    });
  });
}




export async function rateRoutine({ routineId, value }) {
  const user = auth.currentUser;
  if (!user) throw new Error("Not logged in");
  if (value < 1 || value > 5) throw new Error("Invalid rating");

  const routineRef = doc(db, "routines", routineId);
  const ratingRef = doc(db, "routines", routineId, "ratings", user.uid);

  await runTransaction(db, async (tx) => {
    const routineSnap = await tx.get(routineRef);
    if (!routineSnap.exists()) throw new Error("Routine missing");

    const prevSnap = await tx.get(ratingRef);
    const prev = prevSnap.exists() ? Number(prevSnap.data().value || 0) : 0;

    // write/update rating doc
    tx.set(
      ratingRef,
      { value, updatedAt: serverTimestamp(), createdAt: prevSnap.exists() ? prevSnap.data().createdAt : serverTimestamp() },
      { merge: true }
    );

    // Maintain sum + count on routine doc
    // Add fields to routine doc: ratingSum, ratingCount, avgRating
    const cur = routineSnap.data();
    const ratingSum = Number(cur.ratingSum || 0);
    const ratingCount = Number(cur.ratingCount || 0);

    const nextSum = ratingSum - (prev || 0) + value;
    const nextCount = prev ? ratingCount : ratingCount + 1;
    const nextAvg = nextCount ? nextSum / nextCount : 0;

    tx.update(routineRef, {
      ratingSum: nextSum,
      ratingCount: nextCount,
      avgRating: nextAvg,
      updatedAt: serverTimestamp(),
    });
  });
}


export async function updateUserProfile({ uid, username, displayName, photoURL }) {
  if (!uid) return { success: false, message: "No user id" };

  try {
    const cleanUsername = username !== undefined ? String(username || "").trim().replace(/^@+/, "") : undefined;
    const cleanDisplayName = displayName !== undefined ? String(displayName || "").trim() : undefined;
    const publicName = cleanDisplayName || cleanUsername || "Anonymous";

    await setDoc(
      doc(db, "users", uid),
      {
        ...(cleanUsername !== undefined ? { username: cleanUsername } : {}),
        ...(cleanDisplayName !== undefined ? { displayName: cleanDisplayName } : {}),
        ...(photoURL !== undefined ? { photoURL } : {}),
        updatedAt: serverTimestamp(),
      },
      { merge: true }
    );

    if (auth.currentUser?.uid === uid) {
      await updateProfile(auth.currentUser, {
        ...(cleanDisplayName !== undefined ? { displayName: publicName } : {}),
        ...(photoURL !== undefined ? { photoURL } : {}),
      });
    }

    const routinesSnap = await getDocs(
      query(collection(db, ROUTINES_COLLECTION), where("userId", "==", uid))
    );

    if (!routinesSnap.empty) {
      const batch = writeBatch(db);
      routinesSnap.forEach((routineDoc) => {
        batch.update(routineDoc.ref, {
          authorName: publicName,
          authorDisplayName: cleanDisplayName || "",
          authorUsername: cleanUsername || "",
          ...(photoURL !== undefined ? { authorPhotoURL: photoURL } : {}),
          updatedAt: serverTimestamp(),
        });
      });
      await batch.commit();
    }

    return { success: true, publicName };
  } catch (e) {
    console.log("updateUserProfile error", e);
    return { success: false, message: e?.message || "Failed to update profile" };
  }
}


export async function getUserProfile(userId) {
  try {
    const snap = await getDoc(doc(db, "users", userId));
    if (!snap.exists()) return { success: false, message: "No profile" };
    return { success: true, profile: snap.data() };
  } catch (e) {
    console.log("getUserProfile error", e);
    return { success: false, message: e?.message || "Failed to load profile" };
  }
}

async function uploadProfilePhoto({ uid }) {
  // pick image
  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ImagePicker.MediaTypeOptions.Images,
    allowsEditing: true,
    aspect: [1, 1],
    quality: 0.8,
  });

  if (result.canceled) return { success: false, canceled: true };

  const uri = result.assets[0].uri;

  // convert to blob
  const response = await fetch(uri);
  const blob = await response.blob();

  // upload
  const path = `profilePhotos/${uid}.jpg`;
  const storageRef = ref(storage, path);
  await uploadBytes(storageRef, blob);

  const url = await getDownloadURL(storageRef);
  return { success: true, url };
}

export default {
  createRoutine,
  getUserRoutines,
  getRoutineById,
  updateRoutine,
  deleteRoutine,
  getPublicRoutines,
  duplicateRoutine,
  reactToComment,
  rateRoutine,
  postRoutineComment,
  updateUserProfile,
  getUserProfile,
  uploadProfilePhoto
};