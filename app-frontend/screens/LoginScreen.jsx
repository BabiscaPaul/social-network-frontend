import { View, Text, SafeAreaView, TextInput } from 'react-native'
import React, { useContext } from 'react'
import { StyleSheet } from 'react-native'
import { TouchableOpacity } from 'react-native'
import { useState } from 'react'
import { TouchableWithoutFeedback } from 'react-native'
import { Keyboard } from 'react-native'
import { useNavigation } from '@react-navigation/native';
import { AuthContext } from '../AuthProvider'

import Icon from 'react-native-vector-icons/FontAwesome'

const LoginScreen = () => {
    const navigation = useNavigation();

    const [isPasswordVisible, setIsPasswordVisible] = useState(true)
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const { login } = useContext(AuthContext);

    const handleLogin = async () => {
        try {
            const userData = await login(email, password);
            // if (userData && userData.data.user.firstLogin) {
            //     navigation.navigate('Welcome');
            // } else if (userData && !userData.data.user.firstLogin){
            //     navigation.navigate('Home');
            // }
        } catch (error) {
            console.error('Login error:', error);
        }
    };

    return (
        <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
            <SafeAreaView style={styles.inner}>
                <View style={styles.header}>
                    <Text style={styles.title}>Log In</Text>
                    <Text style={styles.subTitle}>Please log in to continue</Text>
                </View>

                <View style={styles.inputContainer}>
                    <Text style={{ marginHorizontal: 10 }}>Email</Text>
                    <View style={styles.inputFieldContainer}>
                        <TextInput
                            style={styles.inputs}
                            placeholder="Email"
                            autoCapitalize="none"
                            selectionColor="#000"
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
                            secureTextEntry={isPasswordVisible}
                            selectionColor="#000"
                            value={password}
                            onChangeText={setPassword}
                        />
                        <TouchableOpacity onPress={() => { setIsPasswordVisible(!isPasswordVisible) }}>
                            {isPasswordVisible ? <Icon name="eye" size={20} /> : <Icon name="eye-slash" size={20} />}
                        </TouchableOpacity>
                    </View>
                </View>

                <View style={styles.signUpContainer}>
                    <Text>Do not have an account?</Text>
                    <TouchableOpacity onPress={() => { navigation.navigate('Signup') }}>
                        <Text style={{ color: '#6082B6', fontStyle: 'italic' }}>Sign Up</Text>
                    </TouchableOpacity>
                </View>

                <TouchableOpacity style={styles.signinButton} onPress={handleLogin}>
                    <Text style={styles.signinButtonText}>Sign In</Text>
                </TouchableOpacity>

            </SafeAreaView>
        </TouchableWithoutFeedback>
    );
};

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

    signUpContainer: {
        flexDirection: 'row',
        gap: 10
    }
});


export default LoginScreen