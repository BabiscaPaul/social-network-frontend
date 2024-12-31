// FriendsScreen.js

import React, { useState, useEffect } from 'react';
import {
    SafeAreaView,
    StyleSheet,
    Text,
    FlatList,
    ActivityIndicator,
    View,
    Image,
    Dimensions,
    TouchableOpacity,
    Alert,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { API_ROUTE, IP_PORT } from '@env';

const { width } = Dimensions.get('window');

const FriendsScreen = () => {
    const [friends, setFriends] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchFriends();
    }, []);

    // Function to fetch friends
    const fetchFriends = async () => {
        try {
            setLoading(true);
            setError(null);

            const response = await fetch(`${IP_PORT}${API_ROUTE}/users/friends`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    // If your backend requires authentication via headers, add them here
                    // 'Authorization': `Bearer your-token-here`,
                },
            });

            if (!response.ok) {
                throw new Error('Failed to fetch friends');
            }

            const data = await response.json();
            console.log('Friends Data:', data);

            // Ensure that data.data.friends is an array
            if (data.data && Array.isArray(data.data.friends)) {
                setFriends(data.data.friends);
            } else {
                throw new Error('Invalid data format received from server');
            }
        } catch (err) {
            setError(err.message || 'Something went wrong!');
            console.error('Error fetching friends:', err);
        } finally {
            setLoading(false);
        }
    };

    // Function to remove a friend
    const removeFriend = async (userId) => {
        try {
            // Optionally, confirm with the user before removing
            Alert.alert(
                'Confirm Removal',
                'Are you sure you want to remove this friend?',
                [
                    {
                        text: 'Cancel',
                        style: 'cancel',
                    },
                    {
                        text: 'Remove',
                        style: 'destructive',
                        onPress: async () => {
                            // Show a loading indicator or disable buttons if necessary
                            // Perform the DELETE request
                            const response = await fetch(`${IP_PORT}${API_ROUTE}/users/friends/${userId}`, {
                                method: 'DELETE',
                                headers: {
                                    'Content-Type': 'application/json',
                                    // Add Authorization header if required
                                    // 'Authorization': `Bearer your-token-here`,
                                },
                            });

                            if (!response.ok) {
                                // Attempt to parse error message from server
                                const errorData = await response.json();
                                const errorMessage = errorData.message || 'Failed to remove friend';
                                throw new Error(errorMessage);
                            }

                            // Optionally, parse response data
                            const data = await response.json();
                            console.log('Friend Removed:', data);

                            // Update the local friends state to remove the friend
                            setFriends((prevFriends) => prevFriends.filter(friend => friend._id !== userId));

                            // Alert the user of success
                            Alert.alert('Success', 'Friend removed successfully!');
                        },
                    },
                ],
                { cancelable: true }
            );
        } catch (err) {
            console.error('Error removing friend:', err);
            Alert.alert('Error', err.message || 'Failed to remove friend');
        }
    };

    // Function to render each friend item
    const renderFriend = ({ item }) => {
        return (
            <View style={styles.friendCard}>
                {/* Profile Image (Optional) */}
                {item.profileImageUrl ? (
                    <Image
                        source={{ uri: item.profileImageUrl }}
                        style={styles.profileImage}
                    />
                ) : (
                    <View style={styles.profileImagePlaceholder}>
                        <Ionicons name="person" size={30} color="#fff" />
                    </View>
                )}

                <View style={styles.friendInfo}>
                    <Text style={styles.friendName}>
                        {item.firstName ? `${item.firstName} ` : ''}
                        {item.lastName ? `${item.lastName}` : ''}
                        {(!item.firstName && !item.lastName) ? item.username : ''}
                    </Text>
                    {item.bio ? <Text style={styles.friendBio}>{item.bio}</Text> : null}
                </View>
                {/* Remove Friend Button */}
                <TouchableOpacity
                    style={styles.removeButton}
                    onPress={() => removeFriend(item._id)}
                >
                    <Text style={styles.removeButtonText}>Remove Friend</Text>
                </TouchableOpacity>
            </View>
        );
    };

    // Function to handle errors by retrying
    const handleRetry = () => {
        fetchFriends();
    };

    if (loading) {
        return (
            <SafeAreaView style={styles.centeredContainer}>
                <ActivityIndicator size="large" color="#000" />
                <Text style={styles.loadingText}>Loading friends...</Text>
            </SafeAreaView>
        );
    }

    if (error) {
        return (
            <SafeAreaView style={styles.centeredContainer}>
                <Ionicons name="alert-circle" size={60} color="red" />
                <Text style={styles.errorText}>{error}</Text>
                <TouchableOpacity style={styles.retryButton} onPress={handleRetry}>
                    <Text style={styles.retryButtonText}>Retry</Text>
                </TouchableOpacity>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            {friends.length === 0 ? (
                <View style={styles.centeredContainer}>
                    <Ionicons name="people-outline" size={60} color="#999" />
                    <Text style={styles.noFriendsText}>You have no friends yet.</Text>
                </View>
            ) : (
                <FlatList
                    data={friends}
                    keyExtractor={(item) => item._id}
                    renderItem={renderFriend}
                    contentContainerStyle={styles.listContainer}
                />
            )}
        </SafeAreaView>
    );
};

export default FriendsScreen;

//-------------------------------------
// Styles
//-------------------------------------
const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f2f2f2',
    },
    centeredContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    loadingText: {
        marginTop: 10,
        fontSize: 16,
        color: '#333',
    },
    errorText: {
        color: 'red',
        fontSize: 16,
        textAlign: 'center',
        marginVertical: 10,
    },
    retryButton: {
        backgroundColor: '#007bff',
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 8,
        marginTop: 10,
    },
    retryButtonText: {
        color: '#fff',
        fontSize: 16,
    },
    noFriendsText: {
        textAlign: 'center',
        color: '#999',
        fontSize: 18,
        marginTop: 10,
    },
    listContainer: {
        padding: 10,
    },
    friendCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        padding: 15,
        borderRadius: 12,
        marginBottom: 10,
        shadowColor: '#000',
        shadowOpacity: 0.05,
        shadowRadius: 5,
        shadowOffset: { width: 0, height: 2 },
        elevation: 2,
    },
    profileImage: {
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: '#ddd',
    },
    profileImagePlaceholder: {
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: '#999',
        justifyContent: 'center',
        alignItems: 'center',
    },
    friendInfo: {
        marginLeft: 15,
        flex: 1,
    },
    friendName: {
        fontSize: 18,
        fontWeight: '600',
        color: '#333',
    },
    friendBio: {
        fontSize: 14,
        color: '#666',
        marginTop: 4,
    },
    removeButton: {
        backgroundColor: '#ff4d4d',
        paddingVertical: 8,
        paddingHorizontal: 12,
        borderRadius: 6,
    },
    removeButtonText: {
        color: '#fff',
        fontSize: 14,
        fontWeight: '500',
    },
});
