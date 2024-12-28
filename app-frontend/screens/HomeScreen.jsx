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
    TouchableOpacity,
} from 'react-native';
import { AuthContext } from '../AuthProvider';
import { API_ROUTE, IP_PORT } from '@env';
import { useNavigation } from '@react-navigation/native';

const HomeScreen = () => {
    const [recentPosts, setRecentPosts] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const { userData } = useContext(AuthContext);
    const navigation = useNavigation();

    useEffect(() => {
        fetchRecentPosts();
    }, []);

    const fetchRecentPosts = async () => {
        try {
            setLoading(true);
            const response = await fetch(`${IP_PORT}${API_ROUTE}/posts/recent`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

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
            {/* Create Post Button at the top */}
            <TouchableOpacity
                style={styles.createButton}
                onPress={() => navigation.navigate('CreatePost')}
            >
                <Text style={styles.createButtonText}>+ Create Post</Text>
            </TouchableOpacity>

            <FlatList
                data={recentPosts}
                keyExtractor={(item) => item._id}
                renderItem={({ item }) => (
                    <View style={styles.postContainer}>
                        <Text style={styles.postTitle}>{item.content}</Text>
                        <Text>Posted by: {item.postedBy?.username}</Text>
                        {item.mediaFiles?.map((filePath, index) => {
                            const fullPath = `${IP_PORT}${filePath}`;
                            return (
                                <Image
                                    key={index}
                                    style={styles.postImage}
                                    source={{ uri: fullPath }}
                                    resizeMode="cover"
                                />
                            );
                        })}
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
    createButton: {
        backgroundColor: 'black',
        alignSelf: 'flex-start',
        paddingVertical: 10,
        paddingHorizontal: 15,
        borderRadius: 8,
    },
    createButtonText: {
        color: '#fff',
        fontSize: 16,
    },
    postContainer: {
        padding: 10,
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 8,
    },
    postTitle: {
        fontWeight: 'bold',
        marginBottom: 6,
        fontSize: 16,
    },
    postImage: {
        width: '100%',
        height: 200,
        marginTop: 10,
        borderRadius: 8,
        backgroundColor: '#f0f0f0',
    },
});
