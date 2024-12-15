import React from 'react';
import { View, Text } from 'react-native';
import Icon from 'react-native-vector-icons/Octicons';
import * as Clipboard from 'expo-clipboard';
import { Menu, MenuOptions, MenuOption, MenuTrigger } from 'react-native-popup-menu';
import { ParamListBase, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { useDatabase } from './db';
import { useSettings } from './settings';
import { getStyles } from './styles';

export default function () {
  const { theme } = useSettings();
  const { selectedMessagesCount, toggleSelectMessage, deleteSelected, getSelected, switchUsers } = useDatabase();
  const navigation = useNavigation<NativeStackNavigationProp<ParamListBase>>();
  const styles = getStyles(theme);

  const copySelected = async () => {
    const selectedMessages = await getSelected();
    Clipboard.setStringAsync(selectedMessages.map(m => (m.type === 'text' ? m.text : '')).toReversed().join('\n'));
    for (const messageSelected of selectedMessages) {
      toggleSelectMessage(messageSelected);
    }
  };

  return (
    <View style={styles.header}>
      <Text style={styles.headerTitle}>
        {selectedMessagesCount > 0 ? `Selected: ${selectedMessagesCount}` : 'SelfTalk'}
      </Text>
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        {selectedMessagesCount > 0 && (
          <Icon
            name="copy"
            size={28}
            color={theme.colors.inputText}
            style={styles.iconStyle}
            onPress={copySelected}
          />
        )}
        {selectedMessagesCount > 0 && (
          <Icon
            name="trash"
            size={28}
            color={theme.colors.inputText}
            style={styles.iconStyle}
            onPress={deleteSelected}
          />
        )}
        <Icon
          name="arrow-switch"
          size={28}
          color={theme.colors.inputText}
          style={styles.iconStyle}
          onPress={switchUsers}
        />
        <Menu>
          <MenuTrigger>
            <Icon
              name="kebab-horizontal"
              size={28}
              color={theme.colors.inputText}
              style={styles.iconStyle}
            />
          </MenuTrigger>
          <MenuOptions customStyles={{ optionsContainer: styles.menuOptionsContainer }}>
            <MenuOption
              onSelect={() => navigation.navigate('Settings')}
              text="Settings"
              customStyles={{ optionText: styles.menuOptionText }}
            />
            <MenuOption
              onSelect={() => navigation.navigate('About')}
              text="About"
              customStyles={{ optionText: styles.menuOptionText }}
            />
          </MenuOptions>
        </Menu>
      </View>
    </View>
  );
}