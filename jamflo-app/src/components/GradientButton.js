import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

export const GradientButton = ({ 
  title, 
  onPress, 
  colors = ["#218ED5", "#13B4B0"],
  style,
  textStyle,
  gradientStyle 
}) => {
  return (
    <TouchableOpacity onPress={onPress} style={style}>
      <LinearGradient
        colors={colors}
        style={[styles.gradientButton, gradientStyle]}
      >
        <Text style={[styles.buttonText, textStyle]}>{title}</Text>
      </LinearGradient>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  gradientButton: {
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
  },
  buttonText: { 
    color: "#fff", 
    fontSize: 15, 
    fontWeight: "600" 
  },
});