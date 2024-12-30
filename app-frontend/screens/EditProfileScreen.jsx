// EditProfileScreen.js
import React, { useState, useContext } from 'react';
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
import { AuthContext } from '../AuthProvider'; // <-- Make sure the path is correct

const EditProfileScreen = () => {
    const navigation = useNavigation();
    const { logout } = useContext(AuthContext);

    // Form states
    const [username, setUsername] = useState('');
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [bio, setBio] = useState(''); // <-- new bio state

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

    // Submit form to update user profile
    const handleUpdateProfile = async () => {
        try {
            const formData = new FormData();
            // If user left a field blank, the backend will keep the old value
            formData.append('username', username);
            formData.append('firstName', firstName);
            formData.append('lastName', lastName);
            formData.append('bio', bio); // <-- append bio to the form data

            // If the user picked a new profile picture
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
                // Omit 'Content-Type' to let fetch + FormData set correct boundaries
            });

            if (!response.ok) {
                throw new Error('Failed to update profile');
            }

            console.log('Profile updated successfully!');
            navigation.goBack();
        } catch (error) {
            console.error('Error updating profile:', error.message);
        }
    };

    // Handle sign out
    const handleSignOut = async () => {
        try {
            await logout();
        } catch (error) {
            console.log('Error logging out:', error);
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView contentContainerStyle={styles.content}>
                {/* Profile Picture Preview */}
                <View style={styles.imageContainer}>
                    {profilePicUri ? (
                        <Image source={{ uri: profilePicUri }} style={styles.profileImage} />
                    ) : (
                        <Image
                            source={{ uri: 'https://via.placeholder.com/100/CCC/FFF?text=Avatar' }}
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
                        autoCapitalize="none"
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
                        autoCapitalize="none"
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
                        autoCapitalize="none"
                        style={styles.input}
                        placeholder="Type last name..."
                        value={lastName}
                        onChangeText={setLastName}
                    />
                </View>

                {/* Bio (new field) */}
                <View style={styles.inputContainer}>
                    <Text style={styles.label}>Bio</Text>
                    <TextInput
                        autoCapitalize="none"
                        style={[styles.input, styles.bioInput]}
                        placeholder="Tell us about yourself..."
                        value={bio}
                        onChangeText={setBio}
                        multiline // allow multiple lines
                    />
                </View>

                {/* Save Changes Button */}
                <TouchableOpacity style={styles.saveBtn} onPress={handleUpdateProfile}>
                    <Text style={styles.saveBtnText}>Save Changes</Text>
                </TouchableOpacity>

                {/* Sign Out Button */}
                <TouchableOpacity style={styles.signOutBtn} onPress={handleSignOut}>
                    <Text style={styles.signOutBtnText}>Sign Out</Text>
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
    content: {
        alignItems: 'center',
        paddingVertical: 20,
        paddingHorizontal: 16,
    },

    // Profile Image
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
        width: '85%',
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
    bioInput: {
        height: 70, // give a bit more space for multiline text
        textAlignVertical: 'top',
    },

    // Save Button
    saveBtn: {
        width: '85%',
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

    // Sign Out Button (red)
    signOutBtn: {
        width: '85%',
        backgroundColor: 'red',
        borderRadius: 8,
        paddingVertical: 12,
        alignItems: 'center',
        marginTop: 20,
    },
    signOutBtnText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: '600',
    },
});
