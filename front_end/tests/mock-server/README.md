# ASTRA GUI Mock API Server

This is a simple mock API server for testing the ASTRA GUI application. It simulates the behavior of the backend API endpoints without requiring the actual backend to be running.

## Features

- RESTful API endpoints for mission management
- Persists mission data to JSON files
- Generates mock simulation results
- CORS enabled for browser access
- Completely isolated from production code

## Setup

1. Install Node.js and npm if not already installed.
2. Navigate to the mock server directory:
   ```
   cd front_end/tests/mock-server
   ```
3. Install dependencies:
   ```
   npm install
   ```

## Running the Server

To start the mock server:

```
npm start
```

For development with auto-restart on file changes:

```
npm run dev
```

The server will start on port 3000 by default. You can change this by setting the `PORT` environment variable.

## Available Endpoints

- `GET /api/missions` - Get a list of all missions
- `GET /api/missions/:id` - Get a specific mission by ID
- `POST /api/missions` - Create a new mission
- `PUT /api/missions/:id` - Update an existing mission
- `DELETE /api/missions/:id` - Delete a mission
- `POST /api/launch/:id` - Launch a mission simulation
- `GET /api/results/:id` - Get mission simulation results

## Data Storage

Mission data is stored in JSON files in the `data` directory. Results are stored in the `data/results` directory. These directories are created automatically if they don't exist.

## Testing with Cypress

This mock server is designed to work with the Cypress tests in the `front_end/tests/cypress` directory. The server should be running when you execute API tests.

For example, to run the API tests:

1. Start the mock server:

   ```
   cd front_end/tests/mock-server
   npm start
   ```

2. In another terminal, run the Cypress tests:
   ```
   cd front_end/tests
   npm run cypress:run -- --spec "cypress/e2e/04-api-tests.cy.js"
   ```

## Creating Custom Scenarios

You can create custom test scenarios by manually placing JSON files in the `data` directory. The file format should be `mission_[id].json` where `[id]` is a unique identifier.

## Limitations

This is a simplified mock server intended for testing only. It does not implement all the features or security measures of a production server.

- No authentication/authorization
- Limited validation
- No real simulation processing
- Mock results are predetermined
