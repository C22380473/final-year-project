import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { commonStyles } from "../../styles/common";

export function ResourcesCard({ isRunning, resources, onOpen }) {
  return (
    <View style={commonStyles.card}>
      <Text style={commonStyles.sectionTitle}>Resources</Text>
      <Text style={commonStyles.helperText}>
        {isRunning ? "Pause to open resources." : "Tap a resource to open it."}
      </Text>

      {resources?.length ? (
        resources.map((r, i) => {
          const icon =
            r.type === "youtube"
              ? "logo-youtube"
              : r.type === "pdf"
              ? "document-text-outline"
              : r.type === "audio"
              ? "musical-notes-outline"
              : "link-outline";

          return (
            <TouchableOpacity
              key={`${r.url}-${i}`}
              onPress={() => onOpen(r.url)}
              disabled={isRunning}
              style={[styles.resourceRow, isRunning && { opacity: 0.6 }]}
            >
              <View style={{ flexDirection: "row", alignItems: "center", gap: 10, flex: 1 }}>
                <Ionicons name={icon} size={20} color="#0f172a" />
                <View style={{ flex: 1 }}>
                  <Text style={styles.resourceName} numberOfLines={1}>
                    {r.name}
                  </Text>
                  <Text style={styles.resourceUrl} numberOfLines={1}>
                    {r.url}
                  </Text>
                </View>
              </View>
              <Ionicons name="open-outline" size={18} color="#0f172a" />
            </TouchableOpacity>
          );
        })
      ) : (
        <Text style={[commonStyles.helperText, { marginTop: 10 }]}>
          No openable links saved for this exercise.
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  resourceRow: {
    marginTop: 10,
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 12,
    backgroundColor: "#f1f5f9",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  resourceName: { fontWeight: "900", color: "#0f172a" },
  resourceUrl: { marginTop: 2, color: "#475569", fontWeight: "700" },
});
