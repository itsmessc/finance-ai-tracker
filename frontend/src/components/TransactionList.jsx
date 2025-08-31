import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import { Edit3, Trash2, MapPin, Tag, ArrowUpCircle, ArrowDownCircle, MoreHorizontal, Bot } from 'lucide-react';
import { deleteTransaction } from '../store/slices/transactionSlice';
import toast from 'react-hot-toast';
import { formatAmount, formatDate } from '../utils/formatters';
import { getCategoryColor } from '../utils/colors';
import Button from './ui/Button';

const TransactionList = ({ transactions, onEdit }) => {
    const dispatch = useDispatch();
    const { loading } = useSelector(state => state.transactions);
    const [showActions, setShowActions] = useState(null);

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this transaction?')) {
            try {
                await dispatch(deleteTransaction(id)).unwrap();
                toast.success('Transaction deleted successfully!');
            } catch (error) {
                toast.error(error);
            }
        }
    };

    const formatAmountWithSign = (amount, type) => {
        const formatted = formatAmount(amount);
        return type === 'credit' ? `+${formatted}` : `-${formatted}`;
    };

    if (transactions.length === 0) {
        return (
            <div className="text-center py-12">
                <div className="text-gray-400 dark:text-gray-500 mb-4">
                    <ArrowDownCircle size={48} className="mx-auto" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No transactions found</h3>
                <p className="text-gray-500 dark:text-gray-400">Start by adding your first transaction!</p>
            </div>
        );
    }

    return (
        <div className="space-y-2 sm:space-y-4">
            {transactions.map((transaction, index) => (
                <motion.div
                    key={transaction._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="bg-white dark:bg-gray-700 rounded-lg shadow-sm border border-gray-200 dark:border-gray-600 p-3 sm:p-4 hover:shadow-md transition-shadow"
                >
                    <div className="flex items-start justify-between">
                        <div className="flex items-start space-x-3 flex-1 min-w-0">
                            {/* Transaction Type Icon */}
                            <div className={`flex-shrink-0 p-1.5 sm:p-2 rounded-full ${transaction.type === 'credit'
                                ? 'bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-300'
                                : 'bg-red-100 text-red-600 dark:bg-red-900 dark:text-red-300'
                                }`}>
                                {transaction.type === 'credit' ? (
                                    <ArrowUpCircle size={16} className="sm:w-5 sm:h-5" />
                                ) : (
                                    <ArrowDownCircle size={16} className="sm:w-5 sm:h-5" />
                                )}
                            </div>

                            {/* Transaction Details */}
                            <div className="flex-1 min-w-0">
                                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between">
                                    <div className="flex-1 min-w-0 mb-2 sm:mb-0">
                                        <h3 className="text-sm sm:text-base font-medium text-gray-900 dark:text-white truncate">
                                            {transaction.description}
                                        </h3>
                                        <div className="mt-1 flex flex-wrap items-center gap-2">
                                            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(transaction.category)}`}>
                                                {transaction.category.charAt(0).toUpperCase() + transaction.category.slice(1)}
                                            </span>
                                            {transaction.parsedFrom && (
                                                <span className="inline-flex items-center space-x-1 text-xs text-purple-600 bg-purple-50 dark:text-purple-300 dark:bg-purple-900 px-2 py-1 rounded-full">
                                                    <Bot size={10} />
                                                    <span className="hidden sm:inline">AI Parsed</span>
                                                    <span className="sm:hidden">AI</span>
                                                </span>
                                            )}
                                        </div>
                                    </div>

                                    {/* Amount */}
                                    <div className="flex flex-row sm:flex-col items-start sm:items-end justify-between sm:justify-start sm:text-right">
                                        <div className={`text-base sm:text-lg font-semibold ${transaction.type === 'credit' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                                            }`}>
                                            {formatAmountWithSign(transaction.amount, transaction.type)}
                                        </div>
                                        <div className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                                            {formatDate(transaction.date)}
                                        </div>
                                    </div>
                                </div>

                                {/* Additional Info */}
                                <div className="mt-2 flex flex-wrap items-center gap-2 sm:gap-4 text-xs text-gray-500 dark:text-gray-400">
                                    {transaction.location && (
                                        <div className="flex items-center space-x-1">
                                            <MapPin size={12} />
                                            <span className="truncate max-w-[100px] sm:max-w-none">{transaction.location}</span>
                                        </div>
                                    )}

                                    {transaction.tags && transaction.tags.length > 0 && (
                                        <div className="flex items-center space-x-1">
                                            <Tag size={12} />
                                            <span className="truncate max-w-[100px] sm:max-w-none">{transaction.tags.join(', ')}</span>
                                        </div>
                                    )}
                                </div>

                                {transaction.parsedFrom && (
                                    <div className="mt-2 text-xs text-gray-500 dark:text-gray-400 italic truncate">
                                        Originally: "{transaction.parsedFrom}"
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="relative flex-shrink-0">
                            <button
                                onClick={() => setShowActions(showActions === transaction._id ? null : transaction._id)}
                                className="p-1.5 sm:p-2 text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 rounded-full hover:bg-gray-100 dark:hover:bg-gray-600"
                            >
                                <MoreHorizontal size={16} />
                            </button>

                            {showActions === transaction._id && (
                                <div className="absolute right-0 top-8 w-32 bg-white dark:bg-gray-800 rounded-md shadow-lg border border-gray-200 dark:border-gray-600 py-1 z-10">
                                    <button
                                        onClick={() => {
                                            onEdit(transaction);
                                            setShowActions(null);
                                        }}
                                        className="w-full flex items-center space-x-2 px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                                    >
                                        <Edit3 size={14} />
                                        <span>Edit</span>
                                    </button>
                                    <button
                                        onClick={() => {
                                            handleDelete(transaction._id);
                                            setShowActions(null);
                                        }}
                                        disabled={loading.deleting}
                                        className="w-full flex items-center space-x-2 px-3 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900 disabled:opacity-50"
                                    >
                                        <Trash2 size={14} />
                                        <span>Delete</span>
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </motion.div>
            ))}
        </div>
    );
};

export default TransactionList;
