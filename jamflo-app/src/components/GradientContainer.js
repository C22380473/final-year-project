import React from 'react';
import { View, KeyboardAvoidingView, ScrollView, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

export const GradientContainer = ({ children, scrollable = true, keyboardAvoiding = true }) => {
  if (scrollable) {
    return (
      <LinearGradient colors={['#218ED5', '#13B4B0']} style={styles.container}>
        {keyboardAvoiding ? (
          <KeyboardAvoidingView style={styles.container} behavior='padding'>
            <ScrollView contentContainerStyle={styles.scrollContainer}>
              {children}
            </ScrollView>
          </KeyboardAvoidingView>
        ) : (
          <ScrollView contentContainerStyle={styles.scrollContainer}>
            {children}
          </ScrollView>
        )}
      </LinearGradient>
    );
  }

  // For non-scrollable screens (like onboarding)
  return (
    <LinearGradient colors={['#218ED5', '#13B4B0']} style={styles.container}>
      {children}
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContainer: { padding: 32, paddingTop: 80 },
});