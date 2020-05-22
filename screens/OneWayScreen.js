import React, { Component } from 'react';
import { View, Text, StyleSheet, AsyncStorage, FlatList } from 'react-native';
import Constants from 'expo-constants';

/**
 * OneWay Screen
 *  - rendered if the user has searched for a one way flight (i.e. isReturn is false)
 */

class OneWayScreen extends Component {
    constructor() {
        super();
        this.state = {
            flights: [],
            search: {}
        };
    }

    /* retrieves filtered flights and search information from LocalStorage in order to display information to the user */
    componentDidMount() {
        AsyncStorage.getItem('filteredFlights').then((result) => {
            var flights = JSON.parse(result);
            this.setState({
                flights: flights
            });
        });
        AsyncStorage.getItem('search').then((result) => {
            var search = JSON.parse(result);
            this.setState({
                search: search
            });
        });
    }

    /* renders the screen */
    render() {
        return (
            <View style={styles.container}>
                <Text>{'\n'}</Text>
                <Text style={styles.heading}>{this.state.search.origin} > {this.state.search.dest}</Text>
                <Text>Depart: {this.state.search.departString}</Text>
                <Text>{'\n'}</Text>
                {
                    this.state.flights.length != 0 ? (
                        <FlatList
                            data={this.state.flights}
                            keyExtractor={(item, index) => index}
                            renderItem={({ item, index }) => (
                                <View key={index} style={styles.listItem}>
                                    <Text>${item.totalPrice}</Text>
                                    <Text>{item.flightNo}</Text>
                                    <Text>{item.originCode} > {item.destCode}</Text>
                                    <Text>Depart: {item.departString}</Text>
                                    <Text>Arrive: {item.arriveString}</Text>
                                </View>
                            )}
                        />
                    ) : (
                            <View>
                                <Text>Sorry, no results found for</Text>
                                <Text>{this.state.search.origin} > {this.state.search.dest}</Text>
                                <Text>Departing {this.state.search.depart}</Text>
                                <Text>Try modifying your search!</Text>
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
    listItem: {
        borderRadius: 5,
        borderColor: 'gray',
        borderWidth: 1,
        width: 300,
        backgroundColor: 'white',
        padding: 20,
        marginVertical: 10
    }
});

export default OneWayScreen;