// EditProfileScreen.js
import React, { useState } from 'react';
import {
    SafeAreaView,
    ScrollView,
    View,
    Text,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    Image,
} from 'react-native';

import { API_ROUTE, IP_PORT } from '@env';
import { useNavigation } from '@react-navigation/native';

const EditProfileScreen = () => {
    const navigation = useNavigation();

    // Form states
    const [username, setUsername] = useState('');
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');

    // Optional image picker
    const [profilePicUri, setProfilePicUri] = useState(null);

    // Handle picking an image for the profile
    const handlePickImage = async () => {
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            quality: 1,
        });

        if (!result.canceled && result.assets[0].uri) {
            setProfilePicUri(result.assets[0].uri);
        }
    };

    // Submit form
    const handleUpdateProfile = async () => {
        try {
            // Use FormData to handle text + (optionally) image file
            const formData = new FormData();

            // If user left a field blank, the backend will keep the old value
            formData.append('username', username);
            formData.append('firstName', firstName);
            formData.append('lastName', lastName);

            // If the user picked a new profile picture
            if (profilePicUri) {
                const fileName = profilePicUri.split('/').pop() || 'profile.jpg';
                formData.append('profilePicture', {
                    uri: profilePicUri,
                    name: fileName,
                    type: 'image/jpeg',
                });
            }

            // Make the request
            const response = await fetch(
                `${IP_PORT}${API_ROUTE}/users/updateProfile`,
                {
                    method: 'POST',
                    body: formData,
                    // NOTE: Omit 'Content-Type': 'multipart/form-data'
                    // because fetch + FormData will set the correct headers automatically
                }
            );

            if (!response.ok) {
                throw new Error('Failed to update profile');
            }

            console.log('Profile updated successfully!');
            navigation.goBack();
        } catch (error) {
            console.error('Error updating profile:', error.message);
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            {/* ScrollView in case content grows */}
            <ScrollView contentContainerStyle={styles.content}>
                {/* Profile Picture Preview */}
                <View style={styles.imageContainer}>
                    {profilePicUri ? (
                        <Image source={{ uri: profilePicUri }} style={styles.profileImage} />
                    ) : (
                        <Image
                            source={{
                                uri: 'https://via.placeholder.com/100/CCC/FFF?text=Avatar',
                            }}
                            style={styles.profileImage}
                        />
                    )}
                    <TouchableOpacity style={styles.pickImageBtn} onPress={handlePickImage}>
                        <Text style={styles.pickImageBtnText}>Pick Profile Picture</Text>
                    </TouchableOpacity>
                </View>

                {/* Username */}
                <View style={styles.inputContainer}>
                    <Text style={styles.label}>Username</Text>
                    <TextInput
                        autoCapitalize='none'
                        style={styles.input}
                        placeholder="Type new username..."
                        value={username}
                        onChangeText={setUsername}
                    />
                </View>

                {/* First Name */}
                <View style={styles.inputContainer}>
                    <Text style={styles.label}>First Name</Text>
                    <TextInput
                        autoCapitalize='none'
                        style={styles.input}
                        placeholder="Type first name..."
                        value={firstName}
                        onChangeText={setFirstName}
                    />
                </View>

                {/* Last Name */}
                <View style={styles.inputContainer}>
                    <Text style={styles.label}>Last Name</Text>
                    <TextInput
                        autoCapitalize='none'
                        style={styles.input}
                        placeholder="Type last name..."
                        value={lastName}
                        onChangeText={setLastName}
                    />
                </View>

                {/* Submit Button */}
                <TouchableOpacity style={styles.saveBtn} onPress={handleUpdateProfile}>
                    <Text style={styles.saveBtnText}>Save Changes</Text>
                </TouchableOpacity>
            </ScrollView>
        </SafeAreaView>
    );
};

export default EditProfileScreen;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    // This container keeps the content centered and narrower
    content: {
        alignItems: 'center',
        paddingVertical: 20,
        paddingHorizontal: 16,
    },

    // Image
    imageContainer: {
        alignItems: 'center',
        marginBottom: 20,
    },
    profileImage: {
        width: 100,
        height: 100,
        borderRadius: 50,
        borderWidth: 2,
        borderColor: '#ddd',
        marginBottom: 8,
        backgroundColor: '#ccc',
    },
    pickImageBtn: {
        backgroundColor: '#000',
        paddingHorizontal: 14,
        paddingVertical: 8,
        borderRadius: 6,
    },
    pickImageBtnText: {
        color: '#fff',
        fontSize: 16,
    },

    // Inputs
    inputContainer: {
        width: '85%',    // narrower width
        marginBottom: 15,
    },
    label: {
        marginLeft: 4,
        marginBottom: 5,
        fontSize: 16,
        color: '#333',
    },
    input: {
        borderWidth: 1.5,
        borderColor: '#ccc',
        borderRadius: 8,
        paddingHorizontal: 12,
        height: 45,
        fontSize: 16,
        color: '#000',
    },

    datePickerContainer: {
        borderWidth: 1.5,
        borderColor: '#ccc',
        borderRadius: 8,
        paddingHorizontal: 12,
        height: 45,
        justifyContent: 'center',
    },
    inputText: {
        fontSize: 16,
        color: '#000',
    },

    // Save Button
    saveBtn: {
        width: '85%',   // narrower width
        backgroundColor: '#000',
        borderRadius: 8,
        paddingVertical: 12,
        alignItems: 'center',
        marginTop: 10,
    },
    saveBtnText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: '600',
    },
});
