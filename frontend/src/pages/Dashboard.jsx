import React, { useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Plus, ArrowRight, TrendingUp, Activity } from 'lucide-react'
import Layout from '../components/Layout'
import TransactionSummary from '../components/TransactionSummary'
import { fetchTransactions } from '../store/slices/transactionSlice'

export default function Dashboard() {
    const dispatch = useDispatch()
    const user = useSelector((s) => s.auth.user)
    const { transactions, summary, loading } = useSelector(state => state.transactions)

    useEffect(() => {
        // Load recent transactions for dashboard
        dispatch(fetchTransactions({ limit: 5, page: 1 }))
    }, [dispatch])

    const formatAmount = (amount, type) => {
        const formattedAmount = new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD'
        }).format(amount);

        return type === 'credit' ? `+${formattedAmount}` : `-${formattedAmount}`;
    };

    return (
        <Layout>
            <div className="space-y-8">
                {/* Welcome Section */}
                <div className="text-center">
                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-3xl font-bold text-gray-900 dark:text-white"
                    >
                        Welcome back, {user?.name}!
                    </motion.h1>
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="text-gray-600 dark:text-gray-300 mt-2"
                    >
                        Here's your financial overview
                    </motion.p>
                </div>

                {/* Summary Cards */}
                <TransactionSummary summary={summary} loading={loading.transactions} />

                {/* Quick Actions */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6"
                >
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                        Quick Actions
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Link
                            to="/transactions"
                            className="flex items-center space-x-3 p-4 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                        >
                            <div className="p-2 bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400 rounded-lg">
                                <Plus size={20} />
                            </div>
                            <div>
                                <h3 className="font-medium text-gray-900 dark:text-white">Add Transaction</h3>
                                <p className="text-sm text-gray-500 dark:text-gray-400">Track new income or expense</p>
                            </div>
                        </Link>

                        <Link
                            to="/analytics"
                            className="flex items-center space-x-3 p-4 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                        >
                            <div className="p-2 bg-green-100 dark:bg-green-900 text-green-600 dark:text-green-400 rounded-lg">
                                <Activity size={20} />
                            </div>
                            <div>
                                <h3 className="font-medium text-gray-900 dark:text-white">View Analytics</h3>
                                <p className="text-sm text-gray-500 dark:text-gray-400">Visual spending insights</p>
                            </div>
                        </Link>
                    </div>
                </motion.div>

                {/* Recent Transactions */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6"
                >
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                            Recent Transactions
                        </h2>
                        <Link
                            to="/transactions"
                            className="flex items-center space-x-1 text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300"
                        >
                            <span className="text-sm">View all</span>
                            <ArrowRight size={16} />
                        </Link>
                    </div>

                    {loading.transactions ? (
                        <div className="flex items-center justify-center py-8">
                            <Activity className="animate-pulse text-gray-400 dark:text-gray-500" size={24} />
                            <span className="ml-2 text-gray-500 dark:text-gray-400">Loading transactions...</span>
                        </div>
                    ) : transactions.length > 0 ? (
                        <div className="space-y-3">
                            {transactions.slice(0, 5).map((transaction) => (
                                <div key={transaction._id} className="flex items-center justify-between p-3 border border-gray-100 dark:border-gray-600 rounded-lg">
                                    <div>
                                        <h3 className="font-medium text-gray-900 dark:text-white">
                                            {transaction.description}
                                        </h3>
                                        <p className="text-sm text-gray-500 dark:text-gray-400">
                                            {transaction.category} • {new Date(transaction.date).toLocaleDateString()}
                                        </p>
                                    </div>
                                    <div className={`font-semibold ${transaction.type === 'credit'
                                        ? 'text-green-600 dark:text-green-400'
                                        : 'text-red-600 dark:text-red-400'
                                        }`}>
                                        {formatAmount(transaction.amount, transaction.type)}
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-8">
                            <div className="text-gray-400 dark:text-gray-500 mb-2">
                                <Activity size={48} className="mx-auto" />
                            </div>
                            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No transactions yet</h3>
                            <p className="text-gray-500 dark:text-gray-400 mb-4">Start tracking your finances today!</p>
                            <Link
                                to="/transactions"
                                className="inline-flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md transition-colors"
                            >
                                <Plus size={16} />
                                <span>Add your first transaction</span>
                            </Link>
                        </div>
                    )}
                </motion.div>
            </div>
        </Layout>
    )
}
