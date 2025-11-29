import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";

export const RoutineCard = ({
  routine,
  onStart,
  onView,
  onEdit,
  onDelete,
}) => {
  return (
    <View style={styles.card}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>{routine.name}</Text>

        <View
          style={[
            styles.privacyBadge,
            { backgroundColor: routine.isPrivate ? "#E3F2FD" : "#E8F5E9" },
          ]}
        >
          <Ionicons
            name={routine.isPrivate ? "lock-closed" : "globe-outline"}
            size={12}
            color={routine.isPrivate ? "#1976D2" : "#4CAF50"}
          />
          <Text
            style={[
              styles.privacyText,
              { color: routine.isPrivate ? "#1976D2" : "#4CAF50" },
            ]}
          >
            {routine.isPrivate ? "Private" : "Public"}
          </Text>
        </View>
      </View>

      {routine.description ? (
        <Text style={styles.description} numberOfLines={2}>
          {routine.description}
        </Text>
      ) : null}

      {/* Duration */}
      <View style={styles.durationRow}>
        <Ionicons name="time-outline" size={14} color="#666" />
        <Text style={styles.durationText}>
          {routine.totalDuration || 0} mins
        </Text>
      </View>

      {/* Focus Blocks */}
      <Text style={styles.label}>Focus Blocks</Text>
      <View style={styles.blocksList}>
        {routine.focusBlocks?.length > 0 ? (
          routine.focusBlocks.map((block) => (
            <View key={block.blockId} style={styles.blockItem}>
              <Text style={styles.blockText}>{block.name}</Text>
            </View>
          ))
        ) : (
          <Text style={styles.noBlocksText}>No focus blocks</Text>
        )}
      </View>

      {/* Action Buttons */}
      <View style={styles.actionRow}>
        {/* Start Practice */}
        <LinearGradient
          colors={["#218ED5", "#13B4B0"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.startButton}
        >
          <TouchableOpacity style={styles.btnInner} onPress={onStart}>
            <Text style={styles.startText}>Start Practice</Text>
          </TouchableOpacity>
        </LinearGradient>

        {/* View */}
        <TouchableOpacity style={styles.viewBtn} onPress={onView}>
          <Text style={styles.viewText}>View Details</Text>
        </TouchableOpacity>

        {/* Edit */}
        <TouchableOpacity style={styles.iconBtn} onPress={onEdit}>
          <Ionicons name="create-outline" size={22} color="#FFC107" />
        </TouchableOpacity>

        {/* Delete */}
        <TouchableOpacity style={styles.iconBtn} onPress={onDelete}>
          <Ionicons name="trash-outline" size={22} color="#E74C3C" />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#fff",
    marginHorizontal: 20,
    marginTop: 12,
    padding: 16,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  header: { flexDirection: "row", justifyContent: "space-between" },
  title: { fontSize: 18, fontWeight: "700", flex: 1 },
  privacyBadge: {
    flexDirection: "row",
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 12,
    alignItems: "center",
  },
  privacyText: { marginLeft: 4, fontSize: 11, fontWeight: "600" },
  description: { fontSize: 13, color: "#666", marginVertical: 8 },
  durationRow: { flexDirection: "row", alignItems: "center", marginBottom: 10 },
  durationText: { marginLeft: 6, fontSize: 13, color: "#666" },
  label: { fontSize: 13, fontWeight: "600", marginBottom: 8 },
  blocksList: { marginBottom: 16 },
  blockItem: {
    backgroundColor: "#F5F5F5",
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
    marginBottom: 6,
  },
  blockText: { fontSize: 14, color: "#333" },
  noBlocksText: { fontSize: 13, color: "#999", fontStyle: "italic" },
  actionRow: { flexDirection: "row", gap: 8, alignItems: "center" },
  startButton: { flex: 1, borderRadius: 8 },
  btnInner: { paddingVertical: 12, alignItems: "center" },
  startText: { color: "#fff", fontWeight: "600" },
  viewBtn: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#218ED5",
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: "center",
  },
  viewText: { color: "#218ED5", fontWeight: "600" },
  iconBtn: {
    width: 44,
    height: 44,
    borderRadius: 8,
    backgroundColor: "#F5F5F5",
    justifyContent: "center",
    alignItems: "center",
  },
});
