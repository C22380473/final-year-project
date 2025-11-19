import React, { useState } from 'react';
import { Text, StyleSheet, TouchableOpacity } from 'react-native';
import { GradientContainer } from '../components/GradientContainer';
import { IntroHeader } from '../components/IntroHeader';
import { AuthInput } from '../components/AuthInput';


export default function SignUpScreen() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  return (
    <GradientContainer>
        <IntroHeader />

        <Text style={styles.title}>Create an Account</Text>
        <Text style={styles.subtitle}>
          to get started on your guitar practice journey
        </Text>

        <AuthInput 
        label="Username"
        value={username}
        onChangeText={setUsername}
        placeholder="Enter username"
      />

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

      <AuthInput 
        label="Confirm Password"
        value={confirmPassword}
        onChangeText={setConfirmPassword}
        placeholder="Confirm password"
        secureTextEntry
      />

      <TouchableOpacity style={styles.signUpBtn}>
        <Text style={styles.signUpBtnText}>Sign Up</Text>
      </TouchableOpacity>
    </GradientContainer>
  );
}

const styles = StyleSheet.create({
  title: {
    fontSize: 32,
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

  signUpBtn: {
    marginTop: 40,
    backgroundColor: '#fff',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },

  signUpBtnText: { fontWeight: '600', fontSize: 16 },
});
