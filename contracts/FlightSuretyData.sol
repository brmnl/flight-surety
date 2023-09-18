pragma solidity ^0.4.25;

import "../node_modules/openzeppelin-solidity/contracts/math/SafeMath.sol";

contract FlightSuretyData {
    using SafeMath for uint256;

    /********************************************************************************************/
    /*                                       DATA VARIABLES                                     */
    /********************************************************************************************/

    struct Airline {
        bool registered;
        bool funded;
        string name;
        address addr;
    }

    struct Flight {
        bool registered;
        string code;
        uint8 statusCode;
        uint256 departure;
        address airline;
    }

    struct FlightInsurance {
        address passenger;
        address airline;
        uint coverage;
    }

    address private contractOwner; // Account used to deploy contract
    bool private operational = true; // Blocks all state changes throughout the contract if false
    mapping(address => bool) private authorizedCaller;

    uint256 private contractAssets = 0;
    mapping(address => uint256) private customerAssets;
    mapping(address => Airline) private airlines;
    address[] public registeredAirlines;

    mapping(bytes32 => Flight) private flights;
    mapping(address => bytes32[]) public airlineFlights;
    bytes32[] regFlights = new bytes32[](0);
    mapping(bytes32 => FlightInsurance[]) insuredPassenger;

    /********************************************************************************************/
    /*                                       EVENT DEFINITIONS                                  */
    /********************************************************************************************/

    /**
     * @dev Constructor
     *      The deploying account becomes contractOwner
     */
    constructor(address firstAirlineAddr, string firstAirlineName) public {
        contractOwner = msg.sender;
        authorizedCaller[contractOwner] = true;
        airlines[firstAirlineAddr] = Airline({
            registered: false,
            funded: false,
            name: firstAirlineName,
            addr: firstAirlineAddr
        });
        registeredAirlines.push(firstAirlineAddr);
        airlines[firstAirlineAddr].registered = true;
    }

    /********************************************************************************************/
    /*                                       FUNCTION MODIFIERS                                 */
    /********************************************************************************************/

    // Modifiers help avoid duplication of code. They are typically used to validate something
    // before a function is allowed to be executed.

    /**
     * @dev Modifier that requires the "operational" boolean variable to be "true"
     *      This is used on all state changing functions to pause the contract in
     *      the event there is an issue that needs to be fixed
     */
    modifier requireIsOperational() {
        require(operational, "Contract is currently not operational");
        _; // All modifiers require an "_" which indicates where the function body will be added
    }

    /**
     * @dev Modifier that requires the "ContractOwner" account to be the function caller
     */
    modifier requireContractOwner() {
        require(tx.origin == contractOwner, "Caller is not contract owner");
        _;
    }

    modifier isAuthorized() {
        require(
            authorizedCaller[msg.sender] == true,
            "Caller is not authorized"
        );
        _;
    }

    /********************************************************************************************/
    /*                                       UTILITY FUNCTIONS                                  */
    /********************************************************************************************/

    /**
     * @dev Get operating status of contract
     *
     * @return A bool that is the current operating status
     */
    function isOperational() public view returns (bool) {
        return operational;
    }

    /**
     * @dev Sets contract operations on/off
     *
     * When operational mode is disabled, all write transactions except for this one will fail
     */
    function setOperatingStatus(bool mode) external requireContractOwner {
        operational = mode;
    }

    function authorizeCaller(
        address addr
    ) external requireIsOperational requireContractOwner {
        authorizedCaller[addr] = true;
    }

    function deauthorizeCaller(
        address addr
    ) external requireIsOperational requireContractOwner {
        delete authorizedCaller[addr];
    }

    /********************************************************************************************/
    /*                                     SMART CONTRACT FUNCTIONS                             */
    /********************************************************************************************/

    /**
     * @dev Add an airline to the registration queue
     *      Can only be called from FlightSuretyApp contract
     *
     */
    function registerAirline(
        string airlineName,
        address airlineAddress
    ) external requireIsOperational {
        require(
            !airlines[airlineAddress].registered,
            "Airline is already registered."
        );
        airlines[airlineAddress] = Airline({
            registered: false,
            funded: false,
            name: airlineName,
            addr: airlineAddress
        });
    }

    function setAirlineRegistered(
        address airlineAddress
    ) external requireIsOperational {
        require(
            !airlines[airlineAddress].registered,
            "Airline is already registered."
        );
        airlines[airlineAddress].registered = true;
        registeredAirlines.push(airlineAddress);
    }

    function setAirlineFunded(
        address airlineAddress
    ) external requireIsOperational {
        require(
            !airlines[airlineAddress].funded,
            "Airline has already status funded"
        );
        airlines[airlineAddress].funded = true;
    }

    function getRegisteredAirlines()
        external
        view
        requireIsOperational
        returns (address[])
    {
        return registeredAirlines;
    }

    function getAirlineStatus(
        address airlineAddress
    ) external view requireIsOperational returns (bool, bool, string, address) {
        return (
            airlines[airlineAddress].registered,
            airlines[airlineAddress].funded,
            airlines[airlineAddress].name,
            airlines[airlineAddress].addr
        );
    }

    function registerFlight(
        address airline,
        string code,
        uint256 timestamp
    ) external requireIsOperational {
        bytes32 flightKey = getFlightKey(airline, code, timestamp);
        require(!flights[flightKey].registered, "This flight already exists.");
        require(
            airlines[airline].registered && airlines[airline].funded,
            "Airline is not registered and/or funded."
        );

        flights[flightKey] = Flight({
            registered: true,
            code: code,
            statusCode: 0,
            departure: timestamp,
            airline: airline
        });

        regFlights.push(flightKey);
        airlineFlights[airline].push(flightKey);
    }

    /**
     * @dev Buy insurance for a flight
     *
     */

    function buy(
        address passenger,
        address airline,
        string flight,
        uint256 departure,
        uint coverage
    ) external payable requireIsOperational {
        bytes32 flightKey = getFlightKey(airline, flight, departure);
        require(flights[flightKey].registered, "Flight is not registered.");
        require(coverage <= 1 ether, "Coverage cannot be more than 1 ether.");
        insuredPassenger[flightKey].push(
            FlightInsurance({
                passenger: passenger,
                airline: airline,
                coverage: coverage
            })
        );
    }

    /**
     *  @dev Credits payouts to insurees
     */
    function creditInsurees() external pure {}

    /**
     *  @dev Transfers eligible payout funds to insuree
     *
     */
    function pay() external pure {}

    /**
     * @dev Initial funding for the insurance. Unless there are too many delayed flights
     *      resulting in insurance payouts, the contract should be self-sustaining
     *
     */

    // Airline after registering needs to fund itself with at least 10 ether to get status funded
    function fund(address airline, uint256 funding) public payable {
        require(airlines[airline].registered, "Airline is not registered.");
        require(!airlines[airline].funded, "Airline is already funded.");
        require(
            funding >= 10 ether,
            "Airline needs to fund itself with at least 10 ether"
        );
        airlines[airline].funded = true;
        contractAssets = contractAssets.add(funding);
    }

    function getFlightKey(
        address airline,
        string memory flight,
        uint256 timestamp
    ) internal pure returns (bytes32) {
        return keccak256(abi.encodePacked(airline, flight, timestamp));
    }

    /**
     * @dev Fallback function for funding smart contract.
     *
     */
    function() external payable {
        // fund(msg.sender, msg.value);
    }
}
