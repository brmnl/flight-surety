import DOM from "./dom";
import Contract from "./contract";
import "./flightsurety.css";
import TestAddreses from "./addresses.json";

(async () => {
  let result = null;

  let contract = new Contract("localhost", () => {
    // Read transaction
    contract.isOperational((error, result) => {
      console.log(error, result);
      display(
        [{ label: "Operational Status", error: error, value: result }],
        "ops-status"
      );
    });

    contract.getRegisteredAirlines((error, result) => {
      console.log(error, result);

      const selectElements = document.querySelectorAll(
        ".listregisteredairlines"
      );

      selectElements.forEach((selectElement) => {
        selectElement.innerHTML = "";

        let airlineName = null;
        result.forEach((address) => {
          contract.getAirlineStatus(address, (error, resultAirline) => {
            console.log(error, resultAirline);
            airlineName = resultAirline[2];
            const option = document.createElement("option");
            option.value = address;
            option.textContent = `${airlineName}: ${address}`;
            selectElement.appendChild(option);
          });
        });
      });
    });

    // Get Credit Balance
    DOM.elid("getCreditBalance").addEventListener("click", () => {
      let passenger = DOM.elid("passengersActAsAccount").value;
      contract.getCreditBalance(passenger, (error, result) => {
        console.log(error, result);
        display(
          [
            {
              label: "getCreditBalance",
              error: error,
              value: `result: ${result}`,
            },
          ],
          "passenger-status"
        );
      });
    });

    // Withdraw Credit Balance
    DOM.elid("withdrawCreditBalance").addEventListener("click", () => {
      let passenger = DOM.elid("passengersActAsAccount").value;
      contract.pay(passenger, (error, result) => {
        console.log(error, result);
        display(
          [
            {
              label: "withdrawCreditBalance",
              error: error,
              value: `result: ${result}`,
            },
          ],
          "passenger-status"
        );
      });
    });

    // User-submitted transaction
    DOM.elid("submit-oracle").addEventListener("click", () => {
      let airline = DOM.elid("oracleAirline").value;
      let flight = DOM.elid("oracleCode").value;
      let departure = DOM.elid("oracleTime").value;
      // Write transaction
      contract.fetchFlightStatus(
        airline,
        flight,
        departure,
        (error, result) => {
          display(
            [
              {
                label: "Fetch Flight Status",
                error: error,
                value:
                  result.airline + " " + result.flight + " " + result.departure,
              },
            ],
            "display-wrapper"
          );
        }
      );
    });

    // Get Passenger Account Balance
    DOM.elid("getAccountBalance").addEventListener("click", () => {
      let passenger = DOM.elid("passengersActAsAccount").value;

      contract.getAccountBalance(passenger, (error, result) => {
        if (error) {
          return;
        }

        display(
          [
            {
              label: "Passenger Account Balance (Wei)",
              error: null,
              value: result,
            },
          ],
          "passenger-status"
        );
      });
    });

    // Register Airline
    DOM.elid("registerAirline").addEventListener("click", () => {
      let airlineAddress = DOM.elid("airlinesActAsAccount").value;
      let airlineName = DOM.elid("airlinesName").value;

      contract.registerAirline(airlineAddress, airlineName, (error, result) => {
        display(
          [
            {
              label: "Register Airline",
              error: error,
              value: result.airline + " " + result.name,
            },
          ],
          "airlines-status"
        );
      });
    });

    // Get Airline Status
    DOM.elid("getAirlineStatus").addEventListener("click", () => {
      let airlineAddress = DOM.elid("airlinesActAsAccount").value;
      contract.getAirlineStatus(airlineAddress, (error, result) => {
        console.log(error, result);
        // extract values from result
        const { 0: registered, 1: funded, 2: name, 3: address } = result;
        display(
          [
            {
              label: "Airline Status",
              error: error,
              value: `address: ${address},  
                      name: ${name}, 
                      registered: ${registered},
                      funded: ${funded}`,
            },
          ],
          "airlines-status"
        );
      });
    });

    // Authorize Airline
    DOM.elid("authorizeAirline").addEventListener("click", () => {
      let authorizerAddress = DOM.elid("airlinesActAsAccount").value;
      let authorizedAddress = DOM.elid("airlinesTargetAccount").value;
      contract.authorizePendingAirlineRegistration(
        authorizerAddress,
        authorizedAddress,
        (error, result) => {
          console.log(error, result);
          display(
            [
              {
                label: "Authorize Airline",
                error: error,
                value: `authorizer: ${authorizerAddress}, authorized: ${authorizedAddress}`,
              },
            ],
            "airlines-status"
          );
        }
      );
    });

    // Fund Airline
    DOM.elid("fundAirline").addEventListener("click", () => {
      let airlineAddress = DOM.elid("airlinesActAsAccount").value;
      let airlineEther = DOM.elid("airlinesEther").value;
      contract.fund(airlineAddress, airlineEther, (error, result) => {
        console.log(error, result);
        display(
          [
            {
              label: "Fund Airline",
              error: error,
              value: `address: ${airlineAddress}, ether: ${airlineEther}`,
            },
          ],
          "airlines-status"
        );
      });
    });

    // Buy Insurance
    DOM.elid("buyInsurance").addEventListener("click", () => {
      let insurancePassenger = DOM.elid("passengersActAsAccount").value;
      let insuranceAirline = DOM.elid("passengersRegisteredAirlines").value;
      let insuranceFlight = DOM.elid("passflightCodes").value;
      let insuranceDeparture = DOM.elid("passDeparture").value;
      let insuranceEther = DOM.elid("passEther").value;
      contract.buy(
        insurancePassenger,
        insuranceAirline,
        insuranceFlight,
        insuranceDeparture,
        insuranceEther,
        (error, result) => {
          console.log(error, result);
          display(
            [
              {
                label: "Buy Insurance",
                error: error,
                value: `passenger: ${insurancePassenger}, 
                      airline: ${insuranceAirline}, 
                      flight: ${insuranceFlight}, 
                      departure: ${insuranceDeparture}, 
                      coverage: ${insuranceEther}`,
              },
            ],
            "passenger-status"
          );
        }
      );
    });

    // Register Flight
    DOM.elid("registerFlight").addEventListener("click", () => {
      let flightCode = DOM.elid("flightCodes").value;
      let departure = DOM.elid("departure").value;
      let airline = DOM.elid("flightsActAsAccount").value;
      contract.registerFlight(
        airline,
        flightCode,
        departure,
        (error, result) => {
          console.log(error, result);
          display(
            [
              {
                label: "Register Flight",
                error: error,
                value: `airline: ${airline}, flightCode: ${flightCode}, departure: ${departure}`,
              },
            ],
            "flight-status"
          );
        }
      );
    });

    // Set Operational Status
    DOM.elid("submit-status-change").addEventListener("click", () => {
      let opsStatus = null;
      let fromAddress = DOM.elid("actAsAccount").value;

      if (DOM.elid("setOpsStatus").value == 1) {
        opsStatus = true;
      } else {
        opsStatus = false;
      }

      contract.setOperatingStatus(opsStatus, fromAddress, (error, result) => {
        if (error) {
          display_replace(
            [{ label: "Operational Status", error: error, value: result }],
            "ops-status"
          );
        } else {
          contract.isOperational((error, result) => {
            console.log(error, result);
            display_replace(
              [{ label: "Operational Status", error: error, value: result }],
              "ops-status"
            );
          });
        }
      });
    });
  });

  // Populate the options from the JSON file
  populateAddressOptions("addroptions");
})();

