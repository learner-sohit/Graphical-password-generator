# Graphical Password Generator

A full-stack authentication project that replaces traditional text passwords with an image-based password flow. Instead of remembering a word or phrase, users choose a theme, receive a curated set of images, and authenticate by selecting their graphical password sequence.

## Overview

This repository contains:

- A React frontend for signup, login, and protected-route access
- An Express and MongoDB backend for user management and authentication
- A graphical password flow powered by themed image selection

The project is designed to explore a more memorable and user-friendly alternative to conventional passwords while still enforcing server-side validation and secure credential storage.

## Key Features

- Theme-based graphical password registration
- Image-based login verification
- Protected frontend route after authentication
- MongoDB-backed user persistence
- Hashed graphical password storage using salted `scrypt`
- Input validation, rate limiting, `helmet`, and tighter CORS handling
- Automatic migration of legacy reversible passwords to hashed storage on successful login

## Tech Stack

### Frontend

- React 18
- React Router
- Redux Toolkit
- Axios
- Vite
- Tailwind CSS
- React Toastify

### Backend

- Node.js
- Express
- MongoDB with Mongoose
- `helmet`
- `express-rate-limit`
- `dotenv`

## Project Structure

```text
Graphical-password-generator/
├── GraphicalPasswordFrontEnd-main/
│   ├── public/
│   ├── src/
│   └── package.json
├── GraphicalPasswordBackEnd-main/
│   ├── index.js
│   ├── model.js
│   └── package.json
└── README.md
```

## How It Works

### Signup Flow

1. The user enters an email address and a theme.
2. The frontend fetches themed images from Unsplash.
3. The user selects one or more images as their graphical password.
4. The backend validates the request and stores:
   - the normalized email
   - the image ID set
   - a salted hash of the graphical password

### Login Flow

1. The user enters the same email and theme.
2. The backend returns the stored image IDs for that user.
3. The frontend fetches those images and displays them.
4. The user selects their graphical password.
5. The backend verifies the selection against the stored password hash.

## Security Improvements

The application was updated to address multiple security issues.

- Replaced reversible/base64 password storage with salted `scrypt` hashing
- Removed shared in-memory login state that could leak across requests
- Added server-side email, theme, and image-selection validation
- Added rate limiting for authentication endpoints
- Added `helmet` for safer HTTP defaults
- Restricted CORS to configured frontend origins
- Reduced unnecessary package exposure and updated vulnerable dependencies
- Hardened Git ignore rules for env files, logs, and PID/runtime artifacts

## Environment Variables

### Frontend

Create [GraphicalPasswordFrontEnd-main/.env](/Users/sohit/Documents/New%20project%202/Graphical-password-generator/GraphicalPasswordFrontEnd-main/.env) with:

```env
PORT=3000
VITE_BACKEND_BASE_URL=http://127.0.0.1:5001
VITE_CLIENT=YOUR_UNSPLASH_ACCESS_KEY
```

### Backend

Create [GraphicalPasswordBackEnd-main/.env](/Users/sohit/Documents/New%20project%202/Graphical-password-generator/GraphicalPasswordBackEnd-main/.env) with:

```env
PORT=5001
MONGO_URI=mongodb://127.0.0.1:27017/graphical_password
FRONTEND_ORIGIN=http://127.0.0.1:3000
```

## GitHub Safety

To avoid exposing secrets or local runtime files in GitHub:

- Keep real credentials only in local `.env` files
- Commit only `.env.sample` files with placeholders
- Ignore runtime artifacts like `*.log` and `*.pid`

Before pushing, run:

```bash
git status --short
git ls-files | rg '(^|/)\.env($|\.)|\.log$|\.pid$'
git ls-files -z | xargs -0 rg -n --no-heading -i '(api[_-]?key|secret|token|private[_-]?key|BEGIN (RSA|OPENSSH|EC) PRIVATE KEY)'
```

## Installation

### 1. Clone the repository

```bash
git clone <your-repository-url>
cd Graphical-password-generator
```

### 2. Install frontend dependencies

```bash
cd GraphicalPasswordFrontEnd-main
npm install
```

### 3. Install backend dependencies

```bash
cd ../GraphicalPasswordBackEnd-main
npm install
```

## Running the Application

Open two terminals.

### Start the backend

```bash
cd "/Users/sohit/Documents/New project 2/Graphical-password-generator/GraphicalPasswordBackEnd-main"
HOST=127.0.0.1 npm start
```

### Start the frontend

```bash
cd "/Users/sohit/Documents/New project 2/Graphical-password-generator/GraphicalPasswordFrontEnd-main"
BROWSER=none HOST=127.0.0.1 npm start
```

### Local URLs

- Frontend: [http://127.0.0.1:3000](http://127.0.0.1:3000)
- Backend: [http://127.0.0.1:5001](http://127.0.0.1:5001)

## Available Scripts

### Frontend

```bash
npm start
npm run build
npm test
```

### Backend

```bash
npm start
npm run dev
```

## API Endpoints

### `GET /`

Health-style root endpoint.

### `POST /signup`

Registers a user with:

- `email`
- `theme`
- `links`
- `id`

### `POST /login`

Validates the email and theme, then returns the stored image IDs for the account.

### `POST /loginVerify`

Verifies the selected graphical password against the stored hash.

## Current Status

- Frontend and backend run successfully in local development
- Production frontend build compiles successfully
- Backend dependency audit is clean
- Frontend dependency audit is clean

## Future Enhancements

- Add proper session or token-based authentication
- Add automated tests for auth flows
- Improve accessibility and keyboard navigation for image selection
- Add account recovery and multi-factor authentication

## License

This project is currently provided without a dedicated license file. Add a license if you plan to distribute or publish it.
