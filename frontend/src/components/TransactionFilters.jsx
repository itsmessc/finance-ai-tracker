import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import {
    Search,
    Filter,
    Calendar,
    DollarSign,
    Tag as TagIcon,
    X,
    RotateCcw
} from 'lucide-react';
import { updateFilters, resetFilters } from '../store/slices/transactionSlice';

const CATEGORIES = [
    { value: 'all', label: 'All Categories' },
    { value: 'food', label: 'Food' },
    { value: 'transport', label: 'Transport' },
    { value: 'entertainment', label: 'Entertainment' },
    { value: 'utilities', label: 'Utilities' },
    { value: 'healthcare', label: 'Healthcare' },
    { value: 'education', label: 'Education' },
    { value: 'shopping', label: 'Shopping' },
    { value: 'travel', label: 'Travel' },
    { value: 'investment', label: 'Investment' },
    { value: 'salary', label: 'Salary' },
    { value: 'freelance', label: 'Freelance' },
    { value: 'business', label: 'Business' },
    { value: 'rent', label: 'Rent' },
    { value: 'insurance', label: 'Insurance' },
    { value: 'other', label: 'Other' }
];

const TRANSACTION_TYPES = [
    { value: 'all', label: 'All Types' },
    { value: 'credit', label: 'Income' },
    { value: 'debit', label: 'Expense' }
];

const SORT_OPTIONS = [
    { value: 'date', label: 'Date' },
    { value: 'amount', label: 'Amount' },
    { value: 'category', label: 'Category' },
    { value: 'description', label: 'Description' }
];

const TransactionFilters = ({ onApplyFilters }) => {
    const dispatch = useDispatch();
    const { filters } = useSelector(state => state.transactions);
    const [showAdvanced, setShowAdvanced] = useState(false);
    const [localFilters, setLocalFilters] = useState(filters);

    const handleFilterChange = (key, value) => {
        const newFilters = { ...localFilters, [key]: value };
        setLocalFilters(newFilters);
        dispatch(updateFilters(newFilters));
        onApplyFilters(newFilters);
    };

    const handleReset = () => {
        dispatch(resetFilters());
        setLocalFilters({
            page: 1,
            limit: 10,
            type: 'all',
            category: 'all',
            startDate: null,
            endDate: null,
            search: '',
            sortBy: 'date',
            sortOrder: 'desc'
        });
        onApplyFilters({
            page: 1,
            limit: 10,
            type: 'all',
            category: 'all',
            startDate: null,
            endDate: null,
            search: '',
            sortBy: 'date',
            sortOrder: 'desc'
        });
    };

    const hasActiveFilters = () => {
        return (
            localFilters.search ||
            localFilters.type !== 'all' ||
            localFilters.category !== 'all' ||
            localFilters.startDate ||
            localFilters.endDate
        );
    };

    return (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4 mb-6">
            {/* Basic Filters */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                {/* Search */}
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500" size={16} />
                    <input
                        type="text"
                        placeholder="Search transactions..."
                        value={localFilters.search}
                        onChange={(e) => handleFilterChange('search', e.target.value)}
                        className="w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                    />
                    {localFilters.search && (
                        <button
                            onClick={() => handleFilterChange('search', '')}
                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300"
                        >
                            <X size={16} />
                        </button>
                    )}
                </div>

                {/* Transaction Type */}
                <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500" size={16} />
                    <select
                        value={localFilters.type}
                        onChange={(e) => handleFilterChange('type', e.target.value)}
                        className="w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    >
                        {TRANSACTION_TYPES.map(type => (
                            <option key={type.value} value={type.value}>
                                {type.label}
                            </option>
                        ))}
                    </select>
                </div>

                {/* Category */}
                <div className="relative">
                    <TagIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500" size={16} />
                    <select
                        value={localFilters.category}
                        onChange={(e) => handleFilterChange('category', e.target.value)}
                        className="w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    >
                        {CATEGORIES.map(category => (
                            <option key={category.value} value={category.value}>
                                {category.label}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Advanced Filters Toggle */}
            <div className="flex items-center justify-between">
                <button
                    onClick={() => setShowAdvanced(!showAdvanced)}
                    className="flex items-center space-x-2 text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                >
                    <Filter size={16} />
                    <span>{showAdvanced ? 'Hide' : 'Show'} Advanced Filters</span>
                </button>

                <div className="flex items-center space-x-2">
                    {hasActiveFilters() && (
                        <button
                            onClick={handleReset}
                            className="flex items-center space-x-1 px-3 py-1 text-xs text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600"
                        >
                            <RotateCcw size={12} />
                            <span>Reset</span>
                        </button>
                    )}
                </div>
            </div>

            {/* Advanced Filters */}
            {showAdvanced && (
                <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700"
                >
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {/* Date Range */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Start Date
                            </label>
                            <div className="relative">
                                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500" size={16} />
                                <input
                                    type="date"
                                    value={localFilters.startDate || ''}
                                    onChange={(e) => handleFilterChange('startDate', e.target.value || null)}
                                    className="w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                End Date
                            </label>
                            <div className="relative">
                                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500" size={16} />
                                <input
                                    type="date"
                                    value={localFilters.endDate || ''}
                                    onChange={(e) => handleFilterChange('endDate', e.target.value || null)}
                                    className="w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                />
                            </div>
                        </div>

                        {/* Sort Options */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Sort By
                            </label>
                            <div className="flex space-x-2">
                                <select
                                    value={localFilters.sortBy}
                                    onChange={(e) => handleFilterChange('sortBy', e.target.value)}
                                    className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                >
                                    {SORT_OPTIONS.map(option => (
                                        <option key={option.value} value={option.value}>
                                            {option.label}
                                        </option>
                                    ))}
                                </select>
                                <select
                                    value={localFilters.sortOrder}
                                    onChange={(e) => handleFilterChange('sortOrder', e.target.value)}
                                    className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                >
                                    <option value="desc">Desc</option>
                                    <option value="asc">Asc</option>
                                </select>
                            </div>
                        </div>
                    </div>
                </motion.div>
            )}
        </div>
    );
};

export default TransactionFilters;
