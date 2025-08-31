require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const authRoutes = require('./routes/auth');
const transactionRoutes = require('./routes/transactions');
const { cleanupExpiredTokens } = require('./actions/authActions');

const app = express();
app.use(cors());
app.use(express.json());

app.use('/auth', authRoutes);
app.use('/api/transactions', transactionRoutes);

app.get('/', (req, res) => res.json({ ok: true, message: 'Finance AI Tracker backend' }));

const PORT = process.env.PORT || 4000;

mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/finance-ai-tracker')
    .then(() => {
        console.log('Connected to MongoDB');
        
        // Clean up expired tokens on startup
        cleanupExpiredTokens();
        
        // Set up periodic cleanup (every 24 hours)
        setInterval(cleanupExpiredTokens, 24 * 60 * 60 * 1000);
        
        app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
    })
    .catch(err => {
        console.error('Failed to connect to MongoDB', err);
    });