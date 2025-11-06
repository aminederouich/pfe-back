# 🚀 PFE Backend API

A modern Node.js/Express backend API for project management and Jira integration, built as part of a PFE (Projet de Fin d'Études) application with **automated versioning** and **professional development practices**.


[![Version](https://img.shields.io/badge/version-1.17.1-blue.svg)](https://github.com/aminederouich/pfe-back)
[![Node.js](https://img.shields.io/badge/node-%3E%3D22.11.0-brightgreen.svg)](https://nodejs.org/)
[![Tests](https://img.shields.io/badge/tests-32%20passing-brightgreen.svg)](https://github.com/aminederouich/pfe-back/actions)
[![ESLint](https://img.shields.io/badge/ESLint-configured-brightgreen.svg)](https://eslint.org/)
[![Auto Versioning](https://img.shields.io/badge/versioning-automated-orange.svg)](https://semver.org/)
[![Branch Protection](https://img.shields.io/badge/branch-protected-red.svg)](https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/defining-the-mergeability-of-pull-requests/about-protected-branches)

## 🎯 Overview

This backend serves as the middleware between a frontend application and external services, providing:
- 🔐 User authentication via Firebase Auth
- 📋 Project management capabilities  
- 🔗 Jira configuration and integration for issue tracking
- 🎫 Ticket management and synchronization
- 🌐 RESTful API endpoints for frontend consumption
- 🤖 **Automated versioning** with GitHub Actions (after PR merge)
- 🛡️ **Branch protection compatible** workflows with Personal Access Token integration
- ✅ **Comprehensive testing** and **code quality** standards
- 🔐 **Branch protection** compatible auto-versioning system

## � Table of Contents

1. [🛠️ Tech Stack](#️-tech-stack)
2. [🏗️ Architecture](#️-architecture)
3. [🚀 Getting Started](#-getting-started)
4. [⚙️ Configuration](#️-configuration)
5. [🔄 Automatic Versioning System](#-automatic-versioning-system)
6. [🧪 Testing](#-testing)
7. [📚 API Documentation](#-api-documentation)
8. [🔒 Security & Best Practices](#-security--best-practices)
9. [🤝 Contributing](#contributing)

## �🛠️ Tech Stack

- **Runtime**: Node.js 22.11.0
- **Framework**: Express.js
- **Database**: Firebase Firestore
- **Authentication**: Firebase Auth + JWT
- **External APIs**: Jira API integration
- **Testing**: Jest + Supertest (32 tests with 100% pass rate)
- **Code Quality**: ESLint + Prettier with 40+ rules
- **Development**: Nodemon for hot reloading
- **CI/CD**: GitHub Actions workflow with auto-versioning
- **Versioning**: Semantic Versioning (SemVer) with conventional commits

## 🏗️ Architecture

```
├── app.js              # Main Express application setup
├── bin/www             # Server startup script (port 8081)
├── config/             # Configuration files
│   ├── firebase.js     # Firebase initialization
│   └── Jira.js         # Jira API client configuration
├── constants/          # Global constants
│   └── httpStatus.js   # HTTP status codes (no magic numbers!)
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
│   ├── jiraConfig.test.js        # Jira config tests (12 tests)
│   └── ...
├── docs/               # Documentation
│   ├── AUTO_VERSION_AFTER_MERGE.md  # Auto-versioning guide
│   ├── BRANCH_PROTECTION_SOLUTION.md # Branch protection setup
│   └── ...                           # Additional guides
├── .github/workflows/  # GitHub Actions
│   ├── auto-version-after-merge.yml  # Automated versioning workflow
│   ├── auto-version-hybrid.yml       # Alternative versioning method
│   ├── auto-version-api.yml          # API-based versioning (fallback)
│   └── node.js.yml                   # CI/CD testing workflow
├── validate-auto-version.js           # Auto-versioning system validation
├── diagnose-and-fix.js                # System diagnostic and troubleshooting
└── .eslintrc.js        # ESLint configuration with 40+ rules
```

## 🆕 New Features & Improvements

### 🤖 Automated Versioning System (After PR Merge)
- **Automatic version bumps** after merging pull requests
- **Smart commit analysis** using conventional commit patterns
- **Multiple workflow options** for different security configurations
- **Branch protection compatible** with Personal Access Token support
- **Fallback mechanisms** for different GitHub repository configurations
- **Semantic Versioning** (SemVer) with auto-generated releases and git tags

### 🔐 Branch Protection & Security
- **Protected main branch** ensures all changes go through PR review
- **AUTO_VERSION_TOKEN** support for bypassing protection rules
- **Multiple authentication methods** (PAT, GitHub Token, API-based)
- **Intelligent workflow selection** based on available permissions

### 📏 Code Quality Standards
- **ESLint configuration** with 40+ professional rules
- **No magic numbers** - All HTTP status codes centralized in `constants/httpStatus.js`
- **Consistent code style** with Prettier integration
- **Best practices** enforcement (ES6+, security, complexity)

### 🧪 Enhanced Testing & Validation
- **32 comprehensive tests** with 100% pass rate
- **Automated test runner** in GitHub Actions workflow
- **Pre-commit validation** ensures code quality
- **System diagnostics** with `diagnose-and-fix.js` script

## 🚀 Getting Started

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

## 📜 Available Scripts

### 🏃‍♂️ Development
```bash
npm start              # Start development server with hot reload
npm test               # Run all tests (32 tests)
npm run test:watch     # Run tests in watch mode  
npm run test:coverage  # Run tests with coverage report
npm run lint           # Check code quality with ESLint
npm run lint:fix       # Auto-fix ESLint issues
```

### 🔄 Versioning (Automated - After PR Merge)
The project uses **automatic versioning** that triggers after merging pull requests:

```bash
# When you merge a PR with these commits, version updates automatically:
git commit -m "feat: add new user management API"     # → 1.0.1 → 1.1.0 (minor)
git commit -m "fix: resolve authentication bug"      # → 1.0.1 → 1.0.2 (patch)
git commit -m "feat!: breaking API changes"          # → 1.0.1 → 2.0.0 (major)

# The workflow automatically:
# 1. Analyzes your PR commits
# 2. Determines version bump type (major/minor/patch)
# 3. Updates package.json and package-lock.json
# 4. Creates commit, git tag, and GitHub release
```

### 🔧 Auto-Versioning Setup
For repositories with branch protection (recommended):

1. **Create Personal Access Token**:
   - GitHub → Settings → Developer settings → Personal access tokens
   - Permissions: `repo` + `workflow`

2. **Add Repository Secret**:
   - Repository → Settings → Secrets → `AUTO_VERSION_TOKEN`

3. **Test the system**:
   ```bash
   # Validate your setup
   node validate-auto-version.js
   
   # Diagnose any issues
   node diagnose-and-fix.js
   ```

See [`docs/BRANCH_PROTECTION_SOLUTION.md`](docs/BRANCH_PROTECTION_SOLUTION.md) for detailed setup guide.

### 🔧 Manual Versioning
```bash
npm run version:patch   # 1.0.0 → 1.0.1 (bug fixes)
npm run version:minor   # 1.0.0 → 1.1.0 (new features)
npm run version:major   # 1.0.0 → 2.0.0 (breaking changes)

# Full release with validation:
npm run release:patch   # Run tests + lint + version patch
npm run release:minor   # Run tests + lint + version minor  
npm run release:major   # Run tests + lint + version major
```

### 🚀 Running the Application

**Development mode:**
```bash
npm start               # Server starts on http://localhost:8081
```

**Testing:**
```bash
npm test               # Run complete test suite
npm run test:coverage  # Generate coverage report
```

**Code Quality:**
```bash
npm run lint           # Check for linting issues
npm run lint:fix       # Auto-fix linting issues
```

The server will start on port 8081 by default.

## 🌐 API Endpoints

### 🔐 Authentication Routes (`/auth`)
- `POST /auth/signup` - User registration
- `POST /auth/signin` - User login  
- `GET /auth/check-auth` - Check authentication status
- `POST /auth/logout` - User logout
- `POST /auth/forget-password` - Password reset request
- `POST /auth/verify-email` - Send email verification

### 📋 Project Management (`/project`)
- `GET /project/getAllProject` - Get all projects
- `POST /project/addNewProject` - Create new project
- `DELETE /project/deleteProject/:id` - Delete project
- `PUT /project/updateProject` - Update project details

### 🔗 Jira Configuration (`/jira-config`)
- `POST /jira-config/test-connection` - Test Jira API connection
- `GET /jira-config/configs` - Get all Jira configurations
- `POST /jira-config/add` - Add new Jira configuration
- `PUT /jira-config/update` - Update Jira configuration
- `DELETE /jira-config/delete` - Delete Jira configuration(s)
- `GET /jira-config/enabled` - Get enabled configurations

### 🎫 Ticket Management (`/tickets`)
- `GET /tickets` - Get all tickets
- `POST /tickets/create` - Create new ticket
- `PUT /tickets/update/:id` - Update ticket
- `DELETE /tickets/delete/:id` - Delete ticket

All endpoints require authentication except `/auth/signup` and `/auth/signin`.

## 🎯 Key Features

### 🔐 Authentication System
- **Firebase Auth** integration with JWT tokens
- Secure user registration and login
- Password reset and email verification
- Protected routes with authentication middleware
- Multi-level security validation

### 📊 Project Management
- Complete **CRUD operations** for projects
- Project validation and error handling
- Multi-user project access control
- Real-time project updates

### 🔧 Jira Integration
- **Multiple Jira instance** configuration support
- Real-time connection testing
- Automatic ticket synchronization with Firebase
- Flexible Jira API configuration management
- Support for different Jira authentication methods

### 🤖 Automated Workflows
- **GitHub Actions** for CI/CD
- Automated version bumping with **semantic versioning**
- Pre-release testing and validation
- Auto-generated releases and changelogs

### 📈 Code Quality
- **ESLint** with 40+ professional rules
- **Prettier** for consistent code formatting
- **No magic numbers** policy
- Comprehensive error handling
- **Best practices** enforcement

## 🤝 Contributing

### Development Workflow

1. **Fork** the repository
2. **Create a feature branch**: `git checkout -b feature/amazing-feature`
3. **Follow conventional commits**: 
   - `feat:` for new features
   - `fix:` for bug fixes  
   - `docs:` for documentation
   - `BREAKING CHANGE:` for breaking changes
4. **Run tests**: `npm test`
5. **Check linting**: `npm run lint`
6. **Commit changes**: `git commit -m "feat: add amazing feature"`
7. **Push to branch**: `git push origin feature/amazing-feature`
8. **Open a Pull Request**

### Commit Convention

This project follows [Conventional Commits](https://www.conventionalcommits.org/):

```bash
feat: add new API endpoint          # Minor version bump
fix: resolve authentication issue   # Patch version bump  
docs: update README                 # Patch version bump
BREAKING CHANGE: refactor API       # Major version bump
```

### Code Standards

- ✅ All code must pass **ESLint** checks
- ✅ **Tests required** for new features
- ✅ **No magic numbers** - use constants
- ✅ **Proper error handling** required
- ✅ **Documentation** for new endpoints

## � Documentation

- 📖 [Auto-Versioning Guide](docs/AUTO-VERSIONING.md)
- 📋 [API Documentation](docs/API.md) *(coming soon)*
- 🧪 [Testing Guide](docs/TESTING.md) *(coming soon)*

## 🔧 Environment Variables

Required environment variables:

```env
DEFAULT_PORT=8081
JWT_SECRET=your_secure_jwt_secret
FIREBASE_PROJECT_ID=your_firebase_project_id
FIREBASE_PRIVATE_KEY=your_firebase_private_key
FIREBASE_CLIENT_EMAIL=your_firebase_client_email
```

## 🚀 Deployment

### Production Setup

1. **Environment Configuration**:
   ```bash
   cp .env.example .env
   # Configure your production environment variables
   ```

2. **Build for Production**:
   ```bash
   npm install --production
   ```

3. **Start Production Server**:
   ```bash
   NODE_ENV=production node bin/www
   ```

### 🐳 Docker Support *(coming soon)*
```bash
docker build -t pfe-backend .
docker run -p 8081:8081 pfe-backend
```

## 📊 Project Statistics

- **✅ 32 Tests** - 100% passing rate
- **📏 40+ ESLint Rules** - Code quality enforced
- **🔄 7 API Endpoints** - Complete REST API
- **⚡ 0 Magic Numbers** - Clean, maintainable code
- **🚀 Automated Versioning** - Professional workflow
- **📦 Latest Dependencies** - Up-to-date packages

## 🤔 Troubleshooting

### Common Issues

**Port already in use:**
```bash
# Change port in .env file
DEFAULT_PORT=8082
```

**Firebase connection issues:**
```bash
# Verify your Firebase config in config/firebase.js
# Ensure Firestore is enabled in Firebase Console
```

**Jira API connection fails:**
```bash
# Check Jira credentials in config/Jira.js
# Verify Jira instance URL and permissions
```

**Tests failing:**
```bash
npm test -- --verbose  # Run tests with detailed output
npm run test:coverage  # Check test coverage
```

## 📄 License

This project is part of a PFE (Projet de Fin d'Études) and is intended for educational purposes.

## 👨‍💻 Author

**Amine Derouich** - [GitHub](https://github.com/aminederouich)

## 🙏 Acknowledgments

- Firebase team for excellent documentation
- Jira API team for comprehensive API support  
- Jest and Supertest communities for testing tools
- Express.js community for the robust framework
- GitHub Actions for automated workflows

---

## 🎉 Project Status

✅ **Ready for Production** - Fully tested and documented  
🤖 **Auto-versioned** - Professional release management  
📈 **High Quality Code** - ESLint + Prettier enforced  
🧪 **Well Tested** - Comprehensive test coverage  
📚 **Well Documented** - Complete API and setup guides


**Current Version:** ![Version](https://img.shields.io/badge/version-1.17.1-blue.svg)

---

*Built with ❤️ for PFE project - A modern, scalable backend API*
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

## 🔄 Automatic Versioning System

This project features an **intelligent auto-versioning system** that automatically updates `package.json` and `package-lock.json` versions after each Pull Request merge.

### 🚀 How It Works

The system analyzes commit messages in merged PRs using **conventional commit patterns** to determine the appropriate version bump:

- **🔧 fix:** → Patch version bump (1.0.0 → 1.0.1)
- **✨ feat:** → Minor version bump (1.0.0 → 1.1.0)  
- **💥 BREAKING CHANGE:** → Major version bump (1.0.0 → 2.0.0)

### 📋 Workflow Features

- ✅ **Branch Protection Compatible** - Works with protected main branches
- ✅ **Multi-Authentication Support** - Personal Access Token integration
- ✅ **Intelligent Analysis** - Scans all commits in merged PRs
- ✅ **Automatic Commits** - Updates version files and commits changes
- ✅ **Fallback Mechanisms** - Multiple workflow variants for different setups

### ⚙️ Setup Requirements

For repositories with branch protection, configure the `AUTO_VERSION_TOKEN` secret:

1. **Create Personal Access Token** in GitHub Settings
2. **Add Repository Secret** named `AUTO_VERSION_TOKEN`
3. **Required Permissions**: `Contents: Write`, `Metadata: Read`, `Pull requests: Write`

### 📁 Workflow Files

```
.github/workflows/
├── auto-version-after-merge.yml    # Primary workflow (branch protection compatible)
├── auto-version-hybrid.yml         # Fallback for mixed configurations
└── auto-version-api.yml            # API-based approach for complex setups
```

### 🔍 Validation & Diagnostics

Test your setup with the validation script:

```bash
node validate-auto-version.js
```

**Example Output:**
```
✅ Auto-versioning system validation
📂 Workflow files: 3 found
🔧 Configuration: Ready for protected branches
📊 System status: Fully operational
```

For detailed setup and troubleshooting, see `/docs/branch-protection-solutions.md`.

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
- ✅ **Automated Versioning System** - Intelligent version management with PR merge triggers
- ✅ **Branch Protection Compatibility** - Works with protected main branches using PAT authentication
- ✅ **Multiple Workflow Variants** - 3 different auto-versioning approaches for various setups
- ✅ **Comprehensive Documentation** - Complete setup guides and troubleshooting resources
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
