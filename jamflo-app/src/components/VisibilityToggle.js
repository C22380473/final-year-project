import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";

export const VisibilityToggle = ({ isPrivate, onToggle }) => {
  return (
    <View style={styles.row}>
      <Text style={styles.label}>Visibility:</Text>

      <TouchableOpacity
        style={[
          styles.toggleButton,
          { backgroundColor: isPrivate ? "#1E88E5" : "#43A047" },
        ]}
        onPress={onToggle}
      >
        <Text style={styles.toggleText}>
          {isPrivate ? "Private" : "Public"}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  row: { flexDirection: "row", alignItems: "center" },
  label: { fontSize: 12, color: "#666", marginRight: 8 },
  toggleButton: {
    borderRadius: 999,
    paddingVertical: 4,
    paddingHorizontal: 12,
  },
  toggleText: {
    color: "#fff",
    fontSize: 11,
    fontWeight: "600",
  },
});
