import React from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons, MaterialCommunityIcons, Feather } from "@expo/vector-icons";
import Svg, { Rect } from "react-native-svg";

export default function HomeScreen() {
  return (
    <ScrollView style={{ flex: 1, backgroundColor: "#f8f8f8" }}>
      
      {/* HEADER */}
      <LinearGradient
        colors={["#218ED5", "#13B4B0"]}
        style={styles.headerContainer}
      >
        <View style={styles.headerLeft}>
          <Image
            source={require("../../assets/logo.png")}
            style={styles.logo}
          />
          <Text style={styles.headerTitle}>JamFlo</Text>
        </View>

        <TouchableOpacity style={styles.settingsButton}>
          <Feather name="settings" size={26} color="#fff" />
        </TouchableOpacity>
      </LinearGradient>

      {/* GREETING */}
      <View style={styles.greetingContainer}>
        <Text style={styles.greetingText}>Welcome back, Jane!</Text>
        <Text style={styles.greetingSub}>
          You’ve practiced 3 days in a row, let's make today count! 🎸
        </Text>
      </View>

      {/* SECTION HEADER */}
      <Text style={styles.sectionTitle}>My Stats Overview</Text>
      <Text style={styles.sectionSubtitle}>Your Practice Progress</Text>

      {/* STATS CARDS */}
      <View style={styles.statsRow}>
        <View style={styles.statCard}>
          <Ionicons name="flame" size={28} color="#ff5400" />
          <Text style={styles.statNumber}>3</Text>
          <Text style={styles.statLabel}>Daily Streak</Text>
        </View>

        <View style={styles.statCard}>
          <MaterialCommunityIcons name="trophy" size={28} color="#ffd700" />
          <Text style={styles.statNumber}>5</Text>
          <Text style={styles.statLabel}>Achievements</Text>
        </View>

        <View style={styles.statCard}>
          <Ionicons name="time" size={28} color="#007aff" />
          <Text style={styles.statNumber}>0</Text>
          <Text style={styles.statLabel}>Mins Today</Text>
        </View>
      </View>

      {/* WEEKLY GOAL */}
      <View style={styles.goalCard}>
        <Text style={styles.goalTitle}>🎯 Weekly Goal</Text>
        <Text style={styles.goalSubtitle}>150/300 mins</Text>

        <View style={styles.progressBarBackground}>
          <View style={[styles.progressBarFill, { width: "50%" }]} />
        </View>

        <Text style={styles.goalPercent}>50%</Text>
      </View>

      {/* WEEKLY ACTIVITY CHART */}
      <View style={styles.chartCard}>
        <Text style={styles.chartTitle}>📊 Weekly Activity</Text>

        <Svg height="140" width="100%">
          {/* Bars */}
          {[
            { day: "Mon", value: 20 },
            { day: "Tue", value: 45 },
            { day: "Wed", value: 30 },
            { day: "Thu", value: 10 },
            { day: "Fri", value: 25 },
            { day: "Sat", value: 50 },
            { day: "Sun", value: 55 },
          ].map((item, index) => (
            <Rect
              key={index}
              x={index * 45 + 25}
              y={140 - item.value * 2}
              width="20"
              height={item.value * 2}
              rx="4"
              fill="#2AC5C0"
            />
          ))}
        </Svg>

        {/* Days Row */}
        <View style={styles.daysRow}>
          {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day) => (
            <Text key={day} style={styles.dayLabel}>{day}</Text>
          ))}
        </View>
      </View>

      {/* ROUTINE SECTION */}
      <Text style={styles.sectionTitle}>My Routines</Text>

      <View style={styles.routineCard}>
        <Text style={styles.routineText}>
          You haven’t created a routine yet! 🎶{"\n"}
          Tap ‘Create a Routine’ below to get started.
        </Text>

        <TouchableOpacity style={styles.routineButton}>
          <LinearGradient
            colors={["#218ED5", "#13B4B0"]}
            style={styles.routineBtnGradient}
          >
            <Text style={styles.routineBtnText}>Create a Routine</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>

      <View style={{ height: 50 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  headerContainer: {
    paddingTop: 60,
    paddingBottom: 20,
    paddingHorizontal: 20,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  headerLeft: { flexDirection: "row", alignItems: "center" },

  logo: { width: 40, height: 40, marginRight: 10, resizeMode: "contain" },

  headerTitle: { color: "#fff", fontSize: 26, fontWeight: "700" },

  settingsButton: { padding: 6 },

  greetingContainer: { padding: 20, paddingBottom: 10 },

  greetingText: { fontSize: 24, fontWeight: "700", color: "#222" },

  greetingSub: { fontSize: 15, color: "#666", marginTop: 4 },

  sectionTitle: {
    fontSize: 22,
    fontWeight: "700",
    paddingHorizontal: 20,
    marginTop: 20,
    color: "#111",
  },

  sectionSubtitle: {
    fontSize: 14,
    color: "#777",
    paddingHorizontal: 20,
    marginBottom: 15,
  },

  statsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 20,
  },

  statCard: {
    backgroundColor: "#fff",
    width: "30%",
    paddingVertical: 15,
    borderRadius: 14,
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },

  statNumber: {
    fontSize: 22,
    fontWeight: "700",
    marginTop: 6,
    color: "#222",
  },

  statLabel: { fontSize: 12, color: "#666", marginTop: 2 },

  goalCard: {
    backgroundColor: "#fff",
    marginTop: 20,
    marginHorizontal: 20,
    padding: 20,
    borderRadius: 16,
    elevation: 3,
  },

  goalTitle: { fontSize: 16, fontWeight: "700", color: "#333" },

  goalSubtitle: { fontSize: 14, color: "#666", marginTop: 6 },

  progressBarBackground: {
    width: "100%",
    height: 10,
    backgroundColor: "#e1e1e1",
    borderRadius: 10,
    marginTop: 12,
  },

  progressBarFill: {
    height: "100%",
    backgroundColor: "#2AC5C0",
    borderRadius: 10,
  },

  goalPercent: {
    fontSize: 12,
    color: "#666",
    marginTop: 6,
    textAlign: "right",
  },

  chartCard: {
    backgroundColor: "#fff",
    marginTop: 20,
    marginHorizontal: 20,
    padding: 20,
    borderRadius: 16,
    elevation: 3,
  },

  chartTitle: { fontSize: 16, fontWeight: "700", marginBottom: 10 },

  daysRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginTop: -5,
  },

  dayLabel: { fontSize: 12, color: "#555" },

  routineCard: {
    backgroundColor: "#fff",
    marginTop: 15,
    marginHorizontal: 20,
    padding: 18,
    borderRadius: 16,
    elevation: 3,
  },

  routineText: { color: "#444", fontSize: 14, marginBottom: 20, textAlign: "center" },

  routineButton: {},

  routineBtnGradient: {
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: "center",
  },

  routineBtnText: { color: "#fff", fontSize: 16, fontWeight: "600" },
});
