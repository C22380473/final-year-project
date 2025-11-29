import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { GradientButton } from "./GradientButton";

export const EmptyStateCard = ({ icon, message, buttonLabel, onPress }) => {
  return (
    <View style={styles.card}>
      <Ionicons name={icon} size={48} color="#CCC" />
      <Text style={styles.text}>{message}</Text>

      {buttonLabel && (
        <GradientButton title={buttonLabel} onPress={onPress} style={{width: "100%"}} />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#fff",
    marginHorizontal: 20,
    marginTop: 20,
    padding: 24,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  text: {
    fontSize: 14,
    color: "#666",
    marginVertical: 16,
    textAlign: "center",
    lineHeight: 20,
  },
});
