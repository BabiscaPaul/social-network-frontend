import React, { useState, useContext, useEffect } from 'react';
import {
    SafeAreaView,
    ScrollView,
    View,
    Text,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    Image,
    Animated,
    Dimensions,
    Platform,
    StatusBar,
    KeyboardAvoidingView,
    ActivityIndicator,
} from 'react-native';
import { API_ROUTE, IP_PORT } from '@env';
import { useNavigation } from '@react-navigation/native';
import { AuthContext } from '../AuthProvider';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';

const { width } = Dimensions.get('window');

const EditProfileScreen = () => {
    const navigation = useNavigation();
    const { logout } = useContext(AuthContext);

    // Animation values
    const fadeAnim = new Animated.Value(0);
    const slideAnim = new Animated.Value(50);

    // Form states
    const [username, setUsername] = useState('');
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [bio, setBio] = useState('');
    const [profilePicUri, setProfilePicUri] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        // Entrance animations
        Animated.parallel([
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 600,
                useNativeDriver: true,
            }),
            Animated.timing(slideAnim, {
                toValue: 0,
                duration: 600,
                useNativeDriver: true,
            }),
        ]).start();
    }, []);

    const handlePickImage = async () => {
        try {
            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsEditing: true,
                aspect: [1, 1],
                quality: 1,
            });

            if (!result.canceled && result.assets[0].uri) {
                // Animate the image change
                Animated.sequence([
                    Animated.timing(fadeAnim, {
                        toValue: 0,
                        duration: 200,
                        useNativeDriver: true,
                    }),
                    Animated.timing(fadeAnim, {
                        toValue: 1,
                        duration: 200,
                        useNativeDriver: true,
                    }),
                ]).start();

                setProfilePicUri(result.assets[0].uri);
            }
        } catch (error) {
            console.error('Error picking image:', error);
        }
    };

    const renderInput = (label, value, setValue, placeholder, multiline = false) => (
        <Animated.View
            style={[
                styles.inputContainer,
                {
                    opacity: fadeAnim,
                    transform: [{ translateY: slideAnim }],
                },
            ]}
        >
            <Text style={styles.label}>{label}</Text>
            <View style={styles.inputWrapper}>
                <TextInput
                    style={[
                        styles.input,
                        multiline && styles.bioInput,
                    ]}
                    placeholder={placeholder}
                    value={value}
                    onChangeText={setValue}
                    multiline={multiline}
                    placeholderTextColor="#999"
                    autoCapitalize="none"
                />
            </View>
        </Animated.View>
    );

    const handleUpdateProfile = async () => {
        try {
            setIsSubmitting(true);
            const formData = new FormData();

            if (username) formData.append('username', username);
            if (firstName) formData.append('firstName', firstName);
            if (lastName) formData.append('lastName', lastName);
            if (bio) formData.append('bio', bio);

            if (profilePicUri) {
                const fileName = profilePicUri.split('/').pop() || 'profile.jpg';
                formData.append('profilePicture', {
                    uri: profilePicUri,
                    name: fileName,
                    type: 'image/jpeg',
                });
            }

            const response = await fetch(`${IP_PORT}${API_ROUTE}/users/updateProfile`, {
                method: 'POST',
                body: formData,
            });

            if (!response.ok) throw new Error('Failed to update profile');

            // Animate out before navigation
            Animated.parallel([
                Animated.timing(fadeAnim, {
                    toValue: 0,
                    duration: 300,
                    useNativeDriver: true,
                }),
                Animated.timing(slideAnim, {
                    toValue: 50,
                    duration: 300,
                    useNativeDriver: true,
                }),
            ]).start(() => {
                navigation.goBack();
            });

        } catch (error) {
            console.error('Error updating profile:', error.message);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleSignOut = async () => {
        try {
            // Animate out before logout
            Animated.parallel([
                Animated.timing(fadeAnim, {
                    toValue: 0,
                    duration: 300,
                    useNativeDriver: true,
                }),
                Animated.timing(slideAnim, {
                    toValue: 50,
                    duration: 300,
                    useNativeDriver: true,
                }),
            ]).start(async () => {
                await logout();
            });
        } catch (error) {
            console.log('Error logging out:', error.message);
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={{ flex: 1 }}
            >
                <ScrollView
                    contentContainerStyle={styles.content}
                    showsVerticalScrollIndicator={false}
                >
                    {/* Profile Picture Section */}
                    <Animated.View
                        style={[
                            styles.imageContainer,
                            {
                                opacity: fadeAnim,
                                transform: [{ translateY: slideAnim }],
                            },
                        ]}
                    >
                        <Image
                            source={{
                                uri: profilePicUri || 'https://via.placeholder.com/150/CCC/FFF?text=Avatar',
                            }}
                            style={styles.profileImage}
                        />
                        <TouchableOpacity
                            style={styles.pickImageBtn}
                            onPress={handlePickImage}
                        >
                            <LinearGradient
                                colors={['#000', '#333']}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 1 }}
                                style={styles.pickImageBtnGradient}
                            >
                                <Ionicons name="camera" size={20} color="#fff" />
                                <Text style={styles.pickImageBtnText}>Change Photo</Text>
                            </LinearGradient>
                        </TouchableOpacity>
                    </Animated.View>

                    {/* Form Fields */}
                    {renderInput('Username', username, setUsername, 'Enter your username')}
                    {renderInput('First Name', firstName, setFirstName, 'Enter your first name')}
                    {renderInput('Last Name', lastName, setLastName, 'Enter your last name')}
                    {renderInput('Bio', bio, setBio, 'Tell us about yourself...', true)}

                    {/* Action Buttons */}
                    <Animated.View
                        style={[
                            styles.buttonContainer,
                            {
                                opacity: fadeAnim,
                                transform: [{ translateY: slideAnim }],
                            },
                        ]}
                    >
                        <TouchableOpacity
                            style={styles.saveBtn}
                            onPress={handleUpdateProfile}
                            disabled={isSubmitting}
                        >
                            <LinearGradient
                                colors={['#000', '#333']}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 1 }}
                                style={styles.saveBtnGradient}
                            >
                                {isSubmitting ? (
                                    <ActivityIndicator color="#fff" />
                                ) : (
                                    <>
                                        <Ionicons name="save-outline" size={20} color="#fff" />
                                        <Text style={styles.saveBtnText}>Save Changes</Text>
                                    </>
                                )}
                            </LinearGradient>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.signOutBtn}
                            onPress={handleSignOut}
                        >
                            <LinearGradient
                                colors={['#FF3B30', '#FF6B6B']}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 1 }}
                                style={styles.signOutBtnGradient}
                            >
                                <Ionicons name="log-out-outline" size={20} color="#fff" />
                                <Text style={styles.signOutBtnText}>Sign Out</Text>
                            </LinearGradient>
                        </TouchableOpacity>
                    </Animated.View>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F8F9FA',
    },
    content: {
        alignItems: 'center',
        paddingVertical: 24,
        paddingHorizontal: 16,
    },
    imageContainer: {
        alignItems: 'center',
        marginBottom: 32,
    },
    profileImage: {
        width: 120,
        height: 120,
        borderRadius: 60,
        borderWidth: 4,
        borderColor: '#fff',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 10,
        marginBottom: 16,
    },
    pickImageBtn: {
        borderRadius: 25,
        overflow: 'hidden',
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
    },
    pickImageBtnGradient: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        paddingHorizontal: 20,
    },
    pickImageBtnText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
        marginLeft: 8,
    },
    inputContainer: {
        width: width - 48,
        marginBottom: 24,
    },
    label: {
        marginLeft: 4,
        marginBottom: 8,
        fontSize: 14,
        fontWeight: '600',
        color: '#666',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    inputWrapper: {
        backgroundColor: '#fff',
        borderRadius: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
    },
    input: {
        paddingHorizontal: 16,
        paddingVertical: 12,
        fontSize: 16,
        color: '#000',
        minHeight: 48,
    },
    bioInput: {
        height: 100,
        textAlignVertical: 'top',
        paddingTop: 12,
    },
    buttonContainer: {
        width: width - 48,
        marginTop: 8,
    },
    saveBtn: {
        borderRadius: 12,
        overflow: 'hidden',
        marginBottom: 16,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
    },
    saveBtnGradient: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 16,
    },
    saveBtnText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
        marginLeft: 8,
    },
    signOutBtn: {
        borderRadius: 12,
        overflow: 'hidden',
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
    },
    signOutBtnGradient: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 16,
    },
    signOutBtnText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
        marginLeft: 8,
    },
});

export default EditProfileScreen;