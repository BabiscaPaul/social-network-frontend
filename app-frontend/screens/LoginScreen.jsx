import { View, Text, SafeAreaView, TextInput } from 'react-native'
import React from 'react'
import { StyleSheet } from 'react-native'
import { TouchableOpacity } from 'react-native'
import { useState } from 'react'
import { TouchableWithoutFeedback } from 'react-native'
import { Keyboard } from 'react-native'

import Icon from 'react-native-vector-icons/FontAwesome'

const LoginScreen = () => {

    const [isPasswordVisible, setIsPasswordVisible] = useState(true)

    return (
            <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible = {false}>
                <SafeAreaView style = {styles.inner}>
                    <View style={styles.header}>
                        <Text style={styles.title}>Log In</Text>
                        <Text style={styles.subTitle}>Please log in to continue 🎧</Text>
                    </View>

                    <View style={styles.inputContainer}>
                        <Text style={{ marginHorizontal: 10 }}>Username</Text>
                        <View style={styles.inputFieldContainer}>
                            <TextInput
                                style={styles.inputs}
                                placeholder="Username"
                                autoCapitalize="none"
                                selectionColor="#000"
                            />
                        </View>
                    </View>

                    <View style={styles.inputContainer}>
                        <Text style={{ marginHorizontal: 10 }}>Password</Text>
                        <View style={styles.passwordContainer}>
                            <TextInput
                                style={styles.inputs}
                                placeholder="Password"
                                autoCapitalize="none"
                                secureTextEntry={isPasswordVisible}
                                selectionColor="#000"
                            />
                            <TouchableOpacity onPress={() => {setIsPasswordVisible(!isPasswordVisible)}}>
                                {isPasswordVisible ? <Icon name="eye" size={20} /> : <Icon name="eye-slash" size={20} />}
                            </TouchableOpacity>
                        </View>
                    </View>

                    <TouchableOpacity style={styles.signinButton}>
                        <Text style={styles.signinButtonText}>Sign In</Text>
                    </TouchableOpacity>
                </SafeAreaView>
            </TouchableWithoutFeedback>
    );
};

const styles = StyleSheet.create({
    inner: {
        flex: 1,
        gap: 15,
        alignItems: 'center',
        backgroundColor: '#fff', 
    },

    header: {
        alignItems: 'center',
        marginBottom: 20,
        width: '70%', 
    },

    title: {
        fontSize: 32,
        fontWeight: '700',
        color: '#000',
        letterSpacing: 1,
        marginBottom: 10,
    },

    subTitle: {
        fontSize: 16,
        fontWeight: '300',
        color: '#555',
        textAlign: 'center',
        lineHeight: 22,
    },

    inputContainer: {
        width: '70%',
        marginBottom: 15,
    },

    inputFieldContainer: {
        width: '100%',
        borderColor: '#000',
        borderWidth: 1.5,
        borderRadius: 15,
        paddingHorizontal: 10,
        height: 50,
        marginTop: 5,
    
    },

    passwordContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        width: '100%',
        borderColor: '#000',
        borderWidth: 1.5,
        borderRadius: 15,
        paddingHorizontal: 10,
        height: 50,
        marginTop: 5,
    },

    inputs: {
        flex: 1,
        fontSize: 20,
        color: '#000',
        height: '100%',
    },

    signinButton: {
        borderWidth: 1.5,
        width: '70%',
        paddingVertical: 10,
        borderRadius: 15,
        backgroundColor: 'black',
        marginTop: 20,
    },

    signinButtonText: {
        color: '#fff',
        fontSize: 20,
        alignSelf: 'center',
    },
});


export default LoginScreen