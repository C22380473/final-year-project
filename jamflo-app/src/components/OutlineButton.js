import React from "react";
import { TouchableOpacity, Text, StyleSheet } from "react-native";

export const OutlineButton = ({
  title,
  onPress,
  style,
  textStyle,
  borderColor = "#218ED5",
}) => {
  return (
    <TouchableOpacity
      onPress={onPress}
      style={[
        styles.button,
        { borderColor },
        style
      ]}
    >
      <Text style={[styles.text, { color: borderColor }, textStyle]}>
        {title}
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    paddingVertical: 10,
    paddingHorizontal: 5,
    borderWidth: 2,
    borderRadius: 10,        
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
  },
  text: {
    fontSize: 15,
    fontWeight: "600",
    textAlign: "center",
  }
});
