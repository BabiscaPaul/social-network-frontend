// ProfileScreen.js
import React, { useState, useEffect } from 'react';
import {
    SafeAreaView,
    View,
    Text,
    StyleSheet,
    ActivityIndicator,
    Image,
    Dimensions,
    ScrollView,
    TouchableOpacity,
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native'; // Import the hook for navigation
import { API_ROUTE, IP_PORT } from '@env';
import { useCallback } from 'react';
import { useFocusEffect } from '@react-navigation/native';


const { width } = Dimensions.get('window');

const ProfileScreen = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Profile and Posts state
    const [profileData, setProfileData] = useState(null);
    const [userPosts, setUserPosts] = useState([]);

    const navigation = useNavigation();
    const route = useRoute();

    useFocusEffect(
        useCallback(() => {
            fetchUserProfile();  // re-fetch data each time user focuses on Profile
        }, [])
    );

    useEffect(() => {
        if (profileData) {
            fetchUserPosts();
        }
    }, [profileData]);

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

    // 2) Fetch the user’s posts
    const fetchUserPosts = async () => {
        try {
            setLoading(true);
            setError(null);

            const response = await fetch(`${IP_PORT}${API_ROUTE}/posts/myPosts`);

            if (!response.ok) {
                throw new Error('Failed to fetch user posts');
            }

            const data = await response.json();
            console.log('My Posts =>', data);

            // Adjust to match your backend’s shape:
            // e.g., if data.data.posts is the array
            setUserPosts(data.data.posts || data.posts || []);
        } catch (err) {
            setError(err.message || 'Something went wrong fetching posts!');
            console.error('Error fetching user posts:', err);
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

                    {/* 3) Display the user’s posts */}
                    <View style={styles.postsContainer}>
                        <Text style={styles.postsHeading}>My Posts</Text>
                        {userPosts.length === 0 ? (
                            <Text style={styles.noPostsText}>No posts yet!</Text>
                        ) : (
                            userPosts.map((post) => (
                                <View style={styles.postCard} key={post._id}>
                                    <Text style={styles.postContent}>{post.content}</Text>
                                    {/* If you have images, display them */}
                                    {post.mediaFiles?.map((filePath, index) => {
                                        const fullPath = `${IP_PORT}${filePath}`;
                                        return (
                                            <Image
                                                key={index}
                                                style={styles.postImage}
                                                source={{ uri: fullPath }}
                                                resizeMode="cover"
                                            />
                                        );
                                    })}
                                </View>
                            ))
                        )}
                    </View>
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

    // Posts Section
    postsContainer: {
        width: '85%',
    },
    postsHeading: {
        fontSize: 20,
        fontWeight: '600',
        marginBottom: 10,
    },
    noPostsText: {
        textAlign: 'center',
        color: '#999',
        marginTop: 10,
    },
    // Individual post card
    postCard: {
        backgroundColor: '#fff',
        borderRadius: 8,
        padding: 15,
        marginBottom: 10,
        shadowColor: '#000',
        shadowOpacity: 0.05,
        shadowRadius: 3,
        shadowOffset: { width: 0, height: 1 },
        elevation: 1,
    },
    postContent: {
        fontSize: 16,
        color: '#333',
        marginBottom: 8,
    },
    postImage: {
        width: '100%',
        height: 200,
        borderRadius: 6,
        backgroundColor: '#eee',
    },
});
