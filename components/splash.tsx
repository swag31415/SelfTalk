import React from 'react';
import { Text, TouchableOpacity, View } from "react-native";
import { ParamListBase, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { getStyles, useStyles } from './styles'

export default function () {
    const navigation = useNavigation<NativeStackNavigationProp<ParamListBase>>();
    const { theme } = useStyles();
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