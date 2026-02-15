import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { commonStyles } from "../../styles/common";

export function OverallProgressCard({ progress, rightText }) {
  return (
    <View style={commonStyles.card}>
      <View style={styles.cardRow}>
        <Text style={styles.cardTitle}>Overall Progress</Text>
        <Text style={styles.cardMeta}>{rightText}</Text>
      </View>

      <View style={commonStyles.progressTrack}>
        <View
          style={[
            commonStyles.progressFill,
            { width: `${Math.round((progress ?? 0) * 100)}%` },
          ]}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  cardRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  cardTitle: { fontSize: 16, fontWeight: "800", color: "#0f172a" },
  cardMeta: { fontSize: 13, fontWeight: "800", color: "#0f172a" },
});
