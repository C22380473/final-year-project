import React, { useCallback, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import { AppHeader } from "../components/AppHeader";
import { BottomNav } from "../components/BottomNav";
import { MetronomeCard } from "../components/practiceSession/MetronomeCard";
import { useMetronome } from "../hooks/useMetronome";
import { auth } from "../config/firebaseConfig";

export default function ToolsScreen({ navigation }) {
  const [bpm, setBpm] = useState(60);
  const [beatsPerBar, setBeatsPerBar] = useState(2);
  const [currentBeat0, setCurrentBeat0] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [metronomeEnabled, setMetronomeEnabled] = useState(true);

  const handleStop = useCallback(() => {
    setIsRunning(false);
    setCurrentBeat0(0);
  }, []);

  useMetronome({
    bpm,
    beatsPerBar,
    enabled: metronomeEnabled,
    isRunning,
    onBeat: (beat) => setCurrentBeat0(beat),
  });

  const handleTogglePlayback = useCallback(() => {
    if (!metronomeEnabled) return;
    setIsRunning((prev) => !prev);
  }, [metronomeEnabled]);

  return (
    <View style={styles.container}>
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
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.headingBlock}>
          <Text style={styles.pageTitle}>Guitar Tools</Text>
          <Text style={styles.pageSubtitle}>
            Essential tools to keep your sessions sharp and in rhythm.
          </Text>
        </View>

        <MetronomeCard
          bpm={bpm}
          setBpm={setBpm}
          beatsPerBar={beatsPerBar}
          setBeatsPerBar={setBeatsPerBar}
          currentBeat0={currentBeat0}
          isRunning={isRunning}
          onStart={handleTogglePlayback}
          onStop={handleStop}
          metronomeEnabled={metronomeEnabled}
          setMetronomeEnabled={setMetronomeEnabled}
        />

        <View style={styles.comingSoonCard}>
          <Text style={styles.comingSoonTitle}>More tools coming soon...</Text>
          <Text style={styles.comingSoonText}>
            This screen is planned for future improvement and implementation.
            Upcoming tools may include a chord finder, tuner, and backing-track
            helpers.
          </Text>

          <View style={styles.pillRow}>
            <View style={styles.pill}>
              <Text style={styles.pillText}>Chord Finder</Text>
            </View>
            <View style={styles.pill}>
              <Text style={styles.pillText}>Tuner</Text>
            </View>
          </View>
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>

      <BottomNav
        activeTab="Tools"
        onTabPress={(t) => {
          if (t === "Home") navigation.navigate("Home");
          if (t === "Create") navigation.navigate("CreateRoutine");
          if (t === "Community") navigation.navigate("Community");
          if (t === "Tools") navigation.navigate("Tools");
          if (t === "Profile") navigation.navigate("Profile");
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f8f8",
  },
  scroll: {
    flex: 1,
  },
  content: {
    paddingBottom: 24,
  },

  headingBlock: {
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 6,
  },
  pageTitle: {
    fontSize: 32,
    fontWeight: "700",
    color: "#111",
    marginBottom: 6,
  },
  pageSubtitle: {
    fontSize: 16,
    lineHeight: 24,
    color: "#666",
    maxWidth: 320,
  },

  comingSoonCard: {
    backgroundColor: "#fff",
    marginHorizontal: 16,
    marginTop: 14,
    borderRadius: 22,
    padding: 20,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
    elevation: 3,
  },

  comingSoonTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 10,
  },
  comingSoonText: {
    fontSize: 15,
    lineHeight: 26,
    color: "#5f6b7a",
    marginBottom: 18,
  },

  pillRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  pill: {
    paddingHorizontal: 22,
    paddingVertical: 12,
    borderRadius: 999,
    borderWidth: 1.5,
    borderColor: "#38bdf8",
    backgroundColor: "#f8fdff",
  },
  pillText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#0369a1",
  },
});
