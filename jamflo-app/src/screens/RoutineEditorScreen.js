import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert, ActivityIndicator,} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { AppHeader } from "../components/AppHeader";
import { BottomNav } from "../components/BottomNav";
import { GradientButton } from "../components/GradientButton";
import { useRoutine } from "../../contexts/RoutineContext";
import { createRoutine, updateRoutine } from "../../services/routineService";
import { auth } from "../config/firebaseConfig";

export default function RoutineEditorScreen({ navigation, route }) {
  const {
    currentRoutine,
    updateRoutineDetails,
    removeFocusBlock,
    calculateTotalDuration,
    resetRoutine,
    loadFocusBlock,
    reorderFocusBlocks
  } = useRoutine();

  const [routineName, setRoutineName] = useState('');
  const [routineDescription, setRoutineDescription] = useState('');
  const [isPrivate, setIsPrivate] = useState(true);
  const [saving, setSaving] = useState(false);

  // Load routine data on mount
  useEffect(() => {
    setRoutineName(currentRoutine.name || '');
    setRoutineDescription(currentRoutine.description || '');
    setIsPrivate(currentRoutine.isPrivate !== false);
  }, [currentRoutine]);

  // Handle removing a focus block
  const handleRemoveFocusBlock = (blockId) => {
    Alert.alert(
      'Remove Focus Block',
      'Are you sure you want to remove this focus block?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: () => removeFocusBlock(blockId)
        }
      ]
    );
  };

  // Handle editing a focus block
  const handleEditFocusBlock = (block) => {
    console.log('✏️ Editing focus block:', block.name);
    
    // Load the focus block into context for editing
    loadFocusBlock(block);
    
    // Navigate to AddFocusBlock screen with edit mode
    navigation.navigate('AddFocusBlock', { 
      isEditing: true,
      blockId: block.id 
    });
  };

  // Move focus block up
  const moveFocusBlockUp = (index) => {
    if (index === 0) return;
    reorderFocusBlocks(index, index - 1);
  };

  // Move focus block down
  const moveFocusBlockDown = (index) => {
    if (index === currentRoutine.focusBlocks.length - 1) return;
    reorderFocusBlocks(index, index + 1);
  };

  // Save routine to Firestore
  const handleSaveRoutine = async () => {
    // Validation
    if (!routineName.trim()) {
      Alert.alert('Error', 'Please enter a routine name');
      return;
    }

    if (currentRoutine.focusBlocks.length === 0) {
      Alert.alert('Error', 'Please add at least one focus block to your routine');
      return;
    }

    const user = auth.currentUser;
    if (!user) {
      Alert.alert('Error', 'You must be logged in to save a routine');
      return;
    }

    setSaving(true);

    try {
      // Prepare routine data
      const routineData = {
        name: routineName,
        description: routineDescription,
        isPrivate: isPrivate,
        focusBlocks: currentRoutine.focusBlocks,
        totalDuration: calculateTotalDuration()
      };

      let result;
      
      // Check if updating existing routine or creating new
      if (currentRoutine.id) {
        result = await updateRoutine(currentRoutine.id, routineData);
      } else {
        result = await createRoutine(user.uid, routineData);
      }

      setSaving(false);

      if (result.success) {
        Alert.alert(
          'Success',
          result.message || 'Routine saved successfully!',
          [
            {
              text: 'OK',
              onPress: () => {
                resetRoutine();
                navigation.navigate('Home');
              }
            }
          ]
        );
      } else {
        Alert.alert('Error', result.message || 'Failed to save routine');
      }
    } catch (error) {
      setSaving(false);
      console.error('Error saving routine:', error);
      Alert.alert('Error', 'An unexpected error occurred while saving');
    }
  };

  const handleTabPress = (tab) => {
    if (tab === "Home") navigation.navigate("Home");
  };

  return (
    <View style={{ flex: 1, backgroundColor: "#f8f8f8" }}>
      <AppHeader />

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingBottom: 120, paddingHorizontal: 20, paddingTop: 12 }}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.headerRow}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Text style={styles.backText}>← Back</Text>
          </TouchableOpacity>
          <Text style={styles.breadcrumb}>
            Create a Routine › Add a Focus Block › <Text style={styles.breadcrumbBold}>Routine Editor</Text>
          </Text>
        </View>

        <View style={styles.titleRow}>
          <Text style={styles.title}>Routine Editor</Text>
          <GradientButton
            title={saving ? "Saving..." : "Save Routine"}
            onPress={handleSaveRoutine}
            gradientStyle={styles.saveRoutineButton}
            disabled={saving}
          />
        </View>

        <View style={styles.card}>
          <View style={styles.detailHeaderRow}>
            <Text style={styles.cardTitle}>Routine Details</Text>

            <View style={styles.visibilityRow}>
              <Text style={styles.visibilityLabel}>Visibility:</Text>
              <TouchableOpacity
                style={[
                  styles.toggleButton,
                  { backgroundColor: isPrivate ? "#4CAF50" : "#9E9E9E" }
                ]}
                onPress={() => setIsPrivate(!isPrivate)}
              >
                <Text style={styles.toggleButtonText}>
                  {isPrivate ? "Private" : "Public"}
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          <Text style={styles.label}>Routine Name *</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter routine name"
            value={routineName}
            onChangeText={setRoutineName}
          />

          <Text style={styles.label}>Description</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Describe your routine"
            multiline
            value={routineDescription}
            onChangeText={setRoutineDescription}
          />

          <Text style={styles.totalDuration}>
            Total Duration: {calculateTotalDuration()} mins
          </Text>
        </View>

        <View style={styles.focusBlocksHeader}>
          <Text style={styles.sectionTitle}>
            Focus Blocks ({currentRoutine.focusBlocks.length})
          </Text>
          <TouchableOpacity
            onPress={() => navigation.navigate('AddFocusBlock')}
            style={styles.addBlockButton}
          >
            <Ionicons name="add-circle" size={24} color="#218ED5" />
            <Text style={styles.addBlockText}>Add Block</Text>
          </TouchableOpacity>
        </View>

        {currentRoutine.focusBlocks.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="musical-notes-outline" size={48} color="#CCC" />
            <Text style={styles.emptyStateText}>
              No focus blocks yet.{'\n'}Add your first focus block to get started!
            </Text>
            <GradientButton
              title="Add Focus Block"
              onPress={() => navigation.navigate('AddFocusBlock')}
              style={{ marginTop: 16 }}
            />
          </View>
        ) : (
          currentRoutine.focusBlocks.map((block, index) => (
            <View key={block.id} style={styles.blockCard}>
              <View style={styles.blockLeft}>
                {/* Reorder buttons */}
                <View style={styles.reorderButtons}>
                  <TouchableOpacity
                    onPress={() => moveFocusBlockUp(index)}
                    disabled={index === 0}
                    style={[styles.reorderButton, index === 0 && styles.reorderButtonDisabled]}
                  >
                    <Ionicons 
                      name="chevron-up" 
                      size={20} 
                      color={index === 0 ? "#CCC" : "#218ED5"} 
                    />
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => moveFocusBlockDown(index)}
                    disabled={index === currentRoutine.focusBlocks.length - 1}
                    style={[styles.reorderButton, index === currentRoutine.focusBlocks.length - 1 && styles.reorderButtonDisabled]}
                  >
                    <Ionicons 
                      name="chevron-down" 
                      size={20} 
                      color={index === currentRoutine.focusBlocks.length - 1 ? "#CCC" : "#218ED5"} 
                    />
                  </TouchableOpacity>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.blockTitle}>{block.name}</Text>
                  <Text style={styles.blockSubtitle}>
                    {block.exercises.length} Exercise{block.exercises.length !== 1 ? 's' : ''}
                  </Text>
                  <Text style={styles.blockMeta}>
                    {block.totalDuration || 0} Mins
                  </Text>
                </View>
              </View>

              <View style={styles.blockRight}>
                <TouchableOpacity
                  style={styles.iconCircle}
                  onPress={() => handleRemoveFocusBlock(block.id)}
                >
                  <Ionicons name="close" size={16} color="#E74C3C" />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => handleEditFocusBlock(block)}>
                  <Text style={styles.editText}>Edit</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))
        )}

        {currentRoutine.focusBlocks.length > 0 && (
          <>
            <GradientButton
              title="Schedule Routine"
              onPress={() => {
                Alert.alert('Coming Soon', 'Schedule feature will be available soon!');
              }}
              style={{ marginTop: 24 }}
            />

            <TouchableOpacity
              style={styles.outlineButton}
              onPress={() => {
                Alert.alert(
                  'Clear Routine',
                  'Are you sure you want to clear all changes?',
                  [
                    { text: 'Cancel', style: 'cancel' },
                    {
                      text: 'Clear',
                      style: 'destructive',
                      onPress: () => {
                        resetRoutine();
                        navigation.navigate('Home');
                      }
                    }
                  ]
                );
              }}
            >
              <Text style={styles.outlineButtonText}>Clear All</Text>
            </TouchableOpacity>
          </>
        )}
      </ScrollView>

      {saving && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#218ED5" />
          <Text style={styles.loadingText}>Saving routine...</Text>
        </View>
      )}

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
  titleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
    marginTop: 8,
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    color: "#000",
  },
  saveRoutineButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    minWidth: 130,
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
    color: "#000",
  },
  label: {
    fontSize: 13,
    color: "#333",
    marginBottom: 6,
    fontWeight: "500",
    marginTop: 8,
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
  detailHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  visibilityRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  visibilityLabel: {
    fontSize: 12,
    color: "#666",
    marginRight: 8,
  },
  toggleButton: {
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  toggleButtonText: {
    fontSize: 11,
    color: "#fff",
    fontWeight: "600",
  },
  focusBlocksHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 12,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#000",
  },
  addBlockButton: {
    flexDirection: "row",
    alignItems: "center",
  },
  addBlockText: {
    fontSize: 14,
    color: "#218ED5",
    fontWeight: "600",
    marginLeft: 4,
  },
  emptyState: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 40,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#E5E5E5",
    borderStyle: "dashed",
  },
  emptyStateText: {
    fontSize: 14,
    color: "#999",
    textAlign: "center",
    marginTop: 16,
    lineHeight: 20,
  },
  blockCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#E5E5E5",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  blockLeft: {
    flexDirection: "row",
    alignItems: "flex-start",
    flex: 1,
  },
  reorderButtons: {
    flexDirection: "column",
    marginRight: 8,
  },
  reorderButton: {
    padding: 2,
  },
  reorderButtonDisabled: {
    opacity: 0.3,
  },
  blockRight: {
    alignItems: "flex-end",
    marginLeft: 12,
  },
  blockTitle: {
    fontSize: 15,
    fontWeight: "700",
    marginBottom: 4,
    color: "#000",
  },
  blockSubtitle: {
    fontSize: 13,
    color: "#666",
    marginBottom: 2,
  },
  blockMeta: {
    fontSize: 12,
    color: "#999",
    marginTop: 2,
  },
  iconCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E5E5E5",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 6,
    backgroundColor: "#fff",
  },
  editText: {
    fontSize: 12,
    color: "#218ED5",
    fontWeight: "600",
  },
  outlineButton: {
    borderWidth: 1,
    borderColor: "#E74C3C",
    borderRadius: 999,
    paddingVertical: 12,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 16,
  },
  outlineButtonText: {
    color: "#E74C3C",
    fontWeight: "600",
    fontSize: 14,
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 999,
  },
  loadingText: {
    color: '#fff',
    marginTop: 12,
    fontSize: 16,
    fontWeight: '600',
  },
});