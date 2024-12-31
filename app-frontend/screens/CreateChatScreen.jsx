// CreateChatScreen.js

import React, { useState, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    ActivityIndicator,
    Alert,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { IP_PORT, API_ROUTE } from '@env'; // Ensure these are correctly set in your .env file

const CreateChatScreen = () => {
    const [friends, setFriends] = useState([]); // To store the list of friends
    const [currentUser, setCurrentUser] = useState(null); // To store current user data
    const [loading, setLoading] = useState(false); // To manage loading state
    const [error, setError] = useState(null); // To handle any errors

    /**
     * Fetches the current user's data from the backend.
     */
    const fetchCurrentUser = async () => {
        try {
            const response = await fetch(`${IP_PORT}${API_ROUTE}/users/me`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    // Include authentication headers if required
                    // 'Authorization': `Bearer your-token-here`,
                },
            });

            if (!response.ok) {
                throw new Error('Failed to fetch current user data');
            }

            const data = await response.json();
            console.log('Current User Data:', data);

            // Extract the user object from the response
            if (data.status === 'success' && data.data.user) {
                setCurrentUser(data.data.user);
            } else {
                throw new Error('Invalid data format received from server');
            }
        } catch (err) {
            console.error('Error fetching current user:', err);
            setError(err.message || 'Something went wrong!');
            Alert.alert('Error', `Failed to fetch user data: ${err.message}`);
        }
    };

    /**
     * Fetches the current user's friends from the backend.
     */
    const fetchFriends = async () => {
        setLoading(true);
        setError(null);
        try {
            // Ensure that currentUser is fetched before fetching friends
            if (!currentUser) {
                await fetchCurrentUser();
            }

            const response = await fetch(`${IP_PORT}${API_ROUTE}/users/friends`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    // Include authentication headers if required
                    // 'Authorization': `Bearer your-token-here`,
                },
            });

            if (!response.ok) {
                throw new Error('Failed to fetch friends');
            }

            const data = await response.json();
            console.log('Friends Data:', data);

            // Assuming the backend returns friends under data.data.friends
            if (data.status === 'success' && Array.isArray(data.data.friends)) {
                setFriends(data.data.friends);
            } else {
                throw new Error('Invalid data format received from server');
            }
        } catch (err) {
            console.error('Error fetching friends:', err);
            setError(err.message || 'Something went wrong!');
            Alert.alert('Error', `Failed to fetch friends: ${err.message}`);
        } finally {
            setLoading(false);
        }
    };

    /**
     * useFocusEffect ensures that fetchFriends is called every time the screen gains focus.
     */
    useFocusEffect(
        useCallback(() => {
            fetchFriends();
        }, [currentUser]) // Dependency on currentUser to ensure it's fetched before friends
    );

    /**
     * Function to create a chat with a selected friend.
     * @param {object} friend - The friend object for whom the chat is to be created.
     */
    const handleCreateChat = async (friend) => {
        if (!currentUser) {
            Alert.alert('Error', 'User data not loaded. Please try again later.');
            return;
        }

        try {
            setLoading(true);

            const requestBody = {
                "id1": String(currentUser._id),
                "id2": String(friend._id)
            };

            const response = await fetch(`${IP_PORT}${API_ROUTE}/chats`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(requestBody),
            });

            if (!response.ok) {
                throw new Error('Failed to create chat');
            }

            const data = await response.json();
            console.log('Chat Creation Response:', data);

            // // Validate response structure
            // if (data.status === 'success' && data.data.chat) {
            //     Alert.alert('Success', `Chat created with ${friend.username}`);
            //     // Optionally, navigate to the ChatDetailScreen with the new chat ID
            //     // navigation.navigate('ChatDetail', { chatId: data.data.chat._id, ...otherParams });
            // } else {
            //     throw new Error('Invalid data format received from server');
            // }
        } catch (err) {
            console.error('Error creating chat:', err);
            Alert.alert('Error', `Failed to create chat: ${err.message}`);
        } finally {
            setLoading(false);
        }
    };

    /**
     * Renders each friend item in the FlatList.
     * @param {object} param0 - The item object from FlatList.
     * @returns {JSX.Element} - The rendered friend item.
     */
    const renderFriend = ({ item }) => (
        <View style={styles.friendItem}>
            <Text style={styles.friendName}>{item.username}</Text>
            <TouchableOpacity
                style={styles.createChatButton}
                onPress={() => handleCreateChat(item)}
            >
                <Text style={styles.buttonText}>Create Chat</Text>
            </TouchableOpacity>
        </View>
    );

    /**
     * Key extractor for FlatList items.
     * @param {object} item - The friend object.
     * @returns {string} - The unique key for the item.
     */
    const keyExtractor = (item) => item._id.toString();

    if (loading) {
        return (
            <View style={styles.loaderContainer}>
                <ActivityIndicator size="large" color="#4CAF50" />
            </View>
        );
    }

    if (error) {
        return (
            <View style={styles.errorContainer}>
                <Text style={styles.errorText}>Failed to load friends.</Text>
                <TouchableOpacity onPress={fetchFriends} style={styles.retryButton}>
                    <Text style={styles.retryButtonText}>Retry</Text>
                </TouchableOpacity>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            {friends.length === 0 ? (
                <View style={styles.noFriendsContainer}>
                    <Text style={styles.noFriendsText}>You have no friends to chat with.</Text>
                </View>
            ) : (
                <FlatList
                    data={friends}
                    keyExtractor={keyExtractor}
                    renderItem={renderFriend}
                    contentContainerStyle={styles.flatListContainer}
                />
            )}
        </View>
    );
};

export default CreateChatScreen;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
        padding: 16,
    },
    flatListContainer: {
        paddingBottom: 20,
    },
    friendItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#e0e0e0',
    },
    friendName: {
        fontSize: 16,
        color: '#333',
    },
    createChatButton: {
        backgroundColor: '#4CAF50',
        paddingVertical: 6,
        paddingHorizontal: 12,
        borderRadius: 20,
    },
    buttonText: {
        color: '#fff',
        fontSize: 14,
    },
    loaderContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    errorContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 20,
    },
    errorText: {
        fontSize: 18,
        color: '#F44336',
        marginBottom: 10,
        textAlign: 'center',
    },
    retryButton: {
        backgroundColor: '#4CAF50',
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 5,
    },
    retryButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
    noFriendsContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    noFriendsText: {
        fontSize: 18,
        color: '#777',
    },
});
