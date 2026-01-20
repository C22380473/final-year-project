import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert } from "react-native";

import { Ionicons } from "@expo/vector-icons";
import { AppHeader } from "../components/AppHeader";
import { BottomNav } from "../components/BottomNav";
import { GradientButton } from "../components/GradientButton";
import { BackBreadcrumbHeader } from "../components/BackBreadcrumbHeader";
import { Card } from "../components/Card";
import { FocusBlockCard } from "../components/FocusBlockCard";
import { VisibilityToggle } from "../components/VisibilityToggle";
import { SavingOverlay } from "../components/SavingOverlay";

import { useRoutine } from "../contexts/RoutineContext";
import { createRoutine, updateRoutine } from "../services/routineService";
import { auth } from "../config/firebaseConfig";

export default function RoutineEditorScreen({ navigation }) {
  const {
    currentRoutine,
    removeFocusBlock,
    calculateTotalDuration,
    resetRoutine,
    loadFocusBlock,
    reorderFocusBlocks,
  } = useRoutine();

  const [routineName, setRoutineName] = useState("");
  const [routineDescription, setRoutineDescription] = useState("");
  const [isPrivate, setIsPrivate] = useState(true);
  const [saving, setSaving] = useState(false);

  /** Load existing routine into state */
  useEffect(() => {
    setRoutineName(currentRoutine.name || "");
    setRoutineDescription(currentRoutine.description || "");
    setIsPrivate(currentRoutine.isPrivate !== false);
  }, [currentRoutine]);

  /** Remove focus block */
  const handleRemoveFocusBlock = (blockId) => {
    Alert.alert("Remove Focus Block", "Remove this block?", [
      { text: "Cancel", style: "cancel" },
      { text: "Remove", style: "destructive", onPress: () => removeFocusBlock(blockId) },
    ]);
  };

  /** Edit focus block */
  const handleEditFocusBlock = (block) => {
    loadFocusBlock(block);
    navigation.navigate("AddFocusBlock", { isEditing: true, blockId: block.blockId });
  };

  /** Save to Firestore */
  const handleSaveRoutine = async () => {
    if (!routineName.trim()) {
      Alert.alert("Error", "Routine name required");
      return;
    }
    if (currentRoutine.focusBlocks.length === 0) {
      Alert.alert("Error", "Add at least one focus block");
      return;
    }

    const user = auth.currentUser;
    if (!user) {
      Alert.alert("Error", "You must be logged in");
      return;
    }

    setSaving(true);

    try {
      const routineData = {
        name: routineName,
        description: routineDescription,
        isPrivate,
        focusBlocks: currentRoutine.focusBlocks,
        totalDuration: calculateTotalDuration(),
        authorId: user.uid,
        authorName: user.displayName || "Anonymous",
      };

      const routineDocId = currentRoutine.routineId || currentRoutine.id;

      const result = routineDocId
        ? await updateRoutine(routineDocId, routineData)
        : await createRoutine(user.uid, routineData);
        
      setSaving(false);

      if (result.success) {
        Alert.alert("Success", result.message || "Routine saved!", [
          {
            text: "OK",
            onPress: () => {
              resetRoutine();
              navigation.navigate("Home");
            },
          },
        ]);
      } else {
        Alert.alert("Error", result.message || "Failed to save routine");
      }
    } catch (err) {
      console.error(err);
      setSaving(false);
      Alert.alert("Error", "Unexpected error while saving");
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: "#f8f8f8" }}>
      <AppHeader />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingBottom: 120,
          paddingHorizontal: 20,
          paddingTop: 12,
        }}
      >
        <BackBreadcrumbHeader
        navigation={navigation}
        breadcrumb={
          <>
            Add a Focus Block ›{" "}
            <Text style={{ fontWeight: "700" }}>Routine Editor</Text>
          </>
        }
