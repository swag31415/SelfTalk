import { MessageType } from '@flyerhq/react-native-chat-ui';
import {Realm, createRealmContext} from '@realm/react';
import { ObjectSchema } from 'realm';

export class Message extends Realm.Object<Message> {
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

  static schema: ObjectSchema = {
    name: 'Message',
    properties: {
      messageJson: 'string',
      id: 'string',
      createdAt: 'double',
      type: 'string',
      selected: 'bool',
      text: 'string?',
    },
    primaryKey: 'id',
  }
}

const config = {
  schema: [Message],
};
export default createRealmContext(config);