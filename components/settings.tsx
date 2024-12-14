import React, { useEffect, useState } from 'react';
import { Text, View, TouchableOpacity, TextInput, ScrollView, Alert } from "react-native";
import { ParamListBase, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { MessageType } from '@flyerhq/react-native-chat-ui';
import { getStyles, useStyles, ThemeName } from './styles'
import { useDatabase } from './db';
import * as FileSystem from 'expo-file-system';
import * as Clipboard from 'expo-clipboard';

export default function Settings() {
  const { messages, addMessage, getSetting, setSetting } = useDatabase();
  const { theme, updateTheme } = useStyles();
  const styles = getStyles(theme);
  const navigation = useNavigation<NativeStackNavigationProp<ParamListBase>>();

  // States for settings and their defaults
  const [themeName, setThemeName] = useState<ThemeName>('dark');
  const [userBubbleColor, setUserBubbleColor] = useState('#007AFF');
  const [otherBubbleColor, setOtherBubbleColor] = useState('#FF9500');
  const [font, setFont] = useState('System');
  const [fontSize, setFontSize] = useState(16);
  const appVersion = '1.0.0'; // Example app version

  useEffect(() => {
    const loadSettings = async () => {
      const _themeName = (await getSetting('theme')) || themeName;
      const _userBubbleColor = (await getSetting('userBubbleColor')) || userBubbleColor;
      const _otherBubbleColor = (await getSetting('otherBubbleColor')) || otherBubbleColor;
      const _font = (await getSetting('font')) || font;
      const _fontSize = parseInt((await getSetting('fontSize')) || fontSize.toString(), 10);

      setThemeName(_themeName as ThemeName);
      setUserBubbleColor(_userBubbleColor);
      setOtherBubbleColor(_otherBubbleColor);
      setFont(_font);
      setFontSize(_fontSize);
    };

    loadSettings();
  }, []);

  useEffect(() => { updateTheme(themeName) }, [themeName]);
  useEffect(() => { setSetting('userBubbleColor', userBubbleColor) }, [userBubbleColor]);
  useEffect(() => { setSetting('otherBubbleColor', otherBubbleColor) }, [otherBubbleColor]);
  useEffect(() => { setSetting('font', font) }, [font]);
  useEffect(() => { setSetting('fontSize', fontSize.toString()) }, [fontSize]);

  const exportData = async (toClipboard = false) => {
    const getChatString = () => JSON.stringify(messages)
    const data = JSON.stringify({ /* Example: Include your exported chat data */ });
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
            onPress={() => setThemeName(themeName == 'dark' ? 'light' : 'dark')}
          >
            <Text style={styles.buttonText}>{themeName == 'dark' ? 'Switch to Light Theme' : 'Switch to Dark Theme'}</Text>
          </TouchableOpacity>
        </View>

        {/* Bubble Colors */}
        <View style={styles.section}>
          <Text style={styles.label}>Bubble Colors</Text>
          <TextInput
            style={styles.input}
            value={userBubbleColor}
            placeholder="User Bubble Color (e.g., #007AFF)"
            onChangeText={setUserBubbleColor}
          />
          <TextInput
            style={styles.input}
            value={otherBubbleColor}
            placeholder="Other Bubble Color (e.g., #FF9500)"
            onChangeText={setOtherBubbleColor}
          />
        </View>

        {/* Font and Font Size */}
        <View style={styles.section}>
          <Text style={styles.label}>Font Settings</Text>
          <TextInput
            style={styles.input}
            value={font}
            placeholder="Font Name (e.g., System, Arial)"
            onChangeText={setFont}
          />
          <TextInput
            style={styles.input}
            value={fontSize.toString()}
            placeholder="Font Size (e.g., 16)"
            keyboardType="numeric"
            onChangeText={(text) => setFontSize(Number(text))}
          />
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
          <Text style={styles.subtitle}>Version: {appVersion}</Text>
          <Text style={styles.subtitle}>Messages Sent: {messages.length}</Text>
        </View>

        {/* Reset Settings */}
        <TouchableOpacity style={styles.button} onPress={() => Alert.alert('todo implement')}>
          <Text style={styles.buttonText}>Reset to Default Settings</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('Chat')}>
          <Text style={styles.buttonText}>Go Back</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}