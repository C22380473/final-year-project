import { StyleSheet, Text, View } from "react-native";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { GradientContainer } from "../components/GradientContainer";
import { InfoHeader } from "../components/InfoHeader";
import { OptionCard } from "../components/OptionCard";
import { ScreenTitle } from "../components/ScreenTitle";
import { auth } from "../config/firebaseConfig";

export default function StartingPointScreen({ navigation, onOnboardingComplete }) {
  
  const completeOnboarding = async () => {
    try {
      const user = auth.currentUser;
      if (user) {
        const onboardingKey = `onboarding_completed_${user.uid}`;
        await AsyncStorage.setItem(onboardingKey, 'true');
        console.log('Onboarding marked as complete for:', user.email);
        
        // Notify parent component that onboarding is complete
        if (onOnboardingComplete) {
          onOnboardingComplete();
        }
      }
    } catch (error) {
      console.error('Error saving onboarding status:', error);
    }
  };

  const handleQuickStart = async () => {
    await completeOnboarding();
    navigation.navigate("Home");
  };

  const handleCreateOwn = async () => {
    await completeOnboarding();
    // Navigate to CreateOwn screen when it's created
    // For now, going to Home
    navigation.navigate("Home");
  };

  const handleBrowseTemplates = async () => {
    await completeOnboarding();
    // Navigate to BrowseTemplates screen when it's created
    // For now, going to Home
    navigation.navigate("Home");
  };

  return (
    <GradientContainer scrollable={false}>
      <View style={styles.content}>
        <InfoHeader style={{ marginBottom: 50 }} />

        <ScreenTitle>How would you like {"\n"} to start?</ScreenTitle>

        <Text style={styles.subtitle}>Choose your Starting Point:</Text>

        <View style={styles.optionsContainer}>
          <OptionCard
            emoji="🚀"
            title="Quick Start"
            description={`Build a routine using pre-made Focus Blocks\n(recommended for beginners).`}
            onPress={handleQuickStart}
          />

          <OptionCard
            emoji="🎨"
            title="Create My Own"
            description="Design your own Focus Blocks and combine them into a custom routine."
            onPress={handleCreateOwn}
          />

          <OptionCard
            emoji="🔍"
            title="Browse Templates"
            description="Explore Focus Blocks/Routines shared by other users."
            onPress={handleBrowseTemplates}
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