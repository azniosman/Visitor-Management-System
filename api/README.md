# Elisa Secure Access API

Backend API for the Elisa Secure Access system - an AI-powered Visitor, Shipment, and Key Management System.

## Features

- **Visitor Management**: Pre-registration, check-in/check-out, badge printing, AI-powered security screening
- **Shipment Tracking**: Package logging, chain of custody, status updates, recipient notifications
- **Key Management**: Digital key checkout system, key return tracking, access level restrictions
- **User Management**: Role-based access control, authentication, profile management
- **AI Integration**: AWS Rekognition for facial recognition, AWS Comprehend for text analysis

## Tech Stack

- **Node.js**: JavaScript runtime
- **Express**: Web framework
- **MongoDB**: NoSQL database
- **Mongoose**: MongoDB object modeling
- **JWT**: Authentication
- **AWS SDK**: AI services integration
- **Docker**: Containerization

## Getting Started

### Prerequisites

- Node.js (v14+)
- MongoDB
- Docker and Docker Compose (optional)

### Installation

1. Clone the repository
2. Install dependencies:
   ```
   npm install
   ```
3. Create a `.env` file based on the `.env.example` file
4. Start the server:
   ```
   npm start
   ```

### Using Docker

1. Build and start the containers:
   ```
   docker-compose up -d
   ```

## API Documentation

API documentation is available at `/api/docs` endpoint when the server is running.

## Environment Variables

- `PORT`: Server port (default: 3000)
- `NODE_ENV`: Environment (development, production)
- `MONGODB_URI`: MongoDB connection string
- `JWT_SECRET`: Secret key for JWT
- `JWT_EXPIRES_IN`: JWT expiration time
- `EMAIL_*`: Email configuration
- `AWS_*`: AWS configuration

## Project Structure

```
api/
├── src/
│   ├── controllers/    # Request handlers
│   ├── middleware/     # Express middleware
│   ├── models/         # Mongoose models
│   ├── routes/         # Express routes
│   ├── utils/          # Utility functions
│   └── index.js        # Entry point
├── .env                # Environment variables
├── .gitignore          # Git ignore file
├── Dockerfile          # Docker configuration
├── package.json        # Dependencies
└── README.md           # This file
```

## License

This project is proprietary and confidential.
