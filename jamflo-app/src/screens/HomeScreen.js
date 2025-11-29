import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, RefreshControl, Alert } from "react-native";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { signOut } from "firebase/auth";
import { auth } from "../config/firebaseConfig";
import { AppHeader } from "../components/AppHeader";
import { BottomNav } from "../components/BottomNav";
import { StatCard } from "../components/StatCard";
import { WeeklyGoalCard } from "../components/WeeklyGoalCard";
import { WeeklyActivityChart } from "../components/WeeklyActivityChart";
import { GradientButton } from "../components/GradientButton";
import { getUserRoutines, deleteRoutine } from "../../services/routineService";
import { useRoutine } from "../../contexts/RoutineContext";

export default function HomeScreen({ navigation }) {
  const [username, setUsername] = useState("User");
  const [routines, setRoutines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  
  const { loadRoutine, resetRoutine } = useRoutine();

  useEffect(() => {
    const currentUser = auth.currentUser;
    if (currentUser && currentUser.displayName) {
      setUsername(currentUser.displayName);
    }
    
    fetchRoutines();
  }, []);

  const fetchRoutines = async () => {
    try {
      const currentUser = auth.currentUser;
      if (!currentUser) {
        setLoading(false);
        return;
      }

      const result = await getUserRoutines(currentUser.uid);
      
      if (result.success) {
        setRoutines(result.routines);
      }
    } catch (error) {
      console.error('Error fetching routines:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchRoutines();
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (err) {
      console.log("Logout error:", err);
    }
  };

  const handleStartRoutine = (routine) => {
    Alert.alert(
      routine.name,
      'Ready to start practicing?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Start Practice',
          onPress: () => {
            Alert.alert('Coming Soon', 'Practice session feature coming soon!');
          }
        }
      ]
    );
  };

  const handleViewDetails = (routine) => {
    // Build detailed info with focus blocks and exercises
    let detailsMessage = `${routine.description || 'No description'}\n\n`;
    detailsMessage += `📊 Total Duration: ${routine.totalDuration || 0} mins\n`;
    detailsMessage += `📋 Focus Blocks: ${routine.focusBlocks?.length || 0}\n\n`;
    
    // Add each focus block with its exercises
    if (routine.focusBlocks && routine.focusBlocks.length > 0) {
      routine.focusBlocks.forEach((block, index) => {
        detailsMessage += `━━━━━━━━━━━━━━━━━━━\n`;
        detailsMessage += `${index + 1}. ${block.name}\n`;
        detailsMessage += `   ⏱️ ${block.totalDuration || 0} mins\n\n`;
        
        // Add exercises for this block
        if (block.exercises && block.exercises.length > 0) {
          detailsMessage += `   Exercises:\n`;
          block.exercises.forEach((exercise, exIndex) => {
            detailsMessage += `   ${exIndex + 1}. ${exercise.name}\n`;
            detailsMessage += `      • Duration: ${exercise.duration} mins\n`;
            if (exercise.tempo) {
              detailsMessage += `      • Tempo: ${exercise.tempo} BPM\n`;
            }
            if (exercise.category) {
              detailsMessage += `      • Category: ${exercise.category}\n`;
            }
            if (exercise.notes) {
              detailsMessage += `      • Notes: ${exercise.notes}\n`;
            }
            if (exercise.resources && exercise.resources.length > 0) {
              detailsMessage += `      • Resources: ${exercise.resources.length} attached\n`;
            }
            detailsMessage += `\n`;
          });
        } else {
          detailsMessage += `   No exercises\n\n`;
        }
      });
    }
    
    Alert.alert(
      routine.name,
      detailsMessage,
      [{ text: 'Close' }]
    );
  };

  const handleEditRoutine = (routine) => {
    loadRoutine(routine);
    navigation.navigate('RoutineEditor');
  };

  const handleDeleteRoutine = (routine) => {
    Alert.alert(
      'Delete Routine',
      `Are you sure you want to delete "${routine.name}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            const result = await deleteRoutine(routine.id);
            if (result.success) {
              Alert.alert('Success', 'Routine deleted!');
              fetchRoutines();
            } else {
              Alert.alert('Error', result.message);
            }
          }
        }
      ]
    );
  };

  const handleCreateRoutine = () => {
    resetRoutine();
    navigation.navigate("CreateRoutine");
  };

  const handleTabPress = (tabName) => {
    if (tabName === "Home") navigation.navigate("Home");
    if (tabName === "Create") handleCreateRoutine();
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
      <ScrollView 
        style={{ flex: 1 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <AppHeader 
          rightButton="logout"
          onRightButtonPress={handleLogout}
        />

        <View style={styles.greetingContainer}>
          <Text style={styles.greetingText}>Welcome back,{username}!</Text>
          <Text style={styles.greetingSub}>
            You've practiced 3 days in a row, let's make today count! 🎸
          </Text>
        </View>

        <Text style={styles.sectionTitle}>My Stats Overview</Text>
        <Text style={styles.sectionSubtitle}>Your Practice Progress</Text>

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

        <WeeklyGoalCard 
          current={150}
          total={300}
          percentage={50}
        />

        <WeeklyActivityChart data={weeklyData} />

        {/* ROUTINES SECTION */}
        <View style={styles.routineHeader}>
          <View>
            <Text style={styles.sectionTitle}>My Routines</Text>
            <Text style={styles.sectionSubtitle}>
              {loading ? 'Loading...' : `${routines.length} routine${routines.length !== 1 ? 's' : ''}`}
            </Text>
          </View>
          <TouchableOpacity 
            onPress={handleCreateRoutine}
            style={styles.addButton}
          >
            <Ionicons name="add-circle" size={28} color="#218ED5" />
          </TouchableOpacity>
        </View>

        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#218ED5" />
            <Text style={styles.loadingText}>Loading your routines...</Text>
          </View>
        ) : routines.length === 0 ? (
          <View style={styles.emptyCard}>
            <Ionicons name="musical-notes-outline" size={48} color="#CCC" style={{ alignSelf: 'center', marginBottom: 16 }} />
            <Text style={styles.emptyText}>
              You haven't created a routine yet! 🎵{"\n"}
              Tap 'Create a Routine' below to get started.
            </Text>
            <GradientButton
              title="Create a Routine"
              onPress={handleCreateRoutine}
            />
          </View>
        ) : (
          routines.map((routine, index) => (
            <View key={routine.id} style={styles.routineCard}>
              {/* Header with title and privacy badge */}
              <View style={styles.cardHeader}>
                <Text style={styles.routineTitle}>{routine.name}</Text>
                <View style={[styles.privacyBadge, { backgroundColor: routine.isPrivate ? '#E3F2FD' : '#E8F5E9' }]}>
                  <Ionicons 
                    name={routine.isPrivate ? "lock-closed" : "globe-outline"} 
                    size={12} 
                    color={routine.isPrivate ? '#1976D2' : '#4CAF50'} 
                  />
                  <Text style={[styles.privacyText, { color: routine.isPrivate ? '#1976D2' : '#4CAF50' }]}>
                    {routine.isPrivate ? 'Private' : 'Public'}
                  </Text>
                </View>
              </View>

              {/* Description */}
              {routine.description ? (
                <Text style={styles.routineDescription} numberOfLines={2}>
                  {routine.description}
                </Text>
              ) : null}

              {/* Duration badge */}
              <View style={styles.durationBadge}>
                <Ionicons name="time-outline" size={14} color="#666" />
                <Text style={styles.durationText}>{routine.totalDuration || 0}mins</Text>
              </View>

              {/* Focus Blocks Section */}
              <Text style={styles.focusBlocksLabel}>Focus Blocks</Text>
              
              <View style={styles.focusBlocksList}>
                {routine.focusBlocks && routine.focusBlocks.length > 0 ? (
                  routine.focusBlocks.map((block, blockIndex) => (
                    <View key={block.id || blockIndex} style={styles.focusBlockItem}>
                      <Text style={styles.focusBlockText}>{block.name}</Text>
                    </View>
                  ))
                ) : (
                  <Text style={styles.noBlocksText}>No focus blocks</Text>
                )}
              </View>

              {/* Action Buttons */}
              <View style={styles.actionButtonsRow}>
                <LinearGradient
                  colors={['#218ED5', '#13B4B0']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.startButton}
                >
                  <TouchableOpacity 
                    style={styles.startButtonInner}
                    onPress={() => handleStartRoutine(routine)}
                  >
                    <Text style={styles.startButtonText}>Start Practice</Text>
                  </TouchableOpacity>
                </LinearGradient>

                <TouchableOpacity 
                  style={styles.viewDetailsButton}
                  onPress={() => handleViewDetails(routine)}
                >
                  <Text style={styles.viewDetailsText}>View Details</Text>
                </TouchableOpacity>

                <TouchableOpacity 
                  style={styles.iconButton}
                  onPress={() => handleEditRoutine(routine)}
                >
                  <Ionicons name="create-outline" size={22} color="#FFC107" />
                </TouchableOpacity>

                <TouchableOpacity 
                  style={styles.iconButton}
                  onPress={() => handleDeleteRoutine(routine)}
                >
                  <Ionicons name="trash-outline" size={22} color="#E74C3C" />
                </TouchableOpacity>
              </View>
            </View>
          ))
        )}

        <View style={{ height: 100 }} />
      </ScrollView>

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
  routineHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingRight: 20,
    marginTop: 20,
  },
  addButton: {
    padding: 4,
  },
  loadingContainer: {
    backgroundColor: '#fff',
    marginHorizontal: 20,
    marginTop: 15,
    padding: 40,
    borderRadius: 16,
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    color: '#666',
    fontSize: 14,
  },
  emptyCard: {
    backgroundColor: "#fff",
    marginTop: 15,
    marginHorizontal: 20,
    padding: 20,
    borderRadius: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  emptyText: { 
    color: "#444", 
    fontSize: 13, 
    marginBottom: 18, 
    textAlign: "center",
    lineHeight: 20,
  },

  // NEW CARD STYLES (matching mockup)
  routineCard: {
    backgroundColor: '#fff',
    marginHorizontal: 20,
    marginTop: 12,
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  routineTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#000',
    flex: 1,
    marginRight: 12,
  },
  privacyBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  privacyText: {
    fontSize: 11,
    fontWeight: '600',
    marginLeft: 4,
  },
  routineDescription: {
    fontSize: 13,
    color: '#666',
    marginBottom: 12,
    lineHeight: 18,
  },
  durationBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  durationText: {
    fontSize: 13,
    color: '#666',
    marginLeft: 6,
  },
  focusBlocksLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#000',
    marginBottom: 8,
  },
  focusBlocksList: {
    marginBottom: 16,
  },
  focusBlockItem: {
    backgroundColor: '#F5F5F5',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
    marginBottom: 6,
  },
  focusBlockText: {
    fontSize: 14,
    color: '#333',
  },
  noBlocksText: {
    fontSize: 13,
    color: '#999',
    fontStyle: 'italic',
  },
  actionButtonsRow: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
  },
  startButton: {
    flex: 1,
    borderRadius: 8,
  },
  startButtonInner: {
    paddingVertical: 12,
    alignItems: 'center',
  },
  startButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  viewDetailsButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#218ED5',
    alignItems: 'center',
  },
  viewDetailsText: {
    color: '#218ED5',
    fontSize: 14,
    fontWeight: '600',
  },
  iconButton: {
    width: 44,
    height: 44,
    borderRadius: 8,
    backgroundColor: '#F5F5F5',
    alignItems: 'center',
    justifyContent: 'center',
  },
});