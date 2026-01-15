# AI Cyber Mentor API

This folder contains an Express.js backend that powers user registration and authentication for the AI Cyber Mentor front-end.

## Prerequisites

- Node.js 18 or later
- npm (ships with Node.js)
- MySQL server accessible from your machine

## Setup

1. Install dependencies:

```bash
npm install
```

2. Copy `.env.example` to `.env` and update the database credentials and secret:

```bash
cp .env.example .env
```

3. Create the database and tables. From a MySQL shell run:

```sql
SOURCE sql/schema.sql;
```

4. Start the development server:

```bash
npm run dev
```

The API will be available on `http://localhost:4000`.

## Available endpoints

- `POST /api/auth/register` – create a new account. Body: `{ "fullName": "...", "email": "...", "password": "..." }`
- `POST /api/auth/login` – authenticate. Body: `{ "email": "...", "password": "..." }`
- `GET /api/auth/me` – fetch the current user's profile. Requires an `Authorization: Bearer <token>` header.

All successful responses include the authenticated user data and a JWT token which the front-end stores in `localStorage`.
