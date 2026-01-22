import React, { useState, useEffect, useCallback } from "react";
import { useFocusEffect } from "@react-navigation/native";
import { View, Text, ScrollView, RefreshControl, TouchableOpacity, ActivityIndicator, Alert, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { AppHeader } from "../components/AppHeader";
import { BottomNav } from "../components/BottomNav";
import { WeeklyGoalCard } from "../components/WeeklyGoalCard";
import { WeeklyActivityChart } from "../components/WeeklyActivityChart";
import { SectionHeader } from "../components/SectionHeader";
import { RoutineCard } from "../components/RoutineCard";
import { EmptyStateCard } from "../components/EmptyStateCard";
import { LoadingCard } from "../components/LoadingCard";
import { StatsRow } from "../components/StatsRow";
import { useRoutine } from "../contexts/RoutineContext";
import { getUserRoutines, deleteRoutine } from "../services/routineService";
import { auth } from "../config/firebaseConfig";


export default function HomeScreen({ navigation }) {
  const [username, setUsername] = useState("User");
  const [routines, setRoutines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const { loadRoutine, resetRoutine } = useRoutine();

  const fetchRoutines = useCallback(async () => {
    try {
      const user = auth.currentUser;
      if (!user) {
        setLoading(false);
        setRefreshing(false);
        return;
      }

      const result = await getUserRoutines(user.uid);
      if (result.success) {
        setRoutines(result.routines || []);
      }
    } catch (e) {
      console.log("Error loading routines:", e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
    }, []);

    // Load user + routines on mount (first render)
    useEffect(() => {
      const user = auth.currentUser;
      if (user?.displayName) setUsername(user.displayName);
        fetchRoutines();
    }, [fetchRoutines]);

    // Reload routines every time Home screen is focused
    useFocusEffect(
      useCallback(() => {
      fetchRoutines();
      }, [fetchRoutines])
    );
 

  const onRefresh = () => {
    setRefreshing(true);
    fetchRoutines();
  };

  /** ROUTINE ACTION HANDLERS */
  const handleStartRoutine = (routine) => {
    Alert.alert(
      routine.name,
      "Ready to start practicing?",
      [
        { text: "Cancel", style: "cancel" },
        { text: "Start Practice", onPress: () => Alert.alert("Coming Soon") },
      ]
    );
  };

  const handleViewDetails = (routine) => {
    let msg = `${routine.description || "No description"}\n\n`;
    msg += `Total: ${routine.totalDuration || 0} mins\n`;
    msg += `Focus Blocks: ${routine.focusBlocks?.length || 0}\n\n`;

    routine.focusBlocks?.forEach((b, i) => {
      msg += `━━━━━━━\n${i + 1}. ${b.name}\n`;
      msg += `   ⏱ ${b.totalDuration} mins\n`;

      b.exercises.forEach((ex, ix) => {
        msg += `   - ${ix + 1}. ${ex.name}\n`;
      });
      msg += "\n";
    });

    Alert.alert(routine.name, msg);
  };

  const handleEditRoutine = (routine) => {
    loadRoutine(routine);
    navigation.navigate("RoutineEditor");
  };

  const handleDeleteRoutine = (routine) => {
    Alert.alert(
      "Delete Routine?",
      `Are you sure you want to delete "${routine.name}"?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            const result = await deleteRoutine(routine.id);
            if (result.success) {
              Alert.alert("Deleted", "Routine deleted.");
              fetchRoutines();
            }
          },
        },
      ]
    );
  };

  const handleCreateRoutine = () => {
    resetRoutine();
    navigation.navigate("CreateRoutine");
  };

  return (
    <View style={{ flex: 1, backgroundColor: "#f8f8f8" }}>
       {/* HEADER */}
        <AppHeader
          rightButton="logout"
          onRightButtonPress={async () => {
            try {
              await auth.signOut();
            } catch (e) {
              console.log("Logout error:", e);
            }
          }}
        />
      <ScrollView
        style={{ flex: 1 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        showsVerticalScrollIndicator={false}
      >

        {/* GREETING */}
        <View style={styles.greetingContainer}>
          <Text style={styles.greetingTitle}>Welcome back, {username}!</Text>
          <Text style={styles.greetingSub}>
            You’ve practiced 3 days in a row — keep the streak going 🎸
          </Text>
        </View>

        {/* STATS SECTION */}
        <SectionHeader title="My Stats Overview" subtitle="Your Practice Progress" />

        <StatsRow />

        <WeeklyGoalCard current={150} total={300} percentage={50} />
        <WeeklyActivityChart
          data={[
            { day: "Mon", value: 20 },
            { day: "Tue", value: 45 },
            { day: "Wed", value: 30 },
            { day: "Thu", value: 10 },
            { day: "Fri", value: 25 },
            { day: "Sat", value: 50 },
            { day: "Sun", value: 55 },
          ]}
        />

        {/* ROUTINES HEADER */}
        <SectionHeader
          title="My Routines"
          subtitle={`${routines.length} routines`}
          rightContent={
            <TouchableOpacity onPress={handleCreateRoutine}>
              <Ionicons name="add-circle" size={28} color="#218ED5" />
            </TouchableOpacity>
          }
        />

        {/* LOADING STATE */}
        {loading && <LoadingCard label="Loading your routines..." />}

        {/* EMPTY STATE */}
        {!loading && routines.length === 0 && (
          <EmptyStateCard
            icon="musical-notes-outline"
            message={`You haven't created any routines yet!\nTap below to start.`}
            buttonLabel="Create a Routine"
            onPress={handleCreateRoutine}
          />
        )}

        {/* ROUTINE LIST */}
        {!loading &&
          routines.map((routine) => (
            <RoutineCard
              key={routine.id}
              routine={routine}
              onStart={() => handleStartRoutine(routine)}
              onView={() => handleViewDetails(routine)}
              onEdit={() => handleEditRoutine(routine)}
              onDelete={() => handleDeleteRoutine(routine)}
            />
          ))}

        <View style={{ height: 100 }} />
      </ScrollView>

      <BottomNav activeTab="Home" onTabPress={(t) => {
        if (t === "Create") handleCreateRoutine();
        if (t === "Home") navigation.navigate("Home");
        if (t === "Community") navigation.navigate("Community");
      }} />
    </View>
  );
}

const styles = StyleSheet.create({
  greetingContainer: {
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  greetingTitle: {
    fontSize: 32,
    fontWeight: "700",
    color: "#222",
  },
  greetingSub: {
    fontSize: 16,
    color: "#666",
    marginTop: 4,
  },
});
