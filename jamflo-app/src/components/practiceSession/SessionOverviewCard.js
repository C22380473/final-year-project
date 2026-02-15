import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { commonStyles } from "../../styles/common";

export function SessionOverviewCard({ focusBlocks, currentBlockIndex, currentExerciseIndex, onSelect }) {
  return (
    <View style={commonStyles.card}>
      <Text style={commonStyles.sectionTitle}>Focus blocks in this session</Text>

      {focusBlocks.map((block, bIdx) => {
        const isCurrentBlock = bIdx === currentBlockIndex;

        return (
          <View key={`block-${block.id ?? bIdx}`} style={styles.blockWrap}>
            <Text style={styles.blockTitle}>
              {bIdx + 1}. {block.name}{" "}
              {!!block.totalDuration ? <Text style={styles.blockMeta}>({block.totalDuration} mins)</Text> : null}
            </Text>

            {(block.exercises ?? []).map((ex, eIdx) => {
              const isCurrent = isCurrentBlock && eIdx === currentExerciseIndex;
              const done = bIdx < currentBlockIndex || (isCurrentBlock && eIdx < currentExerciseIndex);

              return (
                <TouchableOpacity
                  key={`ex-${ex.id ?? `${bIdx}-${eIdx}`}`}
                  onPress={() => onSelect(bIdx, eIdx)}
                  style={[
                    styles.exerciseRow,
                    done && styles.exerciseRowDone,
                    isCurrent && styles.exerciseRowCurrent,
                  ]}
                >
                  <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                    <Text style={styles.rowIcon}>{done ? "✓" : isCurrent ? "▶" : ""}</Text>
                    <Text style={styles.rowText}>{ex?.name ?? "Exercise"}</Text>
                  </View>
                  <Text style={styles.rowMeta}>{ex?.durationMins ?? 5} Mins</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  blockWrap: { marginTop: 14 },
  blockTitle: { fontWeight: "900", color: "#0f172a", fontSize: 16 },
  blockMeta: { fontWeight: "800", color: "#475569", fontSize: 14 },

  exerciseRow: {
    marginTop: 10,
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 14,
    backgroundColor: "#f1f5f9",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  exerciseRowDone: { backgroundColor: "#bff3ea" },
  exerciseRowCurrent: { backgroundColor: "#b9c8f3" },

  rowIcon: { width: 18, fontWeight: "900", color: "#0f172a" },
  rowText: { fontWeight: "900", color: "#0f172a" },
  rowMeta: { fontWeight: "900", color: "#0f172a" },
});
