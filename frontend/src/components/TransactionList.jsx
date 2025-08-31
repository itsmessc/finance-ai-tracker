import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import {
    Edit3,
    Trash2,
    MapPin,
    Tag,
    ArrowUpCircle,
    ArrowDownCircle,
    MoreHorizontal,
    Bot
} from 'lucide-react';
import { deleteTransaction } from '../store/slices/transactionSlice';
import toast from 'react-hot-toast';

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

    const formatAmount = (amount, type) => {
        const formattedAmount = new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD'
        }).format(amount);

        return type === 'credit' ? `+${formattedAmount}` : `-${formattedAmount}`;
    };

    const getCategoryColor = (category) => {
        const colors = {
            food: 'bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300',
            transport: 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300',
            entertainment: 'bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300',
            utilities: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300',
            healthcare: 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300',
            education: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900 dark:text-indigo-300',
            shopping: 'bg-pink-100 text-pink-700 dark:bg-pink-900 dark:text-pink-300',
            travel: 'bg-teal-100 text-teal-700 dark:bg-teal-900 dark:text-teal-300',
            investment: 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300',
            salary: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300',
            freelance: 'bg-cyan-100 text-cyan-700 dark:bg-cyan-900 dark:text-cyan-300',
            business: 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300',
            rent: 'bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300',
            insurance: 'bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-300',
            other: 'bg-neutral-100 text-neutral-700 dark:bg-neutral-700 dark:text-neutral-300'
        };
        return colors[category] || colors.other;
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
        <div className="space-y-4">
            {transactions.map((transaction, index) => (
                <motion.div
                    key={transaction._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="bg-white dark:bg-gray-700 rounded-lg shadow-sm border border-gray-200 dark:border-gray-600 p-4 hover:shadow-md transition-shadow"
                >
                    <div className="flex items-start justify-between">
                        <div className="flex items-start space-x-3 flex-1">
                            {/* Transaction Type Icon */}
                            <div className={`flex-shrink-0 p-2 rounded-full ${transaction.type === 'credit'
                                ? 'bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-300'
                                : 'bg-red-100 text-red-600 dark:bg-red-900 dark:text-red-300'
                                }`}>
                                {transaction.type === 'credit' ? (
                                    <ArrowUpCircle size={20} />
                                ) : (
                                    <ArrowDownCircle size={20} />
                                )}
                            </div>

                            {/* Transaction Details */}
                            <div className="flex-1 min-w-0">
                                <div className="flex items-start justify-between">
                                    <div>
                                        <h3 className="text-sm font-medium text-gray-900 dark:text-white truncate">
                                            {transaction.description}
                                        </h3>
                                        <div className="mt-1 flex items-center space-x-2">
                                            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(transaction.category)}`}>
                                                {transaction.category.charAt(0).toUpperCase() + transaction.category.slice(1)}
                                            </span>
                                            {transaction.parsedFrom && (
                                                <span className="inline-flex items-center space-x-1 text-xs text-purple-600 bg-purple-50 dark:text-purple-300 dark:bg-purple-900 px-2 py-1 rounded-full">
                                                    <Bot size={10} />
                                                    <span>AI Parsed</span>
                                                </span>
                                            )}
                                        </div>
                                    </div>

                                    {/* Amount */}
                                    <div className="text-right">
                                        <div className={`text-lg font-semibold ${transaction.type === 'credit' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                                            }`}>
                                            {formatAmount(transaction.amount, transaction.type)}
                                        </div>
                                        <div className="text-xs text-gray-500 dark:text-gray-400">
                                            {format(new Date(transaction.date), 'MMM dd, yyyy')}
                                        </div>
                                    </div>
                                </div>

                                {/* Additional Info */}
                                <div className="mt-2 flex flex-wrap items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
                                    {transaction.location && (
                                        <div className="flex items-center space-x-1">
                                            <MapPin size={12} />
                                            <span>{transaction.location}</span>
                                        </div>
                                    )}

                                    {transaction.tags && transaction.tags.length > 0 && (
                                        <div className="flex items-center space-x-1">
                                            <Tag size={12} />
                                            <span>{transaction.tags.join(', ')}</span>
                                        </div>
                                    )}
                                </div>

                                {transaction.parsedFrom && (
                                    <div className="mt-2 text-xs text-gray-500 dark:text-gray-400 italic">
                                        Originally: "{transaction.parsedFrom}"
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="relative">
                            <button
                                onClick={() => setShowActions(showActions === transaction._id ? null : transaction._id)}
                                className="p-1 text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 rounded-full hover:bg-gray-100 dark:hover:bg-gray-600"
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
