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
    Dimensions,
    Platform,
    Animated,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { API_ROUTE, IP_PORT } from '@env';
import { Alert } from 'react-native';

// Get device width for responsive design
const { width } = Dimensions.get('window');

const SearchScreen = ({ navigation }) => {
    const [searchQuery, setSearchQuery] = useState('');
    const [filteredUsers, setFilteredUsers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Animation value for search bar
    const [searchBarAnim] = useState(new Animated.Value(0));

    useEffect(() => {
        // Animate search bar on mount
        Animated.spring(searchBarAnim, {
            toValue: 1,
            friction: 8,
            tension: 40,
            useNativeDriver: true,
        }).start();

        if (searchQuery.trim().length > 0) {
            fetchUsers(searchQuery);
        } else {
            setFilteredUsers([]);
            setError(null);
        }
    }, [searchQuery]);

    const fetchUsers = async (query) => {
        try {
            setLoading(true);
            setError(null);

            const encodedQuery = encodeURIComponent(query);
            const response = await fetch(`${IP_PORT}${API_ROUTE}/users/search?q=${encodedQuery}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            if (!response.ok) {
                throw new Error('Failed to fetch users');
            }

            const data = await response.json();
            console.log('Search Results:', JSON.stringify(data, null, 2));

            if (data.data && Array.isArray(data.data.users)) {
                setFilteredUsers(data.data.users);
            } else {
                throw new Error('Invalid data format received from server');
            }
        } catch (err) {
            setError(err.message || 'Something went wrong!');
            console.error('Error fetching users:', err.message);
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
            console.error('Error sending friend request:', err.message);
            Alert.alert('Error', err.message || 'Failed to send friend request');
        }
    };

    const navigateToUserProfile = (userData) => {
        navigation.navigate('UserProfile', { userData });
    };

    const renderUser = ({ item, index }) => {
        const fullName = `${item.firstName ? item.firstName : ''} ${item.lastName ? item.lastName : ''}`.trim();

        // Calculate animation delay based on index
        const animationDelay = index * 100;

        return (
            <Animated.View
                style={[
                    styles.userCard,
                    {
                        opacity: new Animated.Value(1),
                        transform: [{
                            translateY: new Animated.Value(0)
                        }]
                    }
                ]}
            >
                <TouchableOpacity
                    style={styles.userCardContent}
                    activeOpacity={0.7}
                    onPress={() => navigateToUserProfile(item)}
                >
                    <View style={styles.userAvatarContainer}>
                        <View style={styles.userAvatar}>
                            <Text style={styles.userAvatarText}>
                                {fullName.charAt(0).toUpperCase() || item.username.charAt(0).toUpperCase()}
                            </Text>
                        </View>
                    </View>

                    <View style={styles.userInfo}>
                        <Text style={styles.userName}>
                            {fullName.length > 0 ? fullName : item.username}
                        </Text>
                        <Text style={styles.userUsername}>@{item.username}</Text>
                        {item.bio && (
                            <Text numberOfLines={2} style={styles.userBio}>
                                {item.bio}
                            </Text>
                        )}
                    </View>

                    <TouchableOpacity
                        style={styles.friendRequestButton}
                        onPress={(e) => {
                            e.stopPropagation();
                            sendFriendRequest(item._id);
                        }}
                    >
                        <Ionicons name="person-add-outline" size={20} color="#FFFFFF" />
                        <Text style={styles.friendRequestButtonText}>Connect</Text>
                    </TouchableOpacity>
                </TouchableOpacity>
            </Animated.View>
        );
    };

    return (
        <SafeAreaView style={styles.container}>
            <Animated.View
                style={[
                    styles.searchContainer,
                    {
                        transform: [{
                            translateY: searchBarAnim.interpolate({
                                inputRange: [0, 1],
                                outputRange: [-50, 0]
                            })
                        }],
                        opacity: searchBarAnim
                    }
                ]}
            >
                <View style={styles.searchInputContainer}>
                    <Ionicons name="search-outline" size={22} color="#666" style={styles.searchIcon} />
                    <TextInput
                        style={styles.searchInput}
                        placeholder="Search for users..."
                        placeholderTextColor="#999"
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                        autoCorrect={false}
                        autoCapitalize="none"
                        clearButtonMode="while-editing"
                    />
                </View>
            </Animated.View>

            {loading && (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#007AFF" />
                    <Text style={styles.loadingText}>Finding users...</Text>
                </View>
            )}

            {error && !loading && (
                <View style={styles.centeredContainer}>
                    <Ionicons name="alert-circle" size={64} color="#FF3B30" />
                    <Text style={styles.errorText}>{error}</Text>
                    <TouchableOpacity
                        style={styles.retryButton}
                        onPress={() => fetchUsers(searchQuery)}
                    >
                        <Text style={styles.retryButtonText}>Try Again</Text>
                    </TouchableOpacity>
                </View>
            )}

            {!loading && !error && (
                <FlatList
                    data={filteredUsers}
                    keyExtractor={(item) => item._id}
                    renderItem={renderUser}
                    ListEmptyComponent={
                        searchQuery.trim().length > 0 ? (
                            <View style={styles.noResultsContainer}>
                                <Ionicons name="search" size={64} color="#999" />
                                <Text style={styles.noResultsTitle}>No Users Found</Text>
                                <Text style={styles.noResultsText}>
                                    Try searching with different keywords
                                </Text>
                            </View>
                        ) : (
                            <View style={styles.noResultsContainer}>
                                <Ionicons name="people" size={64} color="#999" />
                                <Text style={styles.noResultsTitle}>Find Your Friends</Text>
                                <Text style={styles.noResultsText}>
                                    Search by name or username to connect
                                </Text>
                            </View>
                        )
                    }
                    keyboardShouldPersistTaps="handled"
                    contentContainerStyle={styles.listContainer}
                    showsVerticalScrollIndicator={false}
                />
            )}
        </SafeAreaView>
    );
};

export default SearchScreen;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFFFFF',
    },
    searchContainer: {
        paddingHorizontal: 20,
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#F0F0F0',
        backgroundColor: '#FFFFFF',
    },
    searchInputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F8F8F8',
        borderRadius: 12,
        paddingHorizontal: 16,
        height: 48,
        ...Platform.select({
            ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.1,
                shadowRadius: 8,
            },
            android: {
                elevation: 4,
            },
        }),
    },
    searchIcon: {
        marginRight: 12,
    },
    searchInput: {
        flex: 1,
        fontSize: 16,
        color: '#333333',
        fontWeight: '400',
    },
    listContainer: {
        paddingHorizontal: 20,
        paddingTop: 12,
        paddingBottom: 20,
    },
    userCard: {
        marginBottom: 12,
        borderRadius: 16,
        backgroundColor: '#FFFFFF',
        ...Platform.select({
            ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.1,
                shadowRadius: 8,
            },
            android: {
                elevation: 4,
            },
        }),
    },
    userCardContent: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
    },
    userAvatarContainer: {
        marginRight: 16,
    },
    userAvatar: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: '#007AFF',
        alignItems: 'center',
        justifyContent: 'center',
    },
    userAvatarText: {
        color: '#FFFFFF',
        fontSize: 20,
        fontWeight: '600',
    },
    userInfo: {
        flex: 1,
    },
    userName: {
        fontSize: 16,
        fontWeight: '600',
        color: '#333333',
        marginBottom: 4,
    },
    userUsername: {
        fontSize: 14,
        color: '#666666',
        marginBottom: 4,
    },
    userBio: {
        fontSize: 14,
        color: '#666666',
        lineHeight: 20,
    },
    friendRequestButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#007AFF',
        paddingVertical: 8,
        paddingHorizontal: 16,
        borderRadius: 20,
        marginLeft: 12,
    },
    friendRequestButtonText: {
        color: '#FFFFFF',
        fontSize: 14,
        fontWeight: '600',
        marginLeft: 6,
    },
    noResultsContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingTop: width * 0.2,
    },
    noResultsTitle: {
        fontSize: 20,
        fontWeight: '600',
        color: '#333333',
        marginTop: 16,
        marginBottom: 8,
    },
    noResultsText: {
        fontSize: 16,
        color: '#666666',
        textAlign: 'center',
    },
    centeredContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    errorText: {
        fontSize: 16,
        fontWeight: '500',
        color: '#FF3B30',
        textAlign: 'center',
        marginTop: 16,
        marginBottom: 12,
    },
    retryButton: {
        backgroundColor: '#007AFF',
        paddingVertical: 12,
        paddingHorizontal: 24,
        borderRadius: 20,
        marginTop: 8,
    },
    retryButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '600',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingText: {
        marginTop: 16,
        fontSize: 16,
        color: '#666666',
        fontWeight: '500',
    },
});