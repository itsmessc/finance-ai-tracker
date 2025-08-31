import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import { Plus, Download, RefreshCw } from 'lucide-react';
import Layout from '../components/Layout';
import TransactionForm from '../components/TransactionForm';
import TransactionList from '../components/TransactionList';
import TransactionFilters from '../components/TransactionFilters';
import TransactionSummary from '../components/TransactionSummary';
import Pagination from '../components/Pagination';
import {
    fetchTransactions,
    updateFilters,
    clearError
} from '../store/slices/transactionSlice';

const Transactions = () => {
    const dispatch = useDispatch();
    const {
        transactions,
        pagination,
        summary,
        filters,
        loading
    } = useSelector(state => state.transactions);

    const [showForm, setShowForm] = useState(false);
    const [editingTransaction, setEditingTransaction] = useState(null);

    useEffect(() => {
        loadTransactions();
    }, [dispatch]);

    useEffect(() => {
        // Clear any errors when component mounts
        dispatch(clearError());
    }, [dispatch]);

    const loadTransactions = (newFilters = filters) => {
        dispatch(fetchTransactions(newFilters));
    };

    const handleApplyFilters = (newFilters) => {
        const filtersWithPage = { ...newFilters, page: 1 };
        dispatch(updateFilters(filtersWithPage));
        loadTransactions(filtersWithPage);
    };

    const handlePageChange = (page) => {
        const newFilters = { ...filters, page };
        dispatch(updateFilters(newFilters));
        loadTransactions(newFilters);
    };

    const handleAddTransaction = () => {
        setEditingTransaction(null);
        setShowForm(true);
    };

    const handleEditTransaction = (transaction) => {
        setEditingTransaction(transaction);
        setShowForm(true);
    };

    const handleCloseForm = () => {
        setShowForm(false);
        setEditingTransaction(null);
        // Reload transactions to get updated data
        loadTransactions();
    };

    const handleRefresh = () => {
        loadTransactions();
    };

    const handleExport = () => {
        // TODO: Implement export functionality
        console.log('Export transactions');
    };

    return (
        <Layout>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Transactions</h1>
                        <p className="text-gray-600 dark:text-gray-300 mt-2">
                            Track your income and expenses with AI-powered parsing
                        </p>
                    </div>

                    <div className="flex items-center space-x-3">
                        <button
                            onClick={handleRefresh}
                            disabled={loading.transactions}
                            className="flex items-center space-x-2 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 bg-white dark:bg-gray-800"
                        >
                            <RefreshCw
                                size={16}
                                className={loading.transactions ? 'animate-spin' : ''}
                            />
                            <span>Refresh</span>
                        </button>

                        <button
                            onClick={handleExport}
                            className="flex items-center space-x-2 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 bg-white dark:bg-gray-800"
                        >
                            <Download size={16} />
                            <span>Export</span>
                        </button>

                        <button
                            onClick={handleAddTransaction}
                            className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
                        >
                            <Plus size={16} />
                            <span>Add Transaction</span>
                        </button>
                    </div>
                </div>

                {/* Summary Cards */}
                <TransactionSummary
                    summary={summary}
                    loading={loading.transactions}
                />

                {/* Filters */}
                <TransactionFilters onApplyFilters={handleApplyFilters} />

                {/* Transactions List */}
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
                    {loading.transactions ? (
                        <div className="p-8">
                            <div className="flex items-center justify-center">
                                <RefreshCw className="animate-spin mr-2" size={20} />
                                <span className="text-gray-900 dark:text-white">Loading transactions...</span>
                            </div>
                        </div>
                    ) : (
                        <>
                            <div className="p-6">
                                <div className="flex items-center justify-between mb-4">
                                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                                        Recent Transactions
                                    </h2>
                                    {pagination.totalRecords > 0 && (
                                        <span className="text-sm text-gray-500 dark:text-gray-400">
                                            {pagination.totalRecords} transaction{pagination.totalRecords !== 1 ? 's' : ''} found
                                        </span>
                                    )}
                                </div>

                                <TransactionList
                                    transactions={transactions}
                                    onEdit={handleEditTransaction}
                                />
                            </div>

                            {/* Pagination */}
                            {pagination.total > 1 && (
                                <Pagination
                                    currentPage={pagination.current}
                                    totalPages={pagination.total}
                                    totalRecords={pagination.totalRecords}
                                    recordsPerPage={filters.limit}
                                    onPageChange={handlePageChange}
                                />
                            )}
                        </>
                    )}
                </div>

                {/* Transaction Form Modal */}
                <TransactionForm
                    isOpen={showForm}
                    onClose={handleCloseForm}
                    transaction={editingTransaction}
                />
            </div>
        </Layout>
    );
};

export default Transactions;
