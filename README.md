# GeoControl API

GeoControl is a web application composed of:
- A web server, which exposes HTTP/Rest/JSON APIs
- A web client which interacts with the server through HTTP/Rest/JSON calls
- A database, which saves the application data

## GeoControl System Overview
GeoControl is a software system designed for monitoring physical and environmental variables in various contexts: from hydrogeological analyses of mountain areas to the surveillance of historical buildings, and even the control of internal parameters (such as temperature or lighting) in residential or working environments.
It was commissioned by the Union of Mountain Communities of the Piedmont region for managing the hydrogeological state of its territories. However, thanks to its modular structure, GeoControl has also been commercialized to different public or private entities requiring continuous monitoring of physical parameters.
The system meets high reliability requirements and must ensure that no more than six measurements per year, per sensor, are lost. From an organizational perspective, GeoControl uses a token-based authentication mechanism, with different user roles to regulate access levels to the functionalities.

## Hierarchical Structure and Components
GeoControl’s hierarchy is organized into three main levels:

1. **Network**
- A logical grouping that acts as a container for multiple gateways (and their associated sensors).
- Identified by a unique alphanumeric code (chosen at creation time) and can represent, for example, a monitoring network for a single municipality or an entire building.
- Does not correspond to a physical device but is instead a software definition to organize and manage different groups of devices.

2. **Gateway**
- A physical device uniquely identified by its MAC address, equipped with a network interface and connected through it to the GeoControl system.
- Connected to one or more sensors via serial interfaces, through which it receives measured values and timestamps.
- Performs the digital conversion of data from the sensors and transmits them over the network.

3. **Sensor**
- The physical device that actually measures the physical quantity (temperature, inclination, etc.) every 10 minutes.
- Lacks its own network interface but is uniquely identified by its MAC address (e.g., 71:B1:CE:01:C6:A9).
- Communicates exclusively with its reference gateway via a serial connection, sending the measured value and a timestamp.
- The timestamp corresponds to the exact moment of measurement. Sensors send the date to the system in ISO 8601 format with their local timezone.

This structure allows for an accurate modeling of field devices, maintaining a precise correspondence between physical entities and the software representation. The GeoControl system, installed on a server, receives sensor measurements from the gateways and manages their storage, analysis, and retrieval.

## Main Functionalities

Below are the main functionalities provided by **GeoControl**, aligned with the system’s main areas:

### Authentication and User Management

- The system requires login credentials (username and password) and issues a token to be included in the `Authorization` header of subsequent requests.
- **Admin role** has full access to all resources, including user and network management.
- **Operator role** can manage networks, gateways, sensors, and insert measurements, but does not have access to user-related functionalities.
- **Viewer role** can only consult data (read-only operations on networks, gateways, and sensors, as well as measurements), and does not have access to user information.

### Topology Management and Synchronization

- Creation, updating, and removal of networks, gateways, and sensors, reflecting any field changes (new devices, replacements, decommissioning, etc.).
- Unique identification of elements:
  - **Code** for networks
  - **MAC address** for gateways and sensors

### Measurement Collection and Storage

- The system records all measurements received from the gateways, associating them with the correct sensors.
- Each measurement includes:
  - A **numeric value**
  - A **timestamp**
- The system converts and stores the timestamp in **ISO 8601 format** using the **UTC** timezone.
- When retrieving data, the system always returns timestamps in UTC, allowing clients to convert them to their local timezone if needed.

