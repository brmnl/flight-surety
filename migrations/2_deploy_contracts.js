const FlightSuretyApp = artifacts.require("FlightSuretyApp");
const FlightSuretyData = artifacts.require("FlightSuretyData");
const fs = require("fs");

module.exports = function (deployer) {
  let firstAirlineAddr = "0x7dd5EeEc705A8e96850a4fb91955c9E542452660"; // Account 2
  let firstAirlineName = "The First Airline"; // Account 2

  deployer
    .deploy(FlightSuretyData, firstAirlineAddr, firstAirlineName)
    .then(() => {
      return deployer
        .deploy(FlightSuretyApp, FlightSuretyData.address)
        .then(() => {
          let config = {
            localhost: {
              url: "http://localhost:8545",
              dataAddress: FlightSuretyData.address,
              appAddress: FlightSuretyApp.address,
            },
          };
          fs.writeFileSync(
            __dirname + "/../src/dapp/config.json",
            JSON.stringify(config, null, "\t"),
            "utf-8"
          );
          fs.writeFileSync(
            __dirname + "/../src/server/config.json",
            JSON.stringify(config, null, "\t"),
            "utf-8"
          );
        });
    });
};
