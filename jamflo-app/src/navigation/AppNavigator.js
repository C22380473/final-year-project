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
  const [firstLogin, setFirstLogin] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        const isFirstLogin =
          currentUser.metadata.creationTime === currentUser.metadata.lastSignInTime;
        setFirstLogin(isFirstLogin);
      }
      setUser(currentUser);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  if (loading) return null; // show splash screen later

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>

        {!user ? (
          //  USER NOT LOGGED IN -> SHOW AUTH SCREENS
          <>
            <Stack.Screen name="Main" component={MainScreen} />
            <Stack.Screen name="SignUp" component={SignUpScreen} />
            <Stack.Screen name="LogIn" component={LogInScreen} />
          </>
        ) : firstLogin ? (
          // FIRST LOGIN AFTER SIGNUP -> ONBOARDING FLOW
          <>
            <Stack.Screen name="Welcome" component={WelcomeScreen} />
            <Stack.Screen name="AppInfo1" component={AppInfoScreen1} />
            <Stack.Screen name="AppInfo2" component={AppInfoScreen2} />
            <Stack.Screen name="StartingPoint" component={StartingPointScreen} />
            <Stack.Screen name="Home" component={HomeScreen} />
          </>
        ) : (
          // RETURNING USER OR NORMAL LOGIN -> GO HOME
          <>
            <Stack.Screen name="Home" component={HomeScreen} />
          </>
        )}

      </Stack.Navigator>
    </NavigationContainer>
  );
}
