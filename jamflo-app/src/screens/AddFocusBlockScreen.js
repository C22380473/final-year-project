import React, { useState, useEffect } from "react";
import { View, Text, ScrollView, TextInput, Alert, StyleSheet } from "react-native";
import { AppHeader } from "../components/AppHeader";
import { BottomNav } from "../components/BottomNav";
import { GradientButton } from "../components/GradientButton";
import { useRoutine } from "../contexts/RoutineContext";
import { BackBreadcrumbHeader } from "../components/BackBreadcrumbHeader";
import { Card } from "../components/Card";
import { ExerciseCard } from "../components/ExerciseCard";
import { ResourceModal } from "../components/ResourceModal";
import { OutlineButton } from "../components/OutlineButton";


export default function AddFocusBlockScreen({ navigation, route }) {
  const {
    currentRoutine,       
    loadFocusBlock,   
    currentFocusBlock,
    addFocusBlock,
    updateFocusBlock,
    resetCurrentFocusBlock,
  } = useRoutine();

  const isEditing = route.params?.isEditing || false;
  const blockId = route.params?.blockId || null;

  // Local screen state
  const [focusName, setFocusName] = useState("");
  const [focusDescription, setFocusDescription] = useState("");
  const [exercises, setExercises] = useState([]);

  // Resource modal state
  const [showResourceModal, setShowResourceModal] = useState(false);
  const [selectedExerciseId, setSelectedExerciseId] = useState(null);
  const [resourceType, setResourceType] = useState(null);
  const [resourceUrl, setResourceUrl] = useState("");

  // Load data when editing or creating new
  useEffect(() => {
  if (isEditing && blockId) {
    const block = currentRoutine.focusBlocks.find(b => b.blockId === blockId);
    loadFocusBlock(block);

    setFocusName(block.name);
    setFocusDescription(block.description);
    setExercises(block.exercises);
  } else {
    resetCurrentFocusBlock();
    setFocusName("");
    setFocusDescription("");
    setExercises([]);
  }
}, [isEditing, blockId]);

  // Add a blank exercise
  const addNewExercise = () => {
    const newExercise = {
      exerciseId: `exercise_${Date.now()}_${Math.floor(Math.random() * 99999)}`,
      name: "",
      duration: "",
      tempo: "",
      category: "",
      notes: "",
      resources: [],
    };
    setExercises((prev) => [...prev, newExercise]);
  };

  // Remove exercise
  const handleRemoveExercise = (exerciseId) => {
    if (exercises.length === 1) {
      Alert.alert("Cannot Remove", "A focus block must have at least one exercise.");
      return;
    }

    Alert.alert("Remove Exercise", "Are you sure?", [
      { text: "Cancel", style: "cancel" },
      { text: "Remove", style: "destructive", onPress: () => setExercises((prev) => prev.filter((e) => e.exerciseId !== exerciseId)) },
    ]);
  };

  // Reorder exercise
  const moveExerciseUp = (idx) => {
    if (idx === 0) return;
    const copy = [...exercises];
    [copy[idx - 1], copy[idx]] = [copy[idx], copy[idx - 1]];
    setExercises(copy);
  };

  const moveExerciseDown = (idx) => {
    if (idx === exercises.length - 1) return;
    const copy = [...exercises];
    [copy[idx], copy[idx + 1]] = [copy[idx + 1], copy[idx]];
    setExercises(copy);
  };

  // Update exercise field
  const updateExercise = (exerciseId, field, value) => {
    setExercises((prev) =>
      prev.map((ex) => (ex.exerciseId === exerciseId ? { ...ex, [field]: value } : ex))
    );
  };

  // Modal handlers
  const openResourceModal = (exerciseId) => {
    setSelectedExerciseId(exerciseId);
    setResourceType(null);
    setResourceUrl("");
    setShowResourceModal(true);
  };

  const closeResourceModal = () => {
    setShowResourceModal(false);
    setSelectedExerciseId(null);
    setResourceType(null);
    setResourceUrl("");
  };

  const handleSaveResource = () => {
    if (!resourceType || !resourceUrl.trim()) {
      Alert.alert("Error", "Please select a type and enter a URL.");
      return;
    }

    setExercises((prev) =>
      prev.map((ex) =>
        ex.exerciseId === selectedExerciseId
          ? {
              ...ex,
              resources: [
                ...ex.resources,
                {
                  resourceId: `resource_${Date.now()}_${Math.floor(Math.random() * 99999)}`,
                  type: resourceType,
                  url: resourceUrl,
                  addedAt: new Date().toISOString(),
                },
              ],
            }
          : ex
      )
    );

    closeResourceModal();
  };

  // Total duration
  const calculateTotalDuration = () =>
    exercises.reduce((sum, ex) => sum + (parseInt(ex.duration) || 0), 0);

  // Save to routine
  const handleAddToRoutine = () => {
    if (!focusName.trim()) {
      Alert.alert("Error", "Please enter a focus name");
      return;
    }

    if (exercises.some((ex) => !ex.name.trim() || !ex.duration)) {
      Alert.alert("Error", "Please complete all exercise names and durations");
      return;
    }

    const focusBlock = {
      blockId: blockId || currentFocusBlock.blockId || `block_${Date.now()}_${Math.floor(Math.random() * 99999)}`,
      name: focusName,
      description: focusDescription,
      exercises,
      totalDuration: calculateTotalDuration(),
    };

    if (isEditing) {
      updateFocusBlock(blockId, focusBlock);
      Alert.alert("Success", "Focus block updated!", [
        { text: "OK", onPress: () => navigation.navigate("RoutineEditor") },
      ]);
    } else {
      addFocusBlock(focusBlock);
      Alert.alert("Success", "Focus block added!", [
        { text: "OK", onPress: () => navigation.navigate("RoutineEditor") },
      ]);
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: "#f8f8f8" }}>
      <AppHeader />

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingBottom: 120, paddingHorizontal: 20, paddingTop: 12 }}
        showsVerticalScrollIndicator={false}
      >
        <BackBreadcrumbHeader
          navigation={navigation}
          breadcrumb={
            <>
              Create a Routine ›{" "}
              <Text style={{ fontWeight: "700" }}>Add a Focus Block</Text>
            </>
          }
        />

        <Text style={styles.title}>{isEditing ? "Edit Focus Block" : "Add a Focus Block"}</Text>
        <Text style={styles.subtitle}>
          Review or edit exercises before {isEditing ? "updating" : "adding"} this block.
        </Text>

        {/* Focus Details */}
        <Card>
          <Text style={styles.cardTitle}>Focus Details</Text>

          <Text style={styles.label}>Focus Name *</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter name"
            value={focusName}
            onChangeText={setFocusName}
          />

          <Text style={styles.label}>Description</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Optional description"
            multiline
            value={focusDescription}
            onChangeText={setFocusDescription}
          />

          <Text style={styles.totalDuration}>Total Duration: {calculateTotalDuration()} mins</Text>
        </Card>

        {/* Exercise Header */}
        <View style={styles.exerciseHeader}>
          <Text style={styles.sectionTitle}>Exercises ({exercises.length})</Text>
          <GradientButton
            title="Add Exercise"
            onPress={addNewExercise}
            gradientStyle={styles.addExerciseButton}
            textStyle={styles.addExerciseText}
          />
        </View>

        {/* Exercise Cards */}
        {exercises.map((exercise, index) => (
          <ExerciseCard
            key={exercise.exerciseId}
            exercise={exercise}
            index={index}
            total={exercises.length}
            onChange={(field, value) => updateExercise(exercise.exerciseId, field, value)}
            onReorderUp={() => moveExerciseUp(index)}
            onReorderDown={() => moveExerciseDown(index)}
            onRemove={() => handleRemoveExercise(exercise.exerciseId)}
            onAddResource={() => openResourceModal(exercise.exerciseId)}
          />
        ))}

        {/* Bottom Buttons */}
        <View style={styles.bottomRow}>
          <GradientButton
            title={isEditing ? "Update Focus Block" : "Add to Routine"}
            onPress={handleAddToRoutine}
            style={{ flex: 1, marginRight: 10 }}
          />

        <OutlineButton
          title="Cancel"
          onPress={() => {
            resetCurrentFocusBlock();
            navigation.goBack();
          }}
          style={{ flex: 1 }}
        />

        </View>
      </ScrollView>

      {/* Resource Modal */}
      <ResourceModal
        visible={showResourceModal}
        resourceType={resourceType}
        setResourceType={setResourceType}
        resourceUrl={resourceUrl}
        setResourceUrl={setResourceUrl}
        onSave={handleSaveResource}
        onClose={closeResourceModal}
      />

      <BottomNav activeTab="Create" onTabPress={(tab) => tab === "Home" && navigation.navigate("Home")} />
    </View>
  );
}

