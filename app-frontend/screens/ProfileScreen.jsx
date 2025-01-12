import React, { useState, useEffect, useCallback } from 'react';
import {
    SafeAreaView,
    View,
    Text,
    StyleSheet,
    ActivityIndicator,
    Image,
    ScrollView,
    TouchableOpacity,
    Animated,
    Dimensions,
    Platform,
    StatusBar,
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { API_ROUTE, IP_PORT } from '@env';
import { useFocusEffect } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');
const HEADER_HEIGHT = Platform.OS === 'ios' ? 44 : 56;
const STATUS_BAR_HEIGHT = Platform.OS === 'ios' ? 20 : StatusBar.currentHeight;

const ProfileScreen = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [profileData, setProfileData] = useState(null);
    const scrollY = new Animated.Value(0);

    const navigation = useNavigation();

    // Animation values
    const fadeAnim = useState(new Animated.Value(0))[0];
    const slideAnim = useState(new Animated.Value(50))[0];

    useFocusEffect(
        useCallback(() => {
            fetchUserProfile();
            // Trigger entrance animations
            Animated.parallel([
                Animated.timing(fadeAnim, {
                    toValue: 1,
                    duration: 800,
                    useNativeDriver: true,
                }),
                Animated.timing(slideAnim, {
                    toValue: 0,
                    duration: 800,
                    useNativeDriver: true,
                }),
            ]).start();
        }, [])
    );

    const fetchUserProfile = async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await fetch(`${IP_PORT}${API_ROUTE}/users/me`, {
                method: 'GET',
                headers: { 'Content-Type': 'application/json' },
            });

            if (!response.ok) throw new Error('Failed to fetch user profile');

            const data = await response.json();
            setProfileData(data.data.user || data.user || data);
        } catch (err) {
            setError(err.message || 'Something went wrong fetching profile!');
            console.error('Error fetching user profile:', err.message);
        } finally {
            setLoading(false);
        }
    };

    // Header opacity animation based on scroll
    const headerOpacity = scrollY.interpolate({
        inputRange: [0, 100],
        outputRange: [0, 1],
        extrapolate: 'clamp',
    });

    const renderActionButton = (icon, label, onPress) => (
        <TouchableOpacity
            style={styles.actionButton}
            onPress={onPress}
            activeOpacity={0.7}
        >
            <LinearGradient
                colors={['#000', '#333']}
                style={styles.actionButtonGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
            >
                <Ionicons name={icon} size={24} color="#fff" />
                <Text style={styles.actionButtonText}>{label}</Text>
            </LinearGradient>
        </TouchableOpacity>
    );

    if (loading) {
        return (
            <SafeAreaView style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#000" />
                <Text style={styles.loadingText}>Loading your profile...</Text>
            </SafeAreaView>
        );
    }

    if (error) {
        return (
            <SafeAreaView style={styles.errorContainer}>
                <Ionicons name="alert-circle" size={48} color="#FF3B30" />
                <Text style={styles.errorText}>{error}</Text>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            {/* Animated Header */}
            <Animated.View style={[styles.header, { opacity: headerOpacity }]}>
                <View style={styles.headerContent}>
                    <Text style={styles.headerTitle}>Profile</Text>
                </View>
            </Animated.View>

            {profileData ? (
                <Animated.ScrollView
                    contentContainerStyle={styles.scrollContent}
                    onScroll={Animated.event(
                        [{ nativeEvent: { contentOffset: { y: scrollY } } }],
                        { useNativeDriver: false }
                    )}
                    scrollEventThrottle={16}
                >
                    {/* Profile Section */}
                    <Animated.View
                        style={[
                            styles.profileSection,
                            {
                                opacity: fadeAnim,
                                transform: [{ translateY: slideAnim }],
                            },
                        ]}
                    >
                        <Image
                            style={styles.profileImage}
                            source={{
                                uri: 'https://via.placeholder.com/150/CCC/FFF?text=Avatar',
                            }}
                        />
                        <LinearGradient
                            colors={['rgba(0,0,0,0)', 'rgba(0,0,0,0.1)']}
                            style={styles.profileImageOverlay}
                        />
                    </Animated.View>

                    {/* Profile Info */}
                    <Animated.View
                        style={[
                            styles.infoCard,
                            {
                                opacity: fadeAnim,
                                transform: [{ translateY: slideAnim }],
                            },
                        ]}
                    >
                        <Text style={styles.username}>@{profileData.username}</Text>
                        <Text style={styles.email}>{profileData.email}</Text>
                        <Text style={styles.bio}>
                            {profileData.bio || 'No bio available'}
                        </Text>
                    </Animated.View>

                    {/* Action Buttons */}
                    <View style={styles.actionButtonsContainer}>
                        {renderActionButton('pencil', 'Edit Profile', () =>
                            navigation.navigate('EditProfileScreen')
                        )}
                        {renderActionButton('documents', 'My Posts', () =>
                            navigation.navigate('MyPostsScreen')
                        )}
                        {renderActionButton('share-social', 'Shared Posts', () =>
                            navigation.navigate('SharedPostsScreen')
                        )}
                        {renderActionButton('people', 'Friends', () =>
                            navigation.navigate('FriendsScreen')
                        )}
                    </View>
                </Animated.ScrollView>
            ) : (
                <View style={styles.emptyContainer}>
                    <Ionicons name="person-outline" size={48} color="#999" />
                    <Text style={styles.emptyText}>No profile data available.</Text>
                </View>
            )}
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F8F9FA',
    },
    header: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 1000,
        height: HEADER_HEIGHT + STATUS_BAR_HEIGHT,
        backgroundColor: 'rgba(248, 249, 250, 0.9)', // Added background color to replace blur effect
    },
    headerContent: {
        flex: 1,
        justifyContent: 'flex-end',
        paddingBottom: 10,
    },
    headerTitle: {
        fontSize: 17,
        fontWeight: '600',
        textAlign: 'center',
        color: '#000',
    },
    scrollContent: {
        paddingBottom: 30,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#F8F9FA',
    },
    loadingText: {
        marginTop: 12,
        fontSize: 16,
        color: '#666',
        fontWeight: '500',
    },
    errorContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#F8F9FA',
        padding: 20,
    },
    errorText: {
        marginTop: 12,
        fontSize: 16,
        color: '#FF3B30',
        textAlign: 'center',
        lineHeight: 24,
    },
    profileSection: {
        alignItems: 'center',
        marginTop: 30,
        marginBottom: 20,
    },
    profileImage: {
        width: 140,
        height: 140,
        borderRadius: 70,
        borderWidth: 4,
        borderColor: '#fff',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 10,
    },
    profileImageOverlay: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: 70,
        borderRadius: 70,
    },
    infoCard: {
        width: width - 40,
        backgroundColor: '#fff',
        borderRadius: 16,
        padding: 24,
        marginHorizontal: 20,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 15,
        elevation: 2,
    },
    username: {
        fontSize: 24,
        fontWeight: '700',
        color: '#000',
        marginBottom: 8,
    },
    email: {
        fontSize: 16,
        color: '#666',
        marginBottom: 16,
    },
    bio: {
        fontSize: 16,
        color: '#444',
        textAlign: 'center',
        lineHeight: 24,
    },
    actionButtonsContainer: {
        paddingHorizontal: 20,
        marginTop: 20,
    },
    actionButton: {
        marginBottom: 12,
        borderRadius: 12,
        overflow: 'hidden',
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
    },
    actionButtonGradient: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 16,
        paddingHorizontal: 24,
    },
    actionButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
        marginLeft: 12,
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#F8F9FA',
    },
    emptyText: {
        marginTop: 12,
        fontSize: 16,
        color: '#999',
        textAlign: 'center',
    },
});

export default ProfileScreen;