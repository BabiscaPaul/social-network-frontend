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
} from 'react-native';
// import * as ImagePicker from 'expo-image-picker'; 
import { API_ROUTE, IP_PORT } from '@env';

const CreatePostScreen = ({ navigation }) => {
    const [content, setContent] = useState('');
    const [imageUri, setImageUri] = useState(null);

    const pickImage = async () => {
        // ask for camera roll permissions, then open image picker
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
                // This is how you append a file in FormData for a typical Node/Express backend with Multer
                formData.append('mediaFiles', {
                    uri: imageUri,
                    name: 'post.jpg',  // or your file name
                    type: 'image/jpeg',
                });
            }

            const response = await fetch(`${IP_PORT}${API_ROUTE}/posts`, {
                method: 'POST',
                headers: {
                    // Multer usually needs "multipart/form-data" but `fetch` will set the correct boundary automatically if you omit the Content-Type
                },
                body: formData,
            });

            if (!response.ok) {
                throw new Error('Failed to create post');
            }

            // Optionally parse the returned data if needed
            // const data = await response.json();

            // Once the post is created, go back to the Home screen (or refresh posts)
            navigation.goBack();
        } catch (error) {
            console.error('Error creating post:', error.message);
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <Text style={styles.title}>Create a New Post</Text>

            <TextInput
                style={styles.textInput}
                placeholder="Write something..."
                value={content}
                onChangeText={setContent}
                multiline
            />

            {imageUri ? (
                <Image source={{ uri: imageUri }} style={styles.preview} />
            ) : (
                <Text style={styles.noImageText}>No image selected</Text>
            )}

            <TouchableOpacity style={styles.pickButton} onPress={pickImage}>
                <Text style={styles.pickButtonText}>Pick an Image</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
                <Text style={styles.submitButtonText}>Post</Text>
            </TouchableOpacity>
        </SafeAreaView>
    );
};

export default CreatePostScreen;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 16,
    },
    title: {
        fontSize: 24,
        fontWeight: '600',
        marginBottom: 12,
    },
    textInput: {
        borderWidth: 1,
        borderColor: '#999',
        borderRadius: 8,
        padding: 10,
        fontSize: 16,
        height: 100,
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
        width: '100%',
        height: 200,
        marginBottom: 8,
        resizeMode: 'cover',
        borderRadius: 8,
    },
    pickButton: {
        backgroundColor: '#ccc',
        padding: 12,
        borderRadius: 8,
        marginBottom: 20,
        alignItems: 'center',
    },
    pickButtonText: {
        fontSize: 16,
    },
    submitButton: {
        backgroundColor: 'black',
        padding: 14,
        borderRadius: 8,
        alignItems: 'center',
    },
    submitButtonText: {
        color: '#fff',
        fontSize: 18,
    },
});
