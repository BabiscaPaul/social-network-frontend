// components/posts/PostList.js
import React, { useState } from 'react';
import {
    SafeAreaView,
    FlatList,
    ActivityIndicator,
    View,
    Text,
    Image,
    Dimensions,
    TouchableOpacity,
    TextInput,
    Alert,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { API_ROUTE, IP_PORT } from '@env';

const { width } = Dimensions.get('window');

// PostActions component handles all the interactive features of a post
const PostActions = ({ post, onLike, onComment, onShare, isLiked, showComments }) => {
    const heartIconName = isLiked ? 'heart' : 'heart-outline';

    return (
        <View style={styles.buttonRow}>
            <TouchableOpacity
                style={styles.commentsButton}
                onPress={onComment}
            >
                <Text style={styles.commentsButtonText}>
                    {showComments ? 'Hide Comments' : 'Show Comments'}
                </Text>
            </TouchableOpacity>

            <TouchableOpacity
                style={styles.likeButton}
                onPress={onLike}
            >
                <Ionicons name={heartIconName} size={24} color="red" />
                <Text style={styles.likesCount}>{post.likesCount}</Text>
            </TouchableOpacity>

            <TouchableOpacity
                style={styles.shareButton}
                onPress={onShare}
            >
                <Ionicons name="share-outline" size={24} color="blue" />
            </TouchableOpacity>
        </View>
    );
};

// Comments component handles displaying and adding comments
const Comments = ({ comments, onAddComment, commentInput, setCommentInput }) => {
    return (
        <View style={styles.commentsContainer}>
            {comments?.length > 0 ? (
                comments.map((comment) => (
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

            <View style={styles.addCommentContainer}>
                <TextInput
                    autoCapitalize="none"
                    style={styles.commentInput}
                    placeholder="Add a comment..."
                    value={commentInput}
                    onChangeText={setCommentInput}
                />
                <TouchableOpacity
                    style={styles.submitButton}
                    onPress={onAddComment}
                >
                    <Text style={styles.submitButtonText}>Post</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
};

// Main PostList component that can be reused across different screens
const PostList = ({
    posts,
    loading,
    error,
    onRefresh,
    emptyMessage = "No posts available",
    loadingMessage = "Loading posts...",
    onLikePost,
    onSharePost,
    onAddComment,
    onFetchComments,
    ListHeaderComponent = null,
}) => {
    const [commentsByPost, setCommentsByPost] = useState({});
    const [commentInput, setCommentInput] = useState({});
    const [likedPosts, setLikedPosts] = useState({});

    const handleLike = async (postId) => {
        try {
            await onLikePost(postId, !likedPosts[postId]);
            setLikedPosts(prev => ({
                ...prev,
                [postId]: !prev[postId]
            }));
        } catch (error) {
            Alert.alert('Error', 'Failed to update like status');
        }
    };

    const handleShare = async (postId) => {
        try {
            await onSharePost(postId);
        } catch (error) {
            Alert.alert('Error', 'Failed to share post');
        }
    };

    const handleToggleComments = async (postId) => {
        const isVisible = commentsByPost[postId]?.visible;

        if (!isVisible) {
            try {
                const comments = await onFetchComments(postId);
                setCommentsByPost(prev => ({
                    ...prev,
                    [postId]: { visible: true, data: comments }
                }));
            } catch (error) {
                Alert.alert('Error', 'Failed to load comments');
            }
        } else {
            setCommentsByPost(prev => ({
                ...prev,
                [postId]: { ...prev[postId], visible: false }
            }));
        }
    };

    const handleAddComment = async (postId) => {
        const comment = commentInput[postId]?.trim();
        if (!comment) {
            Alert.alert('Error', 'Comment cannot be empty');
            return;
        }

        try {
            await onAddComment(postId, comment);
            const updatedComments = await onFetchComments(postId);
            setCommentsByPost(prev => ({
                ...prev,
                [postId]: { visible: true, data: updatedComments }
            }));
            setCommentInput(prev => ({ ...prev, [postId]: '' }));
        } catch (error) {
            Alert.alert('Error', 'Failed to add comment');
        }
    };

    if (loading) {
        return (
            <View style={styles.centeredContainer}>
                <ActivityIndicator size="large" color="#007AFF" />
                <Text style={styles.loadingText}>{loadingMessage}</Text>
            </View>
        );
    }

    if (error) {
        return (
            <View style={styles.centeredContainer}>
                <Text style={styles.errorText}>{error}</Text>
            </View>
        );
    }

    const renderPost = ({ item: post }) => {
        const postComments = commentsByPost[post._id];
        const isVisible = postComments?.visible;

        return (
            <View style={styles.postContainer}>
                <Text style={styles.postContent}>{post.content || 'No content available'}</Text>
                <Text style={styles.postedBy}>Posted by: {post.postedBy?.username || 'Unknown'}</Text>

                {post.mediaFiles?.length > 0 ? (
                    <FlatList
                        data={post.mediaFiles}
                        keyExtractor={(_, index) => `${post._id}-image-${index}`}
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        renderItem={({ item: filePath }) => (
                            <Image
                                source={{ uri: `${IP_PORT}${filePath}` }}
                                style={styles.postImage}
                                resizeMode="cover"
                            />
                        )}
                        contentContainerStyle={styles.mediaList}
                    />
                ) : (
                    <Text style={styles.noImagesText}>No images for this post.</Text>
                )}

                <PostActions
                    post={post}
                    onLike={() => handleLike(post._id)}
                    onComment={() => handleToggleComments(post._id)}
                    onShare={() => handleShare(post._id)}
                    isLiked={likedPosts[post._id]}
                    showComments={isVisible}
                />

                {isVisible && (
                    <Comments
                        comments={postComments.data}
                        onAddComment={() => handleAddComment(post._id)}
                        commentInput={commentInput[post._id] || ''}
                        setCommentInput={(text) =>
                            setCommentInput(prev => ({ ...prev, [post._id]: text }))
                        }
                    />
                )}
            </View>
        );
    };

    return (
        <SafeAreaView style={styles.container}>
            <FlatList
                data={posts}
                keyExtractor={(item) => item._id}
                renderItem={renderPost}
                ListHeaderComponent={ListHeaderComponent}
                ListEmptyComponent={
                    <View style={styles.centeredContainer}>
                        <Text style={styles.noPostsText}>{emptyMessage}</Text>
                    </View>
                }
                contentContainerStyle={posts.length === 0 && styles.flatListContainer}
                onRefresh={onRefresh}
                refreshing={loading}
            />
        </SafeAreaView>
    );
};

export default PostList;