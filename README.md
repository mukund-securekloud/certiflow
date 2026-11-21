# CertiFlow – Skilling Certificate Issuance Platform

> Hackathon project under development. Not intended for production use without additional security and testing.

## 1. Overview

CertiFlow is a platform for managing training batches, candidate information, and candidate review statuses.

## 2. Implemented Features

- Create training batches.
- Add candidates to batches.
- View batches and candidate information.
- Allow District Officers to update candidate statuses.
- Store data in PostgreSQL.
- Provide REST APIs using Express.js.
- Provide a React.js frontend.

### Candidate statuses

- PENDING
- APPROVED
- REJECTED
- SENT_BACK

## 3. Technology Stack

| Layer | Technology |
|---|---|
| Frontend | React.js, TypeScript, Vite |
| Backend | Node.js, Express.js, TypeScript |
| Database | PostgreSQL |
| ORM | Prisma |
| API | REST |

## 4. Project Structure

- frontend/ – React.js application
- backend/prisma/ – Database schema and migrations
- backend/src/config/ – Database configuration
- backend/src/routes/ – API routes
- backend/src/app.ts – Express application
- backend/src/server.ts – Backend server

## 5. Prerequisites

- Node.js 22 or later
- npm
- PostgreSQL
- Git

## 6. Local Setup

Clone the repository:

    git clone https://github.com/mukund-securekloud/certiflow.git
    cd certiflow

Create a PostgreSQL database and user for CertiFlow.

Configure the backend:

    cd backend
    npm install

Create backend/.env with your database credentials:

    DATABASE_URL="postgresql://certiflow_user:YOUR_PASSWORD@localhost:5432/certiflow_db?schema=public"
    PORT=5000

Generate Prisma Client and apply migrations:

    npx prisma generate
    npx prisma migrate deploy

Start the backend:

    npm run dev

Open another terminal and start the frontend:

    cd ~/Desktop/certiflow/frontend
    npm install
    npm run dev

Open the local URL printed by Vite.

## 7. Backend API Endpoints

| Method | Endpoint | Purpose |
|---|---|---|
| GET | / | API welcome message |
| GET | /api/health | API and database health |
| POST | /api/users/create | Create a user |
| GET | /api/users | List users |
| POST | /api/batches/create | Create a batch |
| GET | /api/batches | List batches |
| GET | /api/batches/:id | Get batch details |
| POST | /api/batches/:id/candidates | Add a candidate |
| POST | /api/batches/candidates/:candidateId/decision | Update candidate status |

## 8. Technical Decisions

- React.js and Vite for the frontend.
- Express.js for backend REST APIs.
- PostgreSQL for relational data storage.
- Prisma for database access and migrations.
- TypeScript for frontend and backend development.

## 9. Security Considerations

The current demo user selector is not an authentication system. Production deployment requires authentication, server-side role-based access control, secure environment configuration, input validation, automated tests, and monitoring.

## 10. Repository

https://github.com/mukund-securekloud/certiflow
