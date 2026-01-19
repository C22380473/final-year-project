import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";

export const ResourceList = ({ resources, onRemove }) => {
  if (!resources || resources.length === 0) return null;

  return (
    <View style={{ marginBottom: 8 }}>
      <Text style={styles.label}>Resources ({resources.length})</Text>

      {resources.map((r) => (
        <View key={r.resourceId} style={styles.item}>
          <Ionicons
            name={r.type === "video" ? "videocam" : "document"}
            size={16}
            color="#218ED5"
          />

          <Text numberOfLines={1} style={styles.text}>
            {r.url}
          </Text>

          {!!onRemove && (
            <TouchableOpacity
              onPress={() => onRemove(r.resourceId)}
              style={styles.removeBtn}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Ionicons name="trash-outline" size={16} color="#E74C3C" />
            </TouchableOpacity>
          )}
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  label: { fontSize: 13, fontWeight: "500", marginBottom: 6, color: "#333" },
  item: {
    flexDirection: "row",
    padding: 8,
    borderRadius: 6,
    backgroundColor: "#F0F8FF",
    marginBottom: 6,
    alignItems: "center",
  },
  text: { marginLeft: 8, fontSize: 12, color: "#218ED5", flex: 1 },
  removeBtn: { paddingLeft: 10, paddingVertical: 2 },
});
