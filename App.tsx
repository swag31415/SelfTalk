import { Chat, MessageType } from '@flyerhq/react-native-chat-ui'
import React, { useState } from 'react'
import { SafeAreaProvider } from 'react-native-safe-area-context'

import { launchImageLibrary } from 'react-native-image-picker'

import 'react-native-get-random-values';
import { v4 as uuidv4 } from 'uuid';

export default function App() {
  const [messages, setMessages] = useState<MessageType.Any[]>([])
  const user = { id: '06c33e8b-e835-4736-80f4-63f44b66666c' }

  const addMessage = (message: MessageType.Any) => {
    setMessages([message, ...messages])
  }

  const handleSendPress = (message: MessageType.PartialText) => {
    const textMessage: MessageType.Text = {
      author: user,
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
            author: user,
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

  return (
    <SafeAreaProvider>
      <Chat
        messages={messages}
        onSendPress={handleSendPress}
        onAttachmentPress={handleImageSelection}
        user={user}
      />
    </SafeAreaProvider>
  )
}