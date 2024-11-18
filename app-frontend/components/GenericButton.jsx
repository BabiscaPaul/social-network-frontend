import { Text, StyleSheet } from 'react-native'
import { TouchableOpacity } from 'react-native'
import React from 'react'

const GenericButton = ({ onPress, title = 'Default Title' }) => {
    return (
        <TouchableOpacity style={styles.signinButton} onPress = { onPress }>
            <Text style={styles.signinButtonText}>{ title }</Text>
        </TouchableOpacity>
    )
}

const styles = StyleSheet.create({
    signinButton: {
        borderWidth: 1.5,
        width: '70%',
        paddingVertical: 10,
        borderRadius: 15,
        backgroundColor: 'black',
        marginTop: 20,
    },

    signinButtonText: {
        color: '#fff',
        fontSize: 20,
        alignSelf: 'center',
    },
});

export default GenericButton