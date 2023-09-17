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

    // User-submitted transaction
    DOM.elid("submit-oracle").addEventListener("click", () => {
      let flight = DOM.elid("flight-number").value;
      // Write transaction
      contract.fetchFlightStatus(flight, (error, result) => {
        display_replace(
          [
            {
              label: "Fetch Flight Status",
              error: error,
              value: result.flight + " " + result.timestamp,
            },
          ],
          "display-wrapper"
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
