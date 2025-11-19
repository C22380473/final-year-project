import React from 'react';
import { View, Text, TextInput, StyleSheet } from 'react-native';

export const AuthInput = ({ label, value, onChangeText, placeholder, ...props }) => (
  <View>
    <Text style={styles.label}>{label}</Text>
    <TextInput
      style={styles.input}
      value={value}
      onChangeText={onChangeText}
      placeholder={placeholder}
      placeholderTextColor="#dfdfdfff"
      {...props}
    />
  </View>
);

const styles = StyleSheet.create({
  label: {
    color: '#fff',
    marginBottom: 6,
    marginTop: 10,
    fontSize: 14,
  },
  input: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 10,
    padding: 14,
    color: '#fff',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 1)',
  },
});