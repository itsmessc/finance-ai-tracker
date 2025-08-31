import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import { Plus, Download, RefreshCw } from 'lucide-react';
import toast from 'react-hot-toast';
import Layout from '../components/Layout';
import TransactionForm from '../components/TransactionForm';
import TransactionList from '../components/TransactionList';
import TransactionFilters from '../components/TransactionFilters';
import TransactionSummary from '../components/TransactionSummary';
import Pagination from '../components/Pagination';
import { fetchTransactions, updateFilters, clearError } from '../store/slices/transactionSlice';
import { formatDate } from '../utils/formatters';
import Button from '../components/ui/Button';
import { Card, CardContent } from '../components/ui/Card';
import { Spinner } from '../components/ui/Spinner';

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
        if (!transactions || transactions.length === 0) {
            toast.error('No transactions to export');
            return;
        }

        try {
            // Create CSV content
            const headers = ['Date', 'Description', 'Category', 'Type', 'Amount', 'Location', 'Tags'];
            const csvContent = [
                headers.join(','),
                ...transactions.map(transaction => [
                    format(new Date(transaction.date), 'yyyy-MM-dd'),
                    `"${transaction.description.replace(/"/g, '""')}"`, // Escape quotes
                    transaction.category,
                    transaction.type,
                    transaction.amount,
                    `"${(transaction.location || '').replace(/"/g, '""')}"`,
                    `"${(transaction.tags || []).join('; ').replace(/"/g, '""')}"`
                ].join(','))
            ].join('\n');

            // Create and download file
            const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
            const link = document.createElement('a');
            const url = URL.createObjectURL(blob);
            link.setAttribute('href', url);
            link.setAttribute('download', `transactions_${formatDate(new Date(), 'yyyy-MM-dd')}.csv`);
            link.style.visibility = 'hidden';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

            toast.success(`Exported ${transactions.length} transactions to CSV`);
        } catch (error) {
            console.error('Export error:', error);
            toast.error('Failed to export transactions');
        }
    };

    return (
        <Layout>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 sm:mb-8 space-y-4 sm:space-y-0">
                    <div>
                        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">Transactions</h1>
                        <p className="text-gray-600 dark:text-gray-300 mt-1 sm:mt-2 text-sm sm:text-base">
                            Track your income and expenses with AI-powered parsing
                        </p>
                    </div>

                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-2 sm:space-y-0 sm:space-x-3">
                        <Button
                            onClick={handleRefresh}
                            disabled={loading.transactions}
                            variant="secondary"
                            size="md"
                        >
                            <RefreshCw
                                size={16}
                                className={loading.transactions ? 'animate-spin' : ''}
                            />
                            <span>Refresh</span>
                        </Button>

                        <Button
                            onClick={handleExport}
                            variant="secondary"
                            size="md"
                        >
                            <Download size={16} />
                            <span>Export</span>
                        </Button>

                        <Button
                            onClick={handleAddTransaction}
                            size="md"
                        >
                            <Plus size={16} />
                            <span>Add Transaction</span>
                        </Button>
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
                <Card>
                    <CardContent>
                        {loading.transactions ? (
                            <div className="p-6 sm:p-8 flex items-center justify-center">
                                <Spinner size="md" />
                                <span className="ml-2 text-gray-900 dark:text-white">Loading transactions...</span>
                            </div>
                        ) : (
                            <>
                                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 space-y-2 sm:space-y-0">
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
                            </>
                        )}
                    </CardContent>

                    {/* Pagination */}
                    {!loading.transactions && pagination.total > 1 && (
                        <Pagination
                            currentPage={pagination.current}
                            totalPages={pagination.total}
                            totalRecords={pagination.totalRecords}
                            recordsPerPage={filters.limit}
                            onPageChange={handlePageChange}
                        />
                    )}
                </Card>

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
