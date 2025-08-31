const express = require('express');
const Transaction = require('../models/Transaction');
const aiParser = require('../services/aiParser');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

// Get AI-powered financial insights
router.get('/insights', authenticate, async (req, res) => {
    try {
        const { period = '30' } = req.query;
        const periodDays = parseInt(period);

        // Calculate date range
        const now = new Date();
        const startDate = new Date(now.getTime() - (periodDays * 24 * 60 * 60 * 1000));

        // Fetch transactions for the period
        const transactions = await Transaction.find({
            user: req.user.id,
            date: { $gte: startDate, $lte: now }
        }).sort({ date: -1 });

        if (transactions.length === 0) {
            return res.json({
                success: true,
                data: {
                    aiInsights: {
                        healthAssessment: "No transactions found for this period. Start tracking your finances to get personalized insights!",
                        recommendations: [
                            "Add your income and expense transactions to get started",
                            "Use the natural language parser to quickly add transactions",
                            "Set up regular transaction tracking habits"
                        ],
                        spendingPatterns: "No spending patterns available yet",
                        savingsOpportunities: "Start tracking expenses to identify savings opportunities",
                        goalSuggestions: "Begin with tracking your daily expenses",
                        riskLevel: "unknown",
                        budgetScore: 0,
                        generatedAt: new Date().toISOString(),
                        timeframe: period,
                        fallback: false
                    }
                }
            });
        }

        // Calculate financial metrics
        const totalIncome = transactions
            .filter(t => t.type === 'credit')
            .reduce((sum, t) => sum + t.amount, 0);

        const totalExpense = transactions
            .filter(t => t.type === 'debit')
            .reduce((sum, t) => sum + t.amount, 0);

        const netBalance = totalIncome - totalExpense;
        const savingsRate = totalIncome > 0 ? ((netBalance / totalIncome) * 100) : 0;

        // Analyze spending by category
        const categorySpending = {};
        transactions.forEach(transaction => {
            if (transaction.type === 'debit') {
                const category = transaction.category || 'Other';
                categorySpending[category] = (categorySpending[category] || 0) + transaction.amount;
            }
        });

        const topExpenseCategories = Object.entries(categorySpending)
            .map(([category, amount]) => ({
                name: category,
                amount,
                percentage: totalExpense > 0 ? ((amount / totalExpense) * 100) : 0
            }))
            .sort((a, b) => b.amount - a.amount);

        // Generate AI insights
        const insights = await generateAIInsights({
            totalIncome,
            totalExpense,
            netBalance,
            savingsRate,
            topExpenseCategories,
            transactionCount: transactions.length,
            periodDays
        });

        res.json({
            success: true,
            data: {
                aiInsights: {
                    ...insights,
                    generatedAt: new Date().toISOString(),
                    timeframe: period,
                    fallback: false
                }
            }
        });

    } catch (error) {
        console.error('Error generating AI insights:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to generate insights',
            error: error.message
        });
    }
});

// AI insights generation function
async function generateAIInsights(data) {
    const { totalIncome, totalExpense, netBalance, savingsRate, topExpenseCategories, transactionCount, periodDays } = data;

    let healthAssessment = "";
    let riskLevel = "low";
    let budgetScore = 70;

    // Health assessment
    if (netBalance < 0) {
        healthAssessment = "Your expenses exceed your income this period. This requires immediate attention to avoid financial stress.";
        riskLevel = "high";
        budgetScore = 25;
    } else if (savingsRate < 5) {
        healthAssessment = "You're maintaining a positive balance, but with very limited savings. Consider reducing discretionary spending.";
        riskLevel = "medium";
        budgetScore = 45;
    } else if (savingsRate < 15) {
        healthAssessment = "You have a decent financial position but there's room for improvement in your savings rate.";
        riskLevel = "medium";
        budgetScore = 65;
    } else if (savingsRate < 25) {
        healthAssessment = "Great job! You're maintaining healthy financial habits with good savings discipline.";
        riskLevel = "low";
        budgetScore = 85;
    } else {
        healthAssessment = "Excellent financial management! You're saving significantly and building strong financial security.";
        riskLevel = "low";
        budgetScore = 95;
    }

    // Recommendations
    const recommendations = [];

    if (savingsRate < 10) {
        recommendations.push("Aim to save at least 10-15% of your income for financial security");
    }

    if (topExpenseCategories.length > 0) {
        const topCategory = topExpenseCategories[0];
        if (topCategory.percentage > 40) {
            recommendations.push(`Your ${topCategory.name} spending (${topCategory.percentage.toFixed(1)}%) is quite high - consider optimization opportunities`);
        } else {
            recommendations.push(`Monitor your ${topCategory.name} category which represents your largest expense area`);
        }
    }

    if (transactionCount / periodDays > 5) {
        recommendations.push("You have frequent transactions - consider consolidating purchases to better track spending");
    } else if (transactionCount / periodDays < 1) {
        recommendations.push("Consider tracking more detailed transactions for better financial insights");
    }

    if (savingsRate > 20) {
        recommendations.push("With your strong savings rate, consider investing for long-term wealth building");
    }

    if (recommendations.length === 0) {
        recommendations.push("Continue your current financial habits and regularly review your spending patterns");
    }

    // Spending patterns analysis
    let spendingPatterns = "";
    if (topExpenseCategories.length >= 3) {
        const top3 = topExpenseCategories.slice(0, 3);
        spendingPatterns = `Your spending is concentrated in ${top3.map(cat => `${cat.name} (${cat.percentage.toFixed(1)}%)`).join(', ')}. `;

        if (top3[0].percentage > 50) {
            spendingPatterns += "Consider diversifying your expenses to reduce dependency on a single category.";
        } else {
            spendingPatterns += "This shows a balanced approach to different expense categories.";
        }
    } else {
        spendingPatterns = "Limited spending data available. Add more transactions for detailed pattern analysis.";
    }

    // Savings opportunities
    let savingsOpportunities = "";
    if (topExpenseCategories.length > 0) {
        const highestCategory = topExpenseCategories[0];
        if (highestCategory.percentage > 30) {
            savingsOpportunities = `Focus on your ${highestCategory.name} expenses - even a 10% reduction could save you ₹${(highestCategory.amount * 0.1).toFixed(2)} this period.`;
        } else {
            savingsOpportunities = "Look for subscription services or recurring expenses that you might not be using actively.";
        }
    } else {
        savingsOpportunities = "Track more detailed expenses to identify specific savings opportunities.";
    }

    // Goal suggestions
    let goalSuggestions = "";
    if (savingsRate < 10) {
        goalSuggestions = "Start with building an emergency fund covering 1 month of expenses, then gradually increase to 3-6 months.";
    } else if (savingsRate < 20) {
        goalSuggestions = "Work towards saving 20% of your income while building a solid emergency fund.";
    } else {
        goalSuggestions = "Consider setting investment goals for long-term wealth building, such as retirement or major purchases.";
    }

    return {
        healthAssessment,
        recommendations,
        spendingPatterns,
        savingsOpportunities,
        goalSuggestions,
        riskLevel,
        budgetScore
    };
}

