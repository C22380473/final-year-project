import React from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Card } from "./Card";
import { ReorderButtons } from "./ReorderButtons";
import { CategorySelector } from "./CategorySelector";
import { ResourceList } from "./ResourceList";
import { GradientButton } from "./GradientButton";
import { OutlineButton } from "./OutlineButton";

export const ExerciseCard = ({
  exercise,
  index,
  total,
  onChange,
  onReorderUp,
  onReorderDown,
  onRemove,
  onAddResource,
}) => (
  <Card>
    <View style={styles.headerRow}>
      <View style={styles.left}>
        <ReorderButtons
          index={index}
          total={total}
          onUp={onReorderUp}
          onDown={onReorderDown}
        />
        <Text style={styles.subtitle}>Exercise {index + 1}</Text>
      </View>

      {total > 1 && (
        <TouchableOpacity onPress={onRemove} style={styles.trashButton}>
          <Ionicons name="trash-outline" size={18} color="#E74C3C" />
        </TouchableOpacity>
      )}
    </View>

    <Text style={styles.label}>Exercise Name *</Text>
    <TextInput
      style={styles.input}
      value={exercise.name}
      placeholder="Name"
      onChangeText={(v) => onChange("name", v)}
    />

    <View style={styles.row}>
      <View style={{ flex: 1, marginRight: 6 }}>
        <Text style={styles.label}>Duration *</Text>
        <TextInput
          style={styles.input}
          placeholder="5"
          keyboardType="numeric"
          value={exercise.duration}
          onChangeText={(v) => onChange("duration", v)}
        />
      </View>

      <View style={{ flex: 1, marginLeft: 6 }}>
        <Text style={styles.label}>Tempo</Text>
        <TextInput
          style={styles.input}
          placeholder="Optional"
          keyboardType="numeric"
          value={exercise.tempo}
          onChangeText={(v) => onChange("tempo", v)}
        />
      </View>
    </View>

    <Text style={styles.label}>Category</Text>
    <CategorySelector value={exercise.category} onChange={(c) => onChange("category", c)} />

    <Text style={styles.label}>Notes</Text>
    <TextInput
      style={[styles.input, styles.textArea]}
      multiline
      value={exercise.notes}
      onChangeText={(v) => onChange("notes", v)}
    />

    <ResourceList resources={exercise.resources} />

    <View style={{ flexDirection: "row", marginTop: 12 }}>
      <GradientButton title="Add Resource" onPress={onAddResource} style={{ flex: 1 }} />
        <OutlineButton
          title="Remove"
          onPress={onRemove}
          style={{ flex: 1, marginLeft: 8 }}
        />
    </View>
  </Card>
);

const styles = StyleSheet.create({
  headerRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: 12 },
  left: { flexDirection: "row", alignItems: "center" },
  subtitle: { fontSize: 14, fontWeight: "600" },
  trashButton: { padding: 4 },
  label: { fontWeight: "500", marginBottom: 6, color: "#333" },
  input: {
    backgroundColor: "#F5F5F5",
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#E5E5E5",
  },
  row: { flexDirection: "row" },
  textArea: { minHeight: 80 },
  outlineButton: {
    borderWidth: 1,
    borderColor: "#218ED5",
    borderRadius: 999,
    paddingVertical: 10,
    alignItems: "center",
    flex: 1,
  },
  outlineText: { color: "#218ED5", fontWeight: "600" },
});
