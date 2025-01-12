// CreatePostScreen.js
import React, { useState } from 'react';
import {
    SafeAreaView,
    StyleSheet,
    Text,
    TextInput,
    View,
    TouchableOpacity,
    Image,
    ScrollView,
    Alert,
    Dimensions,
    Platform
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { API_ROUTE, IP_PORT } from '@env';

// Get device width for responsive sizing
const { width } = Dimensions.get('window');

const CreatePostScreen = ({ navigation }) => {
    const [content, setContent] = useState('');
    const [imageUri, setImageUri] = useState(null);

    const pickImage = async () => {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
            Alert.alert(
                'Permissions Required',
                'Camera roll permissions are required to select an image.'
            );
            return;
        }

        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            quality: 1,
        });

        if (!result.canceled && result.assets && result.assets[0]?.uri) {
            setImageUri(result.assets[0].uri);
        }
    };

    const handleSubmit = async () => {
        try {
            const formData = new FormData();
            formData.append('content', content);

            if (imageUri) {
                formData.append('media', {
                    uri: imageUri,
                    name: 'post.jpg',
                    type: 'image/jpeg',
                });
            }

            const response = await fetch(`${IP_PORT}${API_ROUTE}/posts`, {
                method: 'POST',
                headers: { 'Content-Type': 'multipart/form-data' },
                body: formData,
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(errorText || 'Failed to create post');
            }

            navigation.goBack();
        } catch (error) {
            console.log('Error creating post:', error);
            Alert.alert('Error', 'Unable to create post. Please try again later.');
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView
                contentContainerStyle={styles.content}
                showsVerticalScrollIndicator={false}
            >
                <View style={styles.header}>
                    <Text style={styles.title}>Create Post</Text>
                    <Text style={styles.subtitle}>Share your thoughts with the world</Text>
                </View>

                <View style={styles.inputContainer}>
                    <TextInput
                        style={styles.textInput}
                        placeholder="What's on your mind?"
                        placeholderTextColor="#999"
                        value={content}
                        onChangeText={setContent}
                        multiline
                        maxLength={2000}
                    />
                </View>

                <View style={styles.mediaSection}>
                    {imageUri ? (
                        <View style={styles.imageContainer}>
                            <Image source={{ uri: imageUri }} style={styles.preview} />
                            <TouchableOpacity
                                style={styles.changeImageButton}
                                onPress={pickImage}
                            >
                                <Text style={styles.changeImageText}>Change Image</Text>
                            </TouchableOpacity>
                        </View>
                    ) : (
                        <TouchableOpacity
                            style={styles.pickButton}
                            onPress={pickImage}
                        >
                            <Text style={styles.pickButtonText}>Add Photo</Text>
                            <Text style={styles.pickButtonSubtext}>
                                Share a photo with your post
                            </Text>
                        </TouchableOpacity>
                    )}
                </View>

                <TouchableOpacity
                    style={[
                        styles.submitButton,
                        (!content && !imageUri) && styles.submitButtonDisabled
                    ]}
                    onPress={handleSubmit}
                    disabled={!content && !imageUri}
                >
                    <Text style={styles.submitButtonText}>Share Post</Text>
                </TouchableOpacity>
            </ScrollView>
        </SafeAreaView>
    );
};

export default CreatePostScreen;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFFFFF',
    },
    content: {
        paddingHorizontal: 20,
        paddingVertical: 24,
    },
    header: {
        marginBottom: 32,
    },
    title: {
        fontSize: 28,
        fontWeight: '700',
        color: '#1A1A1A',
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 16,
        color: '#666666',
        fontWeight: '400',
    },
    inputContainer: {
        backgroundColor: '#F8F8F8',
        borderRadius: 16,
        padding: 16,
        marginBottom: 24,
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
    textInput: {
        fontSize: 16,
        color: '#1A1A1A',
        minHeight: 120,
        textAlignVertical: 'top',
        lineHeight: 24,
    },
    mediaSection: {
        marginBottom: 32,
    },
    imageContainer: {
        width: '100%',
        borderRadius: 16,
        overflow: 'hidden',
        backgroundColor: '#F8F8F8',
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
    preview: {
        width: '100%',
        height: width * 0.6, // Responsive height based on screen width
        resizeMode: 'cover',
    },
    changeImageButton: {
        paddingVertical: 12,
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.05)',
    },
    changeImageText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#666666',
    },
    pickButton: {
        backgroundColor: '#F8F8F8',
        borderRadius: 16,
        padding: 24,
        alignItems: 'center',
        borderWidth: 2,
        borderColor: '#E5E5E5',
        borderStyle: 'dashed',
    },
    pickButtonText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#666666',
        marginBottom: 4,
    },
    pickButtonSubtext: {
        fontSize: 14,
        color: '#999999',
    },
    submitButton: {
        backgroundColor: '#000000',
        borderRadius: 12,
        paddingVertical: 16,
        alignItems: 'center',
        ...Platform.select({
            ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.2,
                shadowRadius: 8,
            },
            android: {
                elevation: 8,
            },
        }),
    },
    submitButtonDisabled: {
        backgroundColor: '#CCCCCC',
    },
    submitButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '600',
    },
});