# Authentication Hub

A centralized authentication system for private cloud applications, enabling secure OAuth integration with external services like Google Workspace.

## Features

- **OAuth Integration**: Secure authentication with Google services (Gmail, Calendar, Drive, etc.)
- **Centralized Management**: Single hub for managing all external service connections
- **Private Cloud Ready**: Designed for private cloud deployments with security in mind
- **Modern Tech Stack**: React/Next.js frontend with Node.js/Express backend
- **Extensible**: Built to support additional OAuth providers (AWS, Azure, Salesforce, etc.)

## Architecture

### Backend Services
- **Auth Service**: Handles OAuth flows and token management
- **Provider Service**: Manages OAuth provider configurations
- **Connection Service**: Tracks user connections and permissions
- **Data Sync Service**: Orchestrates data flow between services
- **API Gateway**: Secure endpoints for private cloud apps

### Frontend
- **Service Grid**: Visual interface for available OAuth providers
- **Connection Manager**: Real-time status and management of connections
- **Authentication Flow**: Streamlined OAuth callback handling

## Quick Start

### Prerequisites
- Node.js 18+
- PostgreSQL 15+
- Redis 7+
- Docker (optional)

### Environment Setup

1. Copy environment variables:
```bash
cp .env.example .env
```

2. Configure your environment:
```env
# Database
DATABASE_URL=postgresql://username:password@localhost:5432/authcenter

# Google OAuth (obtain from Google Cloud Console)
GOOGLE_CLIENT_ID=your-google-oauth-client-id
GOOGLE_CLIENT_SECRET=your-google-oauth-client-secret
GOOGLE_REDIRECT_URI=http://localhost:3001/api/auth/google/callback

# JWT Secret
JWT_SECRET=your-super-secret-jwt-key-here

# Application URLs
FRONTEND_URL=http://localhost:3000
```

### Development

#### Option 1: Docker Compose (Recommended)
```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f
```

#### Option 2: Local Development
```bash
# Install dependencies
npm install

# Start database services
docker-compose up -d postgres redis

# Run development servers
npm run dev
```

The application will be available at:
- Frontend: http://localhost:3000
- Backend API: http://localhost:3001
- Health Check: http://localhost:3001/health

### Production Deployment

1. Build the application:
```bash
npm run build
```

2. Start production servers:
```bash
npm run start
```

## Google OAuth Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create a new project or select existing
3. Enable required APIs:
   - Google+ API
   - Gmail API
   - Calendar API
   - Drive API (if needed)
4. Create OAuth 2.0 credentials:
   - Application type: Web application
   - Authorized redirect URIs: `http://localhost:3001/api/auth/google/callback`
5. Copy Client ID and Client Secret to your `.env` file

## API Usage for Private Cloud Apps

### Authentication
All API requests require a JWT token obtained through the OAuth flow:

```bash
curl -H "Authorization: Bearer YOUR_JWT_TOKEN" \
     http://localhost:3001/api/v1/data/google/gmail
```

### Available Endpoints

#### Get User Connections
```bash
GET /api/connections
```

#### Fetch Data from External Services
```bash
GET /api/v1/data/{provider}/{service}
# Examples:
# GET /api/v1/data/google/gmail
# GET /api/v1/data/google/calendar
```

#### Sync Data to External Services
```bash
POST /api/v1/data/{provider}/{service}
Content-Type: application/json

{
  "data": "your-data-payload"
}
```

## Security Features

- **JWT Authentication**: Secure token-based authentication
- **Encrypted Token Storage**: OAuth tokens encrypted at rest
- **HTTPS Only**: All communication over HTTPS
- **Rate Limiting**: API throttling and abuse prevention
- **Audit Logging**: Comprehensive activity logging
- **Scope Management**: Granular permission control

## Development

### Project Structure
```
authcenter/
   backend/          # Node.js/Express API server
      src/
         controllers/
         services/
         routes/
         middleware/
         config/
      migrations/
   frontend/         # Next.js React application  
      src/
         app/
         components/
         hooks/
         lib/
      public/
   docs/            # Documentation
```

### Available Scripts

```bash
# Development
npm run dev              # Start both frontend and backend
npm run backend:dev      # Start backend only
npm run frontend:dev     # Start frontend only

# Building
npm run build           # Build both applications
npm run backend:build   # Build backend only
npm run frontend:build  # Build frontend only

# Testing
npm test               # Run all tests
npm run backend:test   # Run backend tests
npm run frontend:test  # Run frontend tests

# Linting
npm run lint          # Lint all code
npm run backend:lint  # Lint backend code
npm run frontend:lint # Lint frontend code
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Run linting and tests
6. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For issues and questions:
1. Check existing GitHub issues
2. Create a new issue with detailed description
3. Provide logs and environment details