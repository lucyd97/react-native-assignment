import React, { Component } from 'react';
import { View, Text, StyleSheet, Button, TextInput, Picker, AsyncStorage, Slider } from 'react-native';
import Constants from 'expo-constants';
import Axios from 'axios';

/*
* Search Screen
*   - screen the user sees after loggin in
*   - retrieves flight information from flights.json
*   - get search inputs from user
*   - filters flights based of the users search
*       - user may want a one way flight, or a return flight
*           - if return: have to find pairs of flights that match (i.e. dates/times make sense)
*       - format time and date for user-friendly output
*   - saves the filterd flights in LocalStorage for retrieval by the relevant display screen (OneWayScreen/ReturnScreen)
*/

class SearchScreen extends Component {
    constructor() {
        super();
        this.state = {
            flights: [],
            origin: "",
            dest: "",
            isReturn: false,
            depart: "",
            return: "",
            passengers: 1,
            filteredFlights: []
        };
    }

    /* retrieves flight information from flights.json */
    componentDidMount() {
        Axios.get("http://localhost:3000/flights")
            .then(result => {
                this.setState({
                    flights: result.data,
                })
            })
            .catch(error =>
                this.setState({
                    error,
                })
            );
    }

    /* sets state to reflect whether user wants a one way flight or return trip */
    setReturn(value) {
        if (value === "true") {
            this.setState({
                isReturn: true
            });
        } else {
            this.setState({
                isReturn: false
            })
        }
    }
    /* called when user presses search button, calls updateState() to filter flights, then navigates to relevant display screen */
    handleSearch() {
        this.updateState();
        if (this.state.isReturn) {
            this.props.navigation.navigate('Return');
        } else {
            this.props.navigation.navigate('OneWay');
        }
    }

    /* fiters flights to select only those from origin to destination and vice versa */
    updateState() {
        var departDate = new Date(this.state.depart);
        var returnDate = new Date(this.state.return);

        var originDestNew = [];
        var destOriginNew = [];
        this.state.flights.map(flight => {
            if (flight.origin === this.state.origin && flight.destination === this.state.dest && flight.departDate === this.state.depart) {
                /* calls method to format departure and arrival time for user-friendly output */
                flight.departString = this.formatTime(flight.departTime);
                flight.arriveString = this.formatTime(flight.arriveTime);
                flight.totalPrice = (flight.price * this.state.passengers);
                originDestNew.push(flight);

            } else if (flight.origin === this.state.dest && flight.destination === this.state.origin && flight.departDate === this.state.return && this.state.isReturn) {
                flight.departString = this.formatTime(flight.departTime);
                flight.arriveString = this.formatTime(flight.arriveTime);
                flight.totalPrice = (flight.price * this.state.passengers);
                destOriginNew.push(flight);
            }
        })
        if (this.state.isReturn) {
            /* if the user wants a return flight, calls method to organise pairs of flights that match */
            this.setPairs(originDestNew, destOriginNew);
        } else {
            /* otherwise we only need the list of flights from origin to destination */
            this.setState({
                filteredFlights: originDestNew,
            });
            AsyncStorage.setItem('filteredFlights', JSON.stringify(originDestNew));
        }

        var searchState = {
            origin: this.state.origin,
            dest: this.state.dest,
            depart: this.state.depart,
            return: this.state.return,
            departString: departDate.toDateString(),
            returnString: returnDate.toDateString()
        };

        AsyncStorage.setItem('search', JSON.stringify(searchState));

    }

    /* Method to organise pairs of flights that match */
    setPairs(origin, dest) {
        var pairsList = [];
        origin.forEach(originFlight => {
            dest.forEach(destFlight => {
                if (((originFlight.departDate !== destFlight.departDate) ||
                    (originFlight.arriveTime < destFlight.departTime))) {
                    pairsList.push({
                        origin: originFlight,
                        dest: destFlight,
                        totalPrice: ((originFlight.price + destFlight.price) * this.state.passengers)
                    });
                }
            })
        });
        this.setState({
            filteredFlights: pairsList
        });
        AsyncStorage.setItem('filteredFlights', JSON.stringify(pairsList));
    }

    /* Method to format departure and arrival time for user-friendly output */
    formatTime(time) {
        var timeString = "";
        if (time < 1200) {
            time = time / 100.00;
            if (time % 1 === 0) {
                timeString = time + ".00 AM";
            } else {
                timeString = time + "0 AM";
            }
        } else if (time === 1200) {
            time = time / 100.00;
            if (time % 1 === 0) {
                timeString = time + ".00 PM";
            } else {
                timeString = time + "0 PM";
            }
        } else {
            time = (time - 1200) / 100.00;
            if (time % 1 === 0) {
                timeString = time + ".00 PM";
            } else {
                timeString = time + "0 PM";
            }
        }
        return timeString;
    }


    /* renders components for user to input search */
    render() {
        return (
            <View style={styles.container}>
                <Text style={styles.paragraph}>Flight Search Engine</Text>
                <Text>{'\n'}</Text>

                <Picker
                    style={styles.picker}
                    selectedValue={this.state.framework}
                    onValueChange={(isReturn) => this.setReturn(isReturn)}>
                    <Picker.Item label="One Way" value={"false"} />
                    <Picker.Item label="Return" value="true" />
                </Picker>

                <Text>{'\n'}</Text>

                <TextInput style={styles.box} name="origin" id="origin" placeholder="Enter origin city" onChangeText={(value) => {
                    this.setState({ origin: value });
                }} />
                <Text>{'\n'}</Text>

                <TextInput style={styles.box} name="dest" id="dest" placeholder="Enter destination city" onChangeText={(value) => {
                    this.setState({ dest: value });
                }} />
                <Text>{'\n'}</Text>

                <TextInput style={styles.box} name="depart" id="depart" placeholder="Enter departure date (YYYY-MM-DD)" onChangeText={(value) => {
                    this.setState({ depart: value });
                }} />
                <Text>{'\n'}</Text>

                {this.state.isReturn ? (
                    <TextInput style={styles.box} name="return" id="return" placeholder="Enter return date (YYYY-MM-DD)" onChangeText={(value) => {
                        this.setState({ return: value });
                    }} />
                ) : (
                        null
                    )}
                <Text>{'\n'}</Text>

                <TextInput style={styles.box} keyboardType='numeric' name="passengers" id="passengers" placeholder="Enter number of passengers" onChangeText={(value) => {
                    this.setState({ passengers: value });
                }} />

                <Text>{'\n'}</Text>
                <Button
                    title="Search"
                    onPress={() => this.handleSearch()}
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
    paragraph: {
        fontSize: 18,
        fontWeight: 'bold',
        textAlign: 'center',
    },
    box: {
        borderRadius: 5,
        borderColor: 'gray',
        borderWidth: 1,
        width: 300,
        backgroundColor: 'white',
        height: 20,
        padding: 15,
    },
    picker: {
        borderRadius: 5,
        width: 200,
        borderColor: 'gray',
        borderWidth: 1,
    }
});

export default SearchScreen;