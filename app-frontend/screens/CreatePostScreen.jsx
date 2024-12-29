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
} from 'react-native';
// import * as ImagePicker from 'expo-image-picker'; // remember to uncomment if using expo-image-picker
import { API_ROUTE, IP_PORT } from '@env';

const CreatePostScreen = ({ navigation }) => {
    const [content, setContent] = useState('');
    const [imageUri, setImageUri] = useState(null);

    const pickImage = async () => {
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            quality: 1,
        });

        if (!result.canceled && result.assets[0].uri) {
            setImageUri(result.assets[0].uri);
        }
    };

    const handleSubmit = async () => {
        try {
            const formData = new FormData();
            formData.append('content', content);

            if (imageUri) {
                formData.append('mediaFiles', {
                    uri: imageUri,
                    name: 'post.jpg', // or a derived name
                    type: 'image/jpeg',
                });
            }

            const response = await fetch(`${IP_PORT}${API_ROUTE}/posts`, {
                method: 'POST',
                body: formData,
            });

            if (!response.ok) {
                throw new Error('Failed to create post');
            }

            navigation.goBack();
        } catch (error) {
            console.error('Error creating post:', error.message);
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView contentContainerStyle={styles.content}>
                <Text style={styles.title}>Create a New Post</Text>

                {/* Text Input */}
                <TextInput
                    style={styles.textInput}
                    placeholder="Write something..."
                    value={content}
                    onChangeText={setContent}
                    multiline
                />

                {/* Preview or No Image Text */}
                {imageUri ? (
                    <Image source={{ uri: imageUri }} style={styles.preview} />
                ) : (
                    <Text style={styles.noImageText}>No image selected</Text>
                )}

                {/* Pick Image Button */}
                <TouchableOpacity style={styles.pickButton} onPress={pickImage}>
                    <Text style={styles.pickButtonText}>Pick an Image</Text>
                </TouchableOpacity>

                {/* Submit Button */}
                <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
                    <Text style={styles.submitButtonText}>Post</Text>
                </TouchableOpacity>
            </ScrollView>
        </SafeAreaView>
    );
};

export default CreatePostScreen;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    content: {
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 20,
    },
    title: {
        fontSize: 24,
        fontWeight: '600',
        marginBottom: 20,
        alignSelf: 'flex-start', // keeps the title left-aligned
    },
    textInput: {
        width: '85%',
        borderWidth: 1.5,
        borderColor: '#ccc',
        borderRadius: 8,
        padding: 10,
        fontSize: 16,
        minHeight: 100,
        textAlignVertical: 'top',
        marginBottom: 20,
    },
    noImageText: {
        fontStyle: 'italic',
        color: '#999',
        textAlign: 'center',
        marginVertical: 8,
    },
    preview: {
        width: '85%',
        height: 200,
        marginBottom: 12,
        resizeMode: 'cover',
        borderRadius: 8,
    },
    pickButton: {
        width: '85%',
        backgroundColor: '#000',
        paddingVertical: 12,
        borderRadius: 8,
        alignItems: 'center',
        marginBottom: 20,
    },
    pickButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
    submitButton: {
        width: '85%',
        backgroundColor: '#000',
        borderRadius: 8,
        paddingVertical: 12,
        alignItems: 'center',
    },
    submitButtonText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: '600',
    },
});
