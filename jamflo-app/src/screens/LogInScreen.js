import React, { useState } from 'react';
import { View, Text, Image, TextInput, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

export default function LogInScreen() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  return (
    <LinearGradient colors={['#218ED5', '#13B4B0']} style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.header}>
              <Image 
                    source={require('../../assets/logo.png')}
                    style={styles.logoImage}
                  />
          <Text style={styles.logoText}>JamFlo</Text>
        </View>

        <Text style={styles.title}>Log In to your Account</Text>
        <Text style={styles.subtitle}>
          to get started on track with your guitar practice
        </Text>


        <Text style={styles.label}>Email Address</Text>
        <TextInput
          style={styles.input}
          value={email}
          onChangeText={setEmail}
          placeholder="Enter email"
          placeholderTextColor="#dfdfdfff"
          keyboardType="email-address"
        />

        <Text style={styles.label}>Password</Text>
        <TextInput
          style={styles.input}
          value={password}
          onChangeText={setPassword}
          placeholder="Enter password"
          placeholderTextColor="#dfdfdfff"
          secureTextEntry
        />

        <TouchableOpacity style={styles.logInBtn}>
          <Text style={styles.logInBtnText}>Log In</Text>
        </TouchableOpacity>
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContainer: { padding: 32, paddingTop: 80 },
  header: { alignItems: 'center', marginBottom: 36 },

  logoImage: {
  width: 100,    
  height: 100,
  resizeMode: 'contain',
  marginBottom: -25,
  },
  logoText: { color: '#fff', fontSize: 32, fontWeight: '700', marginTop: 4 },

  title: {
    fontSize: 30,
    color: '#fff',
    fontWeight: '700',
    marginBottom: 4,
    textAlign: 'center',
  },

  subtitle: {
    fontSize: 16,
    color: '#e5e5e5',
    textAlign: 'center',
    marginBottom: 32,
  },

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

  logInBtn: {
    marginTop: 40,
    backgroundColor: '#fff',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },

  logInBtnText: { fontWeight: '600', fontSize: 16 },
});
