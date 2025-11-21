import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

export const StatCard = ({ 
  icon, 
  number, 
  label, 
  gradientColors 
}) => {
  return (
    <LinearGradient
      colors={gradientColors}
      style={styles.statCard}
    >
      {icon}
      <Text style={styles.statNumber}>{number}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  statCard: {
    width: "31%",
    paddingVertical: 20,
    borderRadius: 16,
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: "700",
    marginTop: 8,
    color: "#fff",
  },
  statLabel: { 
    fontSize: 11, 
    color: "#fff", 
    marginTop: 4, 
    fontWeight: "600" 
  },
});