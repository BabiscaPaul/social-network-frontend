import React, { useState } from 'react';
import {
    SafeAreaView,
    View,
    Text,
    StyleSheet,
    ActivityIndicator,
    Image,
    ScrollView,
    TouchableOpacity,
    Alert,
    Dimensions,
} from 'react-native';
import { API_ROUTE, IP_PORT } from '@env';
import Ionicons from 'react-native-vector-icons/Ionicons';

const UserProfile = ({ route, navigation }) => {
    // Extract the userData from route params
    const { userData } = route.params;
    const [isLoading, setIsLoading] = useState(false);

    // Function to format the join date
    const formatJoinDate = () => {
        if (userData.createdAt) {
            const date = new Date(userData.createdAt);
            return `Joined ${date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}`;
        }
        return 'Recently joined';
    };

    // Function to handle friend request
    const handleFriendRequest = async () => {
        try {
            setIsLoading(true);
            const response = await fetch(`${IP_PORT}${API_ROUTE}/users/sendFriendRequest`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ "to": userData._id }),
            });

            if (!response.ok) {
                throw new Error('Failed to send friend request');
            }

            Alert.alert('Success', 'Friend request sent successfully!');
        } catch (error) {
            Alert.alert('Error', error.message);
        } finally {
            setIsLoading(false);
        }
    };

    // Function to start a chat with the user
    const startChat = async () => {
        try {
            setIsLoading(true);
            // Navigate to chat screen or create chat logic here
            navigation.navigate('Messages', {
                screen: 'CreateChat',
                params: { selectedUser: userData }
            });
        } catch (error) {
            Alert.alert('Error', 'Unable to start chat at this moment');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView showsVerticalScrollIndicator={false}>
                {/* Header Section */}
                <View style={styles.header}>
                    <TouchableOpacity
                        style={styles.backButton}
                        onPress={() => navigation.goBack()}
                    >
                        <Ionicons name="arrow-back" size={24} color="#000" />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Profile</Text>
                </View>

                {/* Profile Info Section */}
                <View style={styles.profileSection}>
                    <View style={styles.profileImageContainer}>
                        <Image
                            source={{
                                uri: userData.profileImage || 'https://via.placeholder.com/150/CCC/FFF?text=Avatar'
                            }}
                            style={styles.profileImage}
                        />
                    </View>

                    <Text style={styles.userName}>
                        {`${userData.firstName || ''} ${userData.lastName || ''}`.trim() || userData.username}
                    </Text>
                    <Text style={styles.userHandle}>@{userData.username}</Text>

                    {/* Join Date */}
                    <Text style={styles.joinDate}>{formatJoinDate()}</Text>

                    {/* Bio Section */}
                    {userData.bio && (
                        <View style={styles.bioContainer}>
                            <Text style={styles.bio}>{userData.bio}</Text>
                        </View>
                    )}

                    {/* Action Buttons */}
                    <View style={styles.actionButtons}>
                        <TouchableOpacity
                            style={[styles.actionButton, styles.primaryButton]}
                            onPress={handleFriendRequest}
                            disabled={isLoading}
                        >
                            <Ionicons name="person-add" size={20} color="#FFF" />
                            <Text style={styles.buttonText}>
                                {isLoading ? 'Sending...' : 'Add Friend'}
                            </Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[styles.actionButton, styles.secondaryButton]}
                            onPress={startChat}
                            disabled={isLoading}
                        >
                            <Ionicons name="chatbubble-ellipses" size={20} color="#000" />
                            <Text style={[styles.buttonText, { color: '#000' }]}>Message</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Stats Section */}
                <View style={styles.statsContainer}>
                    <View style={styles.statItem}>
                        <Text style={styles.statNumber}>{userData.posts?.length || 0}</Text>
                        <Text style={styles.statLabel}>Posts</Text>
                    </View>
                    <View style={styles.statDivider} />
                    <View style={styles.statItem}>
                        <Text style={styles.statNumber}>{userData.friends?.length || 0}</Text>
                        <Text style={styles.statLabel}>Friends</Text>
                    </View>
                    <View style={styles.statDivider} />
                    <View style={styles.statItem}>
                        <Text style={styles.statNumber}>{userData.sharedPosts?.length || 0}</Text>
                        <Text style={styles.statLabel}>Shares</Text>
                    </View>
                </View>

                {/* Loading Overlay */}
                {isLoading && (
                    <View style={styles.loadingOverlay}>
                        <ActivityIndicator size="large" color="#000" />
                    </View>
                )}
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFFFFF',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#F0F0F0',
    },
    backButton: {
        padding: 8,
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: '600',
        marginLeft: 12,
    },
    profileSection: {
        alignItems: 'center',
        paddingVertical: 24,
    },
    profileImageContainer: {
        width: 120,
        height: 120,
        borderRadius: 60,
        elevation: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        marginBottom: 16,
        backgroundColor: '#FFF',
    },
    profileImage: {
        width: '100%',
        height: '100%',
        borderRadius: 60,
    },
    userName: {
        fontSize: 24,
        fontWeight: '700',
        marginBottom: 4,
    },
    userHandle: {
        fontSize: 16,
        color: '#666',
        marginBottom: 8,
    },
    joinDate: {
        fontSize: 14,
        color: '#888',
        marginBottom: 16,
    },
    bioContainer: {
        width: '85%',
        paddingHorizontal: 20,
        marginBottom: 24,
    },
    bio: {
        fontSize: 16,
        color: '#444',
        textAlign: 'center',
        lineHeight: 24,
    },
    actionButtons: {
        flexDirection: 'row',
        justifyContent: 'center',
        width: '100%',
        paddingHorizontal: 20,
        gap: 12,
    },
    actionButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 12,
        paddingHorizontal: 24,
        borderRadius: 25,
        width: '45%',
        gap: 8,
    },
    primaryButton: {
        backgroundColor: '#000',
    },
    secondaryButton: {
        backgroundColor: '#F0F0F0',
    },
    buttonText: {
        color: '#FFF',
        fontSize: 16,
        fontWeight: '600',
    },
    statsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        alignItems: 'center',
        paddingVertical: 24,
        paddingHorizontal: 16,
        backgroundColor: '#F8F8F8',
        marginTop: 24,
        borderRadius: 16,
        marginHorizontal: 16,
    },
    statItem: {
        alignItems: 'center',
    },
    statNumber: {
        fontSize: 20,
        fontWeight: '700',
        marginBottom: 4,
    },
    statLabel: {
        fontSize: 14,
        color: '#666',
    },
    statDivider: {
        width: 1,
        height: 40,
        backgroundColor: '#E0E0E0',
    },
    loadingOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(255, 255, 255, 0.7)',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 1000,
    },
});

export default UserProfile;