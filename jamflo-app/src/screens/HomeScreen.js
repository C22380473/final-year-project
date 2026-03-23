import React, { useState, useEffect, useCallback } from "react";
import { useFocusEffect } from "@react-navigation/native";
import {
  View,
  Text,
  TextInput,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  Alert,
  StyleSheet,
} from "react-native";
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
import { auth, db } from "../config/firebaseConfig";
import { collection, getDocs, query, orderBy, limit } from "firebase/firestore";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  getUserStats,
  ensureUserStats,
  updateWeeklyGoal,
} from "../services/userStatsService";

const getDayKey = (date) => {
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const getStartOfWeek = (date = new Date()) => {
  const d = new Date(date);
  const day = d.getDay(); // Sun=0 ... Sat=6
  const diffToMonday = day === 0 ? -6 : 1 - day;
  d.setDate(d.getDate() + diffToMonday);
  d.setHours(0, 0, 0, 0);
  return d;
};

const buildWeeklyChartData = (statsObj) => {
  const base = [
    { day: "Mon", value: 0 },
    { day: "Tue", value: 0 },
    { day: "Wed", value: 0 },
    { day: "Thu", value: 0 },
    { day: "Fri", value: 0 },
    { day: "Sat", value: 0 },
    { day: "Sun", value: 0 },
  ];

  const history = statsObj?.practiceHistory || {};
  const monday = getStartOfWeek(new Date());

  return base.map((item, index) => {
    const current = new Date(monday);
    current.setDate(monday.getDate() + index);
    const key = getDayKey(current);

    return {
      ...item,
      value: Number(history[key] || 0),
    };
  });
};

export default function HomeScreen({ navigation }) {
  const [username, setUsername] = useState("User");
  const [routines, setRoutines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeSession, setActiveSession] = useState(null);

  const [showGoalModal, setShowGoalModal] = useState(false);
  const [goalInput, setGoalInput] = useState("300");

  const [statsLoaded, setStatsLoaded] = useState(false);

  const [stats, setStats] = useState({
    totalPracticeMinutes: 0,
    totalSessionsCompleted: 0,
    currentStreak: 0,
    longestStreak: 0,
    lastPracticeDate: null,
    xp: 0,
    level: 1,
    achievements: [],
    weeklyGoalMinutes: 300,
    todayMinutes: 0,
    weeklyMinutes: 0,
    weeklyMinutesWeekKey: null,
    practiceHistory: {},
  });

  const [weeklyChartData, setWeeklyChartData] = useState([
    { day: "Mon", value: 0 },
    { day: "Tue", value: 0 },
    { day: "Wed", value: 0 },
    { day: "Thu", value: 0 },
    { day: "Fri", value: 0 },
    { day: "Sat", value: 0 },
    { day: "Sun", value: 0 },
  ]);

  const { loadRoutine, resetRoutine } = useRoutine();

  const fetchStats = useCallback(async () => {
    try {
      setStatsLoaded(false);

      const user = auth.currentUser;
      if (!user) {
        setStats({
          totalPracticeMinutes: 0,
          totalSessionsCompleted: 0,
          currentStreak: 0,
          longestStreak: 0,
          lastPracticeDate: null,
          xp: 0,
          level: 1,
          achievements: [],
          weeklyGoalMinutes: 300,
          todayMinutes: 0,
          weeklyMinutes: 0,
          weeklyMinutesWeekKey: null,
          practiceHistory: {},
        });
        setWeeklyChartData([
          { day: "Mon", value: 0 },
          { day: "Tue", value: 0 },
          { day: "Wed", value: 0 },
          { day: "Thu", value: 0 },
          { day: "Fri", value: 0 },
          { day: "Sat", value: 0 },
          { day: "Sun", value: 0 },
        ]);
        setStatsLoaded(true);
        return;
      }

      await ensureUserStats(user.uid);
      const res = await getUserStats(user.uid);

      if (res?.success && res.stats) {
        setStats(res.stats);
        setWeeklyChartData(buildWeeklyChartData(res.stats));
      }

      setStatsLoaded(true);
    } catch (e) {
      console.log("Error loading user stats:", e);
      setStatsLoaded(true);
    }
  }, []);

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

  const fetchActiveSession = useCallback(async () => {
    const user = auth.currentUser;
    if (!user) return;

    const q = query(
      collection(db, "users", user.uid, "activeSessions"),
      orderBy("updatedAtMs", "desc"),
      limit(1),
    );

    const snap = await getDocs(q);

    if (snap.empty) {
      setActiveSession(null);
      return;
    }

    const d = snap.docs[0];
    const data = d.data();
    const remainingMs = Number(data?.remainingMs ?? 0);
    const isCompleted = !!data?.completedAt;

    if (!isCompleted && remainingMs > 0)
      setActiveSession({
        id: d.id,
        routineId: data.routineId ?? d.id,
        ...data,
      });
    else setActiveSession(null);
  }, []);

  useEffect(() => {
    setGoalInput(String(stats.weeklyGoalMinutes || 300));
  }, [stats.weeklyGoalMinutes]);

  // Load user + routines on mount (first render)
  useEffect(() => {
    const user = auth.currentUser;
    if (user?.displayName) setUsername(user.displayName);
    fetchRoutines();
    fetchActiveSession();
    fetchStats();
  }, [fetchRoutines, fetchActiveSession, fetchStats]);

  // Reload routines every time Home screen is focused
  useFocusEffect(
    useCallback(() => {
      fetchRoutines();
      fetchActiveSession();
      fetchStats();
    }, [fetchRoutines, fetchActiveSession, fetchStats]),
  );

  /** ROUTINE ACTION HANDLERS */
  const handleStartRoutine = (routine) => {
    Alert.alert(routine.name, "Ready to start practicing?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Start Practice",
        onPress: () =>
          navigation.navigate("PracticeSession", {
            routineId: routine?.routineId ?? routine?.id,
            startFresh: true,
          }),
      },
    ]);
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchRoutines();
    fetchActiveSession();
    fetchStats();
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
      ],
    );
  };

  const handleCreateRoutine = () => {
    resetRoutine();
    navigation.navigate("CreateRoutine");
  };

  const handleEditWeeklyGoal = () => {
    setGoalInput(String(stats.weeklyGoalMinutes || 300));
    setShowGoalModal(true);
  };

  const handleSaveWeeklyGoal = async () => {
    const n = Number(goalInput);
    if (!Number.isFinite(n) || n <= 0) {
      Alert.alert("Invalid goal", "Please enter a valid number of minutes.");
      return;
    }

    const uid = auth.currentUser?.uid;
    if (!uid) return;

    const res = await updateWeeklyGoal(uid, n);
    if (!res.success) {
      Alert.alert("Error", res.message || "Could not update weekly goal.");
      return;
    }

    setShowGoalModal(false);
    fetchStats();
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
            {!statsLoaded
              ? "Loading your progress..."
              : stats.currentStreak > 0
                ? `You’ve practiced ${stats.currentStreak} day${stats.currentStreak === 1 ? "" : "s"} in a row — keep the streak going 🎸`
                : "Start a session today and begin your streak 🎸"}
          </Text>
        </View>

        {/* STATS SECTION */}
        <SectionHeader
          title="My Stats Overview"
          subtitle="Your Practice Progress"
        />

        <StatsRow stats={stats} />

        <WeeklyGoalCard
          current={Number(stats.weeklyMinutes || 0)}
          total={Number(stats.weeklyGoalMinutes || 300)}
          percentage={Math.min(
            100,
            (Number(stats.weeklyMinutes || 0) /
              Math.max(1, Number(stats.weeklyGoalMinutes || 300))) *
              100,
          )}
          onEdit={handleEditWeeklyGoal}
        />

        <WeeklyActivityChart data={weeklyChartData} />

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

        {activeSession?.remainingMs > 0 && (
          <View style={styles.resumeCard}>
            <Text style={styles.resumeTitle}>Continue your last session?</Text>
            <Text style={styles.resumeSub}>
              You were part-way through a routine.
            </Text>

            <View style={{ flexDirection: "row", gap: 10, marginTop: 10 }}>
              <TouchableOpacity
                style={styles.resumeBtnPrimary}
                onPress={() =>
                  navigation.navigate("PracticeSession", {
                    routineId: activeSession.routineId,
                    startFresh: false,
                  })
                }
              >
                <Text style={styles.resumeBtnText}>Continue</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.resumeBtnSecondary}
                onPress={async () => {
                  const user = auth.currentUser;
                  if (!user || !activeSession?.routineId) return;

                  // Clear local resume (matches PracticeSessionScreen sessionKey)
                  await AsyncStorage.removeItem(
                    `activeSession:${user.uid}:${activeSession.routineId}`,
                  );

                  setActiveSession(null);
                }}
              >
                <Text style={styles.resumeBtnSecondaryText}>Clear</Text>
              </TouchableOpacity>
            </View>
          </View>
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

      {showGoalModal && (
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Set Weekly Goal</Text>
            <TextInput
              value={goalInput}
              onChangeText={setGoalInput}
              keyboardType="numeric"
              placeholder="Enter minutes"
              style={styles.modalInput}
            />

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.modalBtnSecondary}
                onPress={() => setShowGoalModal(false)}
              >
                <Text style={styles.modalBtnSecondaryText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.modalBtnPrimary}
                onPress={handleSaveWeeklyGoal}
              >
                <Text style={styles.modalBtnPrimaryText}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}
      <BottomNav
        activeTab="Home"
        onTabPress={(t) => {
          if (t === "Create") handleCreateRoutine();
          if (t === "Home") navigation.navigate("Home");
          if (t === "Community") navigation.navigate("Community");
          if (t === "Tools") navigation.navigate("Tools");
          if (t === "Profile") navigation.navigate("Profile");
        }}
      />
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
  resumeCard: {
    backgroundColor: "#e8f4ff",
    margin: 16,
    padding: 16,
    borderRadius: 14,
  },
  resumeTitle: {
    fontSize: 18,
    fontWeight: "700",
  },
  resumeSub: {
    marginTop: 4,
    color: "#555",
  },
  resumeBtnPrimary: {
    flex: 1,
    backgroundColor: "#218ED5",
    padding: 12,
    borderRadius: 10,
    alignItems: "center",
  },
  resumeBtnText: {
    color: "#fff",
    fontWeight: "700",
  },
  resumeBtnSecondary: {
    flex: 1,
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#218ED5",
    padding: 12,
    borderRadius: 10,
    alignItems: "center",
  },
  resumeBtnSecondaryText: {
    color: "#218ED5",
    fontWeight: "700",
  },
  modalOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalCard: {
    width: "84%",
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: "#111",
    marginBottom: 12,
  },
  modalInput: {
    borderWidth: 1,
    borderColor: "#DDD",
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
  },
  modalActions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 10,
    marginTop: 16,
  },
  modalBtnPrimary: {
    backgroundColor: "#13B4B0",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  modalBtnPrimaryText: {
    color: "#fff",
    fontWeight: "800",
  },
  modalBtnSecondary: {
    backgroundColor: "#F3F3F3",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  modalBtnSecondaryText: {
    color: "#333",
    fontWeight: "700",
  },
});
