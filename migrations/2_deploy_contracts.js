const FlightSuretyApp = artifacts.require("FlightSuretyApp");
const FlightSuretyData = artifacts.require("FlightSuretyData");
const fs = require("fs");

module.exports = function (deployer) {
  let firstAirline = "0x8B7Dd81f4A41e723823E8f470352c08962e3Ef29";
  deployer.deploy(FlightSuretyData).then(() => {
    return deployer.deploy(FlightSuretyApp).then(() => {
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
