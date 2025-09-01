# Finance AI Tracker - Documentation

Welcome to the complete documentation for the Finance AI Tracker application. This document provides a high-level overview of the project, its architecture, and how the different parts of the application work together.

## Table of Contents

1.  [Project Overview](#project-overview)
2.  [Features](#features)
3.  [System Architecture](#system-architecture)
4.  [Getting Started](./README.md#getting-started)
5.  [Frontend Documentation](./frontend.md)
6.  [Backend Documentation](./backend.md)

---

## 1. Project Overview

The Finance AI Tracker is a modern, full-stack web application designed to help users manage their personal finances effectively. It leverages Artificial Intelligence to parse natural language transaction inputs, provides insightful analytics, and offers a clean, responsive user interface for tracking income and expenses.

## 2. Features

-   **Secure Authentication**: Google OAuth 2.0 for secure and easy login.
-   **AI-Powered Transaction Parsing**: Users can enter transactions in plain English (e.g., "spent 500 on groceries at the store").
-   **CRUD Functionality**: Full capabilities to Create, Read, Update, and Delete transactions.
-   **Dynamic Filtering & Search**: Easily filter transactions by type, category, date range, or a text-based search.
-   **Data-Rich Dashboard**: An analytics page featuring:
    -   AI-driven financial health assessments and recommendations.
    -   Charts for spending by category.
    -   Trends for income vs. expense over time.
-   **Currency Conversion**: All financial data is handled and displayed in Indian Rupees (INR).
-   **Responsive Design**: A mobile-first design that works beautifully on all devices.
-   **Theming**: Light and dark mode support.

## 3. System Architecture

The application is a classic client-server model with a React frontend and a Node.js/Express backend.

-   **Frontend**: A single-page application (SPA) built with React and Vite. It uses Redux for state management and communicates with the backend via a REST API.
-   **Backend**: A Node.js server using the Express framework. It handles business logic, interacts with the MongoDB database, and provides the REST API for the frontend.
-   **Database**: A MongoDB database stores user data, transactions, and refresh tokens. Mongoose is used as the ODM.
-   **AI Service**: Google's Gemini API is used for natural language processing to parse transaction strings.

For more detailed information, please refer to the specific documentation for the [Frontend](./frontend.md) and [Backend](./backend.md).
