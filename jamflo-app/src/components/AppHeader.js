import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

export const AppHeader = ({ 
  rightButton = 'logout', // 'settings', 'logout', or custom
  onRightButtonPress,
  rightButtonText,
  showLogo = true,
}) => {
  return (
    <LinearGradient
      colors={["#218ED5", "#13B4B0"]}
      style={styles.headerContainer}
    >
      <View style={styles.headerLeft}>
        {showLogo && (
          <Image
            source={require("../../assets/logo.png")}
            style={styles.logo}
          />
        )}
        <Text style={styles.headerTitle}>JamFlo</Text>
      </View>

      <TouchableOpacity 
        style={styles.rightButton} 
        onPress={onRightButtonPress}
      >
        {rightButton === 'settings' ? (
          <Ionicons name="settings" size={26} color="#fff" />
        ) : rightButton === 'logout' ? (
          <Text style={styles.rightButtonText}>
            {rightButtonText || 'Log Out'}
          </Text>
        ) : (
          rightButton // Custom button component
        )}
      </TouchableOpacity>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  headerContainer: {
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: 20,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  headerLeft: { 
    flexDirection: "row", 
    alignItems: "center" 
  },
  logo: { 
    width: 35, 
    height: 35, 
    marginRight: -5, 
    resizeMode: "contain" 
  },
  headerTitle: { 
    color: "#fff", 
    fontSize: 24, 
    fontWeight: "700" 
  },
  rightButton: { 
    backgroundColor: "rgba(255,255,255,0.25)", 
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 8,
  },
  rightButtonText: { 
    color: "#fff", 
    fontSize: 13, 
    fontWeight: "600" 
  },
});