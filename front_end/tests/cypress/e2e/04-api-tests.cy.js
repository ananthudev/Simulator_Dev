/// <reference types="cypress" />

describe("API Interactions", () => {
  const API_URL = "http://localhost:3000/api";

  beforeEach(() => {
    // Visit the mission page
    cy.visit("/front_end/mission.html");
    cy.get("#welcome-message").should("be.visible");

    // Use fixture data for API tests
    cy.fixture("example.json").as("testData");
  });

  it("should create and save a mission to the API", () => {
    cy.get("@testData").then((data) => {
      // Fill mission form
      cy.navigateTo("mission");
      cy.fillMissionForm(data.missionDetails).click();
      cy.acceptSweetAlert();

      // Fill environment form
      cy.navigateTo("environment");
      cy.fillEnvironmentForm(data.environment).click();
      cy.acceptSweetAlert();

      // Save the current finalMissionData to the API
      cy.window().then((win) => {
        // Check that we have mission data in the window
        expect(win.finalMissionData).to.exist;

        // Make a direct API call to save the mission
        cy.request({
          method: "POST",
          url: `${API_URL}/missions`,
          body: win.finalMissionData,
        }).then((response) => {
          // Check response
          expect(response.status).to.eq(201);
          expect(response.body).to.have.property("id");
          expect(response.body).to.have.property(
            "message",
            "Mission created successfully"
          );

          // Store the mission ID
          const missionId = response.body.id;

          // Now fetch the mission data to verify it was saved correctly
          cy.request({
            method: "GET",
            url: `${API_URL}/missions/${missionId}`,
          }).then((getResponse) => {
            expect(getResponse.status).to.eq(200);
            expect(getResponse.body).to.have.property("Mission");
            expect(getResponse.body.Mission.name).to.eq(
              data.missionDetails.name
            );
          });
        });
      });
    });
  });

  it("should get a list of missions from the API", () => {
    // Request missions list
    cy.request({
      method: "GET",
      url: `${API_URL}/missions`,
    }).then((response) => {
      expect(response.status).to.eq(200);
      expect(response.body).to.have.property("missions");
      expect(response.body.missions).to.be.an("array");
    });
  });

  it("should update an existing mission", () => {
    // First create a mission
    cy.get("@testData").then((data) => {
      // Create mission via API
      cy.request({
        method: "POST",
        url: `${API_URL}/missions`,
        body: {
          Mission: data.missionDetails,
          Environment: data.environment,
        },
      }).then((response) => {
        expect(response.status).to.eq(201);
        const missionId = response.body.id;

        // Now update the mission
        cy.request({
          method: "PUT",
          url: `${API_URL}/missions/${missionId}`,
          body: {
            Mission: {
              ...data.missionDetails,
              name: "Updated Mission Name",
            },
            Environment: data.environment,
          },
        }).then((updateResponse) => {
          expect(updateResponse.status).to.eq(200);
          expect(updateResponse.body).to.have.property(
            "message",
            "Mission updated successfully"
          );

          // Verify the update
          cy.request({
            method: "GET",
            url: `${API_URL}/missions/${missionId}`,
          }).then((getResponse) => {
            expect(getResponse.status).to.eq(200);
            expect(getResponse.body.Mission.name).to.eq("Updated Mission Name");
          });
        });
      });
    });
  });

  it("should delete a mission", () => {
    // First create a mission
    cy.get("@testData").then((data) => {
      // Create mission via API
      cy.request({
        method: "POST",
        url: `${API_URL}/missions`,
        body: {
          Mission: data.missionDetails,
          Environment: data.environment,
        },
      }).then((response) => {
        expect(response.status).to.eq(201);
        const missionId = response.body.id;

        // Now delete the mission
        cy.request({
          method: "DELETE",
          url: `${API_URL}/missions/${missionId}`,
        }).then((deleteResponse) => {
          expect(deleteResponse.status).to.eq(200);
          expect(deleteResponse.body).to.have.property(
            "message",
            "Mission deleted successfully"
          );

          // Verify the mission has been deleted
          cy.request({
            method: "GET",
            url: `${API_URL}/missions/${missionId}`,
            failOnStatusCode: false,
          }).then((getResponse) => {
            expect(getResponse.status).to.eq(404);
          });
        });
      });
    });
  });

  it("should launch a mission and get simulation results", () => {
    // Create a mission first
    cy.get("@testData").then((data) => {
      // Create mission via API
      cy.request({
        method: "POST",
        url: `${API_URL}/missions`,
        body: {
          Mission: data.missionDetails,
          Environment: data.environment,
          Vehicle: data.vehicle,
        },
      }).then((response) => {
        expect(response.status).to.eq(201);
        const missionId = response.body.id;

        // Now launch the mission
        cy.request({
          method: "POST",
          url: `${API_URL}/launch/${missionId}`,
        }).then((launchResponse) => {
          expect(launchResponse.status).to.eq(200);
          expect(launchResponse.body).to.have.property(
            "message",
            "Mission launched successfully"
          );
          expect(launchResponse.body).to.have.property("resultId");

          // Get the results
          cy.request({
            method: "GET",
            url: `${API_URL}/results/${missionId}`,
          }).then((resultsResponse) => {
            expect(resultsResponse.status).to.eq(200);
            expect(resultsResponse.body).to.have.property("altitude");
            expect(resultsResponse.body).to.have.property("velocity");
            expect(resultsResponse.body).to.have.property("events");
            expect(resultsResponse.body.events)
              .to.be.an("array")
              .with.length.greaterThan(0);
          });
        });
      });
    });
  });
});
