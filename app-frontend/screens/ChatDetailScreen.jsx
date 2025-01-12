// ChatDetailScreen.js

import React, { useState, useEffect, useRef } from 'react';
import {
    SafeAreaView,
    View,
    Text,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    TextInput,
    KeyboardAvoidingView,
    Platform,
    ActivityIndicator,
    Alert,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { IP_PORT, API_ROUTE } from '@env'; 

const ChatDetailScreen = ({ route, navigation }) => {
    // Destructure params from route
    const {
        chatId,
        messages,
        user1Username,
        user2Username,
        user1Id,
        user2Id,
    } = route.params;

    // Local state
    const [currentUser, setCurrentUser] = useState(null);
    const [messageList, setMessageList] = useState(messages || []);
    const [newMessage, setNewMessage] = useState('');
    const [sending, setSending] = useState(false);
    const [loadingCurrentUser, setLoadingCurrentUser] = useState(true);
    const [errorFetchingUser, setErrorFetchingUser] = useState(null);

    // For auto-scrolling to the bottom
    const flatListRef = useRef(null);

    /**
     * Fetch the current user data
     */
    const fetchCurrentUser = async () => {
        try {
            const response = await fetch(`${IP_PORT}${API_ROUTE}/users/me`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    // Include auth headers if necessary
                    // 'Authorization': `Bearer <token>`,
                },
            });

            if (!response.ok) {
                throw new Error('Failed to fetch current user data');
            }

            const data = await response.json();

            if (data.status === 'success' && data.data.user) {
                setCurrentUser(data.data.user);
            } else {
                throw new Error('Invalid data format received from server');
            }
        } catch (err) {
            setErrorFetchingUser(err.message || 'Something went wrong!');
            Alert.alert('Error', `Failed to fetch user data: ${err.message}`);
        } finally {
            setLoadingCurrentUser(false);
        }
    };

    useEffect(() => {
        fetchCurrentUser();
    }, []);

    /**
     * Scroll to the latest message whenever messageList changes
     */
    useEffect(() => {
        if (flatListRef.current && messageList.length > 0) {
            flatListRef.current.scrollToEnd({ animated: true });
        }
    }, [messageList]);

    /**
     * Send a new message
     */
    const handleSendMessage = async () => {
        if (newMessage.trim() === '') {
            Alert.alert('Empty Message', 'Please enter a message to send.');
            return;
        }

        if (!currentUser) {
            Alert.alert('Error', 'User data not loaded. Please try again later.');
            return;
        }

        try {
            setSending(true);

            // Determine if current user is user1 or user2
            const isUser1 = currentUser._id === user1Id;
            const senderId = isUser1 ? user1Id : user2Id;
            const receiverId = isUser1 ? user2Id : user1Id;

            // Build the request body
            const requestBody = {
                chat: chatId,
                sender: senderId,
                receiver: receiverId,
                content: newMessage.trim(),
            };

            // Send request to backend
            const response = await fetch(`${IP_PORT}${API_ROUTE}/chats/message`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(requestBody),
            });

            if (!response.ok) {
                throw new Error('Failed to send message');
            }

            const data = await response.json();

            if (data.status === 'success' && data.data.message) {
                let newMessageData = data.data.message;

                // Ensure the sender object is correct
                if (!newMessageData.sender || newMessageData.sender._id !== currentUser._id) {
                    newMessageData.sender = {
                        _id: currentUser._id,
                        username: currentUser.username,
                    };
                }

                // Append new message
                setMessageList([...messageList, newMessageData]);
                setNewMessage('');
            } else {
                throw new Error('Invalid data format received from server');
            }
        } catch (err) {
            Alert.alert('Error', `Failed to send message: ${err.message}`);
        } finally {
            setSending(false);
        }
    };

    /**
     * Render a single message bubble
     */
    const renderMessage = ({ item }) => {
        if (!currentUser) {
            // Before currentUser is set, default to left alignment
            return (
                <View style={[styles.messageContainer, styles.messageLeft]}>
                    <View style={[styles.messageBubble, styles.otherUserBubble]}>
                        <Text style={styles.senderUsername}>{item.sender.username}</Text>
                        <Text style={styles.messageText}>{item.content}</Text>
                    </View>
                </View>
            );
        }

        const isCurrentUser = item.sender._id === currentUser._id;
        const senderUsername = isCurrentUser ? 'You' : item.sender.username;

        return (
            <View
                style={[
                    styles.messageContainer,
                    isCurrentUser ? styles.messageRight : styles.messageLeft,
                ]}
            >
                <View
                    style={[
                        styles.messageBubble,
                        isCurrentUser ? styles.currentUserBubble : styles.otherUserBubble,
                    ]}
                >
                    <Text style={styles.senderUsername}>{senderUsername}</Text>
                    <Text style={styles.messageText}>{item.content}</Text>
                </View>
            </View>
        );
    };

    // Loader if fetching user data
    if (loadingCurrentUser) {
        return (
            <SafeAreaView style={styles.loaderContainer}>
                <ActivityIndicator size="large" color="#4CAF50" />
            </SafeAreaView>
        );
    }

    // Error view if fetching user fails
    if (errorFetchingUser) {
        return (
            <SafeAreaView style={styles.errorContainer}>
                <Text style={styles.errorText}>Failed to load user data.</Text>
                <TouchableOpacity onPress={fetchCurrentUser} style={styles.retryButton}>
                    <Text style={styles.retryButtonText}>Retry</Text>
                </TouchableOpacity>
            </SafeAreaView>
        );
    }

    return (
        <KeyboardAvoidingView
            style={{ flex: 1 }}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            keyboardVerticalOffset={Platform.OS === 'ios' ? 60 : 20}
        >
            <SafeAreaView style={styles.container}>
                <FlatList
                    ref={flatListRef}
                    data={messageList}
                    keyExtractor={(item) => item._id}
                    renderItem={renderMessage}
                    contentContainerStyle={styles.flatListContainer}
                    showsVerticalScrollIndicator={false}
                />

        
                <View style={styles.inputContainer}>
                    <TextInput
                        style={styles.textInput}
                        placeholder="Type a message..."
                        value={newMessage}
                        onChangeText={setNewMessage}
                        multiline
                    />
                    <TouchableOpacity
                        style={styles.sendButton}
                        onPress={handleSendMessage}
                        disabled={sending}
                    >
                        {sending ? (
                            <ActivityIndicator color="#fff" />
                        ) : (
                            <Ionicons name="send" size={24} color="#fff" />
                        )}
                    </TouchableOpacity>
                </View>
            </SafeAreaView>
        </KeyboardAvoidingView>
    );
};

