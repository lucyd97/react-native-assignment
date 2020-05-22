import React, { Component } from 'react';
import { View, Text, StyleSheet, Button, TextInput, AsyncStorage } from 'react-native';
import Constants from 'expo-constants';

/**
 * SignUp Screen
 *  - for the user to make a new account/save credentials
 */

class SignUpScreen extends Component {
    constructor() {
        super();
        this.state = {
            registeredUsers: [],
            username: '',
            password: '',
            signedUp: false,
            error: false
        };
    }

    /* handles user sign up */
    handleSignUp() {
        var newUser = {
            username: this.state.username,
            password: this.state.password
        }

        var registeredUsers = []
        AsyncStorage.getItem('users').then((result) => {
            var users = JSON.parse(result);
            registeredUsers = users
            this.setState({
                registeredUsers: registeredUsers
            });

            registeredUsers.push(newUser);

            AsyncStorage.setItem('users', JSON.stringify(registeredUsers));

            this.setState({
                signedUp: true
            })

        });
    }

    /* navigates back to Login screen once user is signed up */
    handleLogIn() {
        this.props.navigation.navigate('Login');
    }

    /* renders the screen */
    render() {
        return (
            <View style={styles.container}>
                <Text style={styles.heading}>Welcome to {'\n'}Flight Search Engine!{'\n'}</Text>

                <Text>{'\n'}</Text>

                <TextInput style={styles.box} name="username" id="username" placeholder="Enter your username" onChangeText={(value) => {
                    this.setState({ username: value });
                }} />
                <Text>{'\n'}</Text>

                <TextInput style={styles.box} name="password" id="password" placeholder="Enter your password" onChangeText={(value) => {
                    this.setState({ password: value });
                }} />
                <Text>{'\n'}</Text>

                {
                    this.state.signedUp ? (
                        <View>
                            <Text style={styles.success}>Thanks for signing up!</Text>
                            <Text>{'\n'}</Text>
                            <Button
                                title="Back to Log In"
                                onPress={() => this.handleLogIn()}
                            />
                        </View>
                    ) : (
                            <View>
                                <Text>Enter username and password to create a new account</Text>
                                <Text>{'\n'}</Text>
                                <Button
                                    title="Sign Up"
                                    onPress={() => this.handleSignUp()}
                                />
                            </View>
                        )
                }
            </View>
        );
    }
}

/* styling instructions for the screen */
const styles = StyleSheet.create({
    container: {
        paddingTop: Constants.statusBarHeight,
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    heading: {
        fontSize: 18,
        fontWeight: 'bold',
        textAlign: 'center',
    },
    box: {
        borderRadius: 5,
        borderColor: 'gray',
        borderWidth: 1,
        width: 300,
        height: 20,
        padding: 15,
        backgroundColor: 'white',
    },
    error: {
        color: 'red'
    },
    link: {
        color: 'blue'
    },
    success: {
        color: 'green'
    }
});

export default SignUpScreen;