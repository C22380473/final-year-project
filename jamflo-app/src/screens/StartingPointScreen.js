import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { GradientContainer } from "../components/GradientContainer";
import { AppHeader } from "../components/AppHeader";
import { ScreenTitle } from "../components/ScreenTitle";
import { OptionCard } from "../components/OptionCard";

export default function StartingPointScreen({ navigation }) {
  return (
    <GradientContainer scrollable={false}>
      <View style={styles.content}>
        <AppHeader style={{ marginBottom: 50 }} />

        <ScreenTitle>How would you like  {"\n"} to start?</ScreenTitle>

        <Text style={styles.subtitle}>Choose your Starting Point:</Text>

        <View style={styles.optionsContainer}>
          <OptionCard
            emoji="🚀"
            title="Quick Start"
            description={`Build a routine using pre-made Focus Blocks\n(recommended for beginners).`}
            onPress={() => navigation.navigate("QuickStart")}
          />

          <OptionCard
            emoji="🎨"
            title="Create My Own"
            description="Design your own Focus Blocks and combine them into a custom routine."
            onPress={() => navigation.navigate("CreateOwn")}
          />

          <OptionCard
            emoji="🔍"
            title="Browse Templates"
            description="Explore Focus Blocks/Routines shared by other users."
            onPress={() => navigation.navigate("BrowseTemplates")}
          />
        </View>
      </View>
    </GradientContainer>
  );
}

const styles = StyleSheet.create({
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 50,
    paddingBottom: 40,
  },
  subtitle: {
    fontSize: 16,
    color: "#fff",
    fontWeight: "600",
    marginBottom: 24,
  },
  optionsContainer: {
    flex: 1,
  },
});