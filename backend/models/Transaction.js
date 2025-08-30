const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    amount: {
        type: Number,
        required: true
    },
    type: {
        type: String,
        enum: ['credit', 'debit', 'cr', 'dr'],
        required: true
    },
    category: {
        type: String,
        required: true,
        enum: [
            'food', 'transport', 'entertainment', 'utilities', 'healthcare',
            'education', 'shopping', 'travel', 'investment', 'salary',
            'freelance', 'business', 'rent', 'insurance', 'other'
        ]
    },
    description: {
        type: String,
        required: true
    },
    date: {
        type: Date,
        default: Date.now
    },
    parsedFrom: {
        type: String, // Store original text if parsed by AI
        default: null
    },
    tags: [{
        type: String
    }],
    location: {
        type: String,
        default: null
    }
}, {
    timestamps: true
});

// Index for better query performance
transactionSchema.index({ user: 1, date: -1 });
transactionSchema.index({ user: 1, category: 1 });
transactionSchema.index({ user: 1, type: 1 });

module.exports = mongoose.model('Transaction', transactionSchema);
