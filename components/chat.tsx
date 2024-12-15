import React, { ReactNode } from 'react';
import { View, Text, ColorValue } from 'react-native';
import 'react-native-get-random-values';
import { v4 as uuidv4 } from 'uuid';
import { Chat, MessageType, darkTheme } from '@flyerhq/react-native-chat-ui';
import { useDatabase, Users } from './db';
import { launchImageLibrary } from 'react-native-image-picker';

import { useSettings } from './settings'

export default function () {
  const { theme, userBubbleColor, otherBubbleColor } = useSettings();

  const userColorMap = Users.reduce((m, u, i) => {
    const colors = [userBubbleColor, otherBubbleColor];
    m.set(u.id, colors[i % colors.length]);
    return m;
  }, new Map<string, ColorValue>());

  const { selectedMessagesCount, messages, toggleSelectMessage, addMessage, userIdx, switchUsers } = useDatabase()

  const renderBubble = ({ child, message, nextMessageInGroup }: { child: ReactNode; message: MessageType.Any; nextMessageInGroup: boolean }) => {
    const isUser = Users[userIdx].id === message.author.id;
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
      author: Users[userIdx],
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
            author: Users[userIdx],
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

  let lastTap: number;
  const handleMessagePress = (message: MessageType.Any) => {
    if (selectedMessagesCount > 0) toggleSelectMessage(message);
    const near = (a: number, b: number, tol: number) => Math.abs(a - b) < tol;
    if (lastTap && near(Date.now(), lastTap, 300)) {
      switchUsers();
    }
    lastTap = Date.now();
  };

  return (
    <View style={{ flex: 1 }}>
      <Chat
        messages={messages}
        renderBubble={renderBubble}
        onSendPress={handleSendPress}
        onAttachmentPress={handleImageSelection}
        user={Users[userIdx]}
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
  )
}