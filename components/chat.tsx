import React, { useState, ReactNode } from 'react';
import { View, Text, TouchableWithoutFeedback, NativeTouchEvent, GestureResponderEvent, ColorValue, TextStyle } from 'react-native';
import 'react-native-get-random-values';
import { v4 as uuidv4 } from 'uuid';
import { Chat, MessageType, Theme, ThemeFonts, darkTheme } from '@flyerhq/react-native-chat-ui';
import { useDatabase } from './db';
import { launchImageLibrary } from 'react-native-image-picker';

import { useSettings } from './settings'

export default function () {
  const { theme, userBubbleColor, otherBubbleColor } = useSettings();
  const users = [
    { id: 'ae6c485e-87ea-4fca-a889-e2af0c043d46' },
    { id: '810bb732-9382-4b43-99fb-ea642c843cc3' },
  ];

  const userColorMap = users.reduce((m, u, i) => {
    const colors = [userBubbleColor, otherBubbleColor];
    m.set(u.id, colors[i % colors.length]);
    return m;
  }, new Map<string, ColorValue>());

  const [userIdx, setUserIdx] = useState<number>(0);

  const { selectedMessagesCount, messages, toggleSelectMessage, addMessage } = useDatabase()

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

  return (
    <TouchableWithoutFeedback onPress={handleTouchablePress}>
      <View style={{ flex: 1 }}>
        <Chat
          messages={messages}
          renderBubble={renderBubble}
          onSendPress={handleSendPress}
          onAttachmentPress={handleImageSelection}
          user={users[userIdx]}
          theme={theme}
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
  )
}