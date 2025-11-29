import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, Modal, Alert } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { AppHeader } from "../components/AppHeader";
import { BottomNav } from "../components/BottomNav";
import { GradientButton } from "../components/GradientButton";
import { LinearGradient } from "expo-linear-gradient";
import { useRoutine } from "../../contexts/RoutineContext";

const CATEGORIES = [
  "Warm Up",
  "Scales",
  "Chords",
  "Technique",
  "Rhythm",
  "Theory",
  "Improvisation",
  "Repertoire",
  "Cool Down"
];

export default function AddFocusBlockScreen({ navigation, route }) {
  const {
    currentFocusBlock,
    updateFocusBlockDetails,
    addExercise,
    removeExercise,
    updateExercise,
    addResourceToExercise,
    calculateFocusBlockDuration,
    addFocusBlock,
    updateFocusBlock,
    resetCurrentFocusBlock
  } = useRoutine();

  // Check if we're in edit mode
  const isEditing = route.params?.isEditing || false;
  const blockId = route.params?.blockId || null;

  const [focusName, setFocusName] = useState('');
  const [focusDescription, setFocusDescription] = useState('');
  const [exercises, setExercises] = useState([]);
  
  // Resource modal state
  const [showResourceModal, setShowResourceModal] = useState(false);
  const [selectedExerciseId, setSelectedExerciseId] = useState(null);
  const [resourceType, setResourceType] = useState(null);
  const [resourceUrl, setResourceUrl] = useState('');

  // Load existing focus block if editing
  useEffect(() => {
    if (currentFocusBlock.name || currentFocusBlock.exercises.length > 0) {
      setFocusName(currentFocusBlock.name);
      setFocusDescription(currentFocusBlock.description);
      setExercises(currentFocusBlock.exercises);
    } else {
      // Initialize with one empty exercise
      addNewExercise();
    }
  }, []);

  // Add new empty exercise
  const addNewExercise = () => {
    const newExercise = {
      id: `exercise_${Date.now()}`,
      name: '',
      duration: '',
      tempo: '',
      category: '',
      notes: '',
      resources: []
    };
    setExercises(prev => [...prev, newExercise]);
  };

  // Remove an exercise
  const handleRemoveExercise = (exerciseId) => {
    if (exercises.length === 1) {
      Alert.alert(
        'Cannot Remove',
        'A focus block must have at least one exercise.',
        [{ text: 'OK' }]
      );
      return;
    }

    Alert.alert(
      'Remove Exercise',
      'Are you sure you want to remove this exercise?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: () => {
            setExercises(prev => prev.filter(e => e.id !== exerciseId));
          }
        }
      ]
    );
  };

  // Move exercise up
  const moveExerciseUp = (index) => {
    if (index === 0) return;
    const newExercises = [...exercises];
    [newExercises[index - 1], newExercises[index]] = [newExercises[index], newExercises[index - 1]];
    setExercises(newExercises);
  };

  // Move exercise down
  const moveExerciseDown = (index) => {
    if (index === exercises.length - 1) return;
    const newExercises = [...exercises];
    [newExercises[index], newExercises[index + 1]] = [newExercises[index + 1], newExercises[index]];
    setExercises(newExercises);
  };

  // Update exercise field
  const handleUpdateExercise = (exerciseId, field, value) => {
    setExercises(prev =>
      prev.map(ex =>
        ex.id === exerciseId ? { ...ex, [field]: value } : ex
      )
    );
  };

  // Open resource modal for specific exercise
  const openResourceModal = (exerciseId) => {
    setSelectedExerciseId(exerciseId);
    setResourceType(null);
    setResourceUrl('');
    setShowResourceModal(true);
  };

  // Close resource modal
  const closeResourceModal = () => {
    setShowResourceModal(false);
    setSelectedExerciseId(null);
    setResourceType(null);
    setResourceUrl('');
  };

  // Save resource to exercise
  const handleSaveResource = () => {
    if (!resourceType) {
      Alert.alert('Error', 'Please select a resource type');
      return;
    }

    if (!resourceUrl.trim()) {
      Alert.alert('Error', 'Please enter a URL');
      return;
    }

    setExercises(prev =>
      prev.map(ex => {
        if (ex.id === selectedExerciseId) {
          return {
            ...ex,
            resources: [
              ...(ex.resources || []),
              {
                id: `resource_${Date.now()}`,
                type: resourceType,
                url: resourceUrl,
                addedAt: new Date().toISOString()
              }
            ]
          };
        }
        return ex;
      })
    );

    closeResourceModal();
    Alert.alert('Success', 'Resource added successfully');
  };

  // Calculate total duration
  const calculateTotalDuration = () => {
    return exercises.reduce((total, ex) => {
      const duration = parseInt(ex.duration) || 0;
      return total + duration;
    }, 0);
  };

  // Validate and add/update focus block to routine
  const handleAddToRoutine = () => {
    console.log('🎯 Add/Update to routine clicked. Edit mode:', isEditing);
    
    // Validation
    if (!focusName.trim()) {
      Alert.alert('Error', 'Please enter a focus name');
      return;
    }

    // Check if all exercises have names and durations
    const invalidExercise = exercises.find(ex => !ex.name.trim() || !ex.duration);
    if (invalidExercise) {
      Alert.alert('Error', 'Please complete all exercise names and durations');
      return;
    }

    // Create focus block object
    const focusBlock = {
      id: blockId || currentFocusBlock.id || `block_${Date.now()}`,
      name: focusName,
      description: focusDescription,
      exercises: exercises,
      totalDuration: calculateTotalDuration()
    };

    console.log('📦 Focus block data:', focusBlock);

    if (isEditing && blockId) {
      // Update existing focus block
      console.log('✏️ Updating focus block:', blockId);
      updateFocusBlock(blockId, focusBlock);
      
      Alert.alert(
        'Success',
        'Focus block updated!',
        [
          {
            text: 'OK',
            onPress: () => {
              resetCurrentFocusBlock();
              navigation.navigate('RoutineEditor');
            }
          }
        ]
      );
    } else {
      // Add new focus block
      console.log('➕ Adding new focus block');
      addFocusBlock(focusBlock);

      Alert.alert(
        'Success',
        'Focus block added to routine!',
        [
          {
            text: 'OK',
            onPress: () => navigation.navigate('RoutineEditor')
          }
        ]
      );
    }
  };

  const handleTabPress = (tab) => {
    if (tab === "Home") navigation.navigate("Home");
    if (tab === "Create") {
      // Stay on create flow
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
        {/* Back Button and Breadcrumb Row */}
        <View style={styles.headerRow}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Text style={styles.backText}>← Back</Text>
          </TouchableOpacity>
          <Text style={styles.breadcrumb}>
            Create a Routine › <Text style={styles.breadcrumbBold}>Add a Focus Block</Text>
          </Text>
        </View>
        
        <Text style={styles.title}>{isEditing ? 'Edit Focus Block' : 'Add a Focus Block'}</Text>
        <Text style={styles.subtitle}>
          Review or Edit exercises before {isEditing ? 'updating' : 'adding this to'} your routine.
        </Text>

        {/* Focus Details */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Focus Details</Text>

          <Text style={styles.label}>Focus Name *</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter a focus name"
            value={focusName}
            onChangeText={setFocusName}
          />

          <Text style={styles.label}>Description</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            multiline
            placeholder="Briefly describe this focus block"
            value={focusDescription}
            onChangeText={setFocusDescription}
          />

          <Text style={styles.totalDuration}>
            Total Duration: {calculateTotalDuration()} Mins
          </Text>
        </View>

        {/* Exercises */}
        <View style={styles.exerciseHeaderRow}>
          <Text style={styles.sectionTitle}>Exercises ({exercises.length})</Text>
          <GradientButton
            title="Add Exercise"
            onPress={addNewExercise}
            gradientStyle={styles.addExerciseButton}
          />
        </View>

        {/* Exercise Cards */}
        {exercises.map((exercise, index) => (
          <View key={exercise.id} style={styles.card}>
            <View style={styles.exerciseTitleRow}>
              <View style={styles.exerciseTitleLeft}>
                {/* Reorder buttons */}
                <View style={styles.reorderButtons}>
                  <TouchableOpacity
                    onPress={() => moveExerciseUp(index)}
                    disabled={index === 0}
                    style={[styles.reorderButton, index === 0 && styles.reorderButtonDisabled]}
                  >
                    <Ionicons 
                      name="chevron-up" 
                      size={18} 
                      color={index === 0 ? "#CCC" : "#218ED5"} 
                    />
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => moveExerciseDown(index)}
                    disabled={index === exercises.length - 1}
                    style={[styles.reorderButton, index === exercises.length - 1 && styles.reorderButtonDisabled]}
                  >
                    <Ionicons 
                      name="chevron-down" 
                      size={18} 
                      color={index === exercises.length - 1 ? "#CCC" : "#218ED5"} 
                    />
                  </TouchableOpacity>
                </View>
                <Text style={styles.cardSubtitle}>Exercise {index + 1}</Text>
              </View>
              {exercises.length > 1 && (
                <TouchableOpacity
                  onPress={() => handleRemoveExercise(exercise.id)}
                  style={styles.removeIconButton}
                >
                  <Ionicons name="trash-outline" size={18} color="#E74C3C" />
                </TouchableOpacity>
              )}
            </View>

            <Text style={styles.label}>Exercise Name *</Text>
            <TextInput
              style={styles.input}
              placeholder="Name of exercise"
              value={exercise.name}
              onChangeText={(text) => handleUpdateExercise(exercise.id, 'name', text)}
            />

            <View style={styles.row}>
              <View style={{ flex: 1, marginRight: 6 }}>
                <Text style={styles.label}>Duration (Min) *</Text>
                <TextInput
                  style={styles.input}
                  placeholder="e.g. 5"
                  keyboardType="numeric"
                  value={exercise.duration}
                  onChangeText={(text) => handleUpdateExercise(exercise.id, 'duration', text)}
                />
              </View>
              <View style={{ flex: 1, marginLeft: 6 }}>
                <Text style={styles.label}>Tempo (BPM)</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Optional"
                  keyboardType="numeric"
                  value={exercise.tempo}
                  onChangeText={(text) => handleUpdateExercise(exercise.id, 'tempo', text)}
                />
              </View>
            </View>

            <Text style={styles.label}>Category</Text>
            <View style={styles.categoryContainer}>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {CATEGORIES.map((cat) => (
                  <TouchableOpacity
                    key={cat}
                    style={[
                      styles.categoryChip,
                      exercise.category === cat && styles.categoryChipSelected
                    ]}
                    onPress={() => handleUpdateExercise(exercise.id, 'category', cat)}
                  >
                    <Text
                      style={[
                        styles.categoryChipText,
                        exercise.category === cat && styles.categoryChipTextSelected
                      ]}
                    >
                      {cat}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

            <Text style={styles.label}>Notes</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              multiline
              placeholder="Optional notes"
              value={exercise.notes}
              onChangeText={(text) => handleUpdateExercise(exercise.id, 'notes', text)}
            />

            {/* Show resources if any */}
            {exercise.resources && exercise.resources.length > 0 && (
              <View style={styles.resourcesSection}>
                <Text style={styles.label}>Resources ({exercise.resources.length})</Text>
                {exercise.resources.map((resource) => (
                  <View key={resource.id} style={styles.resourceItem}>
                    <Ionicons
                      name={
                        resource.type === 'video' ? 'videocam' :
                        resource.type === 'file' ? 'document' : 'link'
                      }
                      size={16}
                      color="#218ED5"
                    />
                    <Text style={styles.resourceText} numberOfLines={1}>
                      {resource.url}
                    </Text>
                  </View>
                ))}
              </View>
            )}

            <View style={styles.exerciseButtonsRow}>
              <GradientButton
                title="Add Resource"
                onPress={() => openResourceModal(exercise.id)}
                style={{ marginRight: 8 }}
                gradientStyle={styles.resourceButton}
              />

              {exercises.length > 1 && (
                <TouchableOpacity
                  style={[styles.outlineButton, { marginLeft: 8 }]}
                  onPress={() => handleRemoveExercise(exercise.id)}
                >
                  <Text style={styles.outlineButtonText}>Remove</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        ))}

        <View style={styles.bottomButtonsRow}>
          <GradientButton
            title={isEditing ? "Update Focus Block" : "Add to Routine"}
            onPress={handleAddToRoutine}
            style={{ flex: 1, marginRight: 10 }}
          />
          <TouchableOpacity
            style={[styles.outlineButton, { flex: 1 }]}
            onPress={() => {
              resetCurrentFocusBlock();
              navigation.goBack();
            }}
          >
            <Text style={styles.outlineButtonText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Resource Modal */}
      <Modal
        visible={showResourceModal}
        transparent
        animationType="fade"
        onRequestClose={closeResourceModal}
      >
        <View style={styles.modalBackdrop}>
          <LinearGradient colors={["#218ED5", "#13B4B0"]} style={styles.modalCard}>
            <Text style={styles.modalTitle}>Add a Resource</Text>

            <View style={styles.modalRow}>
              <TouchableOpacity
                style={[
                  styles.modalOption,
                  resourceType === 'file' && styles.modalOptionSelected
                ]}
                onPress={() => setResourceType('file')}
              >
                <Ionicons name="document" size={32} color="#fff" />
                <Text style={styles.modalOptionTitle}>Attach a File</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[
                  styles.modalOption,
                  resourceType === 'video' && styles.modalOptionSelected
                ]}
                onPress={() => setResourceType('video')}
              >
                <Ionicons name="videocam" size={32} color="#fff" />
                <Text style={styles.modalOptionTitle}>Link a Video</Text>
              </TouchableOpacity>
            </View>

            <Text style={[styles.label, { color: "#fff", marginTop: 16 }]}>
              Resource URL
            </Text>
            <TextInput
              style={[styles.input, { backgroundColor: "#fff" }]}
              placeholder="Paste a URL"
              value={resourceUrl}
              onChangeText={setResourceUrl}
              autoCapitalize="none"
            />

            <View style={styles.modalButtonsRow}>
              <TouchableOpacity
                style={[styles.outlineButton, { borderColor: "#fff", flex: 1, marginRight: 8 }]}
                onPress={closeResourceModal}
              >
                <Text style={[styles.outlineButtonText, { color: "#fff" }]}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.saveButton, { flex: 1, marginLeft: 8 }]}
                onPress={handleSaveResource}
              >
                <Text style={styles.saveButtonText}>Save</Text>
              </TouchableOpacity>
            </View>
          </LinearGradient>
        </View>
      </Modal>

      <BottomNav activeTab="Create" onTabPress={handleTabPress} />
    </View>
  );
}

const styles = StyleSheet.create({
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  backButton: {
    borderWidth: 2,
    borderColor: "#13B4B0",
    borderRadius: 24,
    paddingVertical: 5,
    paddingHorizontal: 10,
  },
  backText: {
    color: "#000",
    fontSize: 16,
    fontWeight: "600",
  },
  breadcrumb: {
    fontSize: 12,
    color: "#666",
    fontStyle: "italic",
  },
  breadcrumbBold: {
    fontWeight: "700",
    color: "#000",
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    marginBottom: 6,
    marginTop: 8,
    color: "#000",
  },
  subtitle: {
    fontSize: 13,
    color: "#666",
    marginBottom: 20,
    lineHeight: 18,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#E5E5E5",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: "700",
    marginBottom: 12,
    color: "#000",
  },
  cardSubtitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#000",
  },
  exerciseTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  exerciseTitleLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  reorderButtons: {
    flexDirection: 'column',
    marginRight: 8,
  },
  reorderButton: {
    padding: 2,
  },
  reorderButtonDisabled: {
    opacity: 0.3,
  },
  removeIconButton: {
    padding: 4,
  },
  label: {
    fontSize: 13,
    color: "#333",
    marginBottom: 6,
    fontWeight: "500",
  },
  input: {
    backgroundColor: "#F5F5F5",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 12,
    fontSize: 14,
    borderWidth: 1,
    borderColor: "#E5E5E5",
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: "top",
  },
  totalDuration: {
    fontSize: 13,
    color: "#218ED5",
    marginTop: 4,
    fontWeight: "600",
  },
  exerciseHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 12,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#000",
  },
  addExerciseButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    minWidth: 120,
  },
  resourceButton: {
    paddingVertical: 11,
    paddingHorizontal: 20,
  },
  row: {
    flexDirection: "row",
  },
  categoryContainer: {
    marginBottom: 12,
  },
  categoryChip: {
    backgroundColor: "#F5F5F5",
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 8,
    borderWidth: 1,
    borderColor: "#E5E5E5",
  },
  categoryChipSelected: {
    backgroundColor: "#218ED5",
    borderColor: "#218ED5",
  },
  categoryChipText: {
    fontSize: 13,
    color: "#666",
    fontWeight: "500",
  },
  categoryChipTextSelected: {
    color: "#fff",
    fontWeight: "600",
  },
  resourcesSection: {
    marginTop: 8,
    marginBottom: 8,
  },
  resourceItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0F8FF',
    padding: 8,
    borderRadius: 6,
    marginBottom: 6,
  },
  resourceText: {
    marginLeft: 8,
    fontSize: 12,
    color: '#218ED5',
    flex: 1,
  },
  exerciseButtonsRow: {
    flexDirection: "row",
    marginTop: 8,
  },
  bottomButtonsRow: {
    flexDirection: "row",
    marginTop: 20,
    marginBottom: 20,
  },
  outlineButton: {
    borderWidth: 1,
    borderColor: "#218ED5",
    borderRadius: 999,
    paddingVertical: 11,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 20,
  },
  outlineButtonText: {
    color: "#000000ff",
    fontWeight: "600",
    fontSize: 14,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 24,
  },
  modalCard: {
    width: "100%",
    borderRadius: 20,
    padding: 24,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: "#fff",
    textAlign: "center",
    marginBottom: 20,
  },
  modalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  modalOption: {
    flex: 1,
    backgroundColor: "rgba(255,255,255,0.2)",
    borderRadius: 12,
    padding: 20,
    marginHorizontal: 6,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 100,
    borderWidth: 2,
    borderColor: "transparent",
  },
  modalOptionSelected: {
    backgroundColor: "rgba(255,255,255,0.3)",
    borderColor: "#fff",
  },
  modalOptionTitle: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 14,
    textAlign: "center",
    marginTop: 8,
  },
  modalButtonsRow: {
    flexDirection: "row",
    marginTop: 20,
    justifyContent: "space-between",
  },
  saveButton: {
    backgroundColor: "#fff",
    borderRadius: 999,
    paddingVertical: 11,
    paddingHorizontal: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  saveButtonText: {
    color: "#218ED5",
    fontWeight: "700",
    fontSize: 14,
  },
});