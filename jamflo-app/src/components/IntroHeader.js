import React from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';

export const IntroHeader = () => (
  <View style={styles.header}>
    <Image 
      source={require('../../assets/logo.png')}
      style={styles.logoImage}
    />
    <Text style={styles.logoText}>JamFlo</Text>
  </View>
);

const styles = StyleSheet.create({
  header: { 
    alignItems: 'center', 
    marginBottom: 36 
  },
  logoImage: {
    width: 100,    
    height: 100,
    resizeMode: 'contain',
    marginBottom: -25,
  },
  logoText: { 
    color: '#fff', 
    fontSize: 32, 
    fontWeight: '700', 
    marginTop: 4 
  },
});