// ProfileScreen.js
import React, { useState, useEffect, useCallback } from 'react';
import {
    SafeAreaView,
    View,
    Text,
    StyleSheet,
    ActivityIndicator,
    Image,
    ScrollView,
    TouchableOpacity,
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native'; // Import the hook for navigation
import { API_ROUTE, IP_PORT } from '@env';
import { useFocusEffect } from '@react-navigation/native';

const ProfileScreen = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Profile state
    const [profileData, setProfileData] = useState(null);

    const navigation = useNavigation();
    const route = useRoute();

    useFocusEffect(
        useCallback(() => {
            fetchUserProfile();  // Re-fetch data each time user focuses on Profile
        }, [])
    );

    // 1) Fetch the user’s profile
    const fetchUserProfile = async () => {
        try {
            setLoading(true);
            setError(null);

            const response = await fetch(`${IP_PORT}${API_ROUTE}/users/me`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            if (!response.ok) {
                throw new Error('Failed to fetch user profile');
            }

            const data = await response.json();
            console.log('User Profile Data:', data);

            // Adjust according to your backend response structure
            setProfileData(data.data.user || data.user || data);
        } catch (err) {
            setError(err.message || 'Something went wrong fetching profile!');
            console.error('Error fetching user profile:', err);
        } finally {
            setLoading(false);
        }
    };

    // Handle loading and error states
    if (loading) {
        return (
            <SafeAreaView style={styles.centeredContainer}>
                <ActivityIndicator size="large" color="#000" />
                <Text style={styles.loadingText}>Loading...</Text>
            </SafeAreaView>
        );
    }

    if (error) {
        return (
            <SafeAreaView style={styles.centeredContainer}>
                <Text style={styles.errorText}>{error}</Text>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            {profileData ? (
                <ScrollView contentContainerStyle={styles.scrollContent}>
                    {/* Profile Picture */}
                    <View style={styles.profileImageContainer}>
                        <Image
                            style={styles.profileImage}
                            source={{
                                uri: 'https://via.placeholder.com/150/CCC/FFF?text=Avatar',
                            }}
                        />
                    </View>

                    {/* Profile Info Card */}
                    <View style={styles.infoCard}>
                        <Text style={styles.username}>@{profileData.username}</Text>
                        <Text style={styles.email}>{profileData.email}</Text>
                        <Text style={styles.bio}>
                            {profileData.bio || 'No bio available'}
                        </Text>
                    </View>

                    {/* Edit Profile Button */}
                    <TouchableOpacity
                        style={styles.editButton}
                        onPress={() => navigation.navigate('EditProfileScreen')}
                    >
                        <Text style={styles.editButtonText}>Edit Profile</Text>
                    </TouchableOpacity>

                    {/* My Posts Button */}
                    <TouchableOpacity
                        style={styles.editButton}
                        onPress={() => navigation.navigate('MyPostsScreen')}
                    >
                        <Text style={styles.editButtonText}>My Posts</Text>
                    </TouchableOpacity>

                    {/* Shared Posts Button */}
                    <TouchableOpacity
                        style={styles.editButton}
                        onPress={() => navigation.navigate('SharedPostsScreen')} 
                    >
                        <Text style={styles.editButtonText}>Shared Posts</Text>
                    </TouchableOpacity>

                    {/* You can add more profile-related actions here */}
                </ScrollView>
            ) : (
                <View style={styles.centeredContainer}>
                    <Text>No profile data available.</Text>
                </View>
            )}
        </SafeAreaView>
    );
};

export default ProfileScreen;

//-------------------------------------
// Styles
//-------------------------------------
const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fafafa',
    },
    scrollContent: {
        alignItems: 'center',
        paddingBottom: 30,
    },
    centeredContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingText: {
        marginTop: 10,
        fontSize: 16,
    },
    errorText: {
        color: 'red',
        fontSize: 16,
        textAlign: 'center',
        marginHorizontal: 20,
    },

    // Profile Image
    profileImageContainer: {
        marginTop: 30,
        marginBottom: 20,
        alignItems: 'center',
    },
    profileImage: {
        width: 120,
        height: 120,
        resizeMode: 'cover',
        borderRadius: 60,
        borderWidth: 3,
        borderColor: '#fff',
        backgroundColor: '#ccc',
    },

    // Info Card
    infoCard: {
        width: '85%',
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 20,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowRadius: 4,
        shadowOffset: { width: 0, height: 2 },
        elevation: 2,
        marginBottom: 20,
    },
    username: {
        fontSize: 22,
        fontWeight: '700',
        marginBottom: 6,
    },
    email: {
        fontSize: 16,
        color: '#888',
        marginBottom: 12,
    },
    bio: {
        fontSize: 16,
        color: '#555',
        textAlign: 'center',
        lineHeight: 22,
    },

    // Edit Profile Button
    editButton: {
        width: '85%',
        backgroundColor: '#000',
        borderRadius: 8,
        paddingVertical: 12,
        alignItems: 'center',
        marginBottom: 20,
    },
    editButtonText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: '600',
    },

    // You can add more styles as needed
});
