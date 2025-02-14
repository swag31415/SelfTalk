import { MessageType } from '@flyerhq/react-native-chat-ui';
import { SQLiteDatabase, SQLiteProvider, useSQLiteContext } from 'expo-sqlite';
import React, { createContext, useState, useEffect, useContext } from 'react';
import { Alert } from 'react-native';
import { v4 as uuidv4 } from 'uuid';

interface DatabaseMessage {
  id: string;
  messageJson: string;
  createdAt: number;
  type: string;
  selected: number;
  text: string | null;
}
type AIMessageType = {role: string, content: string}

const initializeDatabase = async (db: SQLiteDatabase) => {
  await db.withTransactionAsync(async () => {
    // Messages table
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS messages (
        id TEXT PRIMARY KEY NOT NULL,
        messageJson TEXT NOT NULL,
        createdAt INTEGER NOT NULL,
        type TEXT NOT NULL,
        selected INTEGER NOT NULL,
        text TEXT
      );
    `);

    // Settings table
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS settings (
        name TEXT PRIMARY KEY NOT NULL,
        value TEXT NOT NULL
      );
    `);
  });
};

// Define the shape of the context
interface DatabaseContextProps {
  messages: MessageType.Any[];
  selectedMessagesCount: number;
  updateMessages: () => Promise<void>;
  toggleSelectMessage: (message: MessageType.Any) => Promise<void>;
  addMessage: (message: MessageType.Any, selected?: boolean) => Promise<void>;
  generateMessage: () => Promise<void>;
  deleteSelected: () => Promise<void>;
  getSelected: () => Promise<MessageType.Any[]>;

  // Settings management
  getSetting: (name: string) => Promise<string | null>;
  setSetting: (name: string, value: string) => Promise<void>;

  // UserIDX
  userIdx: number;
  switchUsers: () => void;
}

// Create the context
const DatabaseContext = createContext<DatabaseContextProps | undefined>(undefined);

export const Users = [
  { id: 'user1' },
  { id: 'user2' },
  { id: 'ai' },
];

// Provider component
function DatabaseProvider({ children }: { children: React.ReactNode }) {
  const db = useSQLiteContext();
  const [messages, setMessages] = useState<MessageType.Any[]>([]);
  const [selectedMessagesCount, setSelectedMessagesCount] = useState<number>(0);
  const [userIdx, setUserIdx] = useState<number>(0);

  async function updateMessages() {
    const msgs = await db.getAllAsync<DatabaseMessage>('SELECT * FROM messages ORDER BY createdAt DESC;');
    setMessages(msgs.map<MessageType.Any>((msg: DatabaseMessage) => JSON.parse(msg.messageJson)));
    const count: { selected_count: number } | null = await db.getFirstAsync(
      'SELECT COUNT(*) AS selected_count FROM messages WHERE selected = 1;'
    );
    setSelectedMessagesCount(count?.selected_count ?? 0);
  }

  async function addMessage(message: MessageType.Any, selected = false) {
    await db.runAsync(
      `INSERT INTO messages (id, messageJson, createdAt, type, selected, text) VALUES (?, ?, ?, ?, ?, ?);`,
      [
        message.id,
        JSON.stringify(message),
        message.createdAt ?? -1,
        message.type,
        selected ? 1 : 0,
        message.type === 'text' ? message.text : null,
      ]
    );
    await updateMessages();
  }

  async function generateMessage() {
    const SYSTEM_MESSAGES = [{role: 'system', content: `What follows is a chat with multiple users. Each message starts with the name of the user followed by that user's message. Refer to the users and answer their questions.`}];
    const HISTORY_SIZE = 20;
    function format_message_for_AI(msg: MessageType.Text): AIMessageType {
      if (msg.author.id === 'ai') {
        return {role: 'assistant', content: msg.text};
      } else {
        return {role: 'user', content: `${msg.author.id}: ${msg.text}`};
      }
    }
    const lastTextMessages = []
    for (const msg of messages) {
      if (msg.type === 'text') {
        lastTextMessages.push(format_message_for_AI(msg));
        if (lastTextMessages.length >= HISTORY_SIZE + 1) break;
      }
    }
    if (lastTextMessages.length === 0) return;
    lastTextMessages.reverse();
    console.log('Last text messages:', lastTextMessages);
    const response = await fetch('https://iskcon-llm-986406911765.us-central1.run.app/query', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        question: lastTextMessages[lastTextMessages.length - 1].content,
        messages: [...SYSTEM_MESSAGES, ...lastTextMessages.slice(0, -1)],
      }),
    });

    if (!response.ok) {
      Alert.alert('Error', 'Failed to generate message');
      console.log(response);
      return;
    }

    const data = await response.json();
    if (!data || !data.response) {
      Alert.alert('Error', 'Failed to generate message');
      console.log(data);
      return;
    }

    const textMessage: MessageType.Text = {
      author: Users[2], // the user is AI, TODO make a better system for this
      createdAt: Date.now(),
      id: uuidv4(),
      text: data.response,
      type: 'text',
    };
    await addMessage(textMessage);
  }

  async function toggleSelectMessage(message: MessageType.Any) {
    message.metadata = message.metadata ?? {};
    message.metadata.selected = !message.metadata.selected
    await db.runAsync(
      `UPDATE messages SET selected = ?, messageJson = ? WHERE id = ?;`,
      [message.metadata.selected ? 1 : 0, JSON.stringify(message), message.id]
    );
    await updateMessages();
  }

  async function deleteSelected() {
    await db.runAsync('DELETE FROM messages WHERE selected = 1;');
    await updateMessages();
  }

  async function getSelected() {
    const msgs = await db.getAllAsync<DatabaseMessage>('SELECT * FROM messages WHERE selected = 1 ORDER BY createdAt DESC;');
    return msgs.map<MessageType.Any>((msg: DatabaseMessage) => JSON.parse(msg.messageJson));
  }

  async function getSetting(name: string): Promise<string | null> {
    const result = await db.getFirstAsync<{ value: string }>(
      'SELECT value FROM settings WHERE name = ?;',
      [name]
    );
    return result?.value ?? null;
  }

  async function setSetting(name: string, value: string): Promise<void> {
    await db.runAsync(
      `INSERT INTO settings (name, value) VALUES (?, ?)
       ON CONFLICT(name) DO UPDATE SET value = excluded.value;`,
      [name, value]
    );
  }

  function switchUsers() {
    setUserIdx((userIdx + 1) % 2); // We use 2 here because the last user is AI
  }

  // Initial fetch
  useEffect(() => {
    updateMessages();
  }, []);

  return (
    <DatabaseContext.Provider value={{
      selectedMessagesCount,
      messages,
      updateMessages,
      toggleSelectMessage,
      addMessage,
      generateMessage,
      deleteSelected,
      getSelected,
      getSetting,
      setSetting,
      userIdx,
      switchUsers,
    }}>
      {children}
    </DatabaseContext.Provider>
  );
}

// Hook to use the DatabaseContext
export function useDatabase() {
  const context = useContext(DatabaseContext);
  if (!context) {
    throw new Error('useDatabase must be used within a DatabaseProvider');
  }
  return context;
}

// Wrapping in the sqlite provider so it all works
export function DatabaseProviderWrapper({ children }: { children: React.ReactNode }) {
  return (
    <SQLiteProvider databaseName='messages.db' onInit={initializeDatabase}>
      <DatabaseProvider>
        {children}
      </DatabaseProvider>
    </SQLiteProvider>
  );
}