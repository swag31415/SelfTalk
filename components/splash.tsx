import React from 'react';
import { Text, TouchableOpacity, View } from "react-native";
import { ParamListBase, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { useSettings } from './settings'
import { getStyles } from './styles'

export default function () {
    const navigation = useNavigation<NativeStackNavigationProp<ParamListBase>>();
    const { theme } = useSettings();
    const styles = getStyles(theme);
    return (
        <View style={styles.container}>
            <Text style={styles.title}>Welcome to ChatApp</Text>
            <Text style={styles.subtitle}>Connect with yourself, anytime, anywhere!</Text>
            <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('Chat')}>
                <Text style={styles.buttonText}>Start Chatting</Text>
            </TouchableOpacity>
        </View>
    )
}