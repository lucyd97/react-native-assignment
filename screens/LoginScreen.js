import React, { Component } from 'react';
import { View, Text, StyleSheet, Button, TextInput, AsyncStorage } from 'react-native';
import Constants from 'expo-constants';
import Axios from 'axios';

/**
 * Login Screen
 *  - first screen the user sees when they open the app.
 *  - retrieves registered user data from LocalStorage, and if there is none saved retrieves hard coded backup data from json file and saves to LocalStorage.
 *  - contains link to SignUp Screen for users to save credentials if they do not have an existing account
 *  - if user logs in with saved credentials - navigates to SearchScreen
 */

class LoginScreen extends Component {
    constructor() {
        super();
        this.state = {
            registeredUsers: [],
            username: '',
            password: '',
            loggedIn: false,
            error: false,
            savedUsers: true
        };
    }

    /* retrieves saved user data from LocalStorage, or json file if users not present in LocalStorage */
    componentDidMount() {
        var savedUsers = true;
        AsyncStorage.getItem('users')
            .then((result) => {
                var registeredUsers = JSON.parse(result);
                this.setState({
                    registeredUsers: registeredUsers
                });
            })
            .catch(error => {
                savedUsers = false;
            });

        if (!savedUsers) {
            Axios.get("http://localhost:3000/users")
                .then(result => {
                    this.setState({
                        registeredUsers: result.data,
                    })
                    AsyncStorage.setItem('users', JSON.stringify(result.data));
                })
                .catch(error =>
                    this.setState({
                        error,
                    })
                );
        }

    }

    /* handles the user login, checks if user provided credentials match any saved credentials */
    handleLogin() {
        var loggedIn = false;
        this.state.registeredUsers.map(user => {
            if ((user.username == this.state.username) && (user.password == this.state.password)) {
                loggedIn = true;
                this.setState({ loggedIn: loggedIn });
                this.setState({ error: false });
                this.props.navigation.navigate('Search');
            }
        })
        if (!loggedIn) {
            this.setState({ error: true });
        }
    }

    handleSignUp() {
        this.props.navigation.navigate('SignUp');
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
                    this.state.error ? (
                        <View style={styles.paragraph}>
                            <Text style={styles.error}>Sorry! Incorrect username or password.{'\n'}
                                Please try again{'\n'}</Text>
                            <Text>Don't have an account? <Text style={styles.link} onPress={() => this.handleSignUp()}>Sign Up!</Text></Text>
                        </View>
                    ) : (
                            <Text>Sign in with existing account or <Text style={styles.link} onPress={() => this.handleSignUp()}>Sign Up</Text></Text>
                        )
                }
                <Text>{'\n'}</Text>
                <Button
                    title="Log In"
                    onPress={() => this.handleLogin()}
                />
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
        color: 'red',
    },
    paragraph: {
        textAlign: 'center'
    },
    link: {
        color: 'blue'
    },
});

export default LoginScreen;