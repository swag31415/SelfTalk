import { MessageType } from '@flyerhq/react-native-chat-ui';

export class Message {
  messageJson!: string;
  id!: string;
  createdAt!: number;
  type!: string;
  selected!: boolean;
  text?: string;

  static generate(message: MessageType.Any, selected=false) {
    return {
      messageJson: JSON.stringify(message),
      id: message.id,
      createdAt: message.createdAt ?? -1,
      type: message.type,
      selected: selected,
      ...(message.type === 'text' && {
        text: message.text
      }),
    }
  }
}