import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { AppHeader } from "../components/AppHeader";
import { GradientButton } from "../components/GradientButton";
import { BottomNav } from "../components/BottomNav";
import { useRoutine } from "../contexts/RoutineContext";
import { QUICK_START_TEMPLATES } from "../data/quickStartTemplates";

export default function CreateRoutineScreen({ navigation }) {
  const { loadRoutineTemplate, resetRoutine } = useRoutine();

  /* -------------------- HANDLERS -------------------- */

  const handleQuickStart = (templateKey) => {
    resetRoutine(); // safety: clear any previous routine
    loadRoutineTemplate(QUICK_START_TEMPLATES[templateKey]);
    navigation.navigate("RoutineEditor");
  };

  const handleStartFromScratch = () => {
    resetRoutine();
    navigation.navigate("AddFocusBlock");
  };

  /* -------------------- UI -------------------- */

  return (
    <View style={{ flex: 1, backgroundColor: "#f8f8f8" }}>
      <AppHeader />

      <ScrollView
        contentContainerStyle={{ padding: 20, paddingBottom: 140 }}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.title}>Create a Routine</Text>
        <Text style={styles.subtitle}>
          Start quickly with a template or build your own routine from scratch.
        </Text>

        {/* QUICK START SECTION */}
        <Text style={styles.sectionTitle}>Quick Start</Text>

        <View style={styles.cardGrid}>
          <TouchableOpacity
            style={styles.templateCard}
            onPress={() => handleQuickStart("essentialWarmUp")}
          >
            <Ionicons name="flame" size={32} color="#FF6B35" />
            <Text style={styles.cardTitle}>Essential Warm Up</Text>
            <Text style={styles.cardSubtitle}>
              Get your fingers moving fast
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.templateCard}
            onPress={() => handleQuickStart("scalesPractice")}
          >
            <Ionicons name="trending-up" size={32} color="#4ECDC4" />
            <Text style={styles.cardTitle}>Scales Practice</Text>
            <Text style={styles.cardSubtitle}>
              Build speed and accuracy
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.templateCard}
            onPress={() => handleQuickStart("chordTraining")}
          >
            <Ionicons name="musical-notes" size={32} color="#5DADE2" />
            <Text style={styles.cardTitle}>Chord Training</Text>
            <Text style={styles.cardSubtitle}>
              Smooth chord transitions
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.templateCard}
            onPress={() => handleQuickStart("techniqueFocus")}
          >
            <Ionicons name="speedometer" size={32} color="#9B59B6" />
            <Text style={styles.cardTitle}>Technique Focus</Text>
            <Text style={styles.cardSubtitle}>
              Picking & fretting drills
            </Text>
          </TouchableOpacity>
        </View>

        {/* DIVIDER */}
        <View style={styles.orContainer}>
          <View style={styles.line} />
          <Text style={styles.orText}>or</Text>
          <View style={styles.line} />
        </View>


        {/* START FROM SCRATCH */}
       <Text style={styles.sectionTitle}>Build Your Own</Text>

        <TouchableOpacity
          style={[styles.templateCard, styles.scratchCard]}
          onPress={handleStartFromScratch}
        >
          <Ionicons name="create-outline" size={36} color="#218ED5" />
          <Text style={styles.cardTitle}>Start From Scratch</Text>
          <Text style={styles.cardSubtitle}>
            Build a routine exactly how you want
          </Text>
        </TouchableOpacity>

      </ScrollView>

      <BottomNav activeTab="Create" onTabPress={(tab) => {
        if (tab === "Home") navigation.navigate("Home");
      }} />
    </View>
  );
}

/* -------------------- STYLES -------------------- */

const styles = StyleSheet.create({
  title: {
    fontSize: 32,
    fontWeight: "700",
    color: "#111",
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 15,
    color: "#666",
    marginBottom: 28,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 14,
    color: "#111",
  },
  cardGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  templateCard: {
    width: "48%",
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#218ED5",
    alignItems: "center",
  },
  cardTitle: {
    marginTop: 10,
    fontSize: 14,
    fontWeight: "700",
    color: "#111",
    textAlign: "center",
  },
  cardSubtitle: {
    marginTop: 4,
    fontSize: 12,
    color: "#777",
    textAlign: "center",
  },
  divider: {
    height: 1,
    backgroundColor: "#E5E5E5",
    marginVertical: 30,
  },
  orContainer: {
  flexDirection: "row",
  alignItems: "center",
  marginVertical: 30,
},
line: {
  flex: 1,
  height: 1,
  backgroundColor: "#E5E5E5",
},
orText: {
  marginHorizontal: 12,
  color: "#999",
  fontSize: 14,
  fontWeight: "600",
},
scratchCard: {
  width: "100%",
  alignSelf: "center",
  marginBottom: 10,
},


});
