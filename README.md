# Social Media Platform
Overview
This project is a social media platform built with Node.js, Express, GraphQL, and clustering to handle high loads efficiently. The application uses GraphQL for flexible and efficient data querying and utilizes Node.js's cluster module to scale across multiple CPU cores.

# Features
GraphQL API: Provides a flexible and efficient API for querying and mutating data.
Clustering: Uses Node.js's cluster module to distribute workload across multiple CPU cores.
Express Middleware: Handles HTTP requests and integrates with Apollo Server for GraphQL.
Database Integration: Connects to a database to manage and persist data.
# Technologies Used
Node.js: JavaScript runtime for building server-side applications.
Express: Web framework for Node.js to handle HTTP requests.
Apollo Server: GraphQL server for handling GraphQL queries and mutations.
GraphQL: Query language for APIs, providing a more flexible and efficient approach than REST.
Clustering: Node.js module to take advantage of multi-core systems.

# Setup
Prerequisites
Node.js (v18.17.1 or later)
A running database (e.g., MongoDB, PostgreSQL)
Installation
Clone the Repository


git clone https://github.com/Novicecoder843/social-media-platform.git
cd social-media-platform

Install Dependencies
npm install
Create a .env File

Copy the .env.example to .env and update the configuration as needed:

MONGO_URI = 'mongodb://127.0.0.1:27017/SocialMedia'
PORT =5000
JWT_SECRET="secretkey"

# Start the Application

To start the application in a clustered environment, use:


node src/cluster.ts

This will start the master process and fork worker processes to utilize multiple CPU cores.

Development
Running Locally
For development, you might want to run a single instance:


npm run dev
This usually starts the server without clustering for easier debugging.


# GraphQL Schema
The GraphQL schema is defined in the graphql/typeDefs.ts file. It includes types, queries, and mutations used by the Apollo Server.

API Endpoints
GraphQL Endpoint: localhost:4000/graphql

Provides a GraphQL playground (if enabled) for testing queries and mutations.
GraphiQL Interface: /graphiql

Provides a GraphiQL interface for interactive exploration of the GraphQL schema.
Clustering
The application uses Node.js's cluster module to scale across multiple CPU cores. The cluster.ts file handles the clustering logic:

Master Process: Forks worker processes based on the number of available CPU cores.
Worker Processes: Each worker handles incoming requests and shares the same server port.

License
This project is licensed under the MIT License - see the LICENSE file for details.