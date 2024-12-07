import React from 'react';
import { StatusBar } from 'expo-status-bar';

import { SafeAreaProvider } from 'react-native-safe-area-context';
import { MenuProvider } from 'react-native-popup-menu';
import { DatabaseProviderWrapper } from './components/messagedb';

import Menu from './components/menu';
import Chat from './components/chat';

function App() {
  return (
    <SafeAreaProvider>
      <StatusBar translucent={false}/>
      <Menu/>
      <Chat/>
    </SafeAreaProvider>
  );
}

export default function AppWrapper() {
  return (
    <DatabaseProviderWrapper>
      <MenuProvider>
        <App></App>
      </MenuProvider>
    </DatabaseProviderWrapper>
  );
}