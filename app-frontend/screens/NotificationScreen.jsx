// NotificationScreen.js

import React, { useState } from 'react';
import {
    SafeAreaView,
    StyleSheet,
    Text,
    FlatList,
    View,
    TouchableOpacity,
    ActivityIndicator,
    Alert,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { API_ROUTE, IP_PORT } from '@env'; // Ensure you have these in your .env file

const NotificationScreen = ({ route, navigation }) => {
    // Initialize local state for notifications and loading states
    const [notificationList, setNotificationList] = useState(route.params.notifications);
    const [loadingIds, setLoadingIds] = useState({});

    /**
     * Handles accepting or declining a friend request.
     *
     * @param {boolean} isAccepted - True if accepted, false if declined.
     * @param {string} notificationId - The unique ID of the notification.
     */
    const handleFriendRequest = async (isAccepted, notificationId) => {
        try {
            // Set loading state for this notification
            setLoadingIds((prev) => ({ ...prev, [notificationId]: true }));

            // Define the endpoint URL
            const endpoint = `${IP_PORT}${API_ROUTE}/notifications/${notificationId}`;

            // Make the POST request with the decision
            const response = await fetch(endpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    // Include authentication headers if required
                    // 'Authorization': `Bearer your-token-here`,
                },
                body: JSON.stringify({ decision: isAccepted }),
            });

            if (!response.ok) {
                throw new Error('Failed to process friend request');
            }

            const data = await response.json();
            console.log(`Friend request ${isAccepted ? 'accepted' : 'declined'}:`, data);

            // Remove the notification from the list
            setNotificationList((prevList) =>
                prevList.filter((notification) => notification._id !== notificationId)
            );

            // Optionally, you can refresh the notifications from the server
            // For now, we're just removing it locally
        } catch (error) {
            console.error(`Error processing friend request:`, error);
            Alert.alert('Error', `Failed to process friend request: ${error.message}`);
        } finally {
            // Remove loading state for this notification
            setLoadingIds((prev) => ({ ...prev, [notificationId]: false }));
        }
    };

    /**
     * Renders each notification item in the FlatList.
     *
     * @param {object} param0 - The item object from FlatList.
     * @returns {JSX.Element} - The rendered notification card.
     */
    const renderNotification = ({ item }) => {
        const isLoading = loadingIds[item._id] || false;

        return (
            <View style={styles.notificationCard}>
                {/* Avatar or Initial */}
                <View style={styles.avatarContainer}>
                    <Text style={styles.avatarText}>
                        {item.from.username.charAt(0).toUpperCase()}
                    </Text>
                </View>

                {/* Notification Details */}
                <View style={styles.notificationContent}>
                    <Text style={styles.notificationText}>
                        <Text style={styles.username}>{item.from.username}</Text> has sent you a friend request.
                    </Text>

                    {/* Action Buttons */}
                    <View style={styles.actionButtons}>
                        <TouchableOpacity
                            style={[styles.button, styles.acceptButton]}
                            onPress={() => handleFriendRequest(true, item._id)}
                            disabled={isLoading}
                        >
                            {isLoading ? (
                                <ActivityIndicator color="#fff" />
                            ) : (
                                <Text style={styles.buttonText}>Accept</Text>
                            )}
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[styles.button, styles.declineButton]}
                            onPress={() => handleFriendRequest(false, item._id)}
                            disabled={isLoading}
                        >
                            {isLoading ? (
                                <ActivityIndicator color="#fff" />
                            ) : (
                                <Text style={styles.buttonText}>Decline</Text>
                            )}
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        );
    };

    return (
        <SafeAreaView style={styles.container}>
            {notificationList.length === 0 ? (
                <View style={styles.emptyContainer}>
                    <Ionicons name="notifications-off-outline" size={60} color="#999" />
                    <Text style={styles.emptyText}>No friend requests at the moment.</Text>
                </View>
            ) : (
                <FlatList
                    data={notificationList}
                    keyExtractor={(item) => item._id}
                    renderItem={renderNotification}
                    contentContainerStyle={styles.listContainer}
                    ItemSeparatorComponent={() => <View style={styles.separator} />}
                />
            )}
        </SafeAreaView>
    );
};

export default NotificationScreen;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
    },
    listContainer: {
        padding: 10,
    },
    notificationCard: {
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
    },
    avatarContainer: {
        backgroundColor: '#4CAF50',
        width: 50,
        height: 50,
        borderRadius: 25,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 15,
    },
    avatarText: {
        color: '#fff',
        fontSize: 20,
        fontWeight: 'bold',
    },
    notificationContent: {
        flex: 1,
    },
    notificationText: {
        fontSize: 16,
        color: '#333',
    },
    username: {
        fontWeight: 'bold',
        color: '#000',
    },
    actionButtons: {
        flexDirection: 'row',
        marginTop: 10,
    },
    button: {
        paddingVertical: 6,
        paddingHorizontal: 12,
        borderRadius: 5,
        marginRight: 10,
        minWidth: 80,
        justifyContent: 'center',
        alignItems: 'center',
    },
    acceptButton: {
        backgroundColor: '#4CAF50', // Green
    },
    declineButton: {
        backgroundColor: '#F44336', // Red
    },
    buttonText: {
        color: '#fff',
        fontSize: 14,
        fontWeight: 'bold',
    },
    separator: {
        height: 10,
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    emptyText: {
        marginTop: 15,
        fontSize: 18,
        color: '#999',
    },
});
