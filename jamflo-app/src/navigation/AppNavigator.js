import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import MainScreen from '../screens/MainScreen';
import SignUpScreen from '../screens/SignUpScreen';
import LogInScreen from '../screens/LogInScreen';
import HomeScreen from '../screens/HomeScreen';
import WelcomeScreen from '../screens/WelcomeScreen';
import AppInfoScreen1 from '../screens/AppInfoScreen1';
import AppInfoScreen2 from '../screens/AppInfoScreen2';
import StartingPointScreen from '../screens/StartingPointScreen';
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../config/firebaseConfig";

const Stack = createStackNavigator();

export default function AppNavigator() {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);

  // Listen for user state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  if (loading) return null; // You can show a splash screen here

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {user ? (
          // If logged in -> go directly to Home 
          <>
            <Stack.Screen name="Home" component={HomeScreen} />
          </>
        ) : (
          // If logged out -> show login/signup flow
          <>
            <Stack.Screen name="Main" component={MainScreen} />
            <Stack.Screen name="SignUp" component={SignUpScreen} />
            <Stack.Screen name="LogIn" component={LogInScreen} />
            
            {/* Onboarding only accessible after signup */}
            <Stack.Screen name="Welcome" component={WelcomeScreen} />
            <Stack.Screen name="AppInfo1" component={AppInfoScreen1} />
            <Stack.Screen name="AppInfo2" component={AppInfoScreen2} />
            <Stack.Screen name="StartingPoint" component={StartingPointScreen} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}