# CodeArena

A LeetCode-like coding platform where users can solve programming problems, run code, and get evaluated against test cases using Judge0 API.

## Features Implemented

- User Authentication
- JWT Authorization
- Admin Middleware
- Problem Creation API
- Test Case Validation
- Judge0 Batch Submission Integration
- MongoDB Integration
- Redis Configuration
- Modular Backend Structure

## Tech Stack

- Node.js
- Express.js
- MongoDB
- Redis
- JWT
- Judge0 API

## Project Structure

```bash
src/
│
├── config/
├── controller/
├── middleware/
├── model/
├── router/
├── utils/
```

## Environment Variables

Create a `.env` file in root directory:

```env
PORT=
DB_CONNECTION_STRING=
SECRET_KEY=
REDIS_USERNAME=
REDIS_PASSWORD=
REDIS_SOCKET_HOST=
REDIS_SOCKET_PORT=
JUDGE0_API_KEY=
```

## Installation

```bash
git clone <repo-url>
cd project-folder
npm install
```

## Run Project

```bash
npm run dev
```

## Upcoming Features

- Code Submission API
- Custom Test Case Execution
- Problem Difficulty Levels
- Contest System
- User Submission History
- Leaderboard
- Docker Deployment

## Current Status

Project is currently under development.