const styles = StyleSheet.create({
  title: { fontSize: 28, fontWeight: "700", marginBottom: 6, color: "#000" },
  subtitle: { fontSize: 13, color: "#666", marginBottom: 20 },
  cardTitle: { fontSize: 15, fontWeight: "700", marginBottom: 12 },
  label: { fontSize: 13, fontWeight: "500", marginBottom: 6 },
  input: {
    backgroundColor: "#F5F5F5",
    borderRadius: 8,
    padding: 10,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#E5E5E5",
    fontSize: 14,
  },
  textArea: { minHeight: 80, textAlignVertical: "top" },
  sectionTitle: { fontSize: 20, fontWeight: "700", color: "#000" },
  totalDuration: { color: "#218ED5", fontWeight: "600" },
  exerciseHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginVertical: 12,
  },
  bottomRow: { flexDirection: "row", marginTop: 20, marginBottom: 20 },
  outlineButton: {
    borderWidth: 1,
    borderColor: "#218ED5",
    borderRadius: 999,
    paddingVertical: 11,
    alignItems: "center",
  },
  
  addExerciseButton: {
  paddingVertical: 10,
  paddingHorizontal: 15,
  borderRadius: 5,
  alignItems: "center",
  justifyContent: "center",
},

addExerciseText: {
  fontSize: 16,
  fontWeight: "600",
}
});
