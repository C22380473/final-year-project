import React from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from "react-native";
import { AppHeader } from "../components/AppHeader";
import { BottomNav } from "../components/BottomNav";
import { GradientButton } from "../components/GradientButton";

const quickBlocks = [
  {
    id: "warmup",
    title: "Essential Warm Up",
    subtitle: "Warm Up",
    meta: "3 Exercises | 15 Mins",
  },
  {
    id: "scales",
    title: "Scales Practice",
    subtitle: "Scales",
    meta: "3 Exercises | 15 Mins",
  },
  {
    id: "chords",
    title: "Chord Training",
    subtitle: "Chords",
    meta: "3 Exercises | 15 Mins",
  },
  {
    id: "technique",
    title: "Technique Focus",
    subtitle: "Technique",
    meta: "3 Exercises | 15 Mins",
  },
];

export default function CreateRoutineScreen({ navigation }) {
  const handleTabPress = (tab) => {
    // later: hook into main navigation
    if (tab === "Home") navigation.navigate("Home");
  };

  const handleQuickBlockPress = (block) => {
    // later: pass chosen block as param
    navigation.navigate("AddFocusBlock");
  };

  const handleStartFromScratch = () => {
    navigation.navigate("AddFocusBlock");
  };

  return (
    <View style={{ flex: 1, backgroundColor: "#f8f8f8" }}>
      {/* Fixed header */}
      <AppHeader />

      {/* Scrollable content */}
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingBottom: 120, paddingHorizontal: 20, paddingTop: 12 }}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.title}>Create a Routine</Text>

        <Text style={styles.sectionTitle}>Quick Start Focus Blocks</Text>
        <Text style={styles.sectionSubtitle}>
          Choose a focus block to practice and add to your routine
        </Text>

        {quickBlocks.map((block) => (
          <TouchableOpacity
            key={block.id}
            style={styles.blockCard}
            onPress={() => handleQuickBlockPress(block)}
          >
            <Text style={styles.blockTitle}>{block.title}</Text>
            <Text style={styles.blockSubtitle}>{block.subtitle}</Text>
            <Text style={styles.blockMeta}>{block.meta}</Text>
          </TouchableOpacity>
        ))}

        <View style={styles.dividerRow}>
          <View style={styles.dividerLine} />
          <Text style={styles.dividerText}>or</Text>
          <View style={styles.dividerLine} />
        </View>

        <GradientButton
          title="Start from Scratch"
          onPress={handleStartFromScratch}
        />
      </ScrollView>

      {/* Fixed bottom nav */}
      <BottomNav activeTab="Create" onTabPress={handleTabPress} />
    </View>
  );
}

const styles = StyleSheet.create({
  title: {
    fontSize: 28,
    fontWeight: "700",
    marginBottom: 24,
    color: "#000",
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 4,
    color: "#000",
  },
  sectionSubtitle: {
    fontSize: 13,
    color: "#666",
    marginBottom: 16,
    lineHeight: 18,
  },
  blockCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#20A39F",
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  blockTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: "#000",
    marginBottom: 4,
  },
  blockSubtitle: {
    fontSize: 13,
    color: "#666",
    marginBottom: 4,
  },
  blockMeta: {
    fontSize: 12,
    color: "#999",
  },
  dividerRow: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 28,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: "#E5E5E5",
  },
  dividerText: {
    marginHorizontal: 12,
    color: "#999",
    fontSize: 13,
    fontWeight: "500",
  },
});