import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { commonStyles } from "../../styles/common";

export function SessionExerciseCard({
  focusBlockName,
  category,
  title,
  subtitle,
  durationMins,
  isRunning,
  onPrev,
  onToggleRun,
  onSkip,
  timerText,
  progress,
}) {
  return (
    <View style={[commonStyles.card, styles.exerciseCard]}>
      <Text style={styles.exerciseTag}>{focusBlockName}</Text>
      <Text style={styles.exerciseTitle}>{title ?? "Exercise"}</Text>
      {!!category && <Text style={styles.exerciseMini}>{category}</Text>}

      {!!subtitle && (
        <Text style={styles.exerciseSubtitle} numberOfLines={3} ellipsizeMode="tail">
          {subtitle}
        </Text>
      )}

      <Text style={styles.timerText}>{timerText}</Text>
      <Text style={styles.timerSub}>{durationMins ?? 5} Minutes</Text>

      <View style={commonStyles.progressTrack}>
        <View
          style={[
            commonStyles.progressFill,
            {
              width: `${Math.round(((progress ?? 0) * 100))}%`,
              opacity: isRunning ? 1 : 0.7,
            },
          ]}
        />
      </View>

      <View style={styles.controlsRow}>
        <TouchableOpacity
          onPress={onPrev}
          style={[styles.smallBtn, isRunning && styles.smallBtnDisabled]}
          disabled={isRunning}
        >
          <Text style={[styles.smallBtnText, isRunning && styles.smallBtnTextDisabled]}>
            ← Previous
          </Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={onToggleRun} style={styles.primaryBtn}>
          <Ionicons name={isRunning ? "pause" : "play"} size={18} color="#fff" />
          <Text style={styles.primaryBtnText}>{isRunning ? "Pause" : "Resume"}</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={onSkip} style={styles.smallBtn}>
          <Text style={styles.smallBtnText}>Skip →</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  exerciseCard: { backgroundColor: "#3b6ee0" },
  exerciseTag: { color: "rgba(255,255,255,0.95)", fontWeight: "900", fontSize: 14 },
  exerciseTitle: { color: "#fff", fontWeight: "900", fontSize: 22, marginTop: 6 },
  exerciseMini: { color: "rgba(255,255,255,0.9)", marginTop: 2, fontWeight: "800" },
  exerciseSubtitle: { color: "rgba(255,255,255,0.9)", marginTop: 6 },

  timerText: {
    color: "#fff",
    fontWeight: "900",
    fontSize: 44,
    textAlign: "center",
    marginTop: 16,
  },
  timerSub: {
    color: "rgba(255,255,255,0.9)",
    textAlign: "center",
    marginTop: -6,
    fontWeight: "800",
  },

  controlsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 10,
    marginTop: 14,
    alignItems: "center",
  },
  smallBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 14,
    backgroundColor: "rgba(255,255,255,0.92)",
    alignItems: "center",
  },
  smallBtnDisabled: { opacity: 0.55 },
  smallBtnText: { fontWeight: "900", color: "#0f172a" },
  smallBtnTextDisabled: { color: "#475569" },

  primaryBtn: {
    flex: 1.25,
    paddingVertical: 12,
    borderRadius: 16,
    backgroundColor: "#14b8a6",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  primaryBtnText: { color: "#fff", fontWeight: "900" },
});