/>

        {/* Title Row */}
        <View style={styles.titleRow}>
          <Text style={styles.title}>Routine Editor</Text>
        </View>

        {/* Routine Details Card */}
        <Card>
          <View style={styles.headerRow}>
            <Text style={styles.cardTitle}>Routine Details</Text>
            <VisibilityToggle
              isPrivate={isPrivate}
              onToggle={() => setIsPrivate((v) => !v)}
            />
          </View>

          <Text style={styles.label}>Routine Name *</Text>
          <TextInput
            value={routineName}
            onChangeText={setRoutineName}
            placeholder="Enter routine name"
            style={styles.input}
          />

          <Text style={styles.label}>Description</Text>
          <TextInput
            value={routineDescription}
            onChangeText={setRoutineDescription}
            placeholder="Describe your routine"
            multiline
            style={[styles.input, styles.textArea]}
          />

          <Text style={styles.totalDuration}>
            Total Duration: {calculateTotalDuration()} mins
          </Text>
        </Card>

        {/* Focus Blocks Header */}
        <View style={styles.blockHeader}>
          <Text style={styles.sectionTitle}>
            Focus Blocks ({currentRoutine.focusBlocks.length})
          </Text>

          <TouchableOpacity
            onPress={() => navigation.navigate("AddFocusBlock")}
            style={styles.addBlockBtn}
          >
            <Ionicons name="add-circle" size={24} color="#218ED5" />
            <Text style={styles.addBlockText}>Add Block</Text>
          </TouchableOpacity>
        </View>

        {/* Empty State */}
        {currentRoutine.focusBlocks.length === 0 ? (
          <Card style={styles.emptyCard}>
            <Ionicons name="musical-notes-outline" size={48} color="#CCC" />
            <Text style={styles.emptyText}>
              No focus blocks yet. Add your first!
            </Text>
            <GradientButton
              title="Add Focus Block"
              onPress={() => navigation.navigate("AddFocusBlock")}
              gradientStyle={styles.emptyButton}
            />
          </Card>
        ) : (
          /* Focus Blocks List */
          currentRoutine.focusBlocks.map((block, index) => (
           <FocusBlockCard
              key={block.blockId}
              block={block}
              index={index}
              total={currentRoutine.focusBlocks.length}
              onMoveUp={() => reorderFocusBlocks(index, index - 1)}
              onMoveDown={() => reorderFocusBlocks(index, index + 1)}
              onEdit={() => handleEditFocusBlock(block)}
              onRemove={() => handleRemoveFocusBlock(block.blockId)}
            />
          ))
        )}

        <GradientButton
        title={saving ? "Saving..." : "Save Routine"}
        onPress={handleSaveRoutine}
        disabled={saving}
        gradientStyle={{ paddingVertical: 16 }}
      />
      </ScrollView>

      {/* Saving Overlay */}
      <SavingOverlay visible={saving} message="Saving routine..." />

      <BottomNav
        activeTab="Create"
        onTabPress={(t) => t === "Home" && navigation.navigate("Home")}
      />
    </View>
  );
}

const styles = StyleSheet.create({
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
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  cardTitle: { fontSize: 15, fontWeight: "700" },
  visibilityRow: { flexDirection: "row", alignItems: "center" },
  visibilityLabel: { fontSize: 12, color: "#666", marginRight: 8 },
  toggleButton: {
    borderRadius: 999,
    paddingVertical: 4,
    paddingHorizontal: 12,
  },
  toggleButtonText: { color: "#fff", fontSize: 11, fontWeight: "600" },
  label: { fontSize: 13, fontWeight: "500", marginTop: 8 },
  input: {
    backgroundColor: "#F5F5F5",
    borderRadius: 8,
    padding: 10,
    marginTop: 4,
    borderWidth: 1,
    borderColor: "#E5E5E5",
  },
  textArea: { minHeight: 80, textAlignVertical: "top" },
  totalDuration: { color: "#218ED5", fontWeight: "600", marginTop: 10 },
  blockHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 16,
    marginTop: 12,
  },
  sectionTitle: { fontSize: 20, fontWeight: "700" },
  addBlockBtn: { flexDirection: "row", alignItems: "center" },
  addBlockText: { marginLeft: 6, color: "#218ED5", fontWeight: "600" },

  emptyCard: { alignItems: "center", padding: 40, borderStyle: "dashed" },
  emptyText: {
    marginTop: 16,
    fontSize: 14,
    color: "#999",
    textAlign: "center",
  },

  blockRow: { flexDirection: "row", alignItems: "flex-start" },
  blockTitle: { fontSize: 15, fontWeight: "700" },
  blockSubtitle: { color: "#666", fontSize: 13 },
  blockMeta: { color: "#999", fontSize: 12, marginTop: 2 },

  blockActions: { alignItems: "flex-end", marginLeft: 12 },
  iconCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E5E5E5",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 6,
  },
  editText: { color: "#218ED5", fontWeight: "600", fontSize: 12 },

  clearButton: {
    borderWidth: 1,
    borderColor: "#E74C3C",
    borderRadius: 999,
    paddingVertical: 12,
    marginTop: 16,
    alignItems: "center",
  },
  clearButtonText: { color: "#E74C3C", fontWeight: "600" },

  savingOverlay: {
    position: "absolute",
    inset: 0,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 10,
  },
  savingText: {
    color: "#fff",
    marginTop: 12,
    fontSize: 16,
    fontWeight: "600",
  },

  emptyButton: {
  marginTop: 10,
  paddingVertical: 10,   
  paddingHorizontal: 20, 
  borderRadius: 8,       
  alignSelf: "center",   
}
});
