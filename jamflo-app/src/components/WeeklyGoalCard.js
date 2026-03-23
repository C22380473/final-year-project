import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { LinearGradient } from "expo-linear-gradient";

export const WeeklyGoalCard = ({
  current = 0,
  total = 300,
  percentage = 0,
  onEdit,
}) => {
  const safePercent = Math.max(0, Math.min(100, Number(percentage || 0)));

  return (
    <LinearGradient
      colors={["#4ECDC4", "#44A08D"]}
      style={styles.goalCard}
    >
      <View style={styles.headerRow}>
        <Text style={styles.goalTitle}>🎯 Weekly Goal</Text>

        {!!onEdit && (
          <TouchableOpacity style={styles.editBtn} onPress={onEdit}>
            <Text style={styles.editBtnText}>Edit</Text>
          </TouchableOpacity>
        )}
      </View>

      <Text style={styles.goalSubtitle}>
        {current}/{total} mins
      </Text>

      <View style={styles.progressBarBackground}>
        <View
          style={[
            styles.progressBarFill,
            { width: `${safePercent}%` },
          ]}
        />
      </View>

      <Text style={styles.goalPercent}>{Math.round(safePercent)}%</Text>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  goalCard: {
    marginTop: 20,
    marginHorizontal: 20,
    padding: 20,
    borderRadius: 16,
    elevation: 5,
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 8,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  goalTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: "#fff",
  },
  editBtn: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    backgroundColor: "rgba(255,255,255,0.18)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.35)",
  },
  editBtnText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 12,
  },
  goalSubtitle: {
    fontSize: 26,
    color: "#fff",
    marginTop: 10,
    fontWeight: "800",
  },
  progressBarBackground: {
    width: "100%",
    height: 12,
    backgroundColor: "rgba(255,255,255,0.3)",
    borderRadius: 10,
    marginTop: 16,
    overflow: "hidden",
  },
  progressBarFill: {
    height: "100%",
    backgroundColor: "#fff",
    borderRadius: 10,
  },
  goalPercent: {
    fontSize: 13,
    color: "#fff",
    marginTop: 10,
    textAlign: "right",
    fontWeight: "700",
  },
});