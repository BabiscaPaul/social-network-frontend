// SearchScreen.jsx

import React, { useState, useEffect } from 'react';
import {
    SafeAreaView,
    StyleSheet,
    Text,
    FlatList,
    View,
    TouchableOpacity,
    TextInput,
    ActivityIndicator,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { API_ROUTE, IP_PORT } from '@env';
import { Alert } from 'react-native';

const SearchScreen = () => {
    const [searchQuery, setSearchQuery] = useState('');
    const [filteredUsers, setFilteredUsers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        // Fetch users only if searchQuery is not empty
        if (searchQuery.trim().length > 0) {
            fetchUsers(searchQuery);
        } else {
            // If searchQuery is empty, clear the results
            setFilteredUsers([]);
            setError(null);
        }
    }, [searchQuery]);

    const fetchUsers = async (query) => {
        try {
            setLoading(true);
            setError(null);

            // Encode the query to handle special characters
            const encodedQuery = encodeURIComponent(query);

            // Fetch from the search endpoint
            const response = await fetch(`${IP_PORT}${API_ROUTE}/users/search?q=${encodedQuery}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    // Add other headers if necessary
                },
            });

            if (!response.ok) {
                throw new Error('Failed to fetch users');
            }

            const data = await response.json();
            console.log('Search Results:', JSON.stringify(data, null, 2));

            // Adjust based on actual response structure
            if (data.data && Array.isArray(data.data.users)) {
                setFilteredUsers(data.data.users);
            } else {
                throw new Error('Invalid data format received from server');
            }
        } catch (err) {
            setError(err.message || 'Something went wrong!');
            console.error('Error fetching users:', err);
        } finally {
            setLoading(false);
        }
    };

    const sendFriendRequest = async (userId) => {
        try {
            const userIdString = String(userId);

            const response = await fetch(`${IP_PORT}${API_ROUTE}/users/sendFriendRequest`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',

                },
                body: JSON.stringify({ "to": userIdString }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                const errorMessage = errorData.message || 'Failed to send friend request';
                throw new Error(errorMessage);
            }

            const data = await response.json();
            console.log('Friend Request Sent:', data);

            Alert.alert('Success', 'Friend request sent successfully!');
        } catch (err) {
            console.error('Error sending friend request:', err);
            Alert.alert('Error', err.message || 'Failed to send friend request');
        }
    };



    // Function to render each user item
    const renderUser = ({ item }) => {
        const fullName = `${item.firstName ? item.firstName : ''} ${item.lastName ? item.lastName : ''}`.trim();

        return (
            <TouchableOpacity style={styles.userCard} activeOpacity={0.7}>
                <View style={styles.userInfo}>
                    <Text style={styles.userName}>
                        {fullName.length > 0 ? fullName : item.username}
                    </Text>
                    <Text style={styles.userUsername}>@{item.username}</Text>
                    {item.bio ? <Text style={styles.userBio}>{item.bio}</Text> : null}
                </View>
                {/* Send Friend Request Button */}
                <TouchableOpacity
                    style={styles.friendRequestButton}
                    onPress={() => sendFriendRequest(item._id)}
                >
                    <Text style={styles.friendRequestButtonText}>Send Friend Request</Text>
                </TouchableOpacity>
            </TouchableOpacity>
        );
    };

    return (
        <SafeAreaView style={styles.container}>
            {/* Search Bar */}
            <View style={styles.searchContainer}>
                <Ionicons name="search-outline" size={20} color="#666" style={styles.searchIcon} />
                <TextInput
                    style={styles.searchInput}
                    placeholder="Search for users..."
                    placeholderTextColor="#666"
                    value={searchQuery}
                    onChangeText={(text) => setSearchQuery(text)}
                    autoCorrect={false}
                    autoCapitalize="none"
                    clearButtonMode="while-editing"
                />
            </View>

            {/* Loading Indicator */}
            {loading && (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#000" />
                    <Text style={styles.loadingText}>Searching...</Text>
                </View>
            )}

            {/* Error Message */}
            {error && !loading && (
                <View style={styles.centeredContainer}>
                    <Ionicons name="alert-circle" size={60} color="red" />
                    <Text style={styles.errorText}>{error}</Text>
                    <TouchableOpacity style={styles.retryButton} onPress={() => fetchUsers(searchQuery)}>
                        <Text style={styles.retryButtonText}>Retry</Text>
                    </TouchableOpacity>
                </View>
            )}

            {/* Search Results */}
            {!loading && !error && (
                <FlatList
                    data={filteredUsers}
                    keyExtractor={(item) => item._id}
                    renderItem={renderUser}
                    ListEmptyComponent={
                        searchQuery.trim().length > 0 ? (
                            <View style={styles.noResultsContainer}>
                                <Ionicons name="search-outline" size={60} color="#999" />
                                <Text style={styles.noResultsText}>No users found.</Text>
                            </View>
                        ) : (
                            <View style={styles.noResultsContainer}>
                                <Ionicons name="people-outline" size={60} color="#999" />
                                <Text style={styles.noResultsText}>Start typing to search for users.</Text>
                            </View>
                        )
                    }
                    keyboardShouldPersistTaps="handled"
                    contentContainerStyle={styles.listContainer}
                />
            )}
        </SafeAreaView>
    );
};

export default SearchScreen;

//////////////////////////////////////
// Styles
//////////////////////////////////////
const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
        paddingHorizontal: 15,
    },
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#f0f0f0',
        borderRadius: 25,
        paddingHorizontal: 15,
        paddingVertical: 10,
        marginVertical: 10,
    },
    searchIcon: {
        marginRight: 10,
    },
    searchInput: {
        flex: 1,
        fontSize: 16,
        color: '#333',
    },
    listContainer: {
        paddingBottom: 20,
    },
    userCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fafafa',
        padding: 15,
        borderRadius: 10,
        marginVertical: 5,
        shadowColor: '#000',
        shadowOpacity: 0.05,
        shadowRadius: 5,
        shadowOffset: { width: 0, height: 2 },
        elevation: 1,
    },
    userInfo: {
        flex: 1,
    },
    userName: {
        fontSize: 18,
        fontWeight: '600',
        color: '#333',
    },
    userUsername: {
        fontSize: 14,
        color: '#666',
        marginTop: 2,
    },
    userBio: {
        fontSize: 14,
        color: '#555',
        marginTop: 4,
    },
    friendRequestButton: {
        backgroundColor: '#007bff',
        paddingVertical: 6,
        paddingHorizontal: 12,
        borderRadius: 8,
        marginLeft: 10,
    },
    friendRequestButtonText: {
        color: '#fff',
        fontSize: 14,
        fontWeight: '500',
    },
    noResultsContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 50,
    },
    noResultsText: {
        fontSize: 16,
        color: '#666',
        marginTop: 10,
    },
    centeredContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
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
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingText: {
        marginTop: 10,
        fontSize: 16,
        color: '#333',
    },
});