**Example:**
- Sensor sends: `2025-02-18T15:30:00+01:00` (Sensor's local timezone: UTC+1)
- System stores: `2025-02-18T14:30:00Z` (Converted to UTC)
- System returns: `2025-02-18T14:30:00Z`
- Client can convert it back to local timezone if needed: `2025-02-18T15:30:00+01:00`

### Calculations and Statistical Analysis

The system must be able to compute:

- **Mean** (μ) and **variance** (σ²) of measurements over a given time span.
- **Thresholds** (upper and lower) to identify potential anomalous values, calculated as:

```text
upperThreshold = μ + 2σ
lowerThreshold = μ - 2σ
```

## Installation and Setup

### Prerequisites

Before starting, ensure you have the following installed on your system:

- **Node.js** (Recommended version: latest LTS)
- **npm** (Node Package Manager, included with Node.js)

### Installing Dependencies

Run the following command to install all required dependencies:

```sh
npm install
```

### Running the Application

#### Starting the API Server

To start the server, run:

```sh
npm start
```

By default, the server runs on

**http://localhost:5000**.

#### Development Mode (Hot Reloading)

For development with hot reloading, use:

```sh
npm run dev
```

This mode restarts the server automatically when code changes.

#### Debugging

For debugging with hot reloading enabled:

- On **Windows**:

  ```sh
  npm run debug-win
  ```

- On **Unix/Linux**:

  ```sh
  npm run debug-unix
  ```

#### Creating the Root User

To create the SQLite database file and add to it an admin user with credentials `root:rootpassword`, execute:

```sh
npm run create-root
```

#### Running Tests

To run the test, the command provided is:

```sh
npm test
```

which runs the test with coverage using Jest

### Windows Execution Policy Issue

If you encounter an execution policy error like:

```
+ CategoryInfo          : SecurityError: (:) [], PSSecurityException
+ FullyQualifiedErrorId : UnauthorizedAccess
```

Run the following command before executing scripts:

```sh
Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass
```

## API Documentation

The API follows an **OpenAPI specification**, with the definition stored in:

```
doc/swagger_v1.yaml
```

Once the application is running, the **Swagger UI** is available at:

**http://localhost:5000/api/v1/doc**

The Swagger documentation provides a complete definition and description of the system, including object schemas, detailed endpoint specifications with input and output parameters, error definitions, and a brief functional overview of each API operation. It serves as the authoritative reference for understanding how the system is designed to function.

## Project Structure

The project follows a **modular architecture**, ensuring maintainability, separation of concerns, and scalability. Each module is structured to serve a specific purpose.

### `/coverage`

- Contains the **HTML and summary reports** generated from the last test run.  
  This folder is **excluded from version control** and automatically generated or updated at each test execution.

### `/data`

- Contains the SQLite database file. This folder is **excluded from version control**.

### `/doc`

- Contains the OpenAPI specification file (swagger) used to define the application external interface.

### `/docker`

- Contains everything needed to **containerize the application** and run it with Docker Compose.
- To run the following commands, [Docker Desktop](https://www.docker.com/products/docker-desktop) is required  
  (On Linux, you can install Docker Engine and CLI from your distribution's package manager too)

- **`/backend`**

  - Contains the `Dockerfile` for building the backend Node.js application. It is intentionally left empty, as completing it is part of task 4. When the container starts, it must first run the `create-root` script, which waits for the database to become available and creates the **default admin user** if it does not exist. Afterwards, it launches the actual backend server.

  **Build the backend image manually (from the project root):**

  ```bash
  docker build -t geocontrol-backend -f docker/backend/Dockerfile .
  ```

  **Run the container after building the image:**

  ```bash
  docker run -d --name geocontrol-backend -p 5000:5000 geocontrol-backend
  ```

- **`/db`**

  - Contains the `init.sql` script used to initialize the MySQL database.  
    The script creates the database, user, and password based on the **environment variables** defined in the `docker-compose.yml` file.  
    This initialization is executed **only on the first startup**, if the database volume is empty.

- **`/frontend`**

  - Contains the `env-vars.json` file, which defines environment variables for the front end such as the server port and server host. The default values can be customized in this file. In order to take effect, it must be mounted inside the front-end container, which is already done in the provided Docker Compose file.

- **`docker-compose.yml`**

  - Defines a three-service setup:
    - The **frontend**
    - The **backend server**
    - The **MySQL database**
  - The frontend image is pulled from a public DockerHub
  - All configuration parameters (e.g. ports, database name, credentials) are centralized and reused across all services.
  - The backend container uses an internal script to **wait for the database to be ready** before attempting any connection.

  **Run the Docker Compose (from `/docker` folder):**

  ```bash
  docker compose up
  ```

  **Run the Docker Compose updating service images if newer versions exist:**

  ```bash
  docker compose up --pull always
  ```

  **Run the Docker Compose with automatic rebuild of the backend image:**

  ```bash
  docker compose up --build
  ```

  **Stop and remove containers:**

  ```bash
  docker compose down
  ```

  **Stop, remove containers and reset volumes (reset the DB):**

  ```bash
  docker compose down -v
  ```

### `/logs`

- Contains all the log files generated by the application:
  - error.log: contains only the errors logged by the application
  - combined.log: contains all the logs generated by the application
- This folder is **excluded from version control**

### `/scripts`

- Contains the set-up scripts for the application.

### `/src` - Main source folder

Contains all the following subfolders with the source code.

- **`/config`**

  - Contains global configuration files.

- **`/controllers`**

  - Handle the request processing logic and call the appropriate services.

- **`/database`**

  - Manages database connection and initialization.

- **`/middlewares`**

  - Contains Express middleware for authentication, validation, and error handling.

- **`/models`**

  - **`/dao`**: Represents **database entities** using TypeORM.
  - **`/dto`**: Contains **Data Transfer Objects (DTOs)** generated automatically from OpenAPI.
  - **`/errors`**: Contains all the custom error classes

- **`/repositories`**

  - Implements data access logic to interact with the database.

- **`/routes`**

  - Defines API endpoints and maps them to controllers.

- **`/services`**

  - Contains business logic and helper functions.

- **`/utils.ts`**
  - Provides utility functions used across the project.

### `/test` - Test folder

- Contains all **unit tests** and **integration tests** for the project. The tests are written using **Jest**, a popular JavaScript testing framework.

- **`/e2e`**

  - Contains end-to-end tests.
  - Includes **an example test** of a full stack execution flow of one of the users endpoints, using the actual in-memory datasource.

- **`/integration`**

  - Contains integration tests
  - Includes **two example tests**, one for the `userController` integration with `mapperService` and the second one for the integration of `userRoutes` with its middleware layer.

- **`/postman_colection`**

  - Contains a **complete Postman test suite** that can be used to manually test the API endpoints defined in **Swagger**.
    **[Download Postman](https://www.postman.com/downloads/)** to import the test collection (`GeoControl API Full Test Suite.postman_collection.json`) and run the requests against the API.

- **`/setup`**

  - Contains the configuration for the **in-memory SQLite test datasource** used during automated tests.

- **`/unit`**
  - Contains the unit tests
  - Includes **two example tests** for the `UserRepository` class:  
    one using full mocking, and one using the actual in-memory datasource which will be used by the final end-to-end tests.

### Path Aliases

To avoid relative imports, TypeScript path aliases are defined in `tsconfig.json`:

```json
    "paths": {
      "@models/*": ["models/*"],
      "@errors/*": ["models/errors/*"],
      "@dao/*": ["models/dao/*"],
      "@dto/*": ["models/dto/*"],
      "@repositories/*": ["repositories/*"],
      "@services/*": ["services/*"],
      "@routes/*": ["routes/*"],
      "@controllers/*": ["controllers/*"],
      "@middlewares/*": ["middlewares/*"],
      "@database": ["database/connection.ts"],
      "@config": ["config/config.ts"],
      "@utils": ["utils.ts"],
      "@app": ["app.ts"],
      "@test/*": ["../test/*"]
    }
```

This allows importing modules like:

```
import { UserRepository } from "@repositories/UserRepository";
```

instead of using relative paths like:

```
import { UserRepository } from "../repositories/UserRepository";
```

## API Versioning

All API endpoints include `/v1/` in their URL paths (e.g., `/api/v1/users`).

This approach allows for backward compatibility when introducing breaking changes in the future. If a newer version of an endpoint requires different input parameters or returns a different response structure, a new version (e.g., `/api/v2/users`) can be created while keeping the old version operational. This prevents service disruptions for existing clients that depend on previous API versions.
