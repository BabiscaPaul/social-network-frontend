import { View, Text, SafeAreaView, TextInput } from 'react-native'
import React, { useContext } from 'react'
import { StyleSheet } from 'react-native'
import { useState } from 'react'
import { TouchableOpacity } from 'react-native'
import { TouchableWithoutFeedback } from 'react-native'
import { Keyboard } from 'react-native'
import { AuthContext } from '../AuthProvider'

import Icon from 'react-native-vector-icons/FontAwesome'

const SignupScreen = () => {

    const { signup } = useContext(AuthContext);

    const [isPasswordVisible1, setIsPasswordVisible1] = useState(true)
    const [isPasswordVisible2, setIsPasswordVisible2] = useState(true)

    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');


    return (
        <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
            <SafeAreaView style = {styles.inner}>

                <View style = { styles.header }>
                    <Text style = { styles.title }>Create Account</Text>
                    <Text style = { styles.subTitle }>Please Register to Login</Text>
                </View>

                <View style={styles.inputContainer}>
                    <Text style={{ marginHorizontal: 10 }}>Username</Text>
                    <View style={styles.inputFieldContainer}>
                        <TextInput
                            style={styles.inputs}
                            placeholder="Username"
                            autoCapitalize="none"
                            selectionColor="#000"
                            value={username}
                            onChangeText={setUsername}
                        />
                    </View>
                </View>

                <View style={styles.inputContainer}>
                    <Text style={{ marginHorizontal: 10 }}>Email</Text>
                    <View style={styles.inputFieldContainer}>
                        <TextInput
                            style={styles.inputs}
                            placeholder="Email"
                            autoCapitalize="none"
                            selectionColor="#000"
                            keyboardType='email-address'
                            value={email}
                            onChangeText={setEmail}
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
                            secureTextEntry={isPasswordVisible1}
                            selectionColor="#000"
                            value={password}
                            onChangeText={setPassword}
                        />
                        <TouchableOpacity onPress={() => { setIsPasswordVisible1(!isPasswordVisible1) }}>
                            {isPasswordVisible1 ? <Icon name="eye" size={20} /> : <Icon name="eye-slash" size={20} />}
                        </TouchableOpacity>
                    </View>
                </View>

                <View style={styles.inputContainer}>
                    <Text style={{ marginHorizontal: 10 }}>Password</Text>
                    <View style={styles.passwordContainer}>
                        <TextInput
                            style={styles.inputs}
                            placeholder="Repeat Password"
                            autoCapitalize="none"
                            secureTextEntry={isPasswordVisible2}
                            selectionColor="#000"
                            value={confirmPassword}
                            onChangeText={setConfirmPassword}
                        />
                        <TouchableOpacity onPress={() => { setIsPasswordVisible2(!isPasswordVisible2) }}>
                            {isPasswordVisible2 ? <Icon name="eye" size={20} /> : <Icon name="eye-slash" size={20} />}
                        </TouchableOpacity>
                    </View>
                </View>
                
                <TouchableOpacity style={styles.signupButton} onPress={() => signup(username, email, password, confirmPassword)}>
                    <Text style={styles.signupButtonText}>Sign Up</Text>
                </TouchableOpacity>

            </SafeAreaView>
        </TouchableWithoutFeedback>
    )
}

const styles = StyleSheet.create({
    inner: {
        flex: 1,
        gap: 5,
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

    signupButton: {
        borderWidth: 1.5,
        width: '70%',
        paddingVertical: 10,
        borderRadius: 15,
        backgroundColor: 'black',
        marginTop: 20,
    },

    signupButtonText: {
        color: '#fff',
        fontSize: 20,
        alignSelf: 'center',
    },
});

export default SignupScreen
