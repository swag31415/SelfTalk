import React, { useState, ReactNode, useEffect } from 'react';
import { View, Text, TouchableWithoutFeedback, NativeTouchEvent, GestureResponderEvent, ColorValue } from 'react-native';
import Clipboard from '@react-native-clipboard/clipboard';
import { launchImageLibrary } from 'react-native-image-picker';
import 'react-native-get-random-values';
import { v4 as uuidv4 } from 'uuid';
import Icon from 'react-native-vector-icons/Octicons';
import { Chat, MessageType, darkTheme } from '@flyerhq/react-native-chat-ui';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { DatabaseProviderWrapper, useDatabase } from './message_db'

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

  const { messages, updateMessages, addMessage } = useDatabase()

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

  const selectMessage = (message: MessageType.Any) => {
    // realm.write(() => {
    //   message.metadata = message.metadata ?? {};
    //   message.metadata.selected = !message.metadata.selected
    //   realm.create('Message', Message.generate(message, message.metadata.selected), UpdateMode.Modified);
    // })
  };

  const handleMessageLongPress = (message: MessageType.Any) => {
    selectMessage(message);
  };

  const handleMessagePress = (message: MessageType.Any) => {
    // if (mongoMessagesSelected.length > 0) selectMessage(message);
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

  const deleteSelected = () => {
    // realm.write(() => {
    //   realm.delete(mongoMessagesSelected)
    // })
  };

  const copySelected = () => {
    // realm.write(() => {
    //   Clipboard.setString(mongoMessagesSelected.map(m => m.text ?? '').join('\n'));
    //   for (const messageSelected of mongoMessagesSelected) {
    //     const message: MessageType.Any = JSON.parse(messageSelected.messageJson)
    //     message.metadata!.selected = false
    //     messageSelected.messageJson = JSON.stringify(message)
    //     messageSelected.selected = false
    //   }
    // })
  };

  return (
    <SafeAreaProvider>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: darkTheme.colors.inputBackground, paddingTop: 10, paddingBottom: 8 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <TouchableWithoutFeedback onPress={() => {/* TODO implement menu */ }} style={{ flexDirection: 'row' }}>
            <Icon name='three-bars' size={28} color={darkTheme.colors.inputText} style={{ paddingLeft: 10, paddingRight: 10 }} />
          </TouchableWithoutFeedback>
          {/* <Text style={{ fontSize: 30, fontFamily: 'Trebuchet MS', color: darkTheme.colors.inputText, marginTop: -3.1 }}>{mongoMessagesSelected.length > 0 ? `Selected: ${mongoMessagesSelected.length}` : 'SelfTalk'}</Text> */}
        </View>
        {/* {mongoMessagesSelected.length > 0 && (
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Icon name='copy' size={28} color={darkTheme.colors.inputText} style={{ paddingLeft: 10, paddingRight: 10 }} onPress={copySelected} />
            <Icon name='trash' size={28} color={darkTheme.colors.inputText} style={{ paddingLeft: 10, paddingRight: 10 }} onPress={deleteSelected} />
          </View>
        )} */}
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
      <App></App>
    </DatabaseProviderWrapper>
  );
}