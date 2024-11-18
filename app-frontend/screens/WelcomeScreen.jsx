import React, { useContext } from 'react';
import { Text, SafeAreaView, StyleSheet, View } from 'react-native';
import { AuthContext } from '../AuthProvider';
import GenericButton from '../components/GenericButton';

import { useNavigation } from '@react-navigation/native';

const WelcomeScreen = () => {
    const { userData } = useContext(AuthContext);
    const navigation = useNavigation();

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.content}>
                <Text style={styles.greeting}>👋</Text>
                <Text style={styles.welcomeText}>
                    Welcome, {userData.data.user.username}!
                </Text>
            </View>

            <GenericButton onPress={() => { navigation.navigate('SetUpProfile') }} title='Next' />
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        padding: 20,
    },
    content: {
        alignItems: 'center',
    },
    greeting: {
        fontSize: 50,
        marginBottom: 10,
    },
    welcomeText: {
        fontSize: 24,
        fontWeight: '600',
        textAlign: 'center',
    },
});

export default WelcomeScreen;
