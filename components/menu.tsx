import React from 'react';
import { View, Text } from 'react-native';
import Icon from 'react-native-vector-icons/Octicons';
import * as Clipboard from 'expo-clipboard';
import { Menu, MenuOptions, MenuOption, MenuTrigger } from 'react-native-popup-menu';
import { ParamListBase, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { useDatabase } from './db';
import { useStyles } from './styles'

export default function () {
  const { theme } = useStyles();  
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
    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: theme.colors.inputBackground, paddingTop: 10, paddingBottom: 8 }}>
      <Text style={{ fontSize: 30, fontFamily: 'Trebuchet MS', color: theme.colors.inputText, marginTop: -3.1, paddingLeft: 10 }}>{selectedMessagesCount > 0 ? `Selected: ${selectedMessagesCount}` : 'SelfTalk'}</Text>
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        {selectedMessagesCount > 0 && (<Icon name='copy' size={28} color={theme.colors.inputText} style={{ paddingLeft: 10, paddingRight: 10 }} onPress={copySelected} />)}
        {selectedMessagesCount > 0 && (<Icon name='trash' size={28} color={theme.colors.inputText} style={{ paddingLeft: 10, paddingRight: 10 }} onPress={deleteSelected} />)}
        <Menu>
          <MenuTrigger>
            <Icon name='kebab-horizontal' size={28} color={theme.colors.inputText} style={{ paddingLeft: 10, paddingRight: 10 }} />
          </MenuTrigger>
          <MenuOptions
            customStyles={{
              optionsContainer: { backgroundColor: theme.colors.secondary, borderRadius: 20, borderColor: theme.colors.background, borderWidth: 1.5 },
              optionText: { padding: 10, ...theme.fonts.receivedMessageBodyTextStyle }
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