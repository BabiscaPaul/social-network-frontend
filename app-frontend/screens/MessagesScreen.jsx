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

// At the top of MessagesScreen.js, add:
// import { LinearGradient } from 'expo-linear-gradient';
// import { BlurView } from 'expo-blur';

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
            console.error('Error fetching chats:', err.message);
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
        return (
            <TouchableOpacity
                style={styles.chatCard}
                onPress={() => handleChatPress(item)}
                disabled={loadingChatId === item._id}
            >
                {/* Avatar Group with refined styling */}
                <View style={styles.avatarGroup}>
                    {/* First Avatar */}
                    <View style={[styles.avatarContainer, { backgroundColor: '#2563eb' }]}>
                        <Text style={styles.avatarText}>
                            {item.user1.username.charAt(0).toUpperCase()}
                        </Text>
                    </View>

                    {/* Second Avatar with subtle overlap */}
                    <View style={[styles.avatarContainer, styles.secondAvatar, { backgroundColor: '#3b82f6' }]}>
                        <Text style={styles.avatarText}>
                            {item.user2.username.charAt(0).toUpperCase()}
                        </Text>
                    </View>
                </View>

                <View style={styles.chatContent}>
                    <Text style={styles.chatName} numberOfLines={1}>
                        {item.user1.username} & {item.user2.username}
                    </Text>
                    {item.lastMessage && (
                        <Text style={styles.latestMessage} numberOfLines={1}>
                            {item.lastMessage}
                        </Text>
                    )}
                </View>

                {loadingChatId === item._id && (
                    <ActivityIndicator
                        size="small"
                        color="#2563eb"
                        style={styles.chatLoading}
                    />
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
                <View style={styles.emptyIconContainer}>
                    <Ionicons
                        name="chatbubble-ellipses-outline"
                        size={70}
                        color="#b48ed6"
                    />
                </View>
                <Text style={styles.emptyTitle}>No Conversations Yet</Text>
                <Text style={styles.emptyText}>
                    Start connecting with others by creating a new chat
                </Text>
                <TouchableOpacity
                    style={styles.createChatButton}
                    onPress={handleCreateNewChat}
                >
                    <Text style={styles.createChatButtonText}>
                        Start New Chat
                    </Text>
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
        backgroundColor: '#fafafa',
    },
    listContainer: {
        padding: 16,
        paddingBottom: 120, // Extra space for FAB
    },
    chatCard: {
        flexDirection: 'row',
        backgroundColor: '#ffffff',
        padding: 16,
        marginVertical: 6,
        borderRadius: 16,
        alignItems: 'center',
        // Refined shadow for depth
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 3,
        // Subtle border for additional definition
        borderWidth: 1,
        borderColor: 'rgba(0, 0, 0, 0.05)',
    },
    avatarGroup: {
        flexDirection: 'row',
        width: 80,
        alignItems: 'center',
        marginRight: 8,
    },
    avatarContainer: {
        width: 48,
        height: 48,
        borderRadius: 24,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.15,
        shadowRadius: 3,
        elevation: 2,
    },
    secondAvatar: {
        marginLeft: -16,
    },
    avatarText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: '600',
    },
    chatContent: {
        flex: 1,
        marginLeft: 8,
    },
    chatName: {
        fontSize: 16,
        fontWeight: '600',
        color: '#1a1a1a',
        marginBottom: 4,
        letterSpacing: 0.2,
    },
    latestMessage: {
        fontSize: 14,
        color: '#666',
        letterSpacing: 0.1,
        lineHeight: 20,
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 32,
        backgroundColor: '#fafafa',
    },
    emptyIconContainer: {
        backgroundColor: 'rgba(37, 99, 235, 0.1)',  // Lighter shade of primary blue
        padding: 24,
        borderRadius: 32,
        marginBottom: 24,
    },
    emptyTitle: {
        fontSize: 24,
        fontWeight: '600',
        color: '#1a1a1a',
        marginBottom: 12,
        letterSpacing: 0.3,
    },
    emptyText: {
        fontSize: 16,
        color: '#666',
        textAlign: 'center',
        lineHeight: 24,
        marginBottom: 32,
        maxWidth: '80%',
    },
    createChatButton: {
        backgroundColor: '#2563eb',  // Primary blue
        paddingVertical: 14,
        paddingHorizontal: 32,
        borderRadius: 25,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.15,
        shadowRadius: 8,
        elevation: 4,
    },
    fab: {
        position: 'absolute',
        bottom: 100,
        right: 24,
        backgroundColor: '#2563eb',  // Primary blue
        width: 56,
        height: 56,
        borderRadius: 28,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 6,
    },
    chatLoading: {
        marginLeft: 16,
    },
});