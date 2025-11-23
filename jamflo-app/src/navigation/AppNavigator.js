import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import AsyncStorage from '@react-native-async-storage/async-storage';
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
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState(false);

  const checkOnboardingStatus = async (userId) => {
    try {
      const onboardingKey = `onboarding_completed_${userId}`;
      const completed = await AsyncStorage.getItem(onboardingKey);
      return completed === 'true';
    } catch (error) {
      console.error('Error reading onboarding status:', error);
      return false;
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        const completed = await checkOnboardingStatus(currentUser.uid);
        setHasCompletedOnboarding(completed);
      } else {
        setHasCompletedOnboarding(false);
      }
      
      setUser(currentUser);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  if (loading) return null;

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
        ) : !hasCompletedOnboarding ? (
          // USER LOGGED IN BUT HASN'T COMPLETED ONBOARDING
          <>
            <Stack.Screen name="Welcome" component={WelcomeScreen} />
            <Stack.Screen name="AppInfo1" component={AppInfoScreen1} />
            <Stack.Screen name="AppInfo2" component={AppInfoScreen2} />
            <Stack.Screen 
              name="StartingPoint" 
              children={(props) => (
                <StartingPointScreen 
                  {...props} 
                  onOnboardingComplete={() => setHasCompletedOnboarding(true)}
                />
              )}
            />
            <Stack.Screen name="Home" component={HomeScreen} />
          </>
        ) : (
          // RETURNING USER WHO HAS COMPLETED ONBOARDING
          <>
            <Stack.Screen name="Home" component={HomeScreen} />
          </>
        )}

      </Stack.Navigator>
    </NavigationContainer>
  );
}