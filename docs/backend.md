# Backend Documentation

This document provides a detailed overview of the backend server for the Finance AI Tracker application.

## 1. Tech Stack

-   **Framework**: [Express.js](https://expressjs.com/)
-   **Database**: [MongoDB](https://www.mongodb.com/)
-   **ODM**: [Mongoose](https://mongoosejs.com/)
-   **Authentication**: [JSON Web Tokens (JWT)](https://jwt.io/)
-   **AI Integration**: [Google Gemini](https://deepmind.google/technologies/gemini/)
-   **Environment Variables**: [dotenv](https://www.npmjs.com/package/dotenv)

## 2. Folder Structure

The `backend` directory is organized to separate concerns, following a standard MVC-like pattern.

-   `actions/`: Contains modules that perform specific, isolated business logic, such as handling the Google OAuth token exchange.
-   `controllers/`: Processes incoming requests, interacts with models and services, and sends responses. This is where the main business logic resides.
-   `middleware/`: Express middleware functions, such as the `auth.js` middleware for verifying JWTs.
-   `models/`: Mongoose schemas and models for `User`, `Transaction`, and `RefreshToken`.
-   `routes/`: Defines the API endpoints and maps them to controller functions.
-   `services/`: Houses services that connect to external APIs, like the `aiParser.js` for Google Gemini.
-   `config/`: Configuration files, such as the database connection setup.
-   `utils/`: Utility classes and functions, like `AppError` for custom error handling.

## 3. API Endpoints

All endpoints are prefixed with `/api`.

### Authentication (`/auth`)

-   `POST /google`: Authenticates a user with a Google ID token. Returns JWT access and refresh tokens.
-   `POST /refresh`: Issues a new access token using a valid refresh token.
-   `POST /logout`: Invalidates a refresh token upon user logout.

### Transactions (`/transactions`)

-   `POST /parse`: (Authenticated) Parses a natural language string into transaction data using the AI service.
-   `POST /`: (Authenticated) Creates a new transaction.
-   `GET /`: (Authenticated) Retrieves a paginated and filtered list of the user's transactions.
-   `GET /summary`: (Authenticated) Gets a summary of income, expenses, and net balance.
-   `GET /:id`: (Authenticated) Retrieves a single transaction by its ID.
-   `PUT /:id`: (Authenticated) Updates a transaction.
-   `DELETE /:id`: (Authenticated) Deletes a transaction.

### Analytics (`/analytics`)

-   `GET /insights`: (Authenticated) Generates and retrieves AI-powered financial insights based on the user's transaction history.

## 4. Authentication Flow

1.  **Login**: The frontend sends a Google ID token to `POST /api/auth/google`.
2.  **Token Exchange**: The backend verifies the token with Google, finds or creates a user, and generates a short-lived JWT **access token** and a long-lived **refresh token**.
3.  **Tokens Stored**: The frontend stores the access token in memory (e.g., Redux state) and the refresh token in a secure `HttpOnly` cookie or local storage.
4.  **Authenticated Requests**: The frontend sends the access token in the `Authorization` header for all protected API calls. The `auth` middleware on the backend verifies this token.
5.  **Token Refresh**: When the access token expires, the frontend sends the refresh token to `POST /api/auth/refresh` to get a new access token.

## 5. Environment Variables

The backend requires a `.env` file in the `backend` directory with the following variables:

-   `PORT`: The port for the server to run on (e.g., 5000).
-   `MONGO_URI`: The connection string for the MongoDB database.
-   `JWT_SECRET`: A secret key for signing access tokens.
-   `JWT_REFRESH_SECRET`: A secret key for signing refresh tokens.
-   `GOOGLE_CLIENT_ID`: The Google Cloud project's client ID for OAuth.
-   `GEMINI_API_KEY`: The API key for the Google Gemini service.
