import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export const BottomNav = ({ activeTab = 'Home', onTabPress }) => {
  const tabs = [
    { name: 'Home', icon: 'home', activeIcon: 'home' },
    { name: 'Create', icon: 'add-circle-outline', activeIcon: 'add-circle' },
    { name: 'Community', icon: 'people-outline', activeIcon: 'people' },
    { name: 'Tools', icon: 'musical-notes-outline', activeIcon: 'musical-notes' },
    { name: 'Profile', icon: 'person-outline', activeIcon: 'person' },
  ];

  return (
    <View style={styles.tabBar}>
      {tabs.map((tab) => {
        const isActive = activeTab === tab.name;
        return (
          <TouchableOpacity
            key={tab.name}
            style={styles.tabItem}
            onPress={() => onTabPress && onTabPress(tab.name)}
          >
            <Ionicons
              name={isActive ? tab.activeIcon : tab.icon}
              size={24}
              color={isActive ? "#4ECDC4" : "#666"}
            />
            <Text
              style={[
                styles.tabLabel,
                isActive && { color: "#4ECDC4" }
              ]}
            >
              {tab.name}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  tabBar: {
    flexDirection: "row",
    backgroundColor: "#fff",
    borderTopWidth: 1,
    borderTopColor: "#e0e0e0",
    paddingVertical: 10,
    paddingBottom: 40,
    justifyContent: "space-around",
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 10,
  },
  tabItem: {
    alignItems: "center",
    justifyContent: "center",
  },
  tabLabel: {
    fontSize: 10,
    color: "#666",
    marginTop: 4,
    fontWeight: "500",
  },
});