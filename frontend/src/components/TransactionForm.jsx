import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import { Bot, DollarSign, Calendar, Tag, MapPin, Loader2, X, Check } from 'lucide-react';
import { parseTransaction, createTransaction, clearParsedTransaction, clearError } from '../store/slices/transactionSlice';
import toast from 'react-hot-toast';

const CATEGORIES = [
    'food', 'transport', 'entertainment', 'utilities', 'healthcare',
    'education', 'shopping', 'travel', 'investment', 'salary',
    'freelance', 'business', 'rent', 'insurance', 'other'
];

const TransactionForm = ({ isOpen, onClose, transaction = null }) => {
    const dispatch = useDispatch();
    const { parsedTransaction, loading, error } = useSelector(state => state.transactions);

    const [useAI, setUseAI] = useState(false);
    const [naturalText, setNaturalText] = useState('');
    const [formData, setFormData] = useState({
        amount: '',
        type: 'debit',
        category: 'other',
        description: '',
        tags: [],
        location: '',
        date: new Date().toISOString().split('T')[0]
    });

    useEffect(() => {
        if (transaction) {
            setFormData({
                amount: transaction.amount || '',
                type: transaction.type || 'debit',
                category: transaction.category || 'other',
                description: transaction.description || '',
                tags: transaction.tags || [],
                location: transaction.location || '',
                date: transaction.date ? new Date(transaction.date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0]
            });
        }
    }, [transaction]);

    useEffect(() => {
        if (parsedTransaction) {
            setFormData(prev => ({
                ...prev,
                amount: parsedTransaction.amount || '',
                type: parsedTransaction.type || 'debit',
                category: parsedTransaction.category || 'other',
                description: parsedTransaction.description || '',
                tags: parsedTransaction.tags || [],
                location: parsedTransaction.location || ''
            }));
            setUseAI(false);
            setNaturalText('');
        }
    }, [parsedTransaction]);

    useEffect(() => {
        if (error) {
            toast.error(error);
            dispatch(clearError());
        }
    }, [error, dispatch]);

    const handleParseTransaction = async () => {
        if (!naturalText.trim()) {
            toast.error('Please enter transaction text to parse');
            return;
        }

        try {
            await dispatch(parseTransaction(naturalText.trim())).unwrap();
            toast.success('Transaction parsed successfully!');
        } catch (error) {
            toast.error(error);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.amount || !formData.description) {
            toast.error('Amount and description are required');
            return;
        }

        try {
            const transactionData = {
                ...formData,
                amount: parseFloat(formData.amount),
                parsedFrom: parsedTransaction?.parsedFrom || null
            };

            await dispatch(createTransaction(transactionData)).unwrap();
            toast.success('Transaction created successfully!');
            handleClose();
        } catch (error) {
            toast.error(error);
        }
    };

    const handleClose = () => {
        setFormData({
            amount: '',
            type: 'debit',
            category: 'other',
            description: '',
            tags: [],
            location: '',
            date: new Date().toISOString().split('T')[0]
        });
        setNaturalText('');
        setUseAI(false);
        dispatch(clearParsedTransaction());
        dispatch(clearError());
        onClose();
    };

    const handleTagAdd = (tag) => {
        if (tag && !formData.tags.includes(tag)) {
            setFormData(prev => ({
                ...prev,
                tags: [...prev.tags, tag]
            }));
        }
    };

    const handleTagRemove = (tagToRemove) => {
        setFormData(prev => ({
            ...prev,
            tags: prev.tags.filter(tag => tag !== tagToRemove)
        }));
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md mx-4 max-h-[90vh] overflow-y-auto"
            >
                <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                        {transaction ? 'Edit Transaction' : 'Add Transaction'}
                    </h2>
                    <button
                        onClick={handleClose}
                        className="text-gray-400 hover:text-gray-600 dark:text-gray-300 dark:hover:text-gray-100"
                    >
                        <X size={24} />
                    </button>
                </div>

                <div className="p-6">
                    {/* AI Toggle */}
                    <div className="mb-6">
                        <div className="flex items-center justify-between">
                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Input Method</span>
                            <div className="flex items-center space-x-2">
                                <button
                                    type="button"
                                    onClick={() => setUseAI(false)}
                                    className={`px-3 py-1 rounded-md text-sm ${!useAI
                                            ? 'bg-blue-100 text-blue-700 border border-blue-300 dark:bg-blue-900 dark:text-blue-300 dark:border-blue-600'
                                            : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300'
                                        }`}
                                >
                                    Manual
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setUseAI(true)}
                                    className={`px-3 py-1 rounded-md text-sm flex items-center space-x-1 ${useAI
                                            ? 'bg-purple-100 text-purple-700 border border-purple-300 dark:bg-purple-900 dark:text-purple-300 dark:border-purple-600'
                                            : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300'
                                        }`}
                                >
                                    <Bot size={14} />
                                    <span>AI Parse</span>
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* AI Input */}
                    {useAI && (
                        <div className="mb-6">
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Describe your transaction
                            </label>
                            <div className="space-y-3">
                                <textarea
                                    value={naturalText}
                                    onChange={(e) => setNaturalText(e.target.value)}
                                    placeholder="e.g., 'Spent $25 on lunch at McDonald's' or 'Received $3000 salary'"
                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                                    rows="3"
                                />
                                <button
                                    type="button"
                                    onClick={handleParseTransaction}
                                    disabled={loading.parsing || !naturalText.trim()}
                                    className="w-full flex items-center justify-center space-x-2 bg-purple-600 text-white py-2 px-4 rounded-md hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {loading.parsing ? (
                                        <Loader2 className="animate-spin" size={16} />
                                    ) : (
                                        <Bot size={16} />
                                    )}
                                    <span>{loading.parsing ? 'Parsing...' : 'Parse with AI'}</span>
                                </button>
                            </div>

                            {parsedTransaction && (
                                <div className="mt-3 p-3 bg-green-50 dark:bg-green-900 border border-green-200 dark:border-green-700 rounded-md">
                                    <div className="flex items-center space-x-2 text-green-700 dark:text-green-300 text-sm">
                                        <Check size={16} />
                                        <span>Transaction parsed successfully! Review and submit below.</span>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Manual Form */}
                    <form onSubmit={handleSubmit} className="space-y-4">
                        {/* Amount */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Amount *
                            </label>
                            <div className="relative">
                                <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500" size={16} />
                                <input
                                    type="number"
                                    step="0.01"
                                    value={formData.amount}
                                    onChange={(e) => setFormData(prev => ({ ...prev, amount: e.target.value }))}
                                    className="w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                                    placeholder="0.00"
                                    required
                                />
                            </div>
                        </div>

                        {/* Type */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Type *
                            </label>
                            <div className="grid grid-cols-2 gap-2">
                                <button
                                    type="button"
                                    onClick={() => setFormData(prev => ({ ...prev, type: 'debit' }))}
                                    className={`p-2 rounded-md text-sm font-medium ${formData.type === 'debit'
                                            ? 'bg-red-100 text-red-700 border border-red-300 dark:bg-red-900 dark:text-red-300 dark:border-red-600'
                                            : 'bg-gray-100 text-gray-600 border border-gray-300 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600'
                                        }`}
                                >
                                    Expense (Debit)
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setFormData(prev => ({ ...prev, type: 'credit' }))}
                                    className={`p-2 rounded-md text-sm font-medium ${formData.type === 'credit'
                                            ? 'bg-green-100 text-green-700 border border-green-300 dark:bg-green-900 dark:text-green-300 dark:border-green-600'
                                            : 'bg-gray-100 text-gray-600 border border-gray-300 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600'
                                        }`}
                                >
                                    Income (Credit)
                                </button>
                            </div>
                        </div>

                        {/* Category */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Category *
                            </label>
                            <select
                                value={formData.category}
                                onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                required
                            >
                                {CATEGORIES.map(cat => (
                                    <option key={cat} value={cat}>
                                        {cat.charAt(0).toUpperCase() + cat.slice(1)}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Description */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Description *
                            </label>
                            <input
                                type="text"
                                value={formData.description}
                                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                                placeholder="Brief description of the transaction"
                                required
                            />
                        </div>

                        {/* Date */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Date
                            </label>
                            <div className="relative">
                                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500" size={16} />
                                <input
                                    type="date"
                                    value={formData.date}
                                    onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
                                    className="w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                />
                            </div>
                        </div>

                        {/* Location */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Location
                            </label>
                            <div className="relative">
                                <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500" size={16} />
                                <input
                                    type="text"
                                    value={formData.location}
                                    onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                                    className="w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                                    placeholder="Where did this transaction occur?"
                                />
                            </div>
                        </div>

                        {/* Tags */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Tags
                            </label>
                            <div className="space-y-2">
                                <div className="flex flex-wrap gap-2">
                                    {formData.tags.map((tag, index) => (
                                        <span
                                            key={index}
                                            className="inline-flex items-center space-x-1 bg-blue-100 text-blue-700 px-2 py-1 rounded-md text-sm dark:bg-blue-900 dark:text-blue-300"
                                        >
                                            <Tag size={12} />
                                            <span>{tag}</span>
                                            <button
                                                type="button"
                                                onClick={() => handleTagRemove(tag)}
                                                className="text-blue-500 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                                            >
                                                <X size={12} />
                                            </button>
                                        </span>
                                    ))}
                                </div>
                                <input
                                    type="text"
                                    placeholder="Add tags (press Enter)"
                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                                    onKeyPress={(e) => {
                                        if (e.key === 'Enter') {
                                            e.preventDefault();
                                            handleTagAdd(e.target.value.trim());
                                            e.target.value = '';
                                        }
                                    }}
                                />
                            </div>
                        </div>

                        {/* Submit Buttons */}
                        <div className="flex space-x-3 pt-4">
                            <button
                                type="button"
                                onClick={handleClose}
                                className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 bg-white dark:bg-gray-800"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={loading.creating}
                                className="flex-1 flex items-center justify-center space-x-2 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {loading.creating ? (
                                    <Loader2 className="animate-spin" size={16} />
                                ) : null}
                                <span>{loading.creating ? 'Creating...' : (transaction ? 'Update' : 'Create')}</span>
                            </button>
                        </div>
                    </form>
                </div>
            </motion.div>
        </div>
    );
};

export default TransactionForm;
