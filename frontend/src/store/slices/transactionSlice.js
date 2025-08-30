import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { transactionService } from '../../services/transactions';

// Async thunks
export const parseTransaction = createAsyncThunk(
    'transactions/parse',
    async (text, { rejectWithValue }) => {
        try {
            const response = await transactionService.parseTransaction(text);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.message || 'Failed to parse transaction');
        }
    }
);

export const createTransaction = createAsyncThunk(
    'transactions/create',
    async (transactionData, { rejectWithValue }) => {
        try {
            const response = await transactionService.createTransaction(transactionData);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.message || 'Failed to create transaction');
        }
    }
);

export const fetchTransactions = createAsyncThunk(
    'transactions/fetchAll',
    async (filters = {}, { rejectWithValue }) => {
        try {
            const response = await transactionService.getTransactions(filters);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.message || 'Failed to fetch transactions');
        }
    }
);

export const updateTransaction = createAsyncThunk(
    'transactions/update',
    async ({ id, data }, { rejectWithValue }) => {
        try {
            const response = await transactionService.updateTransaction(id, data);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.message || 'Failed to update transaction');
        }
    }
);

export const deleteTransaction = createAsyncThunk(
    'transactions/delete',
    async (id, { rejectWithValue }) => {
        try {
            await transactionService.deleteTransaction(id);
            return id;
        } catch (error) {
            return rejectWithValue(error.message || 'Failed to delete transaction');
        }
    }
);

export const fetchTransactionStats = createAsyncThunk(
    'transactions/fetchStats',
    async (period = 'month', { rejectWithValue }) => {
        try {
            const response = await transactionService.getTransactionStats(period);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.message || 'Failed to fetch statistics');
        }
    }
);

const initialState = {
    transactions: [],
    parsedTransaction: null,
    pagination: {
        current: 1,
        total: 1,
        count: 0,
        totalRecords: 0
    },
    summary: {
        totalCredit: 0,
        totalDebit: 0,
        balance: 0
    },
    stats: {
        categoryStats: [],
        monthlyStats: []
    },
    filters: {
        page: 1,
        limit: 10,
        type: 'all',
        category: 'all',
        startDate: null,
        endDate: null,
        search: '',
        sortBy: 'date',
        sortOrder: 'desc'
    },
    loading: {
        transactions: false,
        parsing: false,
        creating: false,
        updating: false,
        deleting: false,
        stats: false
    },
    error: null
};

const transactionSlice = createSlice({
    name: 'transactions',
    initialState,
    reducers: {
        clearError: (state) => {
            state.error = null;
        },
        clearParsedTransaction: (state) => {
            state.parsedTransaction = null;
        },
        updateFilters: (state, action) => {
            state.filters = { ...state.filters, ...action.payload };
        },
        resetFilters: (state) => {
            state.filters = initialState.filters;
        }
    },
    extraReducers: (builder) => {
        builder
            // Parse transaction
            .addCase(parseTransaction.pending, (state) => {
                state.loading.parsing = true;
                state.error = null;
            })
            .addCase(parseTransaction.fulfilled, (state, action) => {
                state.loading.parsing = false;
                state.parsedTransaction = action.payload;
            })
            .addCase(parseTransaction.rejected, (state, action) => {
                state.loading.parsing = false;
                state.error = action.payload;
            })

            // Create transaction
            .addCase(createTransaction.pending, (state) => {
                state.loading.creating = true;
                state.error = null;
            })
            .addCase(createTransaction.fulfilled, (state, action) => {
                state.loading.creating = false;
                state.transactions.unshift(action.payload);
                state.parsedTransaction = null;
            })
            .addCase(createTransaction.rejected, (state, action) => {
                state.loading.creating = false;
                state.error = action.payload;
            })

            // Fetch transactions
            .addCase(fetchTransactions.pending, (state) => {
                state.loading.transactions = true;
                state.error = null;
            })
            .addCase(fetchTransactions.fulfilled, (state, action) => {
                state.loading.transactions = false;
                state.transactions = action.payload.transactions;
                state.pagination = action.payload.pagination;
                state.summary = action.payload.summary;
            })
            .addCase(fetchTransactions.rejected, (state, action) => {
                state.loading.transactions = false;
                state.error = action.payload;
            })

            // Update transaction
            .addCase(updateTransaction.pending, (state) => {
                state.loading.updating = true;
                state.error = null;
            })
            .addCase(updateTransaction.fulfilled, (state, action) => {
                state.loading.updating = false;
                const index = state.transactions.findIndex(t => t._id === action.payload._id);
                if (index !== -1) {
                    state.transactions[index] = action.payload;
                }
            })
            .addCase(updateTransaction.rejected, (state, action) => {
                state.loading.updating = false;
                state.error = action.payload;
            })

            // Delete transaction
            .addCase(deleteTransaction.pending, (state) => {
                state.loading.deleting = true;
                state.error = null;
            })
            .addCase(deleteTransaction.fulfilled, (state, action) => {
                state.loading.deleting = false;
                state.transactions = state.transactions.filter(t => t._id !== action.payload);
            })
            .addCase(deleteTransaction.rejected, (state, action) => {
                state.loading.deleting = false;
                state.error = action.payload;
            })

            // Fetch statistics
            .addCase(fetchTransactionStats.pending, (state) => {
                state.loading.stats = true;
                state.error = null;
            })
            .addCase(fetchTransactionStats.fulfilled, (state, action) => {
                state.loading.stats = false;
                state.stats = action.payload;
            })
            .addCase(fetchTransactionStats.rejected, (state, action) => {
                state.loading.stats = false;
                state.error = action.payload;
            });
    }
});

export const { clearError, clearParsedTransaction, updateFilters, resetFilters } = transactionSlice.actions;
export default transactionSlice.reducer;
