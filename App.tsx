import React from 'react';
import { StatusBar } from 'expo-status-bar';

import { SafeAreaProvider } from 'react-native-safe-area-context';
import { MenuProvider } from 'react-native-popup-menu';
import { DatabaseProviderWrapper } from './components/db';
import { NavigationContainer } from '@react-navigation/native';
import { SettingsProvider } from './components/settings';

import { createNativeStackNavigator } from '@react-navigation/native-stack';

import Menu from './components/menu';
import Chat from './components/chat';
import Splash from './components/splash';
import Settings from './components/settings';
import About from './components/about';

function App() {
  const Stack = createNativeStackNavigator();
  return (
    <SafeAreaProvider>
      <StatusBar translucent={false} />
      <Menu />
      <Stack.Navigator initialRouteName='Splash' screenOptions={{ "headerShown": false }}>
        <Stack.Screen name="Splash" component={Splash} />
        <Stack.Screen name="Chat" component={Chat} />
        <Stack.Screen name="Settings" component={Settings} />
        <Stack.Screen name="About" component={About} />
      </Stack.Navigator>
    </SafeAreaProvider>
  );
}

export default function AppWrapper() {
  return (
    <DatabaseProviderWrapper>
      <SettingsProvider>
        <MenuProvider>
          <NavigationContainer>
            <App></App>
          </NavigationContainer>
        </MenuProvider>
      </SettingsProvider>
    </DatabaseProviderWrapper>
  );
}