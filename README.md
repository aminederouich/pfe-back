# PFE Backend

A Node.js/Express backend API for project management and Jira integration, built as part of a PFE (Projet de Fin d'Études) application.

## Overview

This backend serves as the middleware between a frontend application and external services, providing:
- User authentication via Firebase Auth
- Project management capabilities
- Jira integration for issue tracking
- RESTful API endpoints for frontend consumption

## Tech Stack

- **Runtime**: Node.js 22.11.0
- **Framework**: Express.js
- **Database**: Firebase Firestore
- **Authentication**: Firebase Auth + JWT
- **External APIs**: Jira API integration
- **Testing**: Jest + Supertest
- **Development**: Nodemon for hot reloading

## Architecture

```
├── app.js              # Main Express application setup
├── bin/www             # Server startup script (port 8081)
├── config/             # Configuration files
│   ├── firebase.js     # Firebase initialization
│   └── Jira.js         # Jira API client configuration
├── controllers/        # Request handlers and business logic
├── middleware/         # Custom middleware (auth, etc.)
├── models/             # Data models (Firebase Firestore)
├── routes/             # API route definitions
├── services/           # Service layer for business logic
└── test/               # Test files
```

## Getting Started

### Prerequisites

- Node.js 22.11.0
- Firebase project with Firestore
- Jira instance with API access

### Installation

1. Clone the repository:
```bash
git clone https://github.com/aminederouich/pfe-back.git
cd pfe-back
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
Create a `.env` file in the root directory with:
```env
DEFAULT_PORT=8081
JWT_SECRET=your_jwt_secret
# Add other environment variables as needed
```

4. Configure Firebase:
- Update `config/firebase.js` with your Firebase project credentials
- Ensure Firestore is enabled in your Firebase project

5. Configure Jira:
- Update `config/Jira.js` with your Jira instance details
- Replace the hardcoded credentials with environment variables

### Running the Application

**Development mode (with hot reload):**
```bash
npm start
```

**Testing:**
```bash
# Run tests once
npm test

# Run tests in watch mode
npm run test:watch
```

**Linting:**
```bash
# Check for linting issues
npm run lint

# Auto-fix linting issues
npm run lint:fix
```

The server will start on port 8081 by default.

## API Endpoints

### Authentication
- `POST /auth/login` - User login
- `POST /auth/register` - User registration
- `GET /auth/isLogged` - Check authentication status

### Projects
- `GET /project/getAllProject` - Get all projects
- `POST /project/addNewProject` - Create new project
- `POST /project/deleteProjectByID` - Delete project(s)
- `POST /project/updateProjectByID` - Update project

### Jira Integration
- `GET /jira_client` - Test Jira connection
- Jira configuration routes available via `/jira_config`

### Users & Tickets
- User management via `/user`
- Ticket management via `/ticket`

## Key Features

### Firebase Integration
- Firestore for data persistence
- Firebase Auth for user authentication
- JWT tokens for session management

### Jira Integration
- Direct integration with Jira Cloud API
- Issue tracking and project synchronization
- Configurable Jira connections

### CORS Configuration
- Configured for frontend running on `http://localhost:3000`
- Supports cross-origin requests

## Development

### Project Structure Patterns

- **Controllers**: Handle HTTP requests, call services, return responses
- **Services**: Business logic layer, interact with models
- **Models**: Data layer, Firebase Firestore operations
- **Middleware**: Authentication, logging, error handling
- **Routes**: API endpoint definitions and routing

### Testing

Tests are written using Jest and Supertest. Example test structure:
```javascript
describe('GET /', () => {
  it('should return expected response', async () => {
    const response = await request(app).get('/')
    expect(response.statusCode).toBe(200)
  })
})
```

### Error Handling

The application includes centralized error handling:
- 404 errors for undefined routes
- Global error handler for unhandled errors
- JSON error responses

## Environment Variables

Key environment variables to configure:
- `DEFAULT_PORT`: Server port (default: 8081)
- `JWT_SECRET`: Secret for JWT token signing
- Firebase configuration (if not hardcoded)
- Jira credentials (recommended to move from hardcoded values)

## Security Considerations

⚠️ **Important**: 
- Remove hardcoded Firebase and Jira credentials from config files
- Use environment variables for sensitive data
- Implement proper input validation
- Consider rate limiting for API endpoints

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make changes with appropriate tests
4. Run linting and tests
5. Submit a pull request

## License

This project is licensed under the terms specified in the LICENSE file.

---

**Note**: This is a PFE (Final Year Project) backend. Ensure proper security measures are implemented before production deployment. 
