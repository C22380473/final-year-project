import { collection, doc, addDoc, updateDoc, deleteDoc, getDoc, getDocs, query, where, orderBy, serverTimestamp, Timestamp } from 'firebase/firestore';
import { db } from '../config/firebaseConfig';

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
 * @param {number} limit - Maximum number of routines to fetch
 * @returns {Promise<Object>} Result object with success status and routines array
 */
export const getPublicRoutines = async (limit = 20) => {
  try {
    const q = query(
      collection(db, ROUTINES_COLLECTION),
      where('isPrivate', '==', false),
      orderBy('updatedAt', 'desc')
    );
    
    const querySnapshot = await getDocs(q);
    const routines = [];
    
    querySnapshot.forEach((doc) => {
      if (routines.length < limit) {
        const data = doc.data();
        routines.push({ 
          id: doc.id, 
          ...data,
          createdAt: data.createdAt?.toDate(),
          updatedAt: data.updatedAt?.toDate()
        });
      }
    });
    
    console.log(`Retrieved ${routines.length} public routines`);
    return { success: true, routines };
  } catch (error) {
    console.error('Error getting public routines:', error);
    return { 
      success: false, 
      error: error.message, 
      routines: [],
      message: 'Failed to load public routines.' 
    };
  }
};

/**
 * Duplicate a routine (useful for using someone else's routine as template)
 * @param {string} routineId - The routine to duplicate
 * @param {string} userId - The user creating the duplicate
 * @returns {Promise<Object>} Result object with success status and new routine ID
 */
export const duplicateRoutine = async (routineId, userId) => {
  try {
    // Get the original routine
    const { success, routine } = await getRoutineById(routineId);
    
    if (!success) {
      return { success: false, error: 'Original routine not found' };
    }
    
    // Create new routine with same data but different user
    const { id: originalId, createdAt, updatedAt, ...routineData } = routine;
    const newRoutineData = {
      ...routineData,
      name: `${routineData.name} (Copy)`,
      isPrivate: true // Always make copies private
    };
    
    return await createRoutine(userId, newRoutineData);
  } catch (error) {
    console.error('Error duplicating routine:', error);
    return { 
      success: false, 
      error: error.message,
      message: 'Failed to duplicate routine.' 
    };
  }
};

export default {
  createRoutine,
  getUserRoutines,
  getRoutineById,
  updateRoutine,
  deleteRoutine,
  getPublicRoutines,
  duplicateRoutine
};