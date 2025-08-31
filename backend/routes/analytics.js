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
            savingsOpportunities = `Focus on your ${highestCategory.name} expenses - even a 10% reduction could save you $${(highestCategory.amount * 0.1).toFixed(2)} this period.`;
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

module.exports = router;
