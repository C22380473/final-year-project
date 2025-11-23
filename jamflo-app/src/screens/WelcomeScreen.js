import React, { useEffect } from "react";
import { View, Text, StyleSheet, Image } from "react-native";
import { GradientContainer } from "../components/GradientContainer";
import { PrimaryButton } from "../components/PrimaryButton";

export default function WelcomeScreen({ navigation, route }) {
  
  return (
    <GradientContainer scrollable={false}>
      <View style={styles.content}>
        <Text style={styles.title}>Hello,{"\n"}Welcome to</Text>
        <Image
          source={require("../../assets/logo.png")}
          style={styles.logo}
        />

        <Text style={styles.appName}>JamFlo</Text>
        <Text style={styles.tagline}>Your Practice. Your Flow.</Text>

        <Text style={styles.subtitle}>
          Build better guitar practice habits and share routines with other players.
        </Text>

        <PrimaryButton
          title="Continue"
          onPress={() => navigation.navigate("AppInfo1")}
          style={{ paddingHorizontal: 80 }}
        />
      </View>
    </GradientContainer>
  );
}

const styles = StyleSheet.create({
  content: {
    flex: 1,
    paddingHorizontal: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  title: {
    fontSize: 32,
    color: "#fff",
    fontWeight: "600",
    textAlign: "left",
    alignSelf: "flex-start",
    marginBottom: 8,
  },
  logo: {
    width: 180,
    height: 180,
    resizeMode: "contain",
  },
  appName: {
    fontSize: 48,
    color: "#fff",
    fontWeight: "700",
    marginTop: -40,
  },
  tagline: {
    fontSize: 17,
    color: "#fff",
    fontWeight: "400",
    marginBottom: 40,
  },
  subtitle: {
    fontSize: 16,
    color: "#fff",
    textAlign: "center",
    lineHeight: 24,
    fontStyle: "italic",
    marginBottom: 50,
  },
});