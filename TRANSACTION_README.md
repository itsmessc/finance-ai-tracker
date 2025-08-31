# Finance AI Tracker - Transaction Features

This project now includes comprehensive transaction management with AI-powered natural language parsing using Google's Gemini AI.

## 🚀 Features

### Transaction Management
- ✅ Create transactions manually or with AI parsing
- ✅ Edit and delete transactions
- ✅ Advanced filtering and search
- ✅ Pagination for large datasets
- ✅ Real-time transaction summary
- ✅ Category-based organization
- ✅ Tag support for better organization

### AI-Powered Parsing
- 🤖 Natural language transaction parsing using Gemini AI
- 📝 Convert text like "Spent ₹250 on lunch at McDonald's" into structured data
- 🎯 Automatic category detection
- 📍 Location extraction
- 🏷️ Smart tag generation

### User Interface
- 🎨 Modern, responsive design with Tailwind CSS
- 💫 Smooth animations with Framer Motion
- 🔔 Toast notifications for user feedback
- 📱 Mobile-friendly interface
- 🌙 Dark mode support
- 🔍 Advanced filtering with date ranges
- 📊 Visual transaction summaries

## 🛠️ Setup Instructions

### Backend Setup

1. **Install dependencies:**
   ```bash
   cd backend
   npm install
   ```

2. **Environment Variables:**
   - Copy `.env.example` to `.env`
   - Fill in the required values:
     ```bash
     PORT=4000
     MONGODB_URI=mongodb://localhost:27017/finance-ai-tracker
     JWT_SECRET=your_jwt_secret_here
     JWT_EXPIRES_IN=15m
     REFRESH_TOKEN_EXPIRES_IN=30d
     GOOGLE_CLIENT_ID=your_google_client_id.apps.googleusercontent.com
     GEMINI_API_KEY=your-gemini-api-key-here
     ```

3. **Get Gemini API Key:**
   - Go to [Google AI Studio](https://aistudio.google.com/)
   - Create a new API key
   - Add it to your `.env` file as `GEMINI_API_KEY`

4. **Start the backend:**
   ```bash
   npm start
   ```

### Frontend Setup

1. **Install dependencies:**
   ```bash
   cd frontend
   npm install
   ```

2. **Start the frontend:**
   ```bash
   npm run dev
   ```

## 📡 API Endpoints

### Transaction Endpoints
- `POST /api/transactions/parse` - Parse natural language into transaction data
- `POST /api/transactions` - Create a new transaction
- `GET /api/transactions` - Get transactions with filters
- `PUT /api/transactions/:id` - Update a transaction
- `DELETE /api/transactions/:id` - Delete a transaction
- `GET /api/transactions/stats` - Get transaction statistics

### Query Parameters for GET /api/transactions
- `page` - Page number (default: 1)
- `limit` - Items per page (default: 10)
- `type` - Filter by type: 'all', 'credit', 'debit'
- `category` - Filter by category
- `startDate` - Filter transactions from this date
- `endDate` - Filter transactions until this date
- `search` - Search in description, tags, and location
- `sortBy` - Sort by: 'date', 'amount', 'category', 'description'
- `sortOrder` - Sort order: 'asc', 'desc'

## 🔧 Transaction Categories

The system supports the following transaction categories:
- Food
- Transport
- Entertainment
- Utilities
- Healthcare
- Education
- Shopping
- Travel
- Investment
- Salary
- Freelance
- Business
- Rent
- Insurance
- Other

## 🤖 AI Parsing Examples

The AI can parse natural language like:

- **"Spent 25 dollars on lunch at McDonald's"**
  - Amount: 25
  - Type: debit
  - Category: food
  - Description: "Lunch at McDonald's"
  - Location: "McDonald's"

- **"Received salary of 3000"**
  - Amount: 3000
  - Type: credit
  - Category: salary
  - Description: "Monthly salary"

- **"Paid 50 for uber ride to airport"**
  - Amount: 50
  - Type: debit
  - Category: transport
  - Description: "Uber ride to airport"
  - Location: "airport"

## 🎨 UI Components

### Main Components
- **TransactionForm** - Modal form for creating/editing transactions
- **TransactionList** - Displays transactions with actions
- **TransactionFilters** - Advanced filtering interface
- **TransactionSummary** - Visual summary cards
- **Pagination** - Handles large datasets

### Features
- Real-time filtering and search
- Responsive design for all screen sizes
- Smooth animations and transitions
- Toast notifications for user feedback
- Loading states and error handling

## 🔄 State Management

The app uses Redux Toolkit for state management with the following slices:
- **authSlice** - User authentication
- **transactionSlice** - Transaction management and AI parsing

## 📱 Mobile Responsive

The interface is fully responsive and works seamlessly on:
- Desktop computers
- Tablets
- Mobile phones

## 🚀 Future Enhancements

Potential improvements for the future:
- Export transactions to CSV/PDF
- Advanced analytics and charts
- Recurring transaction templates
- Attachment support for receipts
- Integration with bank APIs
- Budgeting and goal setting
- Multi-currency support

## 🐛 Troubleshooting

### Common Issues

1. **Gemini API Error:**
   - Make sure your API key is valid
   - Check if you have quota remaining
   - Verify the API key in your `.env` file

2. **MongoDB Connection:**
   - Ensure MongoDB is running
   - Check the connection string
   - Verify database permissions

3. **Frontend Not Loading:**
   - Clear browser cache
   - Check console for errors
   - Restart the development server

### Need Help?
If you encounter any issues, please check the console logs for detailed error messages.
