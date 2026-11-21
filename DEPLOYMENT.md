# CertiFlow Deployment Guide

## 1. Overview

This document describes the deployment configuration for CertiFlow, a skilling certificate issuance platform.

The application consists of:

- **Frontend:** React.js, TypeScript, and Vite
- **Backend:** Node.js, Express.js, and TypeScript
- **Database:** PostgreSQL
- **ORM:** Prisma

> **Deployment status:** This guide documents the application configuration and deployment steps. A successful production deployment has not yet been verified. Docker-based deployment is not yet configured.

## 2. Deployment Requirements

Ensure the deployment environment provides:

- Node.js 22 or later
- npm
- PostgreSQL 16 or later
- Git
- Network access between the frontend, backend, and database

## 3. Environment Configuration

The backend requires the following environment variables.

Create a `.env` file inside the `backend` directory:

```env
DATABASE_URL="postgresql://certiflow_user:YOUR_PASSWORD@YOUR_DATABASE_HOST:5432/certiflow_db?schema=public"
PORT=5000
```

Replace the database username, password, and host with the actual deployment database details.

**Important:**
- Never commit `.env` files to GitHub.
- Use your hosting provider's environment-variable settings for deployed environments.
- Keep database credentials private.

## 4. Database Deployment

1. Create a PostgreSQL database named `certiflow_db`.
2. Create a database user with appropriate permissions.
3. Configure the backend `DATABASE_URL`.
4. From the backend directory, install dependencies:

```bash
npm install
```

5. Generate the Prisma Client:

```bash
npx prisma generate
```

6. Apply existing database migrations:

```bash
npx prisma migrate deploy
```

Do not use `prisma migrate dev` as the production migration command.

## 5. Backend Deployment

From the backend directory:

```bash
npm install
npx prisma generate
npm run build
```

After a successful build, start the backend:

```bash
npm start
```

The backend listens on the port configured through the `PORT` environment variable.

Ensure the hosting provider routes requests to this port.

### Backend Health Check

Check the following endpoint after deployment:

```text
GET /api/health
```

Expected successful response:

```json
{
  "status": "OK",
  "message": "CertiFlow API and database are working",
  "database": "Connected"
}
```

## 6. Frontend Deployment

From the frontend directory:

```bash
npm install
```

Configure the frontend API base URL to point to the deployed backend.

For example, if the frontend uses a Vite environment variable, configure:

```env
VITE_API_URL=https://YOUR_BACKEND_DOMAIN
```

The actual variable name must match the one used in the frontend source code.

Build the frontend:

```bash
npm run build
```

The generated production files are placed in the `dist` directory.

Deploy the contents of this directory to a static hosting provider that supports single-page application routing.

## 7. Network and CORS Configuration

The frontend must be able to communicate with the backend.

Before deployment:

- Configure the backend CORS policy to allow the deployed frontend domain.
- Ensure the frontend uses the deployed backend URL.
- Enable HTTPS for deployed services.
- Ensure the backend can connect to PostgreSQL.

The current backend uses Express CORS middleware. Production deployment should restrict allowed origins instead of allowing every origin.

## 8. Deployment Verification

After deploying the services, verify the following:

1. The frontend application loads successfully.
2. The backend root endpoint responds.
3. The `/api/health` endpoint reports a successful database connection.
4. Demo users can be created and listed.
5. Training batches can be created.
6. Candidates can be added to batches.
7. Candidate review statuses can be updated.
8. Browser and backend logs do not show unexpected errors.

## 9. Security Considerations

The current demo user selector is not an authentication mechanism.

Before production use, implement:

- Secure user authentication.
- Server-side role-based authorization.
- Input validation and request sanitization.
- Restricted CORS configuration.
- HTTPS.
- Secure database credentials.
- Logging and monitoring.
- Automated backend and frontend tests.
- Appropriate database backup and recovery procedures.

## 10. Current Limitations

The following deployment capabilities are not yet verified or implemented:

- Dockerfiles and Docker Compose deployment.
- Automated CI/CD pipeline.
- Production hosting configuration.
- Production authentication and authorization.
- Automated test execution in the deployment pipeline.

These items should be completed and verified before treating the application as production-ready.

## 11. Repository

GitHub repository:

https://github.com/mukund-securekloud/certiflow
