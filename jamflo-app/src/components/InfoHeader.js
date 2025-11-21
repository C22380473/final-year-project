import React from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';

export const InfoHeader = ({ style }) => (
  <View style={[styles.topRow, style]}>
    <Image
      source={require('../../assets/logo.png')}
      style={styles.smallLogo}
    />
    <Text style={styles.brand}>JamFlo</Text>
  </View>
);

const styles = StyleSheet.create({
  topRow: { 
    flexDirection: "row", 
    alignItems: "center",
  },
  smallLogo: { 
    width: 40, 
    height: 40, 
    resizeMode: "contain", 
    marginRight: -8,
  },
  brand: { 
    color: "#fff", 
    fontSize: 22, 
    fontWeight: "700",
  },
});