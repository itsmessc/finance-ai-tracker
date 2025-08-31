# Finance AI Tracker

A modern, full-stack financial tracking application that leverages AI to parse and categorize transactions from natural language input. Built with the MERN stack (MongoDB, Express, React, Node.js) and integrated with Google's Gemini AI for intelligent transaction processing.

## ✨ Features

- **Secure Authentication**: Google OAuth 2.0 for secure and easy sign-in.
- **AI-Powered Transaction Parsing**: Enter transactions in plain English (e.g., "Paid ₹500 for groceries at Reliance Fresh") and let the AI handle the rest.
- **Comprehensive Dashboard**: Get a quick overview of your financial health with insightful summaries and charts.
- **Detailed Transaction Management**: View, filter, sort, and manage all your transactions with ease.
- **In-Depth Analytics**: Visualize your spending habits with interactive charts and AI-generated insights.
- **Responsive Design**: A clean, modern, and mobile-first UI that looks great on any device.
- **Dark/Light Mode**: Switch between themes for your viewing comfort.
- **Export Functionality**: Export your transaction data to CSV.

## 🛠️ Tech Stack

- **Backend**:
  - **Node.js** & **Express**: For the RESTful API.
  - **MongoDB**: As the database for storing user and transaction data.
  - **Mongoose**: For object data modeling.
  - **JWT (JSON Web Tokens)**: For secure session management.
  - **Google Gemini AI**: For natural language processing of transactions.
  - **Google Auth Library**: For server-side OAuth 2.0 verification.

- **Frontend**:
  - **React**: For building the user interface.
  - **Vite**: As the build tool for a fast development experience.
  - **Redux Toolkit**: For state management.
  - **Tailwind CSS**: For styling.
  - **Recharts**: For creating beautiful and interactive charts.
  - **Framer Motion**: For smooth animations.
  - **Lucide React**: For icons.

## 📋 Prerequisites

Before you begin, ensure you have the following installed:
- [Node.js](https://nodejs.org/) (v18.x or later recommended)
- [npm](https://www.npmjs.com/) (usually comes with Node.js)
- [MongoDB](https://www.mongodb.com/try/download/community) (or a MongoDB Atlas account)
- [Git](https://git-scm.com/)

## 🚀 Getting Started

Follow these steps to get the project up and running on your local machine.

### 1. Clone the Repository

```bash
git clone https://github.com/your-username/finance-ai-tracker.git
cd finance-ai-tracker
```

### 2. Backend Setup

Navigate to the `backend` directory and install the dependencies.

```bash
cd backend
npm install
```

#### Environment Variables

Create a `.env` file in the `backend` directory by copying the example file:

```bash
cp .env.example .env
```

Now, open the `.env` file and fill in the required values:

- `PORT`: The port for the backend server (e.g., `4000`).
- `MONGODB_URI`: Your MongoDB connection string.
  - For a local setup: `mongodb://localhost:27017/finance-ai-tracker`
- `JWT_SECRET`: A long, random string for signing JWTs.
- `GOOGLE_CLIENT_ID`: Your Google OAuth 2.0 Client ID.
- `GEMINI_API_KEY`: Your API key for Google Gemini.

**How to get Google Credentials:**
1. Go to the [Google Cloud Console](https://console.cloud.google.com/).
2. Create a new project.
3. Navigate to "APIs & Services" > "Credentials".
4. Create an "OAuth 2.0 Client ID" for a "Web application".
5. Add `http://localhost:5173` (or your frontend's URL) to the "Authorized JavaScript origins".
6. Copy the Client ID.

**How to get Gemini API Key:**
1. Go to [Google AI Studio](https://aistudio.google.com/).
2. Click "Get API key".

### 3. Frontend Setup

Open a new terminal, navigate to the `frontend` directory, and install the dependencies.

```bash
cd frontend
npm install
```

#### Environment Variables

Create a `.env` file in the `frontend` directory by copying the example file:

```bash
cp .env.example .env
```

Open the `.env` file and add your Google Client ID:

- `VITE_GOOGLE_CLIENT_ID`: The same Google OAuth 2.0 Client ID used in the backend.
- `VITE_API_BASE`: The base URL for your backend API (e.g., `http://localhost:4000`).

### 4. Running the Application

You need to have two terminals open to run both the backend and frontend servers simultaneously.

- **In the `backend` directory terminal:**

  ```bash
  npm run dev
  ```
  This will start the backend server, typically on `http://localhost:4000`.

- **In the `frontend` directory terminal:**

  ```bash
  npm run dev
  ```
  This will start the frontend development server, typically on `http://localhost:5173`.

Open your browser and navigate to `http://localhost:5173` to see the application in action!
