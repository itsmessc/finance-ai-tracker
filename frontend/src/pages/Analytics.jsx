import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { motion } from 'framer-motion';
import {
    TrendingUp,
    TrendingDown,
    BarChart3,
    PieChart,
    Calendar,
    DollarSign,
    Target,
    Activity,
    Brain,
    Lightbulb,
    AlertCircle,
    TrendingUp as TrendIcon,
    Sparkles,
    RefreshCw
} from 'lucide-react';
import {
    PieChart as RechartsPieChart,
    Pie,
    Cell,
    BarChart as RechartsBarChart,
    LineChart as RechartsLineChart,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
    Bar,
    Line,
    Area,
    AreaChart
} from 'recharts';
import Layout from '../components/Layout';
import { fetchTransactions } from '../store/slices/transactionSlice';
import api from '../services/api';

export default function Analytics() {
    const dispatch = useDispatch();
    const { transactions, summary } = useSelector(state => state.transactions);
    const { token } = useSelector(state => state.auth);
    const [analyticsData, setAnalyticsData] = useState(null);
    const [aiInsights, setAiInsights] = useState(null);
    const [loading, setLoading] = useState(true);
    const [aiLoading, setAiLoading] = useState(false);
    const [selectedPeriod, setSelectedPeriod] = useState('30'); // days

    useEffect(() => {
        // Fetch all transactions for analytics
        dispatch(fetchTransactions({ limit: 1000, page: 1 }));
    }, [dispatch]);

    useEffect(() => {
        if (transactions.length > 0) {
            generateAnalytics();
        } else {
            setLoading(false);
        }
    }, [transactions, selectedPeriod]);

    useEffect(() => {
        if (analyticsData && token) {
            fetchAIInsights();
        }
    }, [analyticsData, selectedPeriod, token]);

    const generateAnalytics = () => {
        const now = new Date();
        const periodDays = parseInt(selectedPeriod);
        const periodStart = new Date(now.getTime() - (periodDays * 24 * 60 * 60 * 1000));

        const filteredTransactions = transactions.filter(t => {
            const transactionDate = new Date(t.date);
            return transactionDate >= periodStart && transactionDate <= now;
        });

        // Category analysis
        const categoryData = {};
        const dailyData = {};
        const monthlyData = {};

        filteredTransactions.forEach(transaction => {
            const category = transaction.category || 'Other';
            const date = new Date(transaction.date).toISOString().split('T')[0];
            const month = new Date(transaction.date).toISOString().substring(0, 7);
            const amount = parseFloat(transaction.amount) || 0;

            // Category breakdown
            if (!categoryData[category]) {
                categoryData[category] = { income: 0, expense: 0, count: 0 };
            }
            if (transaction.type === 'credit') {
                categoryData[category].income += amount;
            } else {
                categoryData[category].expense += amount;
            }
            categoryData[category].count++;

            // Daily trends
            if (!dailyData[date]) {
                dailyData[date] = { date, income: 0, expense: 0, net: 0 };
            }
            if (transaction.type === 'credit') {
                dailyData[date].income += amount;
            } else {
                dailyData[date].expense += amount;
            }
            dailyData[date].net = dailyData[date].income - dailyData[date].expense;

            // Monthly trends
            if (!monthlyData[month]) {
                monthlyData[month] = { month, income: 0, expense: 0, net: 0 };
            }
            if (transaction.type === 'credit') {
                monthlyData[month].income += amount;
            } else {
                monthlyData[month].expense += amount;
            }
            monthlyData[month].net = monthlyData[month].income - monthlyData[month].expense;
        });

        // Calculate safe values with fallbacks
        const totalIncome = summary?.totalIncome || 0;
        const totalExpense = summary?.totalExpense || 0;
        const netBalance = totalIncome - totalExpense;

        // Top expense categories with safe calculations
        const topExpenseCategories = Object.entries(categoryData)
            .map(([category, data]) => ({
                name: category,
                value: data.expense,
                percentage: totalExpense > 0 ? ((data.expense / totalExpense) * 100) : 0
            }))
            .filter(item => item.value > 0)
            .sort((a, b) => b.value - a.value)
            .slice(0, 6);

        // Top income categories
        const topIncomeCategories = Object.entries(categoryData)
            .map(([category, data]) => ({
                name: category,
                value: data.income,
                percentage: totalIncome > 0 ? ((data.income / totalIncome) * 100) : 0
            }))
            .filter(item => item.value > 0)
            .sort((a, b) => b.value - a.value)
            .slice(0, 6);

        // Calculate trends safely
        const dailyEntries = Object.values(dailyData).sort((a, b) => new Date(a.date) - new Date(b.date));
        const lastWeekData = dailyEntries.slice(-7);
        const previousWeekData = dailyEntries.slice(-14, -7);

        const lastWeekAvg = lastWeekData.length > 0 ?
            lastWeekData.reduce((sum, data) => sum + data.expense, 0) / lastWeekData.length : 0;
        const previousWeekAvg = previousWeekData.length > 0 ?
            previousWeekData.reduce((sum, data) => sum + data.expense, 0) / previousWeekData.length : 0;

        const spendingTrend = lastWeekAvg - previousWeekAvg;
        const avgDailySpending = periodDays > 0 ? totalExpense / periodDays : 0;

        setAnalyticsData({
            totalIncome,
            totalExpense,
            netBalance,
            spendingTrend,
            avgDailySpending,
            transactionCount: filteredTransactions.length,
            topExpenseCategories,
            topIncomeCategories,
            dailyData: dailyEntries.slice(-14), // Last 14 days
            monthlyData: Object.values(monthlyData).sort((a, b) => a.month.localeCompare(b.month))
        });

        setLoading(false);
    };

    const fetchAIInsights = async () => {
        if (!token || !analyticsData) return;

        setAiLoading(true);
        try {
            const response = await api.get(`/analytics/insights?period=${selectedPeriod}`);
            setAiInsights(response.data.data.aiInsights);
        } catch (error) {
            console.error('Error fetching AI insights:', error);
            // Generate fallback insights
            generateFallbackInsights();
        } finally {
            setAiLoading(false);
        }
    };

    const generateFallbackInsights = () => {
        if (!analyticsData) return;

        const { totalIncome, totalExpense, netBalance, topExpenseCategories } = analyticsData;
        const savingsRate = totalIncome > 0 ? ((netBalance / totalIncome) * 100) : 0;

        let healthAssessment = "Your financial data shows ";
        let riskLevel = "low";
        let budgetScore = 70;

        if (netBalance < 0) {
            healthAssessment += "you're spending more than you earn this period. This requires immediate attention.";
            riskLevel = "high";
            budgetScore = 30;
        } else if (savingsRate < 10) {
            healthAssessment += "you're maintaining a positive balance but with limited savings. Consider increasing your savings rate.";
            riskLevel = "medium";
            budgetScore = 50;
        } else {
            healthAssessment += "a healthy financial position with good savings habits. Keep up the great work!";
            riskLevel = "low";
            budgetScore = 80;
        }

        const topExpense = topExpenseCategories[0];
        const recommendations = [
            `Focus on your ${topExpense?.name || 'largest expense'} category which accounts for ${topExpense?.percentage?.toFixed(1) || 'a significant'}% of your spending.`,
            savingsRate < 20 ? "Try to save at least 20% of your income for long-term financial security." : "Continue your excellent savings habits and consider investing for growth.",
            "Track your daily expenses to identify small leaks that add up over time."
        ];

        setAiInsights({
            healthAssessment,
            recommendations,
            spendingPatterns: `Your spending is primarily focused on ${topExpenseCategories.slice(0, 3).map(cat => cat.name).join(', ')}. ${savingsRate > 15 ? 'You show good spending discipline.' : 'Consider reviewing discretionary expenses.'}`,
            savingsOpportunities: topExpenseCategories.length > 0 ? `Look into optimizing your ${topExpenseCategories[0].name} expenses, which could free up significant funds.` : "Review all expense categories for optimization opportunities.",
            goalSuggestions: savingsRate > 20 ? "Consider setting up investment goals for wealth building." : "Focus on building an emergency fund of 3-6 months expenses first.",
            riskLevel,
            budgetScore,
            generatedAt: new Date().toISOString(),
            timeframe: selectedPeriod,
            fallback: true
        });
    };

    const refreshAIInsights = async () => {
        if (analyticsData) {
            await fetchAIInsights();
        }
    };

    const formatCurrency = (amount) => {
        const numAmount = parseFloat(amount) || 0;
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD'
        }).format(numAmount);
    };

    const formatPercentage = (value) => {
        const numValue = parseFloat(value) || 0;
        return `${numValue.toFixed(1)}%`;
    };

    // Custom Tooltip Component
    const CustomTooltip = ({ active, payload, label }) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg shadow-lg p-3">
                    <p className="text-sm font-medium text-gray-900 dark:text-white">{label}</p>
                    {payload.map((entry, index) => (
                        <p key={index} className="text-sm" style={{ color: entry.color }}>
                            {entry.name}: {formatCurrency(entry.value)}
                        </p>
                    ))}
                </div>
            );
        }
        return null;
    };

    // Pie Chart Tooltip
    const PieTooltip = ({ active, payload }) => {
        if (active && payload && payload.length) {
            const data = payload[0];
            return (
                <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg shadow-lg p-3">
                    <p className="text-sm font-medium text-gray-900 dark:text-white">{data.payload.name}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                        {formatCurrency(data.value)} ({formatPercentage(data.payload.percentage)})
                    </p>
                </div>
            );
        }
        return null;
    };

    // AI Insights Component
    const AIInsightsPanel = ({ insights }) => {
        if (!insights) return null;

        const getRiskColor = (risk) => {
            switch (risk) {
                case 'low': return 'text-green-600 bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-700';
                case 'medium': return 'text-yellow-600 bg-yellow-50 border-yellow-200 dark:bg-yellow-900/20 dark:border-yellow-700';
                case 'high': return 'text-red-600 bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-700';
                default: return 'text-gray-600 bg-gray-50 border-gray-200 dark:bg-gray-900/20 dark:border-gray-700';
            }
        };

        return (
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 rounded-xl p-6 border border-purple-200 dark:border-purple-700"
            >
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center">
                        <div className="flex items-center justify-center w-10 h-10 bg-purple-100 dark:bg-purple-800 rounded-lg mr-3">
                            <Brain className="h-5 w-5 text-purple-600 dark:text-purple-300" />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white">AI Financial Insights</h3>
                        {insights.fallback && (
                            <span className="ml-2 px-2 py-1 text-xs bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded">Offline Mode</span>
                        )}
                    </div>
                    <button
                        onClick={refreshAIInsights}
                        disabled={aiLoading}
                        className="flex items-center space-x-1 px-3 py-1 text-sm bg-purple-100 dark:bg-purple-800 text-purple-700 dark:text-purple-300 rounded-lg hover:bg-purple-200 dark:hover:bg-purple-700 transition-colors"
                    >
                        <RefreshCw className={`h-4 w-4 ${aiLoading ? 'animate-spin' : ''}`} />
                        <span>Refresh</span>
                    </button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Health Assessment */}
                    <div className="space-y-4">
                        <div className="flex items-center space-x-2">
                            <Target className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                            <h4 className="font-semibold text-gray-900 dark:text-white">Financial Health</h4>
                        </div>
                        <p className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed">
                            {insights.healthAssessment}
                        </p>

                        <div className="flex items-center space-x-4">
                            <div className={`px-3 py-1 rounded-full text-xs font-medium border ${getRiskColor(insights.riskLevel)}`}>
                                Risk Level: {insights.riskLevel?.toUpperCase()}
                            </div>
                            <div className="flex items-center space-x-2">
                                <span className="text-sm text-gray-600 dark:text-gray-400">Budget Score:</span>
                                <div className="flex items-center">
                                    <div className="w-16 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-gradient-to-r from-red-400 via-yellow-400 to-green-400 transition-all"
                                            style={{ width: `${insights.budgetScore}%` }}
                                        />
                                    </div>
                                    <span className="ml-2 text-sm font-medium text-gray-900 dark:text-white">
                                        {insights.budgetScore}/100
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Recommendations */}
                    <div className="space-y-4">
                        <div className="flex items-center space-x-2">
                            <Lightbulb className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
                            <h4 className="font-semibold text-gray-900 dark:text-white">Top Recommendations</h4>
                        </div>
                        <ul className="space-y-2">
                            {insights.recommendations?.slice(0, 3).map((rec, index) => (
                                <li key={index} className="flex items-start space-x-2">
                                    <span className="flex-shrink-0 w-5 h-5 bg-blue-100 dark:bg-blue-800 text-blue-600 dark:text-blue-300 rounded-full flex items-center justify-center text-xs font-medium mt-0.5">
                                        {index + 1}
                                    </span>
                                    <span className="text-sm text-gray-700 dark:text-gray-300">{rec}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>

                <div className="mt-6 pt-4 border-t border-purple-200 dark:border-purple-700">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        <div>
                            <h5 className="font-medium text-gray-900 dark:text-white mb-2 flex items-center">
                                <TrendIcon className="h-4 w-4 mr-1" />
                                Spending Patterns
                            </h5>
                            <p className="text-gray-600 dark:text-gray-400">{insights.spendingPatterns}</p>
                        </div>
                        <div>
                            <h5 className="font-medium text-gray-900 dark:text-white mb-2 flex items-center">
                                <Sparkles className="h-4 w-4 mr-1" />
                                Savings Opportunities
                            </h5>
                            <p className="text-gray-600 dark:text-gray-400">{insights.savingsOpportunities}</p>
                        </div>
                    </div>
                    {insights.goalSuggestions && (
                        <div className="mt-4">
                            <h5 className="font-medium text-gray-900 dark:text-white mb-2 flex items-center">
                                <Target className="h-4 w-4 mr-1" />
                                Goal Suggestions
                            </h5>
                            <p className="text-gray-600 dark:text-gray-400 text-sm">{insights.goalSuggestions}</p>
                        </div>
                    )}
                </div>
            </motion.div>
        );
    };

    if (loading) {
        return (
            <Layout>
                <div className="flex items-center justify-center min-h-64">
                    <div className="flex items-center space-x-2">
                        <Activity className="animate-pulse text-blue-500" size={24} />
                        <span className="text-gray-600 dark:text-gray-300">Generating analytics...</span>
                    </div>
                </div>
            </Layout>
        );
    }

    if (!analyticsData || analyticsData.transactionCount === 0) {
        return (
            <Layout>
                <div className="text-center py-12">
                    <div className="text-gray-400 dark:text-gray-500 mb-4">
                        <BarChart3 size={48} className="mx-auto" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No Data Available</h3>
                    <p className="text-gray-500 dark:text-gray-400">Start by adding some transactions to see analytics!</p>
                </div>
            </Layout>
        );
    }

    const expenseColors = ['#EF4444', '#F97316', '#F59E0B', '#EAB308', '#84CC16', '#22C55E'];
    const incomeColors = ['#10B981', '#059669', '#047857', '#065F46', '#064E3B', '#022C22'];

    return (
        <Layout>
            <div className="space-y-8">
                {/* Header */}
                <div className="text-center">
                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-3xl font-bold text-gray-900 dark:text-white"
                    >
                        Financial Analytics
                    </motion.h1>
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="text-gray-600 dark:text-gray-300 mt-2"
                    >
                        Visual insights into your spending and income patterns
                    </motion.p>
                </div>

                {/* Period Selector */}
                <div className="flex justify-center">
                    <div className="inline-flex rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-1">
                        {[
                            { value: '7', label: '7 Days' },
                            { value: '30', label: '30 Days' },
                            { value: '90', label: '90 Days' },
                        ].map((period) => (
                            <button
                                key={period.value}
                                onClick={() => setSelectedPeriod(period.value)}
                                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${selectedPeriod === period.value
                                        ? 'bg-blue-600 text-white'
                                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                                    }`}
                            >
                                {period.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* AI Insights Section */}
                {aiLoading ? (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6"
                    >
                        <div className="flex items-center justify-center space-x-2">
                            <Brain className="animate-pulse text-purple-500" size={24} />
                            <span className="text-gray-600 dark:text-gray-300">AI is analyzing your financial data...</span>
                        </div>
                    </motion.div>
                ) : aiInsights && (
                    <AIInsightsPanel insights={aiInsights} />
                )}

                {/* Key Metrics */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6"
                    >
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Income</p>
                                <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                                    {formatCurrency(analyticsData.totalIncome)}
                                </p>
                            </div>
                            <DollarSign className="h-8 w-8 text-green-600" />
                        </div>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.1 }}
                        className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6"
                    >
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Expenses</p>
                                <p className="text-2xl font-bold text-red-600 dark:text-red-400">
                                    {formatCurrency(analyticsData.totalExpense)}
                                </p>
                            </div>
                            <TrendingDown className="h-8 w-8 text-red-600" />
                        </div>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.2 }}
                        className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6"
                    >
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Net Balance</p>
                                <p className={`text-2xl font-bold ${analyticsData.netBalance >= 0
                                        ? 'text-green-600 dark:text-green-400'
                                        : 'text-red-600 dark:text-red-400'
                                    }`}>
                                    {formatCurrency(analyticsData.netBalance)}
                                </p>
                            </div>
                            <Target className="h-8 w-8 text-purple-600" />
                        </div>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.3 }}
                        className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6"
                    >
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Avg Daily Spending</p>
                                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                                    {formatCurrency(analyticsData.avgDailySpending)}
                                </p>
                            </div>
                            <Activity className="h-8 w-8 text-blue-600" />
                        </div>
                    </motion.div>
                </div>

                {/* Charts Row 1 - Pie Charts */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Expense Categories Pie Chart */}
                    {analyticsData.topExpenseCategories.length > 0 && (
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6"
                        >
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Expense Breakdown</h3>
                            <ResponsiveContainer width="100%" height={300}>
                                <RechartsPieChart>
                                    <Pie
                                        data={analyticsData.topExpenseCategories}
                                        cx="50%"
                                        cy="50%"
                                        outerRadius={80}
                                        innerRadius={40}
                                        paddingAngle={5}
                                        dataKey="value"
                                    >
                                        {analyticsData.topExpenseCategories.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={expenseColors[index % expenseColors.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip content={<PieTooltip />} />
                                    <Legend />
                                </RechartsPieChart>
                            </ResponsiveContainer>
                        </motion.div>
                    )}

                    {/* Income Categories Pie Chart */}
                    {analyticsData.topIncomeCategories.length > 0 && (
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6"
                        >
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Income Sources</h3>
                            <ResponsiveContainer width="100%" height={300}>
                                <RechartsPieChart>
                                    <Pie
                                        data={analyticsData.topIncomeCategories}
                                        cx="50%"
                                        cy="50%"
                                        outerRadius={80}
                                        innerRadius={40}
                                        paddingAngle={5}
                                        dataKey="value"
                                    >
                                        {analyticsData.topIncomeCategories.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={incomeColors[index % incomeColors.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip content={<PieTooltip />} />
                                    <Legend />
                                </RechartsPieChart>
                            </ResponsiveContainer>
                        </motion.div>
                    )}
                </div>

                {/* Charts Row 2 - Bar Charts */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Daily Spending Bar Chart */}
                    {analyticsData.dailyData.length > 0 && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6"
                        >
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Daily Spending Trend</h3>
                            <ResponsiveContainer width="100%" height={300}>
                                <RechartsBarChart data={analyticsData.dailyData}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />
                                    <XAxis
                                        dataKey="date"
                                        tick={{ fill: '#6B7280', fontSize: 12 }}
                                        tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                    />
                                    <YAxis
                                        tick={{ fill: '#6B7280', fontSize: 12 }}
                                        tickFormatter={(value) => `$${value.toFixed(0)}`}
                                    />
                                    <Tooltip content={<CustomTooltip />} />
                                    <Bar dataKey="expense" fill="#EF4444" radius={[4, 4, 0, 0]} />
                                </RechartsBarChart>
                            </ResponsiveContainer>
                        </motion.div>
                    )}

                    {/* Daily Income Bar Chart */}
                    {analyticsData.dailyData.length > 0 && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6"
                        >
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Daily Income Trend</h3>
                            <ResponsiveContainer width="100%" height={300}>
                                <RechartsBarChart data={analyticsData.dailyData}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />
                                    <XAxis
                                        dataKey="date"
                                        tick={{ fill: '#6B7280', fontSize: 12 }}
                                        tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                    />
                                    <YAxis
                                        tick={{ fill: '#6B7280', fontSize: 12 }}
                                        tickFormatter={(value) => `$${value.toFixed(0)}`}
                                    />
                                    <Tooltip content={<CustomTooltip />} />
                                    <Bar dataKey="income" fill="#10B981" radius={[4, 4, 0, 0]} />
                                </RechartsBarChart>
                            </ResponsiveContainer>
                        </motion.div>
                    )}
                </div>

                {/* Area Chart - Monthly Trends */}
                {analyticsData.monthlyData.length > 1 && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6"
                    >
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Monthly Income vs Expenses Trend</h3>
                        <ResponsiveContainer width="100%" height={400}>
                            <AreaChart
                                data={analyticsData.monthlyData}
                                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                            >
                                <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />
                                <XAxis
                                    dataKey="month"
                                    tick={{ fill: '#6B7280', fontSize: 12 }}
                                    tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short', year: '2-digit' })}
                                />
                                <YAxis
                                    tick={{ fill: '#6B7280', fontSize: 12 }}
                                    tickFormatter={(value) => `$${value.toFixed(0)}`}
                                />
                                <Tooltip content={<CustomTooltip />} />
                                <Legend />
                                <Area
                                    type="monotone"
                                    dataKey="income"
                                    stackId="1"
                                    stroke="#10B981"
                                    fill="#10B981"
                                    fillOpacity={0.6}
                                    name="Income"
                                />
                                <Area
                                    type="monotone"
                                    dataKey="expense"
                                    stackId="2"
                                    stroke="#EF4444"
                                    fill="#EF4444"
                                    fillOpacity={0.6}
                                    name="Expenses"
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </motion.div>
                )}

                {/* Combined Line Chart for Net Balance */}
                {analyticsData.monthlyData.length > 1 && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6"
                    >
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Net Balance Trend</h3>
                        <ResponsiveContainer width="100%" height={300}>
                            <RechartsLineChart
                                data={analyticsData.monthlyData}
                                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                            >
                                <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />
                                <XAxis
                                    dataKey="month"
                                    tick={{ fill: '#6B7280', fontSize: 12 }}
                                    tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short', year: '2-digit' })}
                                />
                                <YAxis
                                    tick={{ fill: '#6B7280', fontSize: 12 }}
                                    tickFormatter={(value) => `$${value.toFixed(0)}`}
                                />
                                <Tooltip content={<CustomTooltip />} />
                                <Legend />
                                <Line
                                    type="monotone"
                                    dataKey="net"
                                    stroke="#8B5CF6"
                                    strokeWidth={3}
                                    dot={{ fill: '#8B5CF6', strokeWidth: 2, r: 4 }}
                                    name="Net Balance"
                                />
                            </RechartsLineChart>
                        </ResponsiveContainer>
                    </motion.div>
                )}

                {/* Summary Insights */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg p-6 text-white"
                >
                    <h3 className="text-xl font-semibold mb-4">Financial Summary</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="text-center">
                            <div className="text-2xl font-bold">
                                {analyticsData.transactionCount}
                            </div>
                            <div className="text-blue-100">Total Transactions</div>
                        </div>
                        <div className="text-center">
                            <div className="text-2xl font-bold">
                                {analyticsData.topExpenseCategories.length}
                            </div>
                            <div className="text-blue-100">Expense Categories</div>
                        </div>
                        <div className="text-center">
                            <div className={`text-2xl font-bold ${analyticsData.spendingTrend > 0 ? 'text-red-200' : 'text-green-200'
                                }`}>
                                {analyticsData.spendingTrend > 0 ? '↗️' : '↘️'} {formatCurrency(Math.abs(analyticsData.spendingTrend))}
                            </div>
                            <div className="text-blue-100">Weekly Trend</div>
                        </div>
                    </div>
                </motion.div>
            </div>
        </Layout>
    );
}