export default ChatDetailScreen;

const styles = StyleSheet.create({
    /**
     * Container for the whole screen background
     */
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
    },
    /**
     * Styles for the flatList container
     * - 'paddingBottom' ensures the last message won't be hidden behind the input
     *   if there's no enough scrollable space
     */
    flatListContainer: {
        padding: 10,
        paddingBottom: 60,
    },

    /**
     * Each message container
     */
    messageContainer: {
        marginVertical: 5,
        flexDirection: 'row',
    },
    /**
     * Align messages to the left
     */
    messageLeft: {
        justifyContent: 'flex-start',
    },
    /**
     * Align messages to the right
     */
    messageRight: {
        justifyContent: 'flex-end',
    },
    /**
     * The bubble styling
     */
    messageBubble: {
        borderRadius: 15,
        padding: 10,
        maxWidth: '80%',
    },
    /**
     * Bubble for the other user
     */
    otherUserBubble: {
        backgroundColor: '#3b82f6',
    },
    /**
     * Bubble for the current user
     */
    currentUserBubble: {
        backgroundColor: '#2563eb',
    },
    /**
     * Username text inside bubble
     */
    senderUsername: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 5,
    },
    /**
     * Message text
     */
    messageText: {
        color: '#000',
        fontSize: 16,
    },

    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        borderRadius: 25,
        paddingHorizontal: 15,
        marginHorizontal: 10,
        marginBottom: 60,  
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowRadius: 5,
        shadowOffset: { width: 0, height: 2 },
        elevation: 2,
    },
    /**
     * TextInput to enter messages
     * 'maxHeight' helps if multi-line input grows too large
     */
    textInput: {
        flex: 1,
        maxHeight: 100,
        fontSize: 16,
    },
    /**
     * Send button on the right side
     */
    sendButton: {
        backgroundColor: '#2563eb',
        borderRadius: 20,
        width: 40,
        height: 40,
        justifyContent: 'center',
        alignItems: 'center',
        marginLeft: 10,
    },
    /**
     * Loader container if fetching data
     */
    loaderContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    /**
     * Error screen container
     */
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
});
