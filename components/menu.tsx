import React from 'react';
import { View, Text } from 'react-native';
import Icon from 'react-native-vector-icons/Octicons';
import { darkTheme } from '@flyerhq/react-native-chat-ui';
import * as Clipboard from 'expo-clipboard';
import { Menu, MenuOptions, MenuOption, MenuTrigger } from 'react-native-popup-menu';
import { ParamListBase, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { useDatabase } from './db';

export default function () {
  const { selectedMessagesCount, toggleSelectMessage, deleteSelected, getSelected } = useDatabase()
  const navigation = useNavigation<NativeStackNavigationProp<ParamListBase>>();

  const copySelected = async () => {
    const selectedMessages = await getSelected();
    Clipboard.setStringAsync(selectedMessages.map(m => m.type == 'text' ? m.text : '').toReversed().join('\n'));
    for (const messageSelected of selectedMessages) {
      toggleSelectMessage(messageSelected);
    }
  };

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
            <MenuOption onSelect={() => navigation.navigate('Settings')} text='Settings' />
            <MenuOption onSelect={() => navigation.navigate('About')} text='About' />
          </MenuOptions>
        </Menu>
      </View>
    </View>
  )
}