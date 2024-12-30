import React, { useState, useEffect } from 'react';
import {
    SafeAreaView,
    StyleSheet,
    Text,
    FlatList,
    ActivityIndicator,
    View,
    Image,
    Dimensions,
    TouchableOpacity,
    TextInput,
    Alert,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { API_ROUTE, IP_PORT } from '@env';

const { width } = Dimensions.get('window');

const MyPosts = () => {
    const [userPosts, setUserPosts] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [commentInput, setCommentInput] = useState({});
    const [commentsByPost, setCommentsByPost] = useState({});
    const [likedPosts, setLikedPosts] = useState({});

    useEffect(() => {
        fetchUserPosts();
    }, []);

    const fetchUserPosts = async () => {
        try {
            setLoading(true);
            setError(null);

            const response = await fetch(`${IP_PORT}${API_ROUTE}/posts/myPosts`);

            if (!response.ok) {
                throw new Error('Failed to fetch your posts');
            }

            const data = await response.json();
            console.log('My Posts =>', data);

            setUserPosts(data.data.posts || data.posts || []);
        } catch (err) {
            setError(err.message || 'Something went wrong!');
            console.error('Error fetching your posts:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleSharePress = (postId) => {
        // Placeholder function for sharing functionality
        Alert.alert('Share', `Share button pressed for post: ${postId}`);
    };

    const handleAddComment = async (postId) => {
        const newComment = commentInput[postId]?.trim();
        if (!newComment || newComment.length === 0) {
            Alert.alert('Error', 'Comment cannot be empty.');
            return;
        }

        try {
            const response = await fetch(`${IP_PORT}${API_ROUTE}/posts/comment/${postId}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ content: newComment }),
            });

            if (!response.ok) {
                throw new Error('Failed to post comment');
            }

            const updatedComments = await fetchCommentsForPost(postId);

            setCommentsByPost((prev) => ({
                ...prev,
                [postId]: {
                    visible: true,
                    data: updatedComments,
                },
            }));

            setCommentInput((prev) => ({ ...prev, [postId]: '' }));
        } catch (error) {
            Alert.alert('Error', `Error posting comment: ${error.message}`);
            console.error(`Error posting comment for post ${postId}:`, error);
        }
    };

    const handleToggleComments = async (postId) => {
        const current = commentsByPost[postId];
        const isVisible = current?.visible;

        if (!isVisible) {
            if (!current || current.data.length === 0) {
                const newComments = await fetchCommentsForPost(postId);
                setCommentsByPost((prev) => ({
                    ...prev,
                    [postId]: { visible: true, data: newComments },
                }));
            } else {
                setCommentsByPost((prev) => ({
                    ...prev,
                    [postId]: { ...prev[postId], visible: true },
                }));
            }
        } else {
            setCommentsByPost((prev) => ({
                ...prev,
                [postId]: { ...prev[postId], visible: false },
            }));
        }
    };

    const fetchCommentsForPost = async (postId) => {
        try {
            const response = await fetch(`${IP_PORT}${API_ROUTE}/posts/comment/${postId}`);
            if (!response.ok) {
                throw new Error('Failed to fetch comments');
            }
            const data = await response.json();
            return data.data.comments.map((comment) => ({
                ...comment,
                commentedBy: comment.commentedBy || { username: 'Unknown' },
            }));
        } catch (err) {
            console.error('Error fetching comments:', err);
            return [];
        }
    };

    const handleLikePress = async (postId) => {
        const postIndex = userPosts.findIndex((post) => post._id === postId);

        if (postIndex === -1) {
            console.error(`Post with ID ${postId} not found`);
            return;
        }

        const currentPost = userPosts[postIndex];
        const isLiked = likedPosts[postId] || false;
        const likeStatus = !isLiked;

        const updatedPosts = [...userPosts];
        updatedPosts[postIndex] = {
            ...currentPost,
            likesCount: currentPost.likesCount + (likeStatus ? 1 : -1),
        };

        setUserPosts(updatedPosts);
        setLikedPosts((prev) => ({ ...prev, [postId]: likeStatus }));

        try {
            const response = await fetch(`${IP_PORT}${API_ROUTE}/posts/${postId}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ like: likeStatus }),
            });

            if (!response.ok) {
                throw new Error('Failed to update like status');
            }
        } catch (error) {
            Alert.alert('Error', `Error updating like status: ${error.message}`);
            console.error(`Error updating like status for post ${postId}:`, error);

            // Revert the like status in case of error
            const revertedPosts = [...userPosts];
            revertedPosts[postIndex] = {
                ...currentPost,
                likesCount: currentPost.likesCount + (likeStatus ? -1 : 1),
            };

            setUserPosts(revertedPosts);
            setLikedPosts((prev) => ({ ...prev, [postId]: isLiked }));
        }
    };

    if (loading) {
        return (
            <SafeAreaView style={styles.centeredContainer}>
                <ActivityIndicator size="large" color="#000" />
                <Text style={styles.loadingText}>Loading your posts...</Text>
            </SafeAreaView>
        );
    }

    if (error) {
        return (
            <SafeAreaView style={styles.centeredContainer}>
                <Text style={styles.errorText}>{error}</Text>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <FlatList
                data={userPosts}
                keyExtractor={(item) => item._id}
                renderItem={({ item }) => {
                    if (!item) return null; // Safeguard to prevent errors
                    const postComments = commentsByPost[item._id];
                    const isVisible = postComments?.visible;
                    const isLiked = likedPosts[item._id] || false;
                    const heartIconName = isLiked ? 'heart' : 'heart-outline';

                    return (
                        <View style={styles.postContainer}>
                            <Text style={styles.postContent}>{item.content || 'No content available'}</Text>
                            <Text style={styles.postedBy}>Posted by: {item.postedBy?.username || 'Unknown'}</Text>

                            {/* Display media files horizontally */}
                            {item.mediaFiles && item.mediaFiles.length > 0 ? (
                                <FlatList
                                    data={item.mediaFiles}
                                    keyExtractor={(_, index) => `${item._id}-image-${index}`}
                                    horizontal
                                    showsHorizontalScrollIndicator={false}
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
                                    contentContainerStyle={styles.mediaList}
                                />
                            ) : (
                                <Text style={styles.noImagesText}>No images for this post.</Text>
                            )}

                            {/* Action Buttons: Comment and Like */}
                            <View style={styles.buttonRow}>
                                <TouchableOpacity
                                    style={styles.commentsButton}
                                    onPress={() => handleToggleComments(item._id)}
                                >
                                    <Text style={styles.commentsButtonText}>
                                        {isVisible ? 'Hide Comments' : 'Show Comments'}
                                    </Text>
                                </TouchableOpacity>

                                <TouchableOpacity
                                    style={styles.likeButton}
                                    onPress={() => handleLikePress(item._id)}
                                >
                                    <Ionicons name={heartIconName} size={24} color="red" />
                                    <Text style={styles.likesCount}>{item.likesCount}</Text>
                                </TouchableOpacity>

                                <TouchableOpacity
                                    style={styles.shareButton}
                                    onPress={() => handleSharePress(item._id)}
                                >
                                    <Ionicons name="share-outline" size={24} color="blue" />
                                </TouchableOpacity>
                            </View>

                            {/* Comments Section */}
                            {isVisible && (
                                <View style={styles.commentsContainer}>
                                    {postComments?.data?.length > 0 ? (
                                        postComments.data.map((comment) => (
                                            <View key={comment._id} style={styles.commentItem}>
                                                <Text style={styles.commentText}>
                                                    <Text style={styles.commentAuthor}>
                                                        {comment.commentedBy.username}:
                                                    </Text>{' '}
                                                    {comment.content}
                                                </Text>
                                            </View>
                                        ))
                                    ) : (
                                        <Text style={styles.noCommentsText}>No comments yet.</Text>
                                    )}

                                    {/* Add Comment Input */}
                                    <View style={styles.addCommentContainer}>
                                        <TextInput
                                            autoCapitalize="none"
                                            style={styles.commentInput}
                                            placeholder="Add a comment..."
                                            value={commentInput[item._id] || ''}
                                            onChangeText={(text) =>
                                                setCommentInput((prev) => ({ ...prev, [item._id]: text }))
                                            }
                                        />
                                        <TouchableOpacity
                                            style={styles.submitButton}
                                            onPress={() => handleAddComment(item._id)}
                                        >
                                            <Text style={styles.submitButtonText}>Post</Text>
                                        </TouchableOpacity>
                                    </View>
                                </View>
                            )}
                        </View>
                    );
                }}
                ListEmptyComponent={
                    <View style={styles.centeredContainer}>
                        <Text style={styles.noPostsText}>You haven't posted anything yet!</Text>
                    </View>
                }
                contentContainerStyle={userPosts.length === 0 && styles.flatListContainer}
            />
        </SafeAreaView>
    );
}

    export default MyPosts;

    //-------------------------------------
    // Styles
    //-------------------------------------
    const styles = StyleSheet.create({
        container: {
            flex: 1,
            backgroundColor: '#fafafa',
        },
        centeredContainer: {
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
            padding: 20,
        },
        loadingText: {
            marginTop: 10,
            fontSize: 16,
            color: '#333',
        },
        errorText: {
            color: 'red',
            fontSize: 16,
            textAlign: 'center',
            marginHorizontal: 20,
        },
        noPostsText: {
            textAlign: 'center',
            color: '#999',
            fontSize: 18,
        },
        postContainer: {
            width: '95%',
            backgroundColor: '#fff',
            borderRadius: 12,
            padding: 15,
            marginBottom: 15,
            shadowColor: '#000',
            shadowOpacity: 0.1,
            shadowRadius: 4,
            shadowOffset: { width: 0, height: 2 },
            elevation: 3,
            alignSelf: 'center',
        },
        postContent: {
            fontSize: 16,
            color: '#333',
            marginBottom: 8,
        },
        postedBy: {
            fontSize: 14,
            color: '#666',
            marginBottom: 10,
        },
        mediaList: {
            marginTop: 10,
        },
        postImage: {
            width: width * 0.7, // 70% of screen width
            height: 200,
            borderRadius: 8,
            marginRight: 10,
            backgroundColor: '#eee',
        },
        noImagesText: {
            fontSize: 14,
            color: '#999',
            marginTop: 10,
            fontStyle: 'italic',
        },
        buttonRow: {
            marginTop: 10,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
        },
        commentsButton: {
            backgroundColor: '#000',
            paddingVertical: 6,
            paddingHorizontal: 12,
            borderRadius: 8,
        },
        commentsButtonText: {
            color: '#fff',
            fontSize: 14,
            fontWeight: '500',
        },
        likeButton: {
            flexDirection: 'row',
            alignItems: 'center',
        },
        likesCount: {
            marginLeft: 5,
            fontSize: 16,
            color: '#333',
        },
        shareButton: {
            padding: 5,
        },
        commentsContainer: {
            marginTop: 15,
            borderTopWidth: 1,
            borderTopColor: '#ddd',
            paddingTop: 10,
        },
        commentItem: {
            marginBottom: 6,
        },
        commentText: {
            fontSize: 14,
            color: '#333',
        },
        commentAuthor: {
            fontWeight: 'bold',
            color: '#555',
        },
        noCommentsText: {
            fontStyle: 'italic',
            color: '#777',
            marginBottom: 6,
        },
        addCommentContainer: {
            flexDirection: 'row',
            alignItems: 'center',
            marginTop: 10,
        },
        commentInput: {
            flex: 1,
            borderWidth: 1,
            borderColor: '#ddd',
            borderRadius: 8,
            paddingVertical: 8,
            paddingHorizontal: 12,
            fontSize: 14,
            backgroundColor: '#fff',
        },
        submitButton: {
            backgroundColor: 'blue',
            paddingVertical: 8,
            paddingHorizontal: 12,
            borderRadius: 8,
            marginLeft: 8,
        },
        submitButtonText: {
            color: '#fff',
            fontWeight: '500',
            fontSize: 14,
        },
        flatListContainer: {
            flexGrow: 1,
            justifyContent: 'center',
            alignItems: 'center',
            padding: 20,
        },
    });
