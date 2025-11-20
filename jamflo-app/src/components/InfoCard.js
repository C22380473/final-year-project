import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export const InfoCard = ({ children }) => (
  <View style={styles.infoCard}>
    {children}
  </View>
);

export const InfoItem = ({ iconName, title, description, boldText }) => (
  <View style={styles.bulletRow}>
    <Ionicons
      name={iconName}
      size={24}
      color="#fff"
      style={styles.bulletIcon}
    />
    <View style={styles.bulletTextBox}>
      <Text style={styles.bulletTitle}>{title}</Text>
      <Text style={styles.bulletText}>
        {boldText ? boldText : description}
      </Text>
    </View>
  </View>
);

const styles = StyleSheet.create({
  infoCard: {
    borderRadius: 20,
    borderWidth: 2,
    borderColor: "rgba(255,255,255,0.5)",
    backgroundColor: "rgba(255,255,255,0.1)",
    padding: 24,
    marginBottom: 40,
  },
  bulletRow: {
    flexDirection: "row",
    marginBottom: 22,
  },
  bulletIcon: {
    marginRight: 12,
    marginTop: 2,
  },
  bulletTextBox: { 
    flex: 1,
  },
  bulletTitle: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 4,
  },
  bulletText: {
    color: "#fff",
    fontSize: 14,
    lineHeight: 20,
  },
});