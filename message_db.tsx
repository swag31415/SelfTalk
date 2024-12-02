
import { MessageType } from '@flyerhq/react-native-chat-ui';
import { SQLiteDatabase, SQLiteProvider, useSQLiteContext } from 'expo-sqlite';
import React, { createContext, useState, useEffect, useContext } from 'react';

const initializeDatabase = async (db: SQLiteDatabase) => {
    await db.withTransactionAsync(async () => {
        await db.execAsync(`CREATE TABLE IF NOT EXISTS messages (
            id TEXT PRIMARY KEY NOT NULL,
            messageJson TEXT NOT NULL,
            createdAt INTEGER NOT NULL,
            type TEXT NOT NULL,
            selected INTEGER NOT NULL,
            text TEXT
        );`);
    });
};

// Define the shape of the context
interface DatabaseContextProps {
    messages: any[];
    updateMessages: () => Promise<void>;
    addMessage: (message: MessageType.Any, selected?: boolean) => Promise<void>;
}

// Create the context
const DatabaseContext = createContext<DatabaseContextProps | undefined>(undefined);

// Provider component
function DatabaseProvider({ children }: { children: React.ReactNode }) {
    const db = useSQLiteContext();
    const [messages, setMessages] = useState<any[]>([]);

    async function updateMessages() {
        const msgs = await db.getAllAsync('SELECT * FROM messages ORDER BY createdAt DESC;;');
        setMessages(msgs.map((msg: any) => JSON.parse(msg.messageJson)));
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

    // Initial fetch
    useEffect(() => {
        updateMessages();
    }, []);

    return (
        <DatabaseContext.Provider value={{ messages, updateMessages, addMessage }}>
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