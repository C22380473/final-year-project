import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

export const OptionCard = ({ emoji, title, description, onPress, style }) => (
  <TouchableOpacity
    style={[styles.optionCard, style]}
    onPress={onPress}
  >
    <View style={styles.optionHeader}>
      <Text style={styles.emoji}>{emoji}</Text>
      <Text style={styles.optionTitle}>{title}</Text>
    </View>
    <Text style={styles.optionDescription}>{description}</Text>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  optionCard: {
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 30,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    marginBottom: 30,
  },
  optionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  emoji: {
    fontSize: 24,
    marginRight: 10,
  },
  optionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#333",
  },
  optionDescription: {
    fontSize: 13,
    color: "#666",
    lineHeight: 18,
  },
});