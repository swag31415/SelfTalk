import { Chat, MessageType, Theme, darkTheme, defaultTheme } from '@flyerhq/react-native-chat-ui'
import React, { useState } from 'react'
import { View, TouchableWithoutFeedback } from 'react-native'
import { SafeAreaProvider} from 'react-native-safe-area-context'

import { launchImageLibrary } from 'react-native-image-picker'

import 'react-native-get-random-values';
import { v4 as uuidv4 } from 'uuid';

export default function App() {
  const users = [
    { id: 'ae6c485e-87ea-4fca-a889-e2af0c043d46', theme: darkTheme },
    { id: '810bb732-9382-4b43-99fb-ea642c843cc3', theme: defaultTheme }
  ]
  const [messages, setMessages] = useState<MessageType.Any[]>([])
  const [userIdx, setUserIdx] = useState<number>(0)

  const addMessage = (message: MessageType.Any) => {
    setMessages([message, ...messages])
  }

  const handleSendPress = (message: MessageType.PartialText) => {
    const textMessage: MessageType.Text = {
      author: users[userIdx],
      createdAt: Date.now(),
      id: uuidv4(),
      text: message.text,
      type: 'text',
    }
    addMessage(textMessage)
  }

  const handleImageSelection = () => {
    launchImageLibrary(
      {
        includeBase64: true,
        maxWidth: 1440,
        mediaType: 'photo',
        quality: 0.7,
      },
      ({ assets }) => {
        const response = assets?.[0]

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
          }
          addMessage(imageMessage)
        }
      }
    )
  }

  const handleDoubleTap = () => {
    // Switch between users
    setUserIdx((userIdx + 1) % users.length);
  };

  let lastTap = 0;
  const handleTouchablePress = () => {
    const now = Date.now();
    if (now - lastTap < 300) {
      // Double tap detected
      handleDoubleTap();
    }
    lastTap = now;
  };

  return (
    <SafeAreaProvider>
      <TouchableWithoutFeedback onPress={handleTouchablePress}>
        <View style={{ flex: 1 }}>
          <Chat
            messages={messages}
            onSendPress={handleSendPress}
            onAttachmentPress={handleImageSelection}
            user={users[userIdx]}
            theme={users[userIdx].theme}
          />
        </View>
      </TouchableWithoutFeedback>
    </SafeAreaProvider>
  );
}
