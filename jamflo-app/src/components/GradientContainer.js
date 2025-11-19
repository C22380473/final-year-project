import React from 'react';
import { KeyboardAvoidingView, ScrollView, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

export const GradientContainer = ({ children }) => (
  <LinearGradient colors={['#218ED5', '#13B4B0']} style={styles.container}>
    <KeyboardAvoidingView style={styles.container} behavior='padding'>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        {children}
      </ScrollView>
    </KeyboardAvoidingView>
  </LinearGradient>
);

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContainer: { padding: 32, paddingTop: 80 },
});