import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';

export const PrimaryButton = ({ title, onPress, style, textStyle }) => (
  <TouchableOpacity 
    style={[styles.button, style]} 
    onPress={onPress}
  >
    <Text style={[styles.buttonText, textStyle]}>{title}</Text>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  button: {
    backgroundColor: "#fff",
    paddingVertical: 16,
    borderRadius: 30,
    alignItems: "center",
  },
  buttonText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
  },
});