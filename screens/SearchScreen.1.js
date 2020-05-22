import React, { Component } from 'react';
import { View, Text, StyleSheet, Button, TextInput, Picker, AsyncStorage, Slider } from 'react-native';
import { NativeSelect, TextField } from '@material-ui/core';
import 'typeface-roboto';
import Constants from 'expo-constants';
import Axios from 'axios';

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
  
  setReturn(e) {
      console.log('in set return', e.target.value);
      if (e.target.value === "true") {
          this.setState({
              isReturn: true
          });
      } else {
        this.setState({
            isReturn: false
        })
      }
  }

  handleSearch() {
    console.log('in handle search',this.state);
    this.updateState();
    if (this.state.isReturn) {
        this.props.navigation.navigate('Return');
    } else {
        this.props.navigation.navigate('OneWay');
    }
  }

  /* fiters flights to select only those from origin to destination and vice versa */
  updateState() {
    var originDestNew = [];
    var destOriginNew = [];
    var originDestOneWay = [];
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
            filteredFlights : originDestNew,
        });
        AsyncStorage.setItem('filteredFlights', JSON.stringify(originDestNew));
    }

    var searchState = {
        origin: this.state.origin,
        dest: this.state.dest,
        depart: this.state.depart,
        return: this.state.return
    };

    AsyncStorage.setItem('origin', this.state.origin);
    AsyncStorage.setItem('dest', this.state.dest);
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
                    origin : originFlight,
                    dest : destFlight,
                    totalPrice : ((originFlight.price + destFlight.price)*this.state.passengers)
                });
            }
        })
    });
    this.setState({
        filteredFlights : pairsList
    });
    AsyncStorage.setItem('filteredFlights', JSON.stringify(pairsList));
}

  /* Method to format departure and arrival time for user-friendly output */
  formatTime(time) {
    var timeString = "";
    if (time < 1200) {
      time = time/100.00;
      if (time%1===0) {
          timeString = time + ".00 AM";
      } else {
          timeString = time + "0 AM";
      }
    } else if (time === 1200) {
      time = time/100.00;
      if (time%1===0) {
          timeString = time + ".00 PM";
      } else {
          timeString = time + "0 PM";
      }
    } else {
      time = (time-1200)/100.00;
      if (time%1===0) {
          timeString = time + ".00 PM";
      } else {
          timeString = time + "0 PM";
      }
    }
    return timeString;
}



  render() {
    return (
      <View style={styles.container}>
        <Text style={styles.paragraph}>Flight Search Engine</Text>
        <Text>{'\n'}</Text>

        <NativeSelect id="select" variant="outlined" onChange={(isReturn) => this.setReturn(isReturn)}>
            <option value="false">One Way</option>
            <option value="true">Return</option>
        </NativeSelect>

        <Text>{'\n'}</Text>

        <form noValidate autoComplete="off">
        <TextField id="standard-basic" label="Enter origin city" />
        </form>

        <TextInput style={styles.box} name="origin" id="origin" placeholder = "Enter origin city" onChangeText={(value)=>{
          this.setState({origin: value});
        }}/>
        <Text>{'\n'}</Text>

        <TextInput style={styles.box} name="dest" id="dest" placeholder = "Enter destination city" onChangeText={(value)=>{
          this.setState({dest: value});
        }}/>
        <Text>{'\n'}</Text>

        <TextInput style={styles.box} name="depart" id="depart" placeholder = "Enter departure date (YYYY-MM-DD)" onChangeText={(value)=>{
          this.setState({depart: value});
        }}/>
        <Text>{'\n'}</Text>

        {this.state.isReturn ?  (
                <TextInput style={styles.box} name="return" id="return" placeholder = "Enter return date (YYYY-MM-DD)" onChangeText={(value)=>{
                    this.setState({return: value});
                  }}/>
            ): (
               null 
        )}
        <Text>{'\n'}</Text>

        <TextInput style={styles.box} keyboardType='numeric' name="passengers" id="passengers" placeholder = "Enter number of passengers" onChangeText={(value)=>{
          this.setState({passengers: value});
        }}/>

        <Text>{'\n'}</Text>
        <Button
          title="Search"
          onPress={() => this.handleSearch()}
        />
      </View>
    );
  }
}
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
    width:300,
    backgroundColor:'white',
  },
  picker: {
    borderRadius: 5,
    width: 200,
    borderColor: 'gray',
    borderWidth: 1,
  }
});

export default SearchScreen;