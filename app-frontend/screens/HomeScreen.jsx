// HomeScreen.js
import React, { useState, useEffect, useContext } from 'react';
import {
    SafeAreaView,
    StyleSheet,
    Text,
    FlatList,
    ActivityIndicator,
    View,
    Image,
    Dimensions,
} from 'react-native';
import { AuthContext } from '../AuthProvider';
import { API_ROUTE, IP_PORT } from '@env';
import { useNavigation } from '@react-navigation/native';

const { width } = Dimensions.get('window');

const HomeScreen = () => {
    const [recentPosts, setRecentPosts] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchRecentPosts();
    }, []);

    const fetchRecentPosts = async () => {
        try {
            setLoading(true);
            const response = await fetch(`${IP_PORT}${API_ROUTE}/posts/recent`);

            if (!response.ok) {
                throw new Error('Failed to fetch recent posts');
            }

            const data = await response.json();
            setRecentPosts(data.data.posts || []);
        } catch (err) {
            setError(err.message || 'Something went wrong!');
            console.error('Error fetching recent posts:', err);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <SafeAreaView style={styles.container}>
                <ActivityIndicator size="large" color="#000" />
            </SafeAreaView>
        );
    }

    if (error) {
        return (
            <SafeAreaView style={styles.container}>
                <Text style={{ color: 'red' }}>{error}</Text>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <FlatList
                data={recentPosts}
                keyExtractor={(item) => item._id}
                renderItem={({ item }) => (
                    <View style={styles.postContainer}>
                        {/* Post Content */}
                        <Text style={styles.postTitle}>{item.content}</Text>
                        <Text>Posted by: {item.postedBy?.username}</Text>

                        {/* Horizontal Scrollable Images */}
                        {item.mediaFiles?.length > 0 ? (
                            <FlatList
                                data={item.mediaFiles}
                                horizontal
                                showsHorizontalScrollIndicator={false}
                                style={styles.imageList}
                                keyExtractor={(_, index) => index.toString()}
                                renderItem={({ item: filePath }) => {
                                    const fullPath = `${IP_PORT}${filePath}`;
                                    return (
                                        <Image
                                            source={{ uri: fullPath }}
                                            style={styles.postImage}
                                            resizeMode="cover"
                                        />
                                    );
                                }}
                            />
                        ) : (
                            <Text style={styles.noImages}>No images for this post.</Text>
                        )}
                    </View>
                )}
                ListEmptyComponent={
                    <Text style={{ textAlign: 'center', marginTop: 20 }}>
                        No recent posts yet!
                    </Text>
                }
            />
        </SafeAreaView>
    );
};

export default HomeScreen;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
        padding: 10,
    },
    postContainer: {
        padding: 10,
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 8,
        marginBottom: 10,
    },
    postTitle: {
        fontWeight: 'bold',
        marginBottom: 6,
        fontSize: 16,
    },
    imageList: {
        marginTop: 10,
    },
    postImage: {
        width: width * 0.8,  // 80% of screen width
        height: 200,
        marginRight: 10,
        borderRadius: 8,
        backgroundColor: '#f0f0f0',
    },
    noImages: {
        marginTop: 10,
        fontStyle: 'italic',
        color: '#999',
    },
});