// Get transaction statistics for analytics
router.get('/stats', authenticate, async (req, res) => {
    try {
        const { period = 'month' } = req.query;

        let dateFilter = {};
        const now = new Date();

        switch (period) {
            case 'week':
                dateFilter = {
                    date: { $gte: new Date(now.setDate(now.getDate() - 7)) }
                };
                break;
            case 'month':
                dateFilter = {
                    date: { $gte: new Date(now.getFullYear(), now.getMonth(), 1) }
                };
                break;
            case 'year':
                dateFilter = {
                    date: { $gte: new Date(now.getFullYear(), 0, 1) }
                };
                break;
        }

        const filter = { user: req.user.id, ...dateFilter };

        const [categoryStats, monthlyStats] = await Promise.all([
            // Category-wise statistics
            Transaction.aggregate([
                { $match: filter },
                {
                    $group: {
                        _id: { category: '$category', type: '$type' },
                        total: { $sum: '$amount' },
                        count: { $sum: 1 }
                    }
                },
                { $sort: { total: -1 } }
            ]),

            // Monthly statistics for the last 6 months
            Transaction.aggregate([
                {
                    $match: {
                        user: req.user.id,
                        date: { $gte: new Date(now.setMonth(now.getMonth() - 6)) }
                    }
                },
                {
                    $group: {
                        _id: {
                            month: { $month: '$date' },
                            year: { $year: '$date' },
                            type: '$type'
                        },
                        total: { $sum: '$amount' }
                    }
                },
                { $sort: { '_id.year': 1, '_id.month': 1 } }
            ])
        ]);

        res.json({
            success: true,
            data: {
                categoryStats,
                monthlyStats
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

// Get comprehensive analytics dashboard data
router.get('/dashboard', authenticate, async (req, res) => {
    try {
        const { period = '30' } = req.query;
        const periodDays = parseInt(period);

        // Calculate date range
        const now = new Date();
        const startDate = new Date(now.getTime() - (periodDays * 24 * 60 * 60 * 1000));

        // Fetch transactions for the period
        const transactions = await Transaction.find({
            user: req.user.id,
            date: { $gte: startDate, $lte: now }
        }).sort({ date: -1 });

        // Calculate basic metrics
        const totalIncome = transactions
            .filter(t => t.type === 'credit')
            .reduce((sum, t) => sum + t.amount, 0);

        const totalExpense = transactions
            .filter(t => t.type === 'debit')
            .reduce((sum, t) => sum + t.amount, 0);

        const netBalance = totalIncome - totalExpense;

        // Daily spending trends
        const dailySpending = {};
        const dailyIncome = {};

        transactions.forEach(transaction => {
            const date = transaction.date.toISOString().split('T')[0];

            if (transaction.type === 'debit') {
                dailySpending[date] = (dailySpending[date] || 0) + transaction.amount;
            } else {
                dailyIncome[date] = (dailyIncome[date] || 0) + transaction.amount;
            }
        });

        // Category breakdown
        const categoryBreakdown = {};
        transactions.forEach(transaction => {
            const category = transaction.category || 'Other';
            if (!categoryBreakdown[category]) {
                categoryBreakdown[category] = { income: 0, expense: 0, net: 0 };
            }

            if (transaction.type === 'credit') {
                categoryBreakdown[category].income += transaction.amount;
            } else {
                categoryBreakdown[category].expense += transaction.amount;
            }
            categoryBreakdown[category].net = categoryBreakdown[category].income - categoryBreakdown[category].expense;
        });

        // Recent transactions (last 10)
        const recentTransactions = transactions.slice(0, 10);

        // Calculate trends (compare with previous period)
        const previousStartDate = new Date(startDate.getTime() - (periodDays * 24 * 60 * 60 * 1000));
        const previousTransactions = await Transaction.find({
            user: req.user.id,
            date: { $gte: previousStartDate, $lt: startDate }
        });

        const previousTotalExpense = previousTransactions
            .filter(t => t.type === 'debit')
            .reduce((sum, t) => sum + t.amount, 0);

        const previousTotalIncome = previousTransactions
            .filter(t => t.type === 'credit')
            .reduce((sum, t) => sum + t.amount, 0);

        const expenseTrend = previousTotalExpense > 0 ?
            ((totalExpense - previousTotalExpense) / previousTotalExpense) * 100 : 0;
        const incomeTrend = previousTotalIncome > 0 ?
            ((totalIncome - previousTotalIncome) / previousTotalIncome) * 100 : 0;

        res.json({
            success: true,
            data: {
                summary: {
                    totalIncome,
                    totalExpense,
                    netBalance,
                    transactionCount: transactions.length,
                    avgDailySpending: totalExpense / periodDays,
                    avgDailyIncome: totalIncome / periodDays
                },
                trends: {
                    expenseTrend,
                    incomeTrend,
                    netTrend: incomeTrend - expenseTrend
                },
                categoryBreakdown,
                dailySpending,
                dailyIncome,
                recentTransactions,
                period: periodDays
            }
        });

    } catch (error) {
        console.error('Error generating dashboard analytics:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to generate dashboard analytics',
            error: error.message
        });
    }
});

// Get detailed spending patterns analysis
router.get('/patterns', authenticate, async (req, res) => {
    try {
        const { period = '90', category } = req.query;
        const periodDays = parseInt(period);

        // Calculate date range
        const now = new Date();
        const startDate = new Date(now.getTime() - (periodDays * 24 * 60 * 60 * 1000));

        let filter = {
            user: req.user.id,
            date: { $gte: startDate, $lte: now }
        };

        // Add category filter if specified
        if (category && category !== 'all') {
            filter.category = category;
        }

        // Aggregate spending patterns by day of week
        const dayOfWeekPattern = await Transaction.aggregate([
            { $match: filter },
            {
                $group: {
                    _id: { $dayOfWeek: '$date' },
                    totalAmount: { $sum: '$amount' },
                    count: { $sum: 1 },
                    avgAmount: { $avg: '$amount' }
                }
            },
            { $sort: { '_id': 1 } }
        ]);

        // Aggregate spending patterns by hour (if we have time data)
        const hourlyPattern = await Transaction.aggregate([
            { $match: filter },
            {
                $group: {
                    _id: { $hour: '$date' },
                    totalAmount: { $sum: '$amount' },
                    count: { $sum: 1 },
                    avgAmount: { $avg: '$amount' }
                }
            },
            { $sort: { '_id': 1 } }
        ]);

        // Monthly trends over the period
        const monthlyTrends = await Transaction.aggregate([
            { $match: filter },
            {
                $group: {
                    _id: {
                        year: { $year: '$date' },
                        month: { $month: '$date' },
                        type: '$type'
                    },
                    totalAmount: { $sum: '$amount' },
                    count: { $sum: 1 }
                }
            },
            { $sort: { '_id.year': 1, '_id.month': 1 } }
        ]);

        // Category patterns (top categories by frequency and amount)
        const categoryPatterns = await Transaction.aggregate([
            { $match: filter },
            {
                $group: {
                    _id: '$category',
                    totalAmount: { $sum: '$amount' },
                    count: { $sum: 1 },
                    avgAmount: { $avg: '$amount' },
                    minAmount: { $min: '$amount' },
                    maxAmount: { $max: '$amount' }
                }
            },
            { $sort: { totalAmount: -1 } }
        ]);

        // Format day of week data
        const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        const formattedDayPattern = dayOfWeekPattern.map(item => ({
            day: dayNames[item._id - 1],
            dayNumber: item._id,
            totalAmount: item.totalAmount,
            count: item.count,
            avgAmount: item.avgAmount
        }));

        res.json({
            success: true,
            data: {
                dayOfWeekPattern: formattedDayPattern,
                hourlyPattern,
                monthlyTrends,
                categoryPatterns,
                period: periodDays,
                category: category || 'all'
            }
        });

    } catch (error) {
        console.error('Error analyzing spending patterns:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to analyze spending patterns',
            error: error.message
        });
    }
});

module.exports = router;
