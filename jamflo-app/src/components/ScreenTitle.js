import React from 'react';
import { Text, StyleSheet } from 'react-native';

export const ScreenTitle = ({ children, style }) => (
  <Text style={[styles.title, style]}>{children}</Text>
);

const styles = StyleSheet.create({
  title: {
    fontSize: 34,
    color: "#fff",
    fontWeight: "700",
    marginBottom: 30,
    textAlign: "center",
  },
});