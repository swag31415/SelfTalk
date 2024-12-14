import React, { createContext, useContext, useEffect, useState } from 'react';
import { Text, View, TouchableOpacity, TextInput, ScrollView, Alert } from "react-native";
import { ParamListBase, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { darkTheme, defaultTheme, MessageType, Theme } from '@flyerhq/react-native-chat-ui';
import { useDatabase } from './db';
import { getStyles } from './styles';
import ColorPickerThing from './utils/color_picker';
import * as FileSystem from 'expo-file-system';
import * as Clipboard from 'expo-clipboard';

type ThemeName = 'dark' | 'light';

interface SettingsContextProps {
  theme: Theme;
  updateTheme: (themeName: ThemeName) => void;
  userBubbleColor: string;
  updateUserBubbleColor: (color: string) => void;
  otherBubbleColor: string;
  updateOtherBubbleColor: (color: string) => void;
  font: string;
  updateFont: (fontName: string) => void;
  fontSize: number;
  updateFontSize: (fontSize: number) => void;
  resetSettings: () => void;
}

const SettingsContext = createContext<SettingsContextProps | undefined>(undefined);

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const { setSetting, getSetting } = useDatabase();

  const [theme, setTheme] = useState<Theme>(darkTheme);
  const [userBubbleColor, setUserBubbleColor] = useState('#007AFF');
  const [otherBubbleColor, setOtherBubbleColor] = useState('#FF9500');
  const [font, setFont] = useState('System');
  const [fontSize, setFontSize] = useState(16);

  function resetSettings() {
    updateTheme('dark');
    updateUserBubbleColor('#007AFF');
    updateOtherBubbleColor('#FF9500');
    updateFont('System');
    updateFontSize(16);
  }

  useEffect(() => {
    const loadSettings = async () => {
      const _theme = await getSetting('theme');
      if (_theme === 'light' || _theme === 'dark') {
        setTheme(_theme === 'dark' ? darkTheme : defaultTheme);
      }
      setUserBubbleColor((await getSetting('userBubbleColor')) ?? userBubbleColor);
      setOtherBubbleColor((await getSetting('otherBubbleColor')) ?? otherBubbleColor);
      setFont((await getSetting('font')) ?? font);
      setFontSize(parseInt((await getSetting('fontSize')) ?? fontSize.toString()));
    }

    loadSettings();
  }, [])

  function updateTheme(themeName: ThemeName) {
    setTheme(themeName === 'dark' ? darkTheme : defaultTheme);
    setSetting('theme', themeName);
  }
  function updateUserBubbleColor(color: string) {
    setUserBubbleColor(color);
    setSetting('userBubbleColor', color);
  }
  function updateOtherBubbleColor(color: string) {
    setOtherBubbleColor(color);
    setSetting('otherBubbleColor', color);
  }
  function updateFont(fontName: string) {
    setFont(fontName);
    setSetting('font', fontName);
  }
  function updateFontSize(size: number) {
    setFontSize(size);
    setSetting('fontSize', size.toString());
  }

  return (
    <SettingsContext.Provider value={{
      theme, updateTheme,
      userBubbleColor, updateUserBubbleColor,
      otherBubbleColor, updateOtherBubbleColor,
      font, updateFont,
      fontSize, updateFontSize,
      resetSettings
    }}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
}

export default function Settings() {
  const { messages, addMessage } = useDatabase();
  const {
    theme, userBubbleColor, otherBubbleColor,
    updateTheme, updateUserBubbleColor, updateOtherBubbleColor, resetSettings
  } = useSettings();
  const navigation = useNavigation<NativeStackNavigationProp<ParamListBase>>();

  const styles = getStyles(theme);

  const exportData = async (toClipboard = false) => {
    const getChatString = () => JSON.stringify(messages)
    if (toClipboard) {
      await Clipboard.setStringAsync(getChatString())
    } else {
      const request = await FileSystem.StorageAccessFramework.requestDirectoryPermissionsAsync()
      if (request.granted) {
        const fname = `log ${(new Date()).toLocaleString()}.json`
        const furi = await FileSystem.StorageAccessFramework.createFileAsync(request.directoryUri, fname, 'text')
        await FileSystem.writeAsStringAsync(furi, getChatString())
        Alert.alert('Chat data exported to a file!');
      } else {
        Alert.alert('Failed to get permission to save files')
      }
    }
  };

  const importData = async () => {
    if (!await Clipboard.hasStringAsync()) alert('could not find string in clipboard');
    const data = await Clipboard.getStringAsync();
    try {
      const imported_messages = JSON.parse(data) as MessageType.Any[];
      imported_messages.forEach(m => addMessage(m));
      Alert.alert('Imported Successfully')
    } catch (error) {
      Alert.alert("Failed to import messages from clipboard. Look at the export format to get a sense of what is expected. Don't import messages you already have! (UUIDs should be different).")
    }
  };

  return (
    <View style={styles.baseContainer}>
      <ScrollView contentContainerStyle={styles.padded}>
        <Text style={styles.title}>Settings</Text>

        {/* Theme Selection */}
        <View style={styles.section}>
          <Text style={styles.label}>Theme</Text>
          <TouchableOpacity
            style={styles.button}
            onPress={() => updateTheme(theme == darkTheme ? 'light' : 'dark')}
          >
            <Text style={styles.buttonText}>{theme == darkTheme ? 'Switch to Light Theme' : 'Switch to Dark Theme'}</Text>
          </TouchableOpacity>
        </View>

        {/* Bubble Colors */}
        <View style={styles.section}>
          <Text style={styles.label}>Bubble Colors</Text>
          <ColorPickerThing value={userBubbleColor} setValue={updateUserBubbleColor}/>
          <ColorPickerThing value={otherBubbleColor} setValue={updateOtherBubbleColor}/>
        </View>

        {/* Export and Import */}
        <View style={styles.section}>
          <Text style={styles.label}>Data Management</Text>
          <TouchableOpacity style={styles.button} onPress={() => exportData(false)}>
            <Text style={styles.buttonText}>Export Chat Data to File</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.button} onPress={() => exportData(true)}>
            <Text style={styles.buttonText}>Export Chat Data to Clipboard</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.button} onPress={importData}>
            <Text style={styles.buttonText}>Import Chat Data from Clipboard</Text>
          </TouchableOpacity>
        </View>

        {/* Privacy Statement */}
        <View style={styles.section}>
          <Text style={styles.label}>Privacy</Text>
          <Text style={styles.subtitle}>
            Your data is stored locally and never shared with third parties. We respect your privacy!
          </Text>
        </View>

        {/* App Info */}
        <View style={styles.section}>
          <Text style={styles.label}>App Info</Text>
          <Text style={styles.subtitle}>Version: {'alpha'}</Text>
          <Text style={styles.subtitle}>Messages Sent: {messages.length}</Text>
        </View>

        {/* Reset Settings */}
        <TouchableOpacity style={styles.button} onPress={() => resetSettings()}>
          <Text style={styles.buttonText}>Reset to Default Settings</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('Chat')}>
          <Text style={styles.buttonText}>Go Back</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}