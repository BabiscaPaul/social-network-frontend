import React, { useState } from 'react';
import {
    View,
    Text,
    SafeAreaView,
    TextInput,
    StyleSheet,
    TouchableOpacity,
    TouchableWithoutFeedback,
    Keyboard,
    Platform
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import Icon from 'react-native-vector-icons/FontAwesome';

const SetUpProfile = () => {
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [birthDate, setBirthDate] = useState(null);
    const [showDatePicker, setShowDatePicker] = useState(false);

    const handleSubmit = () => {
        // Implement your form submission logic here
        console.log('First Name:', firstName);
        console.log('Last Name:', lastName);
        console.log('Birth Date:', birthDate);
    };

    const onChangeDate = (event, selectedDate) => {
        setShowDatePicker(Platform.OS === 'ios');
        if (selectedDate) {
            setBirthDate(selectedDate);
        }
    };

    const showDatepicker = () => {
        setShowDatePicker(true);
    };

    // Format the date to display in the input field
    const formattedDate = birthDate
        ? `${birthDate.getFullYear()}-${(birthDate.getMonth() + 1).toString().padStart(2, '0')}-${birthDate.getDate().toString().padStart(2, '0')}`
        : '';

    return (
        <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
            <SafeAreaView style={styles.inner}>

                <View style={styles.header}>
                    <Text style={styles.title}>Set Up Profile</Text>
                    <Text style={styles.subTitle}>Please enter your details</Text>
                </View>

                <View style={styles.inputContainer}>
                    <Text style={styles.label}>First Name</Text>
                    <View style={styles.inputFieldContainer}>
                        <TextInput
                            style={styles.inputs}
                            placeholder="First Name"
                            autoCapitalize="words"
                            selectionColor="#000"
                            value={firstName}
                            onChangeText={setFirstName}
                        />
                    </View>
                </View>

                <View style={styles.inputContainer}>
                    <Text style={styles.label}>Last Name</Text>
                    <View style={styles.inputFieldContainer}>
                        <TextInput
                            style={styles.inputs}
                            placeholder="Last Name"
                            autoCapitalize="words"
                            selectionColor="#000"
                            value={lastName}
                            onChangeText={setLastName}
                        />
                    </View>
                </View>

                <View style={styles.inputContainer}>
                    <Text style={styles.label}>Birth Date</Text>
                    <TouchableOpacity onPress={showDatepicker} style={styles.datePickerContainer}>
                        <Text style={[styles.inputs, formattedDate ? { color: '#000' } : { color: '#888' }]}>
                            {formattedDate || 'Select Birth Date'}
                        </Text>
                        <Icon name="calendar" size={20} color="#000" />
                    </TouchableOpacity>
                </View>

                {showDatePicker && (
                    <DateTimePicker
                        testID="dateTimePicker"
                        value={birthDate || new Date()}
                        mode="date"
                        display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                        maximumDate={new Date()}
                        onChange={onChangeDate}
                    />
                )}

                <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
                    <Text style={styles.submitButtonText}>Submit</Text>
                </TouchableOpacity>

            </SafeAreaView>
        </TouchableWithoutFeedback>
    );
};

const styles = StyleSheet.create({
    inner: {
        flex: 1,
        gap: 10,
        alignItems: 'center',
        backgroundColor: '#fff',
        paddingTop: 20,
    },

    header: {
        alignItems: 'center',
        marginBottom: 30,
        width: '80%',
    },

    title: {
        fontSize: 32,
        fontWeight: '700',
        color: '#000',
        letterSpacing: 1,
        marginBottom: 10,
    },

    subTitle: {
        fontSize: 16,
        fontWeight: '300',
        color: '#555',
        textAlign: 'center',
        lineHeight: 22,
    },

    inputContainer: {
        width: '80%',
        marginBottom: 20,
    },

    label: {
        marginHorizontal: 10,
        fontSize: 16,
        color: '#000',
    },

    inputFieldContainer: {
        width: '100%',
        borderColor: '#000',
        borderWidth: 1.5,
        borderRadius: 15,
        paddingHorizontal: 10,
        height: 50,
        justifyContent: 'center',
        marginTop: 5,
    },

    datePickerContainer: {
        width: '100%',
        borderColor: '#000',
        borderWidth: 1.5,
        borderRadius: 15,
        paddingHorizontal: 10,
        height: 50,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginTop: 5,
    },

    inputs: {
        fontSize: 18,
        color: '#000',
        flex: 1,
        lineHeight: 24,
    },

    submitButton: {
        borderWidth: 1.5,
        width: '80%',
        paddingVertical: 12,
        borderRadius: 15,
        backgroundColor: 'black',
        marginTop: 20,
    },

    submitButtonText: {
        color: '#fff',
        fontSize: 20,
        alignSelf: 'center',
    },
});

export default SetUpProfile;
