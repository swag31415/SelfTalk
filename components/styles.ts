import { TextStyle, ViewStyle } from "react-native";
import { Theme } from '@flyerhq/react-native-chat-ui';

export function getStyles(theme: Theme) {
    return {
        baseContainer: {
            flex: 1,
            backgroundColor: theme.colors.background,
        } as ViewStyle,
        container: {
            flex: 1,
            padding: 20,
            backgroundColor: theme.colors.background,
        } as ViewStyle,
        title: {
            fontSize: 28,
            color: theme.colors.primary,
            fontWeight: 'bold',
            textAlign: 'center',
            marginBottom: 20,
        } as TextStyle,
        subtitle: {
            fontSize: 16,
            color: theme.colors.inputText,
            textAlign: 'center',
            marginBottom: 20,
        } as TextStyle,
        section: {
            marginBottom: 30,
        } as ViewStyle,
        label: {
            fontSize: 18,
            fontWeight: 'bold',
            color: theme.colors.primary,
            marginBottom: 10,
        } as TextStyle,
        input: {
            borderWidth: 1,
            borderColor: theme.colors.primary,
            backgroundColor: theme.colors.inputBackground,
            paddingVertical: 10,
            paddingHorizontal: 15,
            borderRadius: 8,
            fontSize: 16,
            color: theme.colors.inputText,
            marginBottom: 15,
        },
        button: {
            backgroundColor: theme.colors.primary,
            paddingVertical: 15,
            paddingHorizontal: 20,
            borderRadius: 8,
            shadowColor: theme.colors.background,
            shadowOpacity: 0.2,
            shadowRadius: 4,
            shadowOffset: { width: 0, height: 2 },
            alignItems: 'center',
            marginBottom: 15,
        } as ViewStyle,
        buttonText: {
            color: theme.colors.inputText,
            fontSize: 16,
            fontWeight: '600',
        } as TextStyle,
        content: {
            fontSize: 16,
            color: theme.colors.inputText,
            lineHeight: 24,
            textAlign: 'left',
            marginBottom: 40,
        } as TextStyle,
        italic: {
            fontStyle: 'italic',
        } as TextStyle,
        padded: {
            padding: 20,
        } as ViewStyle,
    }
}