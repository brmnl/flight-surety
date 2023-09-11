# Flight Surety

An InsurTech flight delay insurance solution based on Ethereum smart contract that uses trustless Oracles for flight information.

## Project Description

Flight Surety is an insurance product designed for airline passengers. It provides credits to passengers when their flights are delayed due to airline faults. This credit can be withdrawn by passengers at their convenience. The system operates through a smart contract deployed on the Ethereum blockchain, which is funded with Ether and managed by a consortium of airlines. The smart contract disburses credits to insured passengers when specific conditions, such as flight delays due to airline errors, are met.

Oracles play a vital role by providing flight status information to the smart contract, which determines whether passengers are eligible for credits.

## Project Architecture

The project comprises two primary components: a pair of smart contracts and the Decentralized Application (DApp).

**Smart Contracts:** The first smart contract, coded in Solidity and residing on the Ethereum blockchain, is responsible for data persistence, managing the allocation of credits to insured passengers. The second smart contract handles application logic and oracle code.

**DApp:** The DApp is a web application developed using HTML, CSS, and JavaScript. It leverages Web3.js to seamlessly interact with both smart contracts. A Node.js server, powered by Express.js, serves web pages and provides a REST API for interactions with the smart contracts.

## Getting Started

### Prerequisites

- Node.JS v10.7.0
- Python 2.7.18 (for node-gyp)
- Truffle v5.0.2
- Solidity v0.4.24 (solc-js)
- Web3.js v1.0.0-beta.37
- Ganache-CLI v6.12.2
- Babel v7.0.0-beta.46
- Babel Core v6.26.3
- BigNumber.js v8.0.2
- CSS Loader v1.0.0
- Express v4.16.4
- File Loader v3.0.1
- HTML Loader v0.5.5
- HTML Webpack Plugin v3.2.0
- OpenZeppelin Solidity v1.10.0
- Start Server Webpack Plugin v2.2.5
- Style Loader v0.23.1
- Superstatic v6.0.3
- Truffle HDWallet Provider v1.0.2
- Webpack v4.35.2
- Webpack CLI v3.3.6
- Webpack Dev Server v3.7.2
- Webpack Node Externals v1.7.2

### Installation

Install all requisite npm packages (as listed in `package.json`) and compile smart contracts:

```
npm install --python=python2
npm install -g truffle@5.0.2 --python=python2
npm install -g ganache-cli@6.12.2 --python=python2
```

Run Ganache:

```
ganache-cli -l 99999999999999 -m "wish exercise slender legal goose lecture subway excuse casino spoil clerk gesture" -e 1000 -a 50
```

Using this command, the mnemonic is used to generate 50 accounts with 1000 ETH each. The `-l` flag sets the block gas limit to a very high number, `-e` sets the default account balance to 1000 ETH, and `-a` sets the number of accounts to generate.

Compile smart contracts:

```
truffle compile
```

Run truffle tests:

```
truffle test ./test/flightSurety.js
truffle test ./test/oracles.js
```

Use DApp:

```
truffle migrate
npm run dapp
```

Browse to http://localhost:8000 to use the DApp.

Deploy mock Oracles server:

```
npm run server
truffle test ./test/oracles.js
```

## Project Requirements (To Do's)

### Separation of Concerns, Operational Control and “Fail Fast”

- [x] Smart Contract code is separated into multiple contracts, each with a single purpose.
  - [x] FlightSuretyData.sol for data persistence
  - [x] FlightSuretyApp.sol for app logic and oracles code
- [x] A Dapp client has been created and is used for triggering contract calls. Client can be launched with “npm run dapp” and is available at http://localhost:8000
  - [ ] Passenger can purchase insurance for flight
  - [ ] Trigger contract to request flight status update
- [ ] A server app has been created for simulating oracle behavior. Server can be launched with “npm run server”
- [ ] Operational status control is implemented in contracts
- [ ] Contract functions “fail fast” by having a majority of “require()” calls at the beginning of function body

### Airlines

- [ ] First airline is registered when contract is deployed.
- [ ] Only existing airline may register a new airline until there are at least four airlines registered
  - [ ] Demonstrated either with Truffle test or by making call from client Dapp
- [ ] Registration of fifth and subsequent airlines requires multi-party consensus of 50% of registered airlines
  - [ ] Demonstrated either with Truffle test or by making call from client Dapp
- [ ] Airline can be registered, but does not participate in contract until it submits funding of 10 ether
  - [ ] Demonstrated either with Truffle test or by making call from client Dapp

### Passengers

- [ ] Passengers can choose from a fixed list of flight numbers and departures that are defined in the Dapp client
- [ ] UI implementation should include:
  - [ ] Fields for Airline Address and Airline Name
  - [ ] Amount of funds to send/which airline to send to
  - [ ] Ability to purchase flight insurance for no more than 1 ether
- [ ] Passengers may pay up to 1 ether for purchasing flight insurance.
- [ ] If flight is delayed due to airline fault, passenger receives credit of 1.5X the amount they paid
- [ ] Passenger can withdraw any funds owed to them as a result of receiving credit for insurance payout
- [ ] Insurance payouts are not sent directly to passenger's wallet

### Mock Oracles (Server App)

- [ ] Oracle functionality is implemented in the server app.
- [ ] Upon startup, 20+ oracles are registered and their assigned indexes are persisted in memory
- [ ] Update flight status requests from client Dapp result in OracleRequest event emitted by Smart Contract that is captured by server (displays on console and handled in code)
- [ ] Server will loop through all registered oracles, identify those oracles for which the OracleRequest event applies, and respond by calling into FlightSuretyApp contract with random status code of Unknown (0), On Time (10) or Late Airline (20), Late Weather (30), Late Technical (40), or Late Other (50)
