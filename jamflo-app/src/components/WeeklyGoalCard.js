import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

export const WeeklyGoalCard = ({ 
  current, 
  total, 
  percentage 
}) => {
  return (
    <LinearGradient
      colors={["#4ECDC4", "#44A08D"]}
      style={styles.goalCard}
    >
      <Text style={styles.goalTitle}>🎯 Weekly Goal</Text>
      <Text style={styles.goalSubtitle}>{current}/{total}mins</Text>

      <View style={styles.progressBarBackground}>
        <View style={[styles.progressBarFill, { width: `${percentage}%` }]} />
      </View>

      <Text style={styles.goalPercent}>{percentage}%</Text>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  goalCard: {
    marginTop: 20,
    marginHorizontal: 20,
    padding: 20,
    borderRadius: 16,
    elevation: 5,
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 8,
  },
  goalTitle: { 
    fontSize: 15, 
    fontWeight: "700", 
    color: "#fff" 
  },
  goalSubtitle: { 
    fontSize: 13, 
    color: "#fff", 
    marginTop: 6, 
    fontWeight: "600" 
  },
  progressBarBackground: {
    width: "100%",
    height: 12,
    backgroundColor: "rgba(255,255,255,0.3)",
    borderRadius: 10,
    marginTop: 12,
  },
  progressBarFill: {
    height: "100%",
    backgroundColor: "#fff",
    borderRadius: 10,
  },
  goalPercent: {
    fontSize: 13,
    color: "#fff",
    marginTop: 8,
    textAlign: "right",
    fontWeight: "700",
  },
});