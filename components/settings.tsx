import React from 'react';
import { Text, TextStyle, TouchableOpacity, View, ViewStyle } from "react-native";
import {ParamListBase, useNavigation} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import { darkTheme } from '@flyerhq/react-native-chat-ui';

const styles = {
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
  };

export default function () {
    const navigation = useNavigation<NativeStackNavigationProp<ParamListBase>>();

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Settings</Text>
            <Text style={styles.subtitle}>Not yet implemented</Text>
            <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('Chat')}>
                <Text style={styles.buttonText}>Go Back</Text>
            </TouchableOpacity>
        </View>
    )
}