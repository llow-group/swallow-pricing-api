# Swallow Pricing API

A robust, enterprise-grade Fastify-based API service for generating financial quotes using the proprietary Swallow Pricing Engine. Access to the package for the Swallow pricing engine is granted upon request. This application **will not price** without having permission install to this package.

## Features

- High-performance, lightweight API built with Fastify framework
- RESTful endpoint architecture for generating financial quotes
- Seamless integration with the proprietary Swallow Pricing Engine
- Support for multiple project-specific pricing models through configuration
- Comprehensive Swagger documentation for API reference
- Type-safe implementation with TypeScript
- Extensive test coverage with Jest

## Setup

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Run tests
npm test

# Build production version
npm run build

# Start production server
npm start

# Check types
npm run typecheck

# Lint code
npm run lint

# Format code
npm run format
```

## Docker

This project includes a Docker configuration for containerized deployment using a multi-stage build process with Node.js 20 LTS (Alpine).

```bash
# Build the TypeScript code first
npm run build

# Build the Docker image
docker build -t swallow-pricing-api .

# Run the Docker container
docker run -p 3000:3000 swallow-pricing-api

# Run with environment variables
docker run -p 3000:3000 \
  -e PORT=3000 \
  -e NODE_ENV=production \
  -e LOG_LEVEL=info \
  swallow-pricing-api
```

## API Documentation

Once the server is running, you can access the comprehensive Swagger documentation at:

```
http://localhost:3000/docs
```

### Main Endpoint

```
POST /quote/{project_id}
```

Generates an financial quote for a specific pricing project.

#### Path Parameters

| Parameter | Description |
|-----------|-------------|
| project_id | UUID of the pricing project (e.g., "3fa85f64-5717-4562-b3fc-2c963f66afa6") |

#### Request Body

```json
{
  "proposer_name": "John Smith",
  "proposer_email": "john@example.com",
  "proposer_postcode": "SW1A1AA",
  "animal_species": "Cat",
  "animal_breed": "Ragdoll",
  "animal_age": 3,
  "animal_neutered": true,
  "base": 1000,
  "commission_rate": 0.15,
  "tax_rate": 0.125
}
```

#### Response

```json
{
  "result": 3500,
  "valid": true
}
```

### Example Usage

Using cURL to make a request:

```bash
curl -X POST \
  http://localhost:3000/quote/3fa85f64-5717-4562-b3fc-2c963f66afa6 \
  -H 'Content-Type: application/json' \
  -d '{
    "proposer_name": "John Smith",
    "proposer_email": "john@example.com",
    "proposer_postcode": "SW1A1AA",
    "animal_species": "Dog",
    "animal_breed": "Labrador",
    "animal_age": 5,
    "animal_neutered": true,
    "base": 1000,
    "commission_rate": 0.15,
    "tax_rate": 0.125
  }'
```

Using Axios in JavaScript:

```javascript
const axios = require('axios');

axios.post('http://localhost:3000/quote/3fa85f64-5717-4562-b3fc-2c963f66afa6', {
  proposer_name: "Jane Doe",
  proposer_email: "jane@example.com",
  proposer_postcode: "E14 5AB",
  animal_species: "Cat",
  animal_breed: "Siamese",
  animal_age: 2,
  animal_neutered: false,
  base: 1200,
  commission_rate: 0.15,
  tax_rate: 0.125
})
.then(response => console.log(response.data))
.catch(error => console.error(error));
```

## Project Files

Project configuration files are stored in the `data/models/` directory as JSON files. Each file contains a specific pricing model configuration that is referenced by a UUID.

Projects are mapped to their configuration files internally within the service, with each unique project identified by a UUID that is used in API endpoints (e.g., `/quote/3fa85f64-5717-4562-b3fc-2c963f66afa6`). You can have as many models stored flat-file as you like.

## Environment Variables

- `PORT`: The port to run the server on (default: 3000)
- `NODE_ENV`: Environment mode (development, production, test)
- `LOG_LEVEL`: Logging verbosity level (default: info)
- `PERSIST_QUOTES`: When set to 'true', enables quote persistence to disk (default: false)

## Data Directory Structure

The application uses the following data directory structure:

```
data/
├── models/                # Pricing project configuration files
│   ├── pet-insurance.json
│   └── bikeInsurance.json
└── quotes/               # Generated quotes (when PERSIST_QUOTES=true)
    └── YYYY-MM-DD/       # Date-based folders (e.g., 2025-04-08/)
        └── [uuid].json   # Quote files with UUID filenames
```

### Project Models

Project configuration files are stored in the `data/models/` directory as JSON files. Each file contains 
a specific pricing model configuration that is referenced by a project ID in the filename.

### Quote Persistence

When the `PERSIST_QUOTES` environment variable is set to 'true', all generated quotes will be saved to disk in JSON format. This feature is useful for:

- Audit trails and compliance requirements
- Quote history and analytics
- Debugging and troubleshooting

Quotes are stored in date-based folders within the `data/quotes/` directory (e.g., `data/quotes/2025-04-08/`) with unique UUIDs as filenames. Each quote file contains:

```json
{
  "id": "uuid-of-quote",
  "projectId": "project-id-used",
  "input": {
    // Complete quote request parameters
  },
  "result": 1234.56,
  "valid": true,
  "timestamp": "2025-04-08T00:00:00.000Z"
}
```

To enable quote persistence:

```bash
# In development
PERSIST_QUOTES=true npm run dev

# In production
PERSIST_QUOTES=true npm start

# Using Docker
docker run -p 3000:3000 \
  -e PERSIST_QUOTES=true \
  swallow-pricing-api
```
