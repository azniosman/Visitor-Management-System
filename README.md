# Elisa Secure Access

AI-powered Visitor Management System with modules for Visitor Management, Shipment Tracking, and Key Management.

## Features

- Visitor Management: Check-in, check-out, photo capture, and watchlist checking
- Shipment Tracking: Package receipt, delivery tracking, and notifications
- Key Management: Key checkout, return tracking, and access control
- AI-powered features: Facial recognition, sentiment analysis, and anomaly detection
- Progressive Web App (PWA) for mobile and offline access
- Containerized deployment with Docker

## Tech Stack

- **Frontend**: React, Material-UI, Progressive Web App (PWA)
- **Backend**: Node.js, Express, MongoDB
- **AI Services**: AWS Rekognition, AWS Comprehend
- **Deployment**: Docker, GitHub Actions

## Development Setup

### Prerequisites

- Node.js 18+
- Docker and Docker Compose
- MongoDB (or use the Docker Compose setup)
- AWS Account (for AI services)

### Local Development

1. Clone the repository:

   ```bash
   git clone https://github.com/azniosman/elisa-secure-access.git
   cd elisa-secure-access
   ```

2. Set up environment variables:

   ```bash
   cp .env.development .env
   # Edit .env with your configuration
   ```

3. Start the development environment:

   ```bash
   docker-compose up -d
   ```

4. Access the application:
   - Frontend: http://localhost:5173
   - API: http://localhost:3000/api

### Running Tests

```bash
# Backend tests
cd api
npm test

# Frontend tests
cd elisa-secure-access
npm test
```

## Production Deployment

### Using Docker Compose

1. Set up environment variables:

   ```bash
   cp .env.production .env
   # Edit .env with your production configuration
   ```

2. Start the production environment:
   ```bash
   docker-compose -f docker-compose.prod.yml up -d
   ```

### Using CI/CD Pipeline

1. Set up the following secrets in your GitHub repository:

   - `DOCKERHUB_USERNAME`: Your Docker Hub username
   - `DOCKERHUB_TOKEN`: Your Docker Hub access token
   - `SSH_HOST`: Your production server hostname
   - `SSH_USERNAME`: Your production server username
   - `SSH_PRIVATE_KEY`: Your SSH private key for the production server

2. Push to the main branch or create a tag to trigger deployment:
   ```bash
   git tag v1.0.0
   git push origin v1.0.0
   ```

## Directory Structure

```
elisa-secure-access/
├── api/                  # Backend API
│   ├── src/              # Source code
│   ├── tests/            # Test files
│   └── Dockerfile        # Backend Docker configuration
├── elisa-secure-access/  # Frontend application
│   ├── public/           # Public assets
│   ├── src/              # Source code
│   └── Dockerfile        # Frontend Docker configuration
├── scripts/              # Utility scripts
├── .github/              # GitHub Actions workflows
├── docker-compose.yml    # Development Docker Compose
└── docker-compose.prod.yml # Production Docker Compose
```

## Environment Variables

### Backend (.env)

- `MONGO_DATABASE`: MongoDB database name
- `MONGO_USERNAME`: MongoDB username
- `MONGO_PASSWORD`: MongoDB password
- `JWT_SECRET`: Secret for JWT token generation
- `JWT_EXPIRES_IN`: JWT token expiration time
- `EMAIL_*`: Email configuration
- `AWS_*`: AWS configuration

### Frontend (.env)

- `VITE_API_URL`: Backend API URL
- `VITE_AWS_REGION`: AWS region
- `VITE_AWS_ACCESS_KEY_ID`: AWS access key
- `VITE_AWS_SECRET_ACCESS_KEY`: AWS secret key

## License

This project is licensed under the MIT License - see the LICENSE file for details.
