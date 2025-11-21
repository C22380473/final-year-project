import React, { useState } from 'react';
import { Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { GradientContainer } from '../components/GradientContainer';
import { IntroHeader } from '../components/IntroHeader';
import { AuthInput } from '../components/AuthInput';
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../config/firebaseConfig";

export default function LogInScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert("Missing Fields", "Enter your email and password.");
      return;
    }

    try {
      await signInWithEmailAndPassword(auth, email, password);

    } catch (err) {
      Alert.alert("Login Error", err.message);
    }
  };

  return (
    <GradientContainer>
      <IntroHeader />

      <Text style={styles.title}>Log In to your Account</Text>
      <Text style={styles.subtitle}>
        to get started on track with your guitar practice
      </Text>

      <AuthInput 
        label="Email Address"
        value={email}
        onChangeText={setEmail}
        placeholder="Enter email"
        keyboardType="email-address"
      />

      <AuthInput 
        label="Password"
        value={password}
        onChangeText={setPassword}
        placeholder="Enter password"
        secureTextEntry
      />

      <TouchableOpacity style={styles.logInBtn}  onPress={handleLogin}>
        <Text style={styles.logInBtnText}>Log In</Text>
      </TouchableOpacity>

       <TouchableOpacity 
        onPress={() => navigation.navigate("SignUp")}
        style={{ marginTop: 20 }}
      >
        <Text style={{ color: "#fff", textAlign: "center" }}>
          Don't have an account? Sign Up
        </Text>
      </TouchableOpacity>
      
    </GradientContainer>
  );
}

const styles = StyleSheet.create({

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

  logInBtn: {
    marginTop: 40,
    backgroundColor: '#fff',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },

  logInBtnText: { fontWeight: '600', fontSize: 16 },
});
