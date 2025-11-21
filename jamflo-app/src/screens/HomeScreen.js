import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, ScrollView } from "react-native";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { signOut } from "firebase/auth";
import { auth } from "../config/firebaseConfig";
import { AppHeader } from "../components/AppHeader";
import { BottomNav } from "../components/BottomNav";
import { StatCard } from "../components/StatCard";
import { WeeklyGoalCard } from "../components/WeeklyGoalCard";
import { WeeklyActivityChart } from "../components/WeeklyActivityChart";
import { GradientButton } from "../components/GradientButton";

export default function HomeScreen({ navigation }) {
  const [username, setUsername] = useState("User");

  useEffect(() => {
    const currentUser = auth.currentUser;
    if (currentUser && currentUser.displayName) {
      setUsername(currentUser.displayName);
    }
  }, []);

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (err) {
      console.log("Logout error:", err);
    }
  };

  const handleTabPress = (tabName) => {
    // Navigation logic here
    console.log(`Navigating to ${tabName}`);
  };

  const weeklyData = [
    { day: "Mon", value: 20 },
    { day: "Tue", value: 45 },
    { day: "Wed", value: 30 },
    { day: "Thu", value: 10 },
    { day: "Fri", value: 25 },
    { day: "Sat", value: 50 },
    { day: "Sun", value: 55 },
  ];

  return (
    <View style={{ flex: 1, backgroundColor: "#f8f8f8" }}>
      <ScrollView style={{ flex: 1 }}>
        
        {/* HEADER */}
        <AppHeader 
          rightButton="logout"
          onRightButtonPress={handleLogout}
        />

        {/* GREETING */}
        <View style={styles.greetingContainer}>
          <Text style={styles.greetingText}>Welcome back, {username}!</Text>
          <Text style={styles.greetingSub}>
            You've practiced 3 days in a row, let's make today count! 🎸
          </Text>
        </View>

        {/* SECTION HEADER */}
        <Text style={styles.sectionTitle}>My Stats Overview</Text>
        <Text style={styles.sectionSubtitle}>Your Practice Progress</Text>

        {/* STATS CARDS */}
        <View style={styles.statsRow}>
          <StatCard
            icon={<Ionicons name="flame" size={32} color="#fff" />}
            number="3"
            label="Daily Streak"
            gradientColors={["#FF6B35", "#F7931E"]}
          />
          <StatCard
            icon={<MaterialCommunityIcons name="trophy" size={32} color="#fff" />}
            number="5"
            label="Achievements"
            gradientColors={["#4ECDC4", "#44A08D"]}
          />
          <StatCard
            icon={<Ionicons name="time" size={32} color="#fff" />}
            number="0"
            label="Mins Today"
            gradientColors={["#5DADE2", "#3498DB"]}
          />
        </View>

        {/* WEEKLY GOAL */}
        <WeeklyGoalCard 
          current={150}
          total={300}
          percentage={50}
        />

        {/* WEEKLY ACTIVITY CHART */}
        <WeeklyActivityChart data={weeklyData} />

        {/* ROUTINE SECTION */}
        <Text style={styles.sectionTitle}>My Routines</Text>

        <View style={styles.routineCard}>
          <Text style={styles.routineText}>
            You haven't created a routine yet! 🎵{"\n"}
            Tap 'Create a Routine' below to get started.
          </Text>

          <GradientButton
            title="Create a Routine"
            onPress={() => console.log("Create routine")}
          />
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* BOTTOM TAB BAR */}
      <BottomNav 
        activeTab="Home"
        onTabPress={handleTabPress}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  greetingContainer: { padding: 20, paddingBottom: 0 },
  greetingText: { fontSize: 32, fontWeight: "700", color: "#222" },
  greetingSub: { fontSize: 16, color: "#666", marginTop: 4 },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "700",
    paddingHorizontal: 20,
    marginTop: 20,
    color: "#111",
  },
  sectionSubtitle: {
    fontSize: 13,
    color: "#777",
    paddingHorizontal: 20,
    marginBottom: 15,
  },
  statsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 20,
  },
  routineCard: {
    backgroundColor: "#fff",
    marginTop: 15,
    marginHorizontal: 20,
    padding: 20,
    borderRadius: 16,
    elevation: 3,
  },
  routineText: { 
    color: "#444", 
    fontSize: 13, 
    marginBottom: 18, 
    textAlign: "center",
    lineHeight: 20,
  },
});