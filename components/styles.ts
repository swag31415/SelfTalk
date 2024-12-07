import { TextStyle, ViewStyle } from "react-native";
import { darkTheme } from '@flyerhq/react-native-chat-ui';

export const styles = {
    baseContainer: {
        flex: 1,
        backgroundColor: darkTheme.colors.background,
    } as ViewStyle,
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        padding: 20,
        backgroundColor: darkTheme.colors.background,
    } as ViewStyle,
    title: {
        fontSize: 28,
        color: darkTheme.colors.primary,
        fontWeight: 'bold',
        textAlign: 'center',
        marginBottom: 20,
    } as TextStyle,
    subtitle: {
        fontSize: 16,
        color: darkTheme.colors.inputText,
        textAlign: 'center',
        marginBottom: 40,
    } as TextStyle,
    button: {
        backgroundColor: darkTheme.colors.primary,
        paddingVertical: 15,
        paddingHorizontal: 30,
        borderRadius: 8,
        shadowColor: darkTheme.colors.background,
        shadowOpacity: 0.2,
        shadowRadius: 4,
        shadowOffset: { width: 0, height: 2 },
    },
    buttonText: {
        color: darkTheme.colors.inputText,
        fontSize: 16,
        fontWeight: '600',
    } as TextStyle,
    content: {
        fontSize: 16,
        color: darkTheme.colors.inputText,
        lineHeight: 24,
        textAlign: 'left',
        marginBottom: 40,
    } as TextStyle,
    italic: {
        fontStyle: 'italic',
    } as TextStyle,
    padded: {
        padding: 20,
    },
};