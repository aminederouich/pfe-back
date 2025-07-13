# PFE Backend

A Node.js/Express backend API for project management and Jira integration, built as part of a PFE (Projet de Fin d'Études) application.

## Overview

This backend serves as the middleware between a frontend application and external services, providing:
- User authentication via Firebase Auth
- Project management capabilities  
- Jira configuration and integration for issue tracking
- Ticket management and synchronization
- RESTful API endpoints for frontend consumption

## Tech Stack

- **Runtime**: Node.js 22.11.0
- **Framework**: Express.js
- **Database**: Firebase Firestore
- **Authentication**: Firebase Auth + JWT
- **External APIs**: Jira API integration
- **Testing**: Jest + Supertest (32 tests with 100% pass rate)
- **Development**: Nodemon for hot reloading
- **CI/CD**: GitHub Actions workflow

## Architecture

```
├── app.js              # Main Express application setup
├── bin/www             # Server startup script (port 8081)
├── config/             # Configuration files
│   ├── firebase.js     # Firebase initialization
│   └── Jira.js         # Jira API client configuration
├── controllers/        # Request handlers and business logic
│   ├── auth.controller.js        # Authentication logic
│   ├── project.controller.js     # Project management
│   ├── jiraConfig.controller.js  # Jira configuration
│   ├── ticket.js                 # Ticket management
│   └── user.js                   # User management
├── middleware/         # Custom middleware
│   └── auth.js         # Authentication middleware
├── models/             # Data models (Firebase Firestore)
├── routes/             # API route definitions
│   ├── auth.routes.js            # Authentication routes
│   ├── project.routes.js         # Project routes
│   ├── jira_config.routes.js     # Jira config routes
│   └── ticket.js                 # Ticket routes
├── services/           # Service layer for business logic
├── test/               # Comprehensive test suite
│   ├── auth.test.js              # Authentication tests (6 tests)
│   ├── project.test.js           # Project tests (14 tests)
│   ├── jiraConfig.test.js        # Jira config tests (4 tests)
│   ├── config.test.js            # Configuration tests
│   └── index.test.js             # Basic route tests
└── package.json        # Dependencies and scripts
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
# Run all tests (32 tests)
npm test

# Run tests in watch mode  
npm run test:watch

# Run tests with coverage report
npm run test:coverage
```

**Production:**
```bash
# Start the server in production mode
node bin/www
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

### Authentication Routes
- `POST /auth/signup` - User registration
- `POST /auth/signin` - User login  
- `GET /auth/check-auth` - Check authentication status
- `POST /auth/logout` - User logout
- `POST /auth/forget-password` - Password reset request
- `POST /auth/verify-email` - Send email verification

### Project Management
- `GET /project/getAllProject` - Get all projects
- `POST /project/addNewProject` - Create new project
- `POST /project/deleteProjectByID` - Delete project(s) by ID
- `POST /project/updateProjectByID` - Update project by ID

### Jira Configuration
- `POST /jira-config/checkConnection` - Test Jira API connection
- `GET /jira-config/getAllConfig` - Get all Jira configurations
- `GET /jira-config/getEnabledConfig` - Get enabled configurations
- `GET /jira-config/getConfig/:id` - Get configuration by ID
- `POST /jira-config/addConfig` - Add new Jira configuration
- `POST /jira-config/deleteConfigByID` - Delete configurations
- `POST /jira-config/updateConfigByID` - Update configuration

### Ticket Management
- `GET /ticket/getAllTicket` - Get all tickets (with Jira sync)
- `POST /ticket/addNewTicket` - Add new ticket

### User Management
- User routes available via `/user` endpoints

## Key Features

### 🔐 Authentication System
- Firebase Auth integration with JWT tokens
- Secure user registration and login
- Password reset and email verification
- Protected routes with authentication middleware

### 📊 Project Management
- Complete CRUD operations for projects
- Project validation and error handling
- Multi-user project access control

### 🔧 Jira Integration
- Multiple Jira instance configuration support
- Real-time connection testing
- Automatic ticket synchronization with Firebase
- Project and issue fetching from Jira Cloud API

### 🎫 Ticket Management  
- Automatic sync between Jira and Firebase
- Manual ticket creation and management
- Cross-platform ticket tracking
- Timestamp tracking (created, updated, last sync)

### 🌐 API Design
- RESTful API architecture
- JSON responses with consistent error handling
- CORS enabled for frontend integration
- Comprehensive input validation

## Development & Deployment

### Development Workflow
1. **Development Server**: `npm start` (with nodemon hot reload)
2. **Testing**: Comprehensive test suite with Jest
3. **Linting**: ESLint with Prettier for code quality
4. **Git Workflow**: Feature branches with pull requests

### CI/CD Pipeline
- **GitHub Actions** workflow for automated testing
- Runs on Node.js 22.11.0
- Automated test execution on pull requests
- Quality gates for code deployment

### Code Quality
- **ESLint**: Code linting and style enforcement
- **Prettier**: Code formatting
- **Jest**: Unit and integration testing
- **Supertest**: HTTP endpoint testing

### Environment Configuration
```env
# Server Configuration
DEFAULT_PORT=8081
NODE_ENV=development

# Authentication
JWT_SECRET=your_jwt_secret_here

# Firebase Configuration  
# (Configure in config/firebase.js)

# Jira Configuration
# (Configure via API endpoints)
```

### Testing

The project includes a comprehensive test suite with **32 tests** covering:

- **Authentication Tests** (6 tests): Login, signup, logout, password reset
- **Project Management Tests** (14 tests): CRUD operations, validation, error handling  
- **Jira Configuration Tests** (4 tests): Connection testing, configuration management
- **Integration Tests**: Route testing, middleware validation
- **Unit Tests**: Controller and service layer testing

**Test Structure:**
```javascript
describe('Auth Routes Tests', () => {
  test('should register user successfully', async () => {
    const response = await request(app)
      .post('/auth/signup')
      .send(userData)
      .expect(201);
    
    expect(response.body).toHaveProperty('message');
  });
});
```

**Key Testing Features:**
- Mock services and middleware for isolation
- Supertest for HTTP endpoint testing
- Jest configuration optimized for Node.js environment
- 100% test pass rate with fast execution (~2 seconds)

**Running Tests:**
```bash
npm test                    # Run all tests
npm run test:watch         # Watch mode for development  
npm run test:coverage      # Generate coverage report
```

## Security & Best Practices

### 🔒 Security Features
- JWT-based authentication with Firebase Auth
- Protected routes with authentication middleware
- Input validation and sanitization
- CORS configuration for cross-origin security
- Environment variables for sensitive data

### ⚠️ Security Recommendations
- Use environment variables for all credentials
- Implement rate limiting for API endpoints
- Add request validation middleware
- Use HTTPS in production
- Regular security audits with `npm audit`

### 📋 Production Checklist
- [ ] Move all credentials to environment variables
- [ ] Enable HTTPS/SSL certificates
- [ ] Configure production Firebase project
- [ ] Set up monitoring and logging
- [ ] Implement rate limiting
- [ ] Configure production CORS origins
- [ ] Set up backup strategies for Firebase

## Testing Coverage

**Current Test Statistics:**
- ✅ **32 tests** passing (100% success rate)
- ⚡ **~2 seconds** execution time  
- 🧪 **6 test suites** covering all major features
- 📊 Coverage available via `npm run test:coverage`

**Test Distribution:**
- Authentication: 6 tests
- Project Management: 14 tests  
- Jira Configuration: 4 tests
- Basic Routes: 3 tests
- Configuration: 2 tests
- Integration: 3 tests

## Contributing

1. **Fork** the repository
2. **Create** a feature branch (`git checkout -b feature/amazing-feature`)
3. **Write tests** for new functionality
4. **Run tests** to ensure they pass (`npm test`)
5. **Lint code** (`npm run lint`)
6. **Commit** changes (`git commit -m 'Add amazing feature'`)
7. **Push** to branch (`git push origin feature/amazing-feature`)
8. **Open** a Pull Request

### Development Standards
- Follow existing code style and patterns
- Write tests for new features and bug fixes
- Update documentation as needed
- Ensure all tests pass before submitting PR

## Project Status

**Current Version**: Active Development  
**Test Coverage**: 32 tests (100% passing)  
**Node.js**: 22.11.0  
**Last Updated**: January 2025

### Recent Updates
- ✅ Comprehensive test suite implementation
- ✅ Jira configuration management
- ✅ Authentication system with Firebase
- ✅ Project management CRUD operations
- ✅ CI/CD pipeline with GitHub Actions
- ✅ Code quality improvements with ESLint/Prettier

## License

This project is licensed under the terms specified in the LICENSE file.

---

**PFE Backend** - A robust Node.js API for project management and Jira integration  
Built with ❤️ for final year project requirements

> **Note**: This is a PFE (Final Year Project) backend. Ensure proper security measures and environment configuration before production deployment. 
