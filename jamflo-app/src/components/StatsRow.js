import React from "react";
import { View, StyleSheet } from "react-native";
import { StatCard } from "./StatCard";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";

export const StatsRow = () => {
  return (
    <View style={styles.row}>
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
  );
};

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 20,
  },
});
