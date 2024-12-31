// MessagesScreen.js

import React, { useEffect, useState, useCallback } from 'react';
import {
    SafeAreaView,
    View,
    Text,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    ActivityIndicator,
    Alert,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { IP_PORT, API_ROUTE } from '@env'; // Ensure these are correctly set in your .env file
import { useFocusEffect } from '@react-navigation/native';

const MessagesScreen = ({ navigation }) => {
    const [chats, setChats] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [loadingChatId, setLoadingChatId] = useState(null); // To track which chat is loading

    /**
     * Fetches all chats from the backend.
     */
    const fetchChats = async () => {
        try {
            setLoading(true);
            setError(null);

            const response = await fetch(`${IP_PORT}${API_ROUTE}/chats`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    // Include authentication headers if required
                    // 'Authorization': `Bearer your-token-here`,
                },
            });

            if (response.ok) {
                const data = await response.json();
                console.log('Chats Data:', data);

                // Validate response structure
                if (data.status === 'success' && Array.isArray(data.data.chats)) {
                    setChats(data.data.chats);
                } else {
                    throw new Error('Invalid data format received from server');
                }
            } else if (response.status === 404) {
                // 404 indicates no chats found
                setChats([]); // Set chats to empty array
                console.log('No chats found.');
            } else {
                // Other error statuses
                throw new Error(`Failed to fetch chats: ${response.status} ${response.statusText}`);
            }
        } catch (err) {
            console.error('Error fetching chats:', err);
            setError(err.message || 'Something went wrong!');
            // Show alert only for errors other than 404
            if (err.message && !err.message.includes('404')) {
                Alert.alert('Error', `Failed to fetch chats: ${err.message}`);
            }
        } finally {
            setLoading(false);
        }
    };

    useFocusEffect(
        useCallback(() => {
            fetchChats();
        }, [])
    );

    /**
     * Handles the press event on a chat item.
     *
     * @param {object} chat - The chat object that was pressed.
     */
    const handleChatPress = async (chat) => {
        console.log('Chat pressed:', chat);
        try {
            setLoadingChatId(chat._id); // Start loading for this chat

            const response = await fetch(`${IP_PORT}${API_ROUTE}/chats/message/${chat._id}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    // Include authentication headers if required
                    // 'Authorization': `Bearer your-token-here`,
                },
            });

            if (response.ok) {
                const data = await response.json();
                console.log('Messages Data:', data);

                // Validate response structure
                if (data.status === 'success' && Array.isArray(data.data.messages)) {
                    // Extract usernames
                    const user1Username = chat.user1.username;
                    const user2Username = chat.user2.username;
                    const id1 = chat.user1._id;
                    const id2 = chat.user2._id;

                    // Navigate to ChatDetailScreen with chatId, messages, and usernames
                    navigation.navigate('ChatDetail', {
                        chatId: chat._id,
                        messages: data.data.messages,
                        user1Username: user1Username,
                        user2Username: user2Username,
                        user1Id: id1,
                        user2Id: id2,
                    });
                } else {
                    throw new Error('Invalid data format received from server');
                }
            } else if (response.status === 404) {
                // 404 indicates no messages found for this chat
                Alert.alert('No Messages', 'This chat has no messages yet.');
            } else {
                throw new Error(`Failed to fetch messages: ${response.status} ${response.statusText}`);
            }
        } catch (err) {
            console.error('Error fetching messages:', err);
            Alert.alert('Error', `Failed to fetch messages: ${err.message}`);
        } finally {
            setLoadingChatId(null); // End loading for this chat
        }
    };

    /**
     * Renders each chat item in the FlatList.
     *
     * @param {object} param0 - The item object from FlatList.
     * @returns {JSX.Element} - The rendered chat card.
     */
    const renderChat = ({ item }) => {
        // Identify the other participant based on chat data
        // Assuming that the backend returns relevant chats for the current user
        return (
            <TouchableOpacity
                style={styles.chatCard}
                onPress={() => handleChatPress(item)}
                disabled={loadingChatId === item._id} // Disable if loading
            >
                {/* Chat Avatar or Initial for User1 */}
                <View style={styles.avatarContainer}>
                    <Text style={styles.avatarText}>
                        {item.user1.username.charAt(0).toUpperCase()}
                    </Text>
                </View>

                {/* Chat Avatar or Initial for User2 */}
                <View style={styles.avatarContainer}>
                    <Text style={styles.avatarText}>
                        {item.user2.username.charAt(0).toUpperCase()}
                    </Text>
                </View>

                {/* Chat Details */}
                <View style={styles.chatContent}>
                    <Text style={styles.chatName}>
                        {item.user1.username} & {item.user2.username}
                    </Text>
                    {/* Optionally, display the latest message */}
                    {item.lastMessage ? (
                        <Text style={styles.latestMessage} numberOfLines={1}>
                            {item.lastMessage}
                        </Text>
                    ) : null}
                </View>

                {/* Loading Indicator for this chat */}
                {loadingChatId === item._id && (
                    <ActivityIndicator size="small" color="#4CAF50" style={styles.chatLoading} />
                )}
            </TouchableOpacity>
        );
    };

    /**
     * Renders a generic message when there are no chats.
     */
    const renderEmptyChats = () => {
        return (
            <View style={styles.emptyContainer}>
                <Ionicons name="chatbubble-ellipses-outline" size={60} color="#999" />
                <Text style={styles.emptyText}>No chats created yet. Start a new conversation!</Text>
                <TouchableOpacity
                    style={styles.createChatButton}
                    onPress={handleCreateNewChat}
                >
                    <Text style={styles.createChatButtonText}>Create New Chat</Text>
                </TouchableOpacity>
            </View>
        );
    };

    /**
     * Handles the creation of a new chat.
     */
    const handleCreateNewChat = () => {
        console.log('Create new chat button pressed');
        // Navigate to CreateChatScreen
        navigation.navigate('CreateChat'); // Ensure that 'CreateChat' is correctly registered in your navigator
    };

    return (
        <SafeAreaView style={styles.container}>
            {loading ? (
                <View style={styles.loaderContainer}>
                    <ActivityIndicator size="large" color="#4CAF50" />
                </View>
            ) : error ? (
                <View style={styles.errorContainer}>
                    <Text style={styles.errorText}>Failed to load chats.</Text>
                    <TouchableOpacity onPress={fetchChats} style={styles.retryButton}>
                        <Text style={styles.retryButtonText}>Retry</Text>
                    </TouchableOpacity>
                </View>
            ) : chats.length === 0 ? (
                renderEmptyChats()
            ) : (
                <FlatList
                    data={chats}
                    keyExtractor={(item) => item._id}
                    renderItem={renderChat}
                    contentContainerStyle={styles.listContainer}
                    ItemSeparatorComponent={() => <View style={styles.separator} />}
                />
            )}

            {/* Floating Action Button to Create New Chat */}
            {chats.length > 0 && (
                <TouchableOpacity
                    style={styles.fab}
                    onPress={handleCreateNewChat}
                >
                    <Ionicons name="add" size={30} color="#fff" />
                </TouchableOpacity>
            )}
        </SafeAreaView>
    );

};

export default MessagesScreen;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
    },
    listContainer: {
        padding: 10,
    },
    chatCard: {
        flexDirection: 'row',
        backgroundColor: '#fff',
        padding: 15,
        borderRadius: 10,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOpacity: 0.05,
        shadowRadius: 5,
        shadowOffset: { width: 0, height: 2 },
        elevation: 2,
        position: 'relative',
    },
    avatarContainer: {
        backgroundColor: '#4CAF50',
        width: 50,
        height: 50,
        borderRadius: 25,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 10,
    },
    avatarText: {
        color: '#fff',
        fontSize: 20,
        fontWeight: 'bold',
    },
    chatContent: {
        flex: 1,
    },
    chatName: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
    },
    latestMessage: {
        fontSize: 14,
        color: '#666',
        marginTop: 4,
    },
    separator: {
        height: 10,
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
        padding: 20,
    },
    errorText: {
        fontSize: 18,
        color: '#F44336',
        marginBottom: 10,
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
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    emptyText: {
        fontSize: 18,
        color: '#777',
        textAlign: 'center',
        marginTop: 15,
    },
    createChatButton: {
        marginTop: 20,
        backgroundColor: '#4CAF50',
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 5,
    },
    createChatButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
    fab: {
        position: 'absolute',
        bottom: 30,
        right: 30,
        backgroundColor: '#4CAF50',
        width: 60,
        height: 60,
        borderRadius: 30,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOpacity: 0.3,
        shadowRadius: 5,
        shadowOffset: { width: 0, height: 2 },
        elevation: 5,
    },
    chatLoading: {
        position: 'absolute',
        right: 15,
        top: '50%',
        transform: [{ translateY: -10 }],
    },
});
