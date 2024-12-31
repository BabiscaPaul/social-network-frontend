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
import { IP_PORT, API_ROUTE } from '@env'; // Ensure these are correctly set in your .env file

const ChatDetailScreen = ({ route, navigation }) => {
    const {
        chatId,
        messages,
        user1Username,
        user2Username,
        user1Id,
        user2Id,
    } = route.params;

    const [currentUser, setCurrentUser] = useState(null); // To store current user data
    const [messageList, setMessageList] = useState(messages || []);
    const [newMessage, setNewMessage] = useState('');
    const [sending, setSending] = useState(false);
    const [loadingCurrentUser, setLoadingCurrentUser] = useState(true);
    const [errorFetchingUser, setErrorFetchingUser] = useState(null);
    const flatListRef = useRef(null);

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
     * Scrolls to the bottom of the FlatList whenever a new message is added.
     */
    useEffect(() => {
        if (flatListRef.current && messageList.length > 0) {
            flatListRef.current.scrollToEnd({ animated: true });
        }
    }, [messageList]);

    /**
     * Function to send a new message to the backend.
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

            // Prepare the request body
            const requestBody = {
                chat: chatId,
                sender: senderId,
                receiver: receiverId,
                content: newMessage.trim(),
            };

            // Make the POST request to send the message
            const response = await fetch(`${IP_PORT}${API_ROUTE}/chats/message`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    // Include authentication headers if required
                    // 'Authorization': `Bearer your-token-here`,
                },
                body: JSON.stringify(requestBody),
            });

            if (!response.ok) {
                throw new Error('Failed to send message');
            }

            const data = await response.json();
            console.log('Send Message Response:', data);

            // Validate response structure
            if (data.status === 'success' && data.data.message) {
                let newMessageData = data.data.message;

                // Ensure sender field is correctly set
                if (!newMessageData.sender || newMessageData.sender._id !== currentUser._id) {
                    newMessageData.sender = {
                        _id: currentUser._id,
                        username: currentUser.username,
                    };
                }

                // Append the new message to the message list
                setMessageList([...messageList, newMessageData]);
                setNewMessage('');
            } else {
                throw new Error('Invalid data format received from server');
            }
        } catch (err) {
            console.error('Error sending message:', err);
            Alert.alert('Error', `Failed to send message: ${err.message}`);
        } finally {
            setSending(false);
        }
    };

    /**
     * Renders each message in the FlatList.
     *
     * @param {object} param0 - The item object from FlatList.
     * @returns {JSX.Element} - The rendered message bubble.
     */
    const renderMessage = ({ item }) => {
        if (!currentUser) {
            // If current user data is not loaded, default to left alignment
            return (
                <View style={[styles.messageContainer, styles.messageLeft]}>
                    <View style={[styles.messageBubble, styles.otherUserBubble]}>
                        <Text style={styles.senderUsername}>{item.sender.username}</Text>
                        <Text style={styles.messageText}>{item.content}</Text>
                    </View>
                </View>
            );
        }

        // Determine if the message was sent by the current user using IDs
        const isCurrentUser = item.sender._id === currentUser._id;

        // Log the IDs being compared for debugging
        console.log(`Comparing sender ID: ${item.sender._id} with currentUser ID: ${currentUser._id} (isCurrentUser: ${isCurrentUser})`);

        // Determine the sender's username to display
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
                    {/* Display Sender's Username */}
                    <Text style={styles.senderUsername}>{senderUsername}</Text>
                    {/* Display Message Content */}
                    <Text style={styles.messageText}>{item.content}</Text>
                </View>
            </View>
        );
    };

    if (loadingCurrentUser) {
        return (
            <SafeAreaView style={styles.loaderContainer}>
                <ActivityIndicator size="large" color="#4CAF50" />
            </SafeAreaView>
        );
    }

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
        <SafeAreaView style={styles.container}>
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                style={styles.keyboardAvoidingView}
                keyboardVerticalOffset={90}
            >
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
            </KeyboardAvoidingView>
        </SafeAreaView>
    );

};

export default ChatDetailScreen;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
    },
    flatListContainer: {
        padding: 10,
        paddingBottom: 60, // To avoid overlapping with input
    },
    messageContainer: {
        marginVertical: 5,
        flexDirection: 'row',
    },
    messageLeft: {
        justifyContent: 'flex-start',
    },
    messageRight: {
        justifyContent: 'flex-end',
    },
    messageBubble: {
        borderRadius: 15,
        padding: 10,
        maxWidth: '80%',
    },
    otherUserBubble: {
        backgroundColor: '#e0e0e0',
    },
    currentUserBubble: {
        backgroundColor: '#4CAF50',
    },
    senderUsername: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 5,
    },
    messageText: {
        color: '#000',
        fontSize: 16,
    },
    inputContainer: {
        position: 'absolute',
        bottom: 10,
        left: 10,
        right: 10,
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        borderRadius: 25,
        paddingHorizontal: 15,
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowRadius: 5,
        shadowOffset: { width: 0, height: 2 },
        elevation: 2,
    },
    textInput: {
        flex: 1,
        maxHeight: 100,
        fontSize: 16,
    },
    sendButton: {
        backgroundColor: '#4CAF50',
        borderRadius: 20,
        width: 40,
        height: 40,
        justifyContent: 'center',
        alignItems: 'center',
        marginLeft: 10,
    },
    keyboardAvoidingView: {
        flex: 1,
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
});
