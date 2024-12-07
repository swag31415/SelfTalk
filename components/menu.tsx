import React from 'react';
import { View, Text, ToastAndroid } from 'react-native';
import Icon from 'react-native-vector-icons/Octicons';
import { MessageType, darkTheme } from '@flyerhq/react-native-chat-ui';
import * as Clipboard from 'expo-clipboard';
import { Menu, MenuOptions, MenuOption, MenuTrigger } from 'react-native-popup-menu';
import * as FileSystem from 'expo-file-system';

import { useDatabase } from './messagedb';

export default function () {
  const { selectedMessagesCount, messages, toggleSelectMessage, addMessage, deleteSelected, getSelected } = useDatabase()

  const copySelected = async () => {
    const selectedMessages = await getSelected();
    Clipboard.setStringAsync(selectedMessages.map(m => m.type == 'text' ? m.text : '').toReversed().join('\n'));
    for (const messageSelected of selectedMessages) {
      toggleSelectMessage(messageSelected);
    }
  };

  const getChatString = () => JSON.stringify(messages)

  const exportChatToFile = async () => {
    const request = await FileSystem.StorageAccessFramework.requestDirectoryPermissionsAsync()
    if (request.granted) {
      const fname = `log ${(new Date()).toLocaleString()}.json`
      const furi = await FileSystem.StorageAccessFramework.createFileAsync(request.directoryUri, fname, 'text')
      await FileSystem.writeAsStringAsync(furi, getChatString())
      ToastAndroid.show('File Saved', ToastAndroid.SHORT)
    } else {
      alert('failed to get permission to save files')
    }
  }

  const exportChatToClipboard = () => {
    Clipboard.setStringAsync(getChatString())
  }

  const importChat = async () => {
    if (!await Clipboard.hasStringAsync()) alert('could not find string in clipboard');
    const data = await Clipboard.getStringAsync();
    try {
      const imported_messages = JSON.parse(data) as MessageType.Any[];
      imported_messages.forEach(m => addMessage(m));
      ToastAndroid.show('Imported Successfully', ToastAndroid.SHORT)
    } catch (error) {
      alert("Failed to import messages from clipboard. Look at the export format to get a sense of what is expected. Don't import messages you already have! (UUIDs should be different).")
    }
  }

  return (
    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: darkTheme.colors.inputBackground, paddingTop: 10, paddingBottom: 8 }}>
      <Text style={{ fontSize: 30, fontFamily: 'Trebuchet MS', color: darkTheme.colors.inputText, marginTop: -3.1, paddingLeft: 10 }}>{selectedMessagesCount > 0 ? `Selected: ${selectedMessagesCount}` : 'SelfTalk'}</Text>
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        {selectedMessagesCount > 0 && (<Icon name='copy' size={28} color={darkTheme.colors.inputText} style={{ paddingLeft: 10, paddingRight: 10 }} onPress={copySelected} />)}
        {selectedMessagesCount > 0 && (<Icon name='trash' size={28} color={darkTheme.colors.inputText} style={{ paddingLeft: 10, paddingRight: 10 }} onPress={deleteSelected} />)}
        <Menu>
          <MenuTrigger>
            <Icon name='kebab-horizontal' size={28} color={darkTheme.colors.inputText} style={{ paddingLeft: 10, paddingRight: 10 }} />
          </MenuTrigger>
          <MenuOptions
            customStyles={{
              optionsContainer: { backgroundColor: darkTheme.colors.secondary, borderRadius: 20, borderColor: darkTheme.colors.background, borderWidth: 1.5 },
              optionText: { padding: 10, ...darkTheme.fonts.receivedMessageBodyTextStyle }
            }}
          >
            <MenuOption onSelect={() => alert(`not yet implemented`)} text='Settings' />
            <MenuOption onSelect={importChat} text='Import from Clipboard' />
            <MenuOption onSelect={exportChatToClipboard} text='Export to Clipboard' />
            <MenuOption onSelect={exportChatToFile} text='Export to File' />
            <MenuOption onSelect={() => alert(`not yet implemented`)} text='About' />
          </MenuOptions>
        </Menu>
      </View>
    </View>
  )
}