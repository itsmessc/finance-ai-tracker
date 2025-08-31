import api from './api';

export const transactionService = {
    // Parse natural language transaction
    parseTransaction: async (text) => {
        try {
            const response = await api.post('/api/transactions/parse', { text });
            const data = await response.json();
            if (!response.ok) {
                throw new Error(data.message || 'Failed to parse transaction');
            }
            return data;
        } catch (error) {
            throw error;
        }
    },

    // Create transaction
    createTransaction: async (transactionData) => {
        try {
            const response = await api.post('/api/transactions', transactionData);
            const data = await response.json();
            if (!response.ok) {
                throw new Error(data.message || 'Failed to create transaction');
            }
            return data;
        } catch (error) {
            throw error;
        }
    },

    // Get transactions with filters
    getTransactions: async (filters = {}) => {
        try {
            const queryParams = new URLSearchParams();

            Object.keys(filters).forEach(key => {
                if (filters[key] !== undefined && filters[key] !== null && filters[key] !== '') {
                    queryParams.append(key, filters[key]);
                }
            });

            const response = await api.get(`/api/transactions?${queryParams.toString()}`);
            const data = await response.json();
            if (!response.ok) {
                throw new Error(data.message || 'Failed to fetch transactions');
            }
            return data;
        } catch (error) {
            throw error;
        }
    },

    // Update transaction
    updateTransaction: async (id, transactionData) => {
        try {
            const response = await api.put(`/api/transactions/${id}`, transactionData);
            const data = await response.json();
            if (!response.ok) {
                throw new Error(data.message || 'Failed to update transaction');
            }
            return data;
        } catch (error) {
            throw error;
        }
    },

    // Delete transaction
    deleteTransaction: async (id) => {
        try {
            const response = await api.delete(`/api/transactions/${id}`);
            const data = await response.json();
            if (!response.ok) {
                throw new Error(data.message || 'Failed to delete transaction');
            }
            return data;
        } catch (error) {
            throw error;
        }
    },

    // Get transaction statistics
    getTransactionStats: async (period = 'month') => {
        try {
            const response = await api.get(`/analytics/stats?period=${period}`);
            const data = await response.json();
            if (!response.ok) {
                throw new Error(data.message || 'Failed to fetch statistics');
            }
            return data;
        } catch (error) {
            throw error;
        }
    }
};
