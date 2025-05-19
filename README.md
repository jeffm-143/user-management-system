# User Management System

## Overview

A comprehensive employee management system built with Angular 10 and Node.js, featuring user authentication, role-based access control, employee management, workflow approvals, and departmental transfers.

## Table of Contents

1. [Features](#features)
2. [Technology Stack](#technology-stack)
3. [Installation](#installation)
4. [Configuration](#configuration)
5. [Usage Guide](#usage-guide)
6. [API Documentation](#api-documentation)
7. [User Roles](#user-roles)
8. [Database Structure](#database-structure)
9. [Workflow Management](#workflow-management)
10. [Troubleshooting](#troubleshooting)

## Features

- **User Authentication**: Secure login/logout with JWT tokens
- **Account Management**: User registration, email verification, password reset
- **Role-Based Access Control**: Admin and User roles with different permissions
- **Employee Management**: Add, edit, delete, and view employees
- **Department Management**: Create and manage departments
- **Workflow Approvals**: Create and process approval workflows for employee requests
- **Employee Transfers**: Move employees between departments
- **Request Management**: Handle employee requests with approval processes

## Technology Stack

### Frontend
- Angular 10
- Bootstrap 5
- RxJS
- TypeScript

### Backend
- Node.js
- Express.js
- Sequelize ORM
- MySQL Database
- JWT Authentication

## Installation

### Prerequisites
- Node.js (v12+)
- MySQL Server
- XAMPP or similar local development environment

### Backend Setup
1. Navigate to the API directory:
   ```
   cd "Node.js + MySQL - Boilerplate API"
   ```
2. Install dependencies:
   ```
   npm install
   ```
3. Create a MySQL database with the details matching the config.json file
4. Start the server:
   ```
   npm start
   ```
5. The API will be available at `http://localhost:4000`

### Frontend Setup
1. Navigate to the Angular directory:
   ```
   cd "Angular-10-Boilerplate"
   ```
2. Install dependencies:
   ```
   npm install
   ```
3. Start the development server:
   ```
   ng serve
   ```
4. Access the application at `http://localhost:4200`

## Configuration

### API Configuration
The backend configuration is stored in `config.json`:

```json
{
    "database": {
      "host": "153.92.15.31 ",
      "port": 3306,
      "user": "u875409848_catubig",
      "password": " 9T2Z5$3UKkgSYzE",
      "database": "u875409848_catubig"
    },
    "secret": "b28a97b3-7a3a-4a35-8bfa-41d9d2191949",
    "emailFrom": "info@node-mysql-signup-verification-api.com",
    "smtpOptions": {
      "host": "smtp.ethereal.email",
      "port": 587,
      "auth": {
        "user": "everardo.stracke75@ethereal.email",
        "pass": "nRJBMPhs3U9WczVS36"
      }
    }
  }
  
  
```

### Frontend Configuration
Environment settings are in `src/environments/environment.ts` and `environment.prod.ts`:

```typescript
export const environment = {
  production: false,
  apiUrl: 'http://localhost:4000'
};
```

## Usage Guide

### Admin Functions
1. **User Management**: Create, edit, and deactivate user accounts
2. **Department Management**: Create and manage departments
3. **Employee Management**: Add employees, assign to departments, and manage their details
4. **Workflow Approval**: Review and process workflow approval requests

### User Functions
1. **Personal Profile**: View and edit personal information
2. **Requests**: Submit requests for approval
3. **Workflows**: View personal workflow status

## API Documentation

### Authentication Endpoints
- `POST /accounts/authenticate` - User login
- `POST /accounts/refresh-token` - Refresh JWT token
- `POST /accounts/revoke-token` - Logout
- `POST /accounts/register` - Register a new account
- `POST /accounts/verify-email` - Verify email address
- `POST /accounts/forgot-password` - Request password reset
- `POST /accounts/reset-password` - Reset password

### Employee Endpoints
- `GET /employees` - List all employees
- `GET /employees/:id` - Get employee details
- `POST /employees` - Create a new employee
- `PUT /employees/:id` - Update employee information
- `DELETE /employees/:id` - Delete an employee
- `PUT /employees/:id/transfer` - Transfer employee to another department

### Workflow Endpoints
- `GET /workflows` - List all workflows
- `GET /workflows/:id` - Get workflow details
- `PUT /workflows/:id/status` - Update workflow status

### Department Endpoints
- `GET /departments` - List all departments
- `POST /departments` - Create a new department
- `PUT /departments/:id` - Update department information
- `DELETE /departments/:id` - Delete a department

## User Roles

### Admin
- Full system access
- Manage all users, employees, departments
- Process workflow approvals
- Perform employee transfers

### User
- Limited access based on permissions
- View and edit personal information
- Submit requests for approval
- View assigned workflows

## Database Structure

### Main Tables
- **Accounts**: User authentication data
- **Employees**: Employee information linked to accounts
- **Departments**: Department information
- **Workflows**: Approval workflows for system actions
- **Requests**: Employee requests requiring approval
- **RefreshTokens**: JWT token management

## Workflow Management

Workflows are a key component of this system, allowing for structured approval processes:

1. **Request Submission**: User submits a request
2. **Workflow Creation**: System creates a workflow for approval
3. **Approval Process**: Admin reviews and approves/rejects workflow
4. **Status Update**: Upon workflow approval, the associated request is automatically approved
5. **Notification**: Users are notified of the outcome (future enhancement)

## Troubleshooting

### Common Issues

#### API Connection Errors
- Ensure the API server is running at the configured URL
- Check for CORS issues in the browser console
- Verify database connection settings in config.json

#### Authentication Problems
- Verify user credentials
- Check if the account is active
- Ensure email verification is complete for new accounts

#### Workflow Issues
- Verify the workflow record contains the correct requestId
- Check that your database has proper relationships between tables
- Ensure users have appropriate permissions for workflow actions

For additional support, please contact the system administrator.