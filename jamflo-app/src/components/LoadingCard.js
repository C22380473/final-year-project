import React from "react";
import { View, Text, ActivityIndicator, StyleSheet } from "react-native";

export const LoadingCard = ({ label = "Loading..." }) => {
  return (
    <View style={styles.card}>
      <ActivityIndicator size="large" color="#218ED5" />
      <Text style={styles.text}>{label}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#fff",
    marginHorizontal: 20,
    marginTop: 15,
    padding: 40,
    borderRadius: 16,
    alignItems: "center",
  },
  text: {
    marginTop: 12,
    color: "#666",
    fontSize: 14,
  },
});
