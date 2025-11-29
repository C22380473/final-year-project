import React, { createContext, useState, useContext } from 'react';

const RoutineContext = createContext();

export const RoutineProvider = ({ children }) => {
  // Main routine being created/edited
  const [currentRoutine, setCurrentRoutine] = useState({
    id: null,
    name: '',
    description: '',
    isPrivate: true,
    focusBlocks: []
  });

  // Current focus block being created/edited
  const [currentFocusBlock, setCurrentFocusBlock] = useState({
    id: null,
    name: '',
    description: '',
    exercises: []
  });

  // Add a focus block to the routine
  const addFocusBlock = (block) => {
    const blockWithId = {
      ...block,
      id: block.id || `block_${Date.now()}`
    };
    
    setCurrentRoutine(prev => ({
      ...prev,
      focusBlocks: [...prev.focusBlocks, blockWithId]
    }));
    
    // Reset current focus block after adding
    resetCurrentFocusBlock();
  };

  // Remove a focus block from routine
  const removeFocusBlock = (blockId) => {
    setCurrentRoutine(prev => ({
      ...prev,
      focusBlocks: prev.focusBlocks.filter(b => b.id !== blockId)
    }));
  };

  // Update an existing focus block in routine
  const updateFocusBlock = (blockId, updatedBlock) => {
    setCurrentRoutine(prev => ({
      ...prev,
      focusBlocks: prev.focusBlocks.map(b => 
        b.id === blockId ? { ...b, ...updatedBlock } : b
      )
    }));
  };

  // Add exercise to current focus block
  const addExercise = (exercise) => {
    const exerciseWithId = {
      ...exercise,
      id: exercise.id || `exercise_${Date.now()}`
    };
    
    setCurrentFocusBlock(prev => ({
      ...prev,
      exercises: [...prev.exercises, exerciseWithId]
    }));
  };

  // Remove exercise from current focus block
  const removeExercise = (exerciseId) => {
    setCurrentFocusBlock(prev => ({
      ...prev,
      exercises: prev.exercises.filter(e => e.id !== exerciseId)
    }));
  };

  // Update exercise in current focus block
  const updateExercise = (exerciseId, updatedExercise) => {
    setCurrentFocusBlock(prev => ({
      ...prev,
      exercises: prev.exercises.map(e => 
        e.id === exerciseId ? { ...e, ...updatedExercise } : e
      )
    }));
  };

  // Reorder exercises in current focus block
  const reorderExercises = (fromIndex, toIndex) => {
    setCurrentFocusBlock(prev => {
      const newExercises = [...prev.exercises];
      const [movedExercise] = newExercises.splice(fromIndex, 1);
      newExercises.splice(toIndex, 0, movedExercise);
      return {
        ...prev,
        exercises: newExercises
      };
    });
  };

  // Reorder focus blocks in routine
  const reorderFocusBlocks = (fromIndex, toIndex) => {
    setCurrentRoutine(prev => {
      const newBlocks = [...prev.focusBlocks];
      const [movedBlock] = newBlocks.splice(fromIndex, 1);
      newBlocks.splice(toIndex, 0, movedBlock);
      return {
        ...prev,
        focusBlocks: newBlocks
      };
    });
  };

  // Add resource to an exercise
  const addResourceToExercise = (exerciseId, resource) => {
    setCurrentFocusBlock(prev => ({
      ...prev,
      exercises: prev.exercises.map(e => {
        if (e.id === exerciseId) {
          return {
            ...e,
            resources: [...(e.resources || []), {
              ...resource,
              id: `resource_${Date.now()}`
            }]
          };
        }
        return e;
      })
    }));
  };

  // Remove resource from exercise
  const removeResourceFromExercise = (exerciseId, resourceId) => {
    setCurrentFocusBlock(prev => ({
      ...prev,
      exercises: prev.exercises.map(e => {
        if (e.id === exerciseId) {
          return {
            ...e,
            resources: (e.resources || []).filter(r => r.id !== resourceId)
          };
        }
        return e;
      })
    }));
  };

  // Calculate duration for current focus block
  const calculateFocusBlockDuration = () => {
    return currentFocusBlock.exercises.reduce((total, exercise) => {
      return total + (parseInt(exercise.duration) || 0);
    }, 0);
  };

  // Calculate total routine duration
  const calculateTotalDuration = () => {
    return currentRoutine.focusBlocks.reduce((total, block) => {
      const blockDuration = block.exercises.reduce((sum, ex) => 
        sum + (parseInt(ex.duration) || 0), 0
      );
      return total + blockDuration;
    }, 0);
  };

  // Load existing routine for editing
  const loadRoutine = (routine) => {
    setCurrentRoutine(routine);
  };

  // Load focus block for editing
  const loadFocusBlock = (block) => {
    setCurrentFocusBlock(block);
  };

  // Reset current focus block
  const resetCurrentFocusBlock = () => {
    setCurrentFocusBlock({
      id: null,
      name: '',
      description: '',
      exercises: []
    });
  };

  // Reset entire routine
  const resetRoutine = () => {
    setCurrentRoutine({
      id: null,
      name: '',
      description: '',
      isPrivate: true,
      focusBlocks: []
    });
    resetCurrentFocusBlock();
  };

  // Update routine details (name, description, privacy)
  const updateRoutineDetails = (updates) => {
    setCurrentRoutine(prev => ({
      ...prev,
      ...updates
    }));
  };

  // Update focus block details (name, description)
  const updateFocusBlockDetails = (updates) => {
    setCurrentFocusBlock(prev => ({
      ...prev,
      ...updates
    }));
  };

  const value = {
    // State
    currentRoutine,
    currentFocusBlock,
    
    // Routine operations
    setCurrentRoutine,
    updateRoutineDetails,
    loadRoutine,
    resetRoutine,
    
    // Focus block operations
    setCurrentFocusBlock,
    updateFocusBlockDetails,
    addFocusBlock,
    removeFocusBlock,
    updateFocusBlock,
    loadFocusBlock,
    resetCurrentFocusBlock,
    
    // Exercise operations
    addExercise,
    removeExercise,
    updateExercise,
    reorderExercises,
    
    // Resource operations
    addResourceToExercise,
    removeResourceFromExercise,
    
    // Calculations
    calculateFocusBlockDuration,
    calculateTotalDuration,
    
    // Reordering
    reorderFocusBlocks
  };

  return (
    <RoutineContext.Provider value={value}>
      {children}
    </RoutineContext.Provider>
  );
};

export const useRoutine = () => {
  const context = useContext(RoutineContext);
  if (!context) {
    throw new Error('useRoutine must be used within RoutineProvider');
  }
  return context;
};