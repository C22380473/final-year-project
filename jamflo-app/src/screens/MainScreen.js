import React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

export default function MainScreen({ navigation }) {
  return (
    <LinearGradient  colors={['#218ED5', '#13B4B0']} style={styles.container}>
      <View style={styles.logoContainer}>
        <Image 
          source={require('../../assets/logo.png')}
          style={styles.logoImage}
        />
        <Text style={styles.logoText}>JamFlo</Text>
        <Text style={styles.tagline}>Structure Your Practice. Play Your Way.</Text>
      </View>
      
      <TouchableOpacity style={styles.primaryBtn} onPress={() => navigation.navigate('LogIn')}>
        <Text style={styles.primaryBtnText}>Log In</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.secondaryBtn} onPress={() => navigation.navigate('SignUp')}>
        <Text style={styles.secondaryBtnText}>Sign Up</Text>
      </TouchableOpacity>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center' },

  logoContainer: { alignItems: 'center', marginBottom: 80 },

  logoImage: {
  width: 220,    
  height: 220,
  resizeMode: 'contain',
  marginBottom: -50,
},


  logoText: { fontSize: 60, fontWeight: '700', color: '#fff' },

  tagline: { color: '#fff', marginTop: 8, fontSize: 16 },

  primaryBtn: {
    width: '75%',
    paddingVertical: 18,
    borderRadius: 12,
    backgroundColor: '#fff',
    marginBottom: 20,
    alignItems: 'center',
    elevation: 3,
  },

  primaryBtnText: { fontWeight: '600', fontSize: 16 },

  secondaryBtn: {
    width: '75%',
    paddingVertical: 18,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#fff',
    alignItems: 'center',
  },

  secondaryBtnText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
});