function display(results, containerId) {
  let displayDiv = DOM.elid(containerId);
  let section = DOM.section();

  results.map((result) => {
    let row = section.appendChild(DOM.div({ className: "row mt-4" }));
    row.appendChild(
      DOM.div(
        { className: "col-sm-4 field p-1 border rounded-left" },
        result.label
      )
    );
    row.appendChild(
      DOM.div(
        {
          className:
            "col-sm-8 field-value p-1 border-top border-right border-bottom rounded-right",
        },
        result.error ? String(result.error) : String(result.value)
      )
    );
    section.appendChild(row);
  });
  displayDiv.append(section);
}

function display_replace(results, containerId) {
  let displayDiv = DOM.elid(containerId);
  let section = displayDiv.querySelector("section");

  if (!section) {
    section = DOM.section();
    displayDiv.appendChild(section);
  } else {
    while (section.firstChild) {
      section.removeChild(section.firstChild);
    }
  }

  results.map((result) => {
    let row = section.appendChild(DOM.div({ className: "row mt-4" }));
    row.appendChild(
      DOM.div(
        { className: "col-sm-4 field p-1 border rounded-left" },
        result.label
      )
    );
    row.appendChild(
      DOM.div(
        {
          className:
            "col-sm-8 field-value p-1 border-top border-right border-bottom rounded-right",
        },
        result.error ? String(result.error) : String(result.value)
      )
    );
  });
}

function populateAddressOptions(className) {
  try {
    const selectElements = document.querySelectorAll(`.${className}`);

    selectElements.forEach((selectElement) => {
      TestAddreses.forEach((option) => {
        const optionElement = document.createElement("option");
        optionElement.value = option.value;
        optionElement.textContent = option.label;
        selectElement.appendChild(optionElement);
      });
    });
  } catch (error) {
    console.error("Error populating options:", error);
  }
}
