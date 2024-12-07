import React, { useState, ReactNode } from 'react';
import { View, Text, TouchableWithoutFeedback, NativeTouchEvent, GestureResponderEvent, ColorValue, ToastAndroid } from 'react-native';
import { launchImageLibrary } from 'react-native-image-picker';
import 'react-native-get-random-values';
import { v4 as uuidv4 } from 'uuid';
import Icon from 'react-native-vector-icons/Octicons';
import { Chat, MessageType, darkTheme } from '@flyerhq/react-native-chat-ui';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import * as Clipboard from 'expo-clipboard';
import { StatusBar } from 'expo-status-bar';
import { MenuProvider, Menu, MenuOptions, MenuOption, MenuTrigger } from 'react-native-popup-menu';
import * as FileSystem from 'expo-file-system';

import { DatabaseProviderWrapper, useDatabase } from './message_db';

function App() {
  const users = [
    { id: 'ae6c485e-87ea-4fca-a889-e2af0c043d46' },
    { id: '810bb732-9382-4b43-99fb-ea642c843cc3' },
  ];

  const userColorMap = users.reduce((m, u, i) => {
    const colors = darkTheme.colors.userAvatarNameColors;
    m.set(u.id, colors[i % colors.length]);
    return m;
  }, new Map<string, ColorValue>());

  const [userIdx, setUserIdx] = useState<number>(0);

  const { selectedMessagesCount, messages, toggleSelectMessage, addMessage, deleteSelected, getSelected } = useDatabase()

  const renderBubble = ({ child, message, nextMessageInGroup }: { child: ReactNode; message: MessageType.Any; nextMessageInGroup: boolean }) => {
    const isUser = users[userIdx].id === message.author.id;
    const borderRadius = 20;

    return (
      <View
        style={{
          backgroundColor: userColorMap.get(message.author.id),
          borderRadius: borderRadius,
          borderBottomLeftRadius: !isUser && !nextMessageInGroup ? 0 : borderRadius,
          borderBottomRightRadius: isUser && !nextMessageInGroup ? 0 : borderRadius,
          overflow: 'hidden',
          opacity: message.metadata && message.metadata.selected === true ? 0.4 : 1,
        }}
      >
        {child}
      </View>
    );
  };

  const handleSendPress = (message: MessageType.PartialText) => {
    const textMessage: MessageType.Text = {
      author: users[userIdx],
      createdAt: Date.now(),
      id: uuidv4(),
      text: message.text,
      type: 'text',
    };

    addMessage(textMessage);
  };

  const handleImageSelection = () => {
    launchImageLibrary(
      {
        includeBase64: true,
        maxWidth: 1440,
        mediaType: 'photo',
        quality: 0.7,
      },
      ({ assets }) => {
        const response = assets?.[0];

        if (response?.base64) {
          const imageMessage: MessageType.Image = {
            author: users[userIdx],
            createdAt: Date.now(),
            height: response.height,
            id: uuidv4(),
            name: response.fileName ?? response.uri?.split('/').pop() ?? '🖼',
            size: response.fileSize ?? 0,
            type: 'image',
            uri: `data:image/*;base64,${response.base64}`,
            width: response.width,
          };

          addMessage(imageMessage);
        }
      }
    );
  };

  const handleMessageLongPress = (message: MessageType.Any) => {
    toggleSelectMessage(message);
  };

  const handleMessagePress = (message: MessageType.Any) => {
    if (selectedMessagesCount > 0) toggleSelectMessage(message);
  };

  const handleDoubleTap = () => {
    // Switch between users
    setUserIdx((userIdx + 1) % users.length);
  };

  let lastTap: NativeTouchEvent;
  const handleTouchablePress = (event: GestureResponderEvent) => {
    const near = (a: number, b: number, tol: number) => Math.abs(a - b) < tol;

    if (
      lastTap &&
      near(event.nativeEvent.locationX, lastTap.locationX, 50) &&
      near(event.nativeEvent.locationY, lastTap.locationY, 50) &&
      near(event.nativeEvent.timestamp, lastTap.timestamp, 300)
    ) {
      handleDoubleTap();
    }

    lastTap = event.nativeEvent;
  };

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
    <SafeAreaProvider>
      <StatusBar translucent={false}/>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: darkTheme.colors.inputBackground, paddingTop: 10, paddingBottom: 8 }}>
        <Text style={{ fontSize: 30, fontFamily: 'Trebuchet MS', color: darkTheme.colors.inputText, marginTop: -3.1, paddingLeft: 10 }}>{selectedMessagesCount > 0 ? `Selected: ${selectedMessagesCount}` : 'SelfTalk'}</Text>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          {selectedMessagesCount > 0 && (<Icon name='copy' size={28} color={darkTheme.colors.inputText} style={{ paddingLeft: 10, paddingRight: 10 }} onPress={copySelected} />)}
          {selectedMessagesCount > 0 && (<Icon name='trash' size={28} color={darkTheme.colors.inputText} style={{ paddingLeft: 10, paddingRight: 10 }} onPress={deleteSelected} />)}
          <Menu>
            <MenuTrigger>
              <Icon name='kebab-horizontal' size={28} color={darkTheme.colors.inputText} style={{ paddingLeft: 10, paddingRight: 10 }}/>
            </MenuTrigger>
            <MenuOptions
              customStyles={{
                optionsContainer: { backgroundColor: darkTheme.colors.secondary, borderRadius: 20, borderColor: darkTheme.colors.background, borderWidth: 1.5 },
                optionText: {padding: 10, ...darkTheme.fonts.receivedMessageBodyTextStyle}
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
      <TouchableWithoutFeedback onPress={handleTouchablePress}>
        <View style={{ flex: 1 }}>
          <Chat
            messages={messages}
            renderBubble={renderBubble}
            onSendPress={handleSendPress}
            onAttachmentPress={handleImageSelection}
            user={users[userIdx]}
            theme={darkTheme}
            emptyState={() => (
              <Text style={{ transform: [{ scaleX: -1 }], color: darkTheme.colors.primary }}>
                Who needs a therapist when you have your own number?
              </Text>
            )}
            onMessagePress={handleMessagePress}
            onMessageLongPress={handleMessageLongPress}
            enableAnimation={true}
            disableImageGallery={true}
          />
        </View>
      </TouchableWithoutFeedback>
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