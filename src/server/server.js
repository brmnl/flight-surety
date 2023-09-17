import FlightSuretyApp from "../../build/contracts/FlightSuretyApp.json";
import Config from "./config.json";
import Web3 from "web3";
import express from "express";

// Configuration

let config = Config["localhost"];
let web3 = new Web3(
  new Web3.providers.WebsocketProvider(config.url.replace("http", "ws"))
);
let oracles = [];
let statusCodes = [0, 10, 20, 30, 40, 50];

web3.eth.defaultAccount = web3.eth.accounts[0];
let flightSuretyApp = new web3.eth.Contract(
  FlightSuretyApp.abi,
  config.appAddress
);

// Smart Contract Interactions

// Catch emitted OracleRequest events and submit responses to oracles

flightSuretyApp.events.OracleRequest(
  {
    fromBlock: "latest",
  },
  function (error, event) {
    if (error) console.log(error);
    console.log("OracleRequest event:", event);
    processOracleRequest({
      index: Number(event.returnValues.index),
      airline: event.returnValues.airline,
      flight: event.returnValues.flight,
      timestamp: event.returnValues.timestamp,
    });
  }
);

flightSuretyApp.events.FlightStatusInfo(
  {
    fromBlock: "latest",
  },
  function (error, event) {
    if (error) console.log(error);
    console.log("Oracle quorum reached, status validated:", event);
  }
);

// Use last 25 addresses as oracles and register them

web3.eth.getAccounts().then((accounts) => {
  web3.eth.defaultAccount = accounts[0];
  for (let i = 25; i < 49; i++) {
    flightSuretyApp.methods
      .registerOracle()
      .send({
        from: accounts[i],
        gas: 5000000,
        value: web3.utils.toWei("1", "ether"),
      })
      .then((r) => {
        flightSuretyApp.methods
          .getMyIndexes()
          .call({ from: r.from })
          .then((indexes) => {
            console.log("Oracle registered:", r.from, indexes);
            oracles.push({
              address: accounts[i],
              indexes: indexes,
            });
          });
      });
  }
});

function processOracleRequest(req) {
  oracles.forEach((oracle) => {
    let i = oracle.indexes.map(Number);
    if (i.indexOf(req.index) >= 0) {
      let status = getFlightStatus();
      console.log(
        "Flight status:",
        req.airline,
        req.flight,
        req.timestamp,
        status
      );
      flightSuretyApp.methods
        .submitOracleResponse(
          req.index,
          req.airline,
          req.flight,
          req.timestamp,
          status
        )
        .send({ from: oracle.address, gas: 5000000 })
        .then((r) => console.log("submitOracleResponse was successful."))
        .catch((e) =>
          console.log("submitOracleResponse resulted in an error: ", e)
        );
    }
  });
}

function getFlightStatus() {
  let randomIndex = Math.floor(Math.random() * statusCodes.length);
  return statusCodes[randomIndex];
}

// ExpressJS server

const app = express();
app.get("/api", (req, res) => {
  res.send({
    message: "An API for use with your Dapp!",
  });
});

export default app;
