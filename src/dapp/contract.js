import FlightSuretyApp from "../../build/contracts/FlightSuretyApp.json";
import Config from "./config.json";
import Web3 from "web3";

export default class Contract {
  constructor(network, callback) {
    let config = Config[network];
    this.web3 = new Web3(new Web3.providers.HttpProvider(config.url));
    this.flightSuretyApp = new this.web3.eth.Contract(
      FlightSuretyApp.abi,
      config.appAddress
    );
    this.initialize(callback);
    this.owner = null;
    this.airlines = [];
    this.passengers = [];
  }

  initialize(callback) {
    this.web3.eth.getAccounts((error, accts) => {
      this.owner = accts[0];

      let counter = 1;

      while (this.airlines.length < 5) {
        this.airlines.push(accts[counter++]);
      }

      while (this.passengers.length < 5) {
        this.passengers.push(accts[counter++]);
      }

      callback();
    });
  }

  isOperational(callback) {
    let self = this;
    self.flightSuretyApp.methods
      .isOperational()
      .call({ from: self.owner }, callback);
  }

  setOperatingStatus(opsStatus, fromAddress, callback) {
    let self = this;
    let payload = {
      mode: opsStatus,
    };
    self.flightSuretyApp.methods
      .setOperatingStatus(payload.mode)
      .send({ from: fromAddress }, (error, result) => {
        callback(error, payload);
      });
  }

  fetchFlightStatus(flight, callback) {
    let self = this;
    let payload = {
      airline: self.airlines[0],
      flight: flight,
      timestamp: Math.floor(Date.now() / 1000),
    };
    self.flightSuretyApp.methods
      .fetchFlightStatus(payload.airline, payload.flight, payload.timestamp)
      .send({ from: self.owner }, (error, result) => {
        callback(error, payload);
      });
  }

  registerAirline(airlineAddress, airlineName, callback) {
    let self = this;
    let payload = {
      airline: airlineAddress,
      name: airlineName,
    };
    self.flightSuretyApp.methods
      .registerAirline(payload.name, payload.airline)
      .send({ from: airlineAddress }, (error, result) => {
        callback(error, payload);
      });
  }

  registerFlight(airline, code, departure, callback) {
    let self = this;
    let payload = {
      airline: airline,
      code: code,
      departure: departure,
    };
    self.flightSuretyApp.methods
      .registerFlight(payload.airline, payload.code, payload.departure)
      .send({ from: airline, gas: 500000 }, (error, result) => {
        callback(error, payload);
      });
  }

  authorizePendingAirlineRegistration(authorizer, authorized, callback) {
    let self = this;
    let payload = {
      authorizer: authorizer,
      authorized: authorized,
    };
    self.flightSuretyApp.methods
      .authorizePendingAirlineRegistration(payload.authorized)
      .send({ from: authorizer, gas: 500000 }, (error, result) => {
        callback(error, payload);
      });
  }

  fund(airlineAddress, airlineEther, callback) {
    let self = this;
    let payload = {
      airline: airlineAddress,
      ether: airlineEther,
    };

    self.flightSuretyApp.methods
      .fund(airlineAddress, Web3.utils.toWei(payload.ether, "ether"))
      .send(
        {
          from: airlineAddress,
          value: Web3.utils.toWei(airlineEther, "ether"),
        },
        (error, result) => {
          callback(error, payload);
        }
      );
  }

  getAirlineStatus(airlineAddress, callback) {
    let self = this;
    self.flightSuretyApp.methods
      .getAirlineStatus(airlineAddress)
      .call({ from: airlineAddress }, callback);
  }
}
