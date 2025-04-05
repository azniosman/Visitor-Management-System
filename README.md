# Elisa Secure Access

Enterprise-grade Visitor Management System with integrated AI capabilities for Visitor Management, Shipment Tracking, and Key Management.

## Overview

Elisa Secure Access is a comprehensive security management solution designed for modern enterprises. It leverages artificial intelligence to provide advanced security features while maintaining an intuitive user experience.

## Core Features

### Visitor Management

- Automated check-in/check-out process
- Real-time watchlist screening
- Biometric verification with photo capture
- Digital visitor badges
- Host notification system

### Shipment Tracking

- End-to-end package tracking
- Chain of custody management
- Automated recipient notifications
- Integration with major courier services
- QR code-based tracking

### Key Management

- Digital key checkout system
- Access level management
- Return tracking automation
- Usage analytics and reporting
- Emergency access protocols

### AI Capabilities

- Facial recognition (AWS Rekognition)
- Sentiment analysis for threat detection
- Behavioral anomaly detection
- Real-time alert system

## Technical Architecture

### Frontend

- React 18+ with Material-UI
- Progressive Web App (PWA) capabilities
- Responsive design for mobile access
- Offline functionality

### Backend

- Node.js (18+) with Express
- MongoDB for data persistence
- JWT-based authentication
- RESTful API architecture

### AI Services

- AWS Rekognition for facial processing
- AWS Comprehend for text analysis
- Custom ML models for anomaly detection

### Infrastructure

- Docker containerization
- GitHub Actions for CI/CD
- AWS cloud infrastructure
- Horizontal scaling capability

## Development Setup

### Prerequisites

- Node.js 18+
- Docker Engine 20.10+
- Docker Compose 2.0+
- MongoDB 6.0+ (optional if using Docker)
- AWS Account with appropriate permissions

### Local Development

1. Clone the repository:

   ```bash
   git clone https://github.com/azniosman/elisa-secure-access.git
   cd elisa-secure-access
   ```

2. Configure environment:

   ```bash
   cp .env.development .env
   # Edit .env with your configuration
   ```

3. Start development environment:

   ```bash
   NODE_ENV=development docker-compose up -d
   ```

4. Access the application:
   - Frontend: http://localhost:5173
   - API: http://localhost:3000/api
   - Swagger Documentation: http://localhost:3000/api-docs

### Testing

```bash
# Backend tests
cd api && npm test

# Frontend tests
cd elisa-secure-access && npm test

# E2E tests
npm run test:e2e
```

## Production Deployment

### Docker Compose Deployment

1. Configure production environment:

   ```bash
   cp .env.production .env
   # Configure production settings
   ```

2. Deploy:
   ```bash
   docker-compose -f docker-compose.prod.yml up -d
   ```

### CI/CD Pipeline

1. Configure repository secrets:

   - `DOCKERHUB_USERNAME`
   - `DOCKERHUB_TOKEN`
   - `SSH_HOST`
   - `SSH_USERNAME`
   - `SSH_PRIVATE_KEY`
   - `AWS_ACCESS_KEY_ID`
   - `AWS_SECRET_ACCESS_KEY`

2. Trigger deployment:
   ```bash
   git tag v1.0.0
   git push origin v1.0.0
   ```

## Common Troubleshooting

### Docker Issues

1. Container fails to start:

   ```bash
   # Check container logs
   docker-compose logs

   # Rebuild containers
   docker-compose down
   docker-compose build --no-cache
   docker-compose up -d
   ```

2. Development stage not found:

   ```bash
   # Ensure NODE_ENV is set
   NODE_ENV=development docker-compose up -d
   ```

3. Test failures in container:
   ```bash
   # Install dependencies first
   docker-compose exec api npm ci
   docker-compose exec frontend npm ci
   ```

### Database Issues

1. MongoDB connection failures:

   ```bash
   # Verify MongoDB is running
   docker-compose ps mongodb

   # Check MongoDB logs
   docker-compose logs mongodb
   ```

2. Data persistence issues:
   ```bash
   # Verify volume mounts
   docker volume ls
   docker volume inspect elisa-secure-access_mongodb-data
   ```

### AWS Integration

1. AI service failures:

   - Verify AWS credentials in `.env`
   - Check IAM permissions
   - Ensure correct AWS region configuration

2. Rate limiting:
   - Monitor AWS CloudWatch metrics
   - Implement request throttling
   - Check service quotas

## Project Structure

```
elisa-secure-access/
├── api/                  # Backend API
│   ├── src/             # Source code
│   ├── tests/           # Test files
│   └── Dockerfile       # Backend Docker configuration
├── elisa-secure-access/ # Frontend application
│   ├── public/          # Public assets
│   ├── src/             # Source code
│   └── Dockerfile       # Frontend Docker configuration
├── scripts/             # Utility scripts
├── .github/             # GitHub Actions workflows
├── docker-compose.yml   # Development Docker Compose
└── docker-compose.prod.yml # Production Docker Compose
```

## Support

For technical support:

- Create an issue in the GitHub repository
- Contact the development team
- Check documentation in the `/docs` directory

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
