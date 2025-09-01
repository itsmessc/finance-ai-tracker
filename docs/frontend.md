# Frontend Documentation

This document details the architecture, components, and state management of the Finance AI Tracker's frontend.

## 1. Tech Stack

-   **Framework**: [React](https://reactjs.org/)
-   **Build Tool**: [Vite](https://vitejs.dev/)
-   **Styling**: [Tailwind CSS](https://tailwindcss.com/) & Plain CSS
-   **State Management**: [Redux Toolkit](https://redux-toolkit.js.org/)
-   **Routing**: [React Router](https://reactrouter.com/)
-   **UI Components**:
    -   [Lucide React](https://lucide.dev/guide/packages/lucide-react) for icons.
    -   [Recharts](https://recharts.org/) for charts.
    -   [Framer Motion](https://www.framer.com/motion/) for animations.
-   **Linting**: [ESLint](https://eslint.org/)

## 2. Folder Structure

The `frontend/src` directory is organized as follows:

-   `assets/`: Static assets like images and SVGs.
-   `components/`: Reusable React components.
    -   `ui/`: Generic, presentational components (e.g., `Button`, `Card`).
    -   Specific components like `TransactionList`, `TransactionForm`, etc.
-   `constants/`: Shared constant values (e.g., transaction categories).
-   `pages/`: Top-level components that represent application pages (e.g., `Dashboard`, `Login`).
-   `routes/`: Routing configuration, including protected routes.
-   `services/`: Modules for making API calls to the backend.
-   `store/`: Redux Toolkit setup, including slices and the main store.
-   `styles/`: Global and component-specific styles.
-   `utils/`: Utility functions (e.g., date formatters, color generators).

## 3. State Management (Redux)

Redux Toolkit is used for global state management.

-   **`store/index.js`**: Configures the main Redux store.
-   **`store/slices/`**:
    -   `authSlice.js`: Manages user authentication state, including the user object, access token, and loading/error states.
    -   `transactionSlice.js`: Manages transaction data, including the list of transactions, pagination details, filters, and summary data.

## 4. Key Components

-   **`Layout.jsx`**: The main application layout, including the sidebar, header, and main content area. It's responsible for the overall structure of the UI.
-   **`TransactionForm.jsx`**: A smart form that allows users to add or edit transactions. It includes the AI-powered natural language input field.
-   **`TransactionList.jsx`**: Displays the list of transactions with pagination and allows for editing or deleting individual items.
-   **`Analytics.jsx`**: The dashboard page that visualizes financial data using charts and displays AI-generated insights.
-   **`GoogleSignIn.jsx`**: A component that handles the Google Sign-In flow.

## 5. Environment Variables

The frontend uses a `.env` file in the `frontend` directory to manage environment variables. The primary variable is:

-   `VITE_API_BASE_URL`: The base URL for the backend API (e.g., `http://localhost:5000/api`).
