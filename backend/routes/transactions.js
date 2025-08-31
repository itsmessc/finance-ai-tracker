const express = require('express');
const mongoose = require('mongoose');
const Transaction = require('../models/Transaction');
const aiParser = require('../services/aiParser');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

// Parse natural language input
router.post('/parse', authenticate, async (req, res) => {
    try {
        const { text } = req.body;

        if (!text || text.trim() === '') {
            return res.status(400).json({
                success: false,
                message: 'Text is required for parsing'
            });
        }

        const parsedData = await aiParser.parseTransaction(text.trim());

        res.json({
            success: true,
            data: {
                ...parsedData,
                parsedFrom: text
            }
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
});

// Create transaction
router.post('/', authenticate, async (req, res) => {
    try {
        const { amount, type, category, description, date, tags, location, parsedFrom } = req.body;

        // Validate required fields
        if (!amount || !type || !category || !description) {
            return res.status(400).json({
                success: false,
                message: 'Amount, type, category, and description are required'
            });
        }

        const transaction = new Transaction({
            user: req.user.id,
            amount: Math.abs(amount), // Ensure positive amount
            type: type.toLowerCase(),
            category: category.toLowerCase(),
            description,
            date: date ? new Date(date) : new Date(), // Use provided date or current date
            tags: tags || [],
            location: location || null,
            parsedFrom: parsedFrom || null
        });

        await transaction.save();
        await transaction.populate('user', 'name email');

        res.status(201).json({
            success: true,
            data: transaction
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
});

// Get user's transactions with filters
router.get('/', authenticate, async (req, res) => {
    try {
        const {
            page = 1,
            limit = 10,
            type,
            category,
            startDate,
            endDate,
            search,
            sortBy = 'date',
            sortOrder = 'desc'
        } = req.query;

        const filter = { user: req.user.id };

        console.log('User ID from token:', req.user.id);
        console.log('Filter for query:', filter);

        // First, let's see all transactions for this user without filters
        const allUserTransactions = await Transaction.find({ user: req.user.id });
        console.log('All user transactions:', allUserTransactions.length);
        console.log('Sample transactions:', allUserTransactions.slice(0, 2).map(t => ({
            id: t._id,
            amount: t.amount,
            type: t.type,
            user: t.user
        })));

        // Apply filters
        if (type && type !== 'all') {
            filter.type = type;
        }

        if (category && category !== 'all') {
            filter.category = category;
        }

        if (startDate || endDate) {
            filter.date = {};
            if (startDate) {
                filter.date.$gte = new Date(startDate);
            }
            if (endDate) {
                filter.date.$lte = new Date(endDate);
            }
        }

        if (search) {
            filter.$or = [
                { description: { $regex: search, $options: 'i' } },
                { tags: { $in: [new RegExp(search, 'i')] } },
                { location: { $regex: search, $options: 'i' } }
            ];
        }

        const sort = {};
        sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

        const skip = (page - 1) * limit;

        const [transactions, total] = await Promise.all([
            Transaction.find(filter)
                .sort(sort)
                .skip(skip)
                .limit(parseInt(limit))
                .populate('user', 'name email'),
            Transaction.countDocuments(filter)
        ]);

        console.log('Found transactions count:', transactions.length);
        console.log('Total transactions:', total);
        console.log('Sample transaction:', transactions[0]);

        // Calculate totals using the same filter but ensuring proper ObjectId comparison
        const aggregationFilter = { user: new mongoose.Types.ObjectId(req.user.id) };

        // Apply the same additional filters to aggregation
        if (type && type !== 'all') {
            aggregationFilter.type = type;
        }

        if (category && category !== 'all') {
            aggregationFilter.category = category;
        }

        if (startDate || endDate) {
            aggregationFilter.date = {};
            if (startDate) {
                aggregationFilter.date.$gte = new Date(startDate);
            }
            if (endDate) {
                aggregationFilter.date.$lte = new Date(endDate);
            }
        }

        if (search) {
            aggregationFilter.$or = [
                { description: { $regex: search, $options: 'i' } },
                { tags: { $in: [new RegExp(search, 'i')] } },
                { location: { $regex: search, $options: 'i' } }
            ];
        }

        const totals = await Transaction.aggregate([
            { $match: aggregationFilter },
            {
                $group: {
                    _id: '$type',
                    total: { $sum: '$amount' }
                }
            }
        ]);

        console.log('Aggregation filter:', aggregationFilter);
        console.log('Aggregation totals result:', totals);

        const totalCredit = totals.find(t => t._id === 'credit')?.total || 0;
        const totalDebit = totals.find(t => t._id === 'debit')?.total || 0;
        const balance = totalCredit - totalDebit;

        console.log('Final calculated totals:', { totalCredit, totalDebit, balance });

        res.json({
            success: true,
            data: {
                transactions,
                pagination: {
                    current: parseInt(page),
                    total: Math.ceil(total / limit),
                    count: transactions.length,
                    totalRecords: total
                },
                summary: {
                    totalCredit,
                    totalDebit,
                    balance
                }
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

// Update transaction
router.put('/:id', authenticate, async (req, res) => {
    try {
        const { amount, type, category, description, tags, location } = req.body;

        const transaction = await Transaction.findOne({
            _id: req.params.id,
            user: req.user.id
        });

        if (!transaction) {
            return res.status(404).json({
                success: false,
                message: 'Transaction not found'
            });
        }

        // Update fields
        if (amount !== undefined) transaction.amount = Math.abs(amount);
        if (type !== undefined) transaction.type = type.toLowerCase();
        if (category !== undefined) transaction.category = category.toLowerCase();
        if (description !== undefined) transaction.description = description;
        if (tags !== undefined) transaction.tags = tags;
        if (location !== undefined) transaction.location = location;

        await transaction.save();
        await transaction.populate('user', 'name email');

        res.json({
            success: true,
            data: transaction
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
});

// Delete transaction
router.delete('/:id', authenticate, async (req, res) => {
    try {
        const transaction = await Transaction.findOneAndDelete({
            _id: req.params.id,
            user: req.user.id
        });

        if (!transaction) {
            return res.status(404).json({
                success: false,
                message: 'Transaction not found'
            });
        }

        res.json({
            success: true,
            message: 'Transaction deleted successfully'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

module.exports = router;
