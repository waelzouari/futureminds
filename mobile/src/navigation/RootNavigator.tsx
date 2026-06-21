import React, { useEffect, useState } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { authService } from '../services/authService';
import { useAuthStore, useChildrenStore } from '../store';
import { Colors, FontFamily, FontSize } from '../theme';

// Screens
import { LoginScreen } from '../screens/Auth/LoginScreen';
import { RegisterScreen } from '../screens/Auth/RegisterScreen';
import { OnboardingScreen } from '../screens/Onboarding/OnboardingScreen';
import { DashboardScreen } from '../screens/ParentDashboard/DashboardScreen';
import { ChildrenListScreen } from '../screens/ParentDashboard/ChildrenListScreen';
import { ProfileScreen } from '../screens/ParentDashboard/ProfileScreen';
import { ChildProfileScreen } from '../screens/ChildProfile/ChildProfileScreen';
import { CreateChildScreen } from '../screens/ChildProfile/CreateChildScreen';
import { ChildHomeScreen } from '../screens/ChildHome/ChildHomeScreen';
import { GameSelectionScreen } from '../screens/GameSelection/GameSelectionScreen';
import { UnityGameScreen } from '../screens/UnityGame/UnityGameScreen';
import { SessionReportScreen } from '../screens/SessionReport/SessionReportScreen';

import {
  AuthStackParamList,
  AppStackParamList,
  ParentTabParamList,
} from './types';
import { Text } from 'react-native';

const AuthStack = createNativeStackNavigator<AuthStackParamList>();
const AppStack = createNativeStackNavigator<AppStackParamList>();
const ParentTab = createBottomTabNavigator<ParentTabParamList>();

const TAB_ICONS: Record<string, { active: string; inactive: string }> = {
  Dashboard: { active: '📊', inactive: '📈' },
  Children: { active: '👶', inactive: '👦' },
  Profile: { active: '⚙️', inactive: '⚙️' },
};

const ParentTabNavigator = () => (
  <ParentTab.Navigator
    screenOptions={({ route }) => ({
      tabBarIcon: ({ focused }) => {
        const icons = TAB_ICONS[route.name];
        return (
          <Text style={{ fontSize: 22, marginBottom: -4 }}>
            {focused ? icons.active : icons.inactive}
          </Text>
        );
      },
      tabBarLabel: ({ focused, children }) => (
        <Text style={{
          fontFamily: focused ? FontFamily.semiBold : FontFamily.regular,
          fontSize: FontSize.xs,
          color: focused ? Colors.primary : Colors.textTertiary,
          marginTop: -2,
          marginBottom: 4,
        }}>
          {children}
        </Text>
      ),
      tabBarStyle: {
        backgroundColor: Colors.surface,
        borderTopColor: Colors.border,
        borderTopWidth: 1,
        height: 72,
        paddingTop: 4,
      },
      tabBarActiveTintColor: Colors.primary,
      tabBarInactiveTintColor: Colors.textTertiary,
      headerShown: false,
    })}
  >
    <ParentTab.Screen name="Dashboard" component={DashboardScreen} options={{ tabBarLabel: 'Tableau de bord' }} />
    <ParentTab.Screen name="Children" component={ChildrenListScreen} options={{ tabBarLabel: 'Profils enfants' }} />
    <ParentTab.Screen name="Profile" component={ProfileScreen} options={{ tabBarLabel: 'Mon profil' }} />
  </ParentTab.Navigator>
);

const AuthNavigator = () => (
  <AuthStack.Navigator
    screenOptions={{ headerShown: false, animation: 'fade' }}
    initialRouteName="Onboarding"
  >
    <AuthStack.Screen name="Onboarding" component={OnboardingScreen} />
    <AuthStack.Screen name="Login" component={LoginScreen} />
    <AuthStack.Screen name="Register" component={RegisterScreen} />
  </AuthStack.Navigator>
);

const AppNavigator = () => (
  <AppStack.Navigator screenOptions={{ headerShown: false }}>
    <AppStack.Screen name="ParentTabs" component={ParentTabNavigator} />
    <AppStack.Screen
      name="ChildProfile"
      component={ChildProfileScreen}
      options={{ animation: 'slide_from_right' }}
    />
    <AppStack.Screen
      name="CreateChild"
      component={CreateChildScreen}
      options={{ animation: 'slide_from_bottom' }}
    />
    <AppStack.Screen
      name="ChildTabs"
      component={ChildHomeScreen}
      options={{ animation: 'slide_from_right' }}
    />
    <AppStack.Screen
      name="UnityGame"
      component={UnityGameScreen}
      options={{ animation: 'slide_from_bottom' }}
    />
    <AppStack.Screen
      name="SessionReport"
      component={SessionReportScreen}
      options={{ animation: 'slide_from_right' }}
    />
    <AppStack.Screen
      name="GameSelection"
      component={GameSelectionScreen as any}
      options={{ animation: 'slide_from_right' }}
    />
  </AppStack.Navigator>
);

export const RootNavigator = () => {
  const { user, setUser } = useAuthStore();
  const [isInitializing, setIsInitializing] = useState(true);

  useEffect(() => {
    const initialize = async () => {
      await authService.initialize();
      const currentUser = authService.getCurrentUser();
      setUser(currentUser);
      setIsInitializing(false);
    };
    initialize();

    const unsubscribe = authService.onAuthStateChanged((user) => {
      setUser(user);
    });
    return unsubscribe;
  }, []);

  if (isInitializing) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: Colors.background }}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  return (
    <NavigationContainer>
      {user ? <AppNavigator /> : <AuthNavigator />}
    </NavigationContainer>
  );
};
