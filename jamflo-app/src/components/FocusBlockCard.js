import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { Card } from "./Card";
import { ReorderButtons } from "./ReorderButtons";

export const FocusBlockCard = ({
  block,
  index,
  total,
  onMoveUp,
  onMoveDown,
  onEdit,
  onRemove,
}) => {
  
  // Calculate duration directly from exercises (fixed for templates + scratch)
  const totalMins =
    block?.exercises?.reduce((sum, ex) => sum + Number(ex?.duration || 0), 0) ||
    0;

  const exerciseCount = block?.exercises?.length || 0;

  return (
    <Card>
      <View style={styles.row}>
        <ReorderButtons
          index={index}
          total={total}
          onUp={onMoveUp}
          onDown={onMoveDown}
        />

        <View style={styles.infoContainer}>
          <Text style={styles.title}>{block.name}</Text>
          <Text style={styles.subtitle}>
            {block.exercises.length} Exercise
            {block.exercises.length !== 1 ? "s" : ""}
          </Text>
          <Text style={styles.meta}>{totalMins} mins</Text>
        </View>

        <View style={styles.actions}>
          <TouchableOpacity style={styles.iconCircle} onPress={onRemove}>
            <Ionicons name="close" size={16} color="#E74C3C" />
          </TouchableOpacity>

          <TouchableOpacity onPress={onEdit}>
            <Text style={styles.editText}>Edit</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Card>
  );
};

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "flex-start",
  },
  infoContainer: {
    flex: 1,
    marginLeft: 4,
  },
  title: { fontSize: 15, fontWeight: "700" },
  subtitle: { color: "#666", fontSize: 13 },
  meta: { color: "#999", fontSize: 12, marginTop: 2 },

  actions: {
    alignItems: "flex-end",
    marginLeft: 8,
  },
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
  editText: {
    color: "#218ED5",
    fontWeight: "600",
    fontSize: 12,
  },
});
