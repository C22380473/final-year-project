import React, { createContext, useContext, useState } from "react";

const RoutineContext = createContext();
export const useRoutine = () => useContext(RoutineContext);

export const RoutineProvider = ({ children }) => {
  /* -------------------- STATE -------------------- */

  const [currentRoutine, setCurrentRoutine] = useState({
    routineId: null,
    name: "",
    description: "",
    isPrivate: true,
    focusBlocks: [],
  });

  const [currentFocusBlock, setCurrentFocusBlock] = useState({
    blockId: null,
    name: "",
    description: "",
    exercises: [],
  });

  /* -------------------- HELPERS -------------------- */

  const generateId = (prefix) =>
    `${prefix}_${Date.now()}_${Math.floor(Math.random() * 100000)}`;

  /* -------------------- TEMPLATE CLONING -------------------- */

  const cloneRoutineTemplate = (template) => {
    return {
      routineId: null,
      name: template.name,
      description: template.description,
      isPrivate: template.isPrivate,
      focusBlocks: template.focusBlocks.map((block) => ({
        blockId: generateId("block"),
        name: block.name,
        description: block.description || "",
        exercises: block.exercises.map((exercise) => ({
          ...exercise,
          exerciseId: generateId("exercise"),
          resources: exercise.resources || [],
        })),
      })),
    };
  };

  const loadRoutineTemplate = (template) => {
    const cloned = cloneRoutineTemplate(template);
    setCurrentRoutine(cloned);
    resetCurrentFocusBlock();
  };

  /* -------------------- ROUTINE OPS -------------------- */

  const resetRoutine = () => {
    setCurrentRoutine({
      routineId: null,
      name: "",
      description: "",
      isPrivate: true,
      focusBlocks: [],
    });
    resetCurrentFocusBlock();
  };

  const loadRoutine = (routine) => {
    setCurrentRoutine(routine);
  };

  const updateRoutineDetails = (updates) => {
    setCurrentRoutine((prev) => ({ ...prev, ...updates }));
  };

  /* -------------------- FOCUS BLOCK OPS -------------------- */

  const addFocusBlock = (block) => {
    const blockWithId = {
      ...block,
      blockId: block.blockId || generateId("block"),
    };

    setCurrentRoutine((prev) => ({
      ...prev,
      focusBlocks: [...prev.focusBlocks, blockWithId],
    }));
  };

  const updateFocusBlock = (updatedBlock) => {
    setCurrentRoutine((prev) => ({
      ...prev,
      focusBlocks: prev.focusBlocks.map((b) =>
        b.blockId === updatedBlock.blockId ? updatedBlock : b
      ),
    }));
  };

  const removeFocusBlock = (blockId) => {
    setCurrentRoutine((prev) => ({
      ...prev,
      focusBlocks: prev.focusBlocks.filter((b) => b.blockId !== blockId),
    }));
  };

  const loadFocusBlock = (block) => {
    setCurrentFocusBlock(block);
  };

  const resetCurrentFocusBlock = () => {
    setCurrentFocusBlock({
      blockId: null,
      name: "",
      description: "",
      exercises: [],
    });
  };

  /* -------------------- EXERCISE OPS -------------------- */

  const addExercise = (exercise = {}) => {
    const exerciseWithId = {
      ...exercise,
      exerciseId:
        exercise.exerciseId || generateId("exercise"),
      name: exercise.name || "",
      duration: exercise.duration || "",
      tempo: exercise.tempo || "",
      category: exercise.category || "",
      notes: exercise.notes || "",
      resources: exercise.resources || [],
    };

    setCurrentFocusBlock((prev) => ({
      ...prev,
      exercises: [...prev.exercises, exerciseWithId],
    }));
  };

  const updateExercise = (exerciseId, field, value) => {
    setCurrentFocusBlock((prev) => ({
      ...prev,
      exercises: prev.exercises.map((ex) =>
        ex.exerciseId === exerciseId ? { ...ex, [field]: value } : ex
      ),
    }));
  };

  const removeExercise = (exerciseId) => {
    setCurrentFocusBlock((prev) => ({
      ...prev,
      exercises: prev.exercises.filter((ex) => ex.exerciseId !== exerciseId),
    }));
  };

  const reorderExercises = (newOrder) => {
    setCurrentFocusBlock((prev) => ({
      ...prev,
      exercises: newOrder,
    }));
  };

  /* -------------------- CALCULATIONS -------------------- */

  const calculateFocusBlockDuration = (block) => {
    return block.exercises.reduce(
      (sum, ex) => sum + Number(ex.duration || 0),
      0
    );
  };

  const calculateTotalDuration = () => {
    return currentRoutine.focusBlocks.reduce(
      (sum, block) => sum + calculateFocusBlockDuration(block),
      0
    );
  };

  /* -------------------- REORDER BLOCKS -------------------- */

  const reorderFocusBlocks = (newOrder) => {
    setCurrentRoutine((prev) => ({
      ...prev,
      focusBlocks: newOrder,
    }));
  };

  /* -------------------- CONTEXT VALUE -------------------- */

  return (
    <RoutineContext.Provider
      value={{
        // State
        currentRoutine,
        currentFocusBlock,

        // Templates
        loadRoutineTemplate,

        // Routine
        setCurrentRoutine,
        loadRoutine,
        updateRoutineDetails,
        resetRoutine,

        // Focus Blocks
        setCurrentFocusBlock,
        addFocusBlock,
        updateFocusBlock,
        removeFocusBlock,
        loadFocusBlock,
        resetCurrentFocusBlock,
        reorderFocusBlocks,

        // Exercises
        addExercise,
        updateExercise,
        removeExercise,
        reorderExercises,

        // Calculations
        calculateFocusBlockDuration,
        calculateTotalDuration,
      }}
    >
      {children}
    </RoutineContext.Provider>
  );
};
