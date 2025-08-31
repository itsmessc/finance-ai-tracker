import React from 'react';
import { motion } from 'framer-motion';
import {
    ArrowUpCircle,
    ArrowDownCircle,
    Wallet,
    TrendingUp,
    TrendingDown
} from 'lucide-react';

const TransactionSummary = ({ summary, loading }) => {
    // Default summary if none provided
    const defaultSummary = {
        totalCredit: 0,
        totalDebit: 0,
        balance: 0
    };

    const safeSummary = summary || defaultSummary;

    const formatAmount = (amount) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR'
        }).format(amount || 0);
    };

    const getBalanceColor = (balance) => {
        if (balance > 0) return 'text-green-600 dark:text-green-400';
        if (balance < 0) return 'text-red-600 dark:text-red-400';
        return 'text-gray-600 dark:text-gray-400';
    };

    const getBalanceIcon = (balance) => {
        if (balance > 0) return <TrendingUp size={20} />;
        if (balance < 0) return <TrendingDown size={20} />;
        return <Wallet size={20} />;
    };

    if (loading) {
        return (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                {[1, 2, 3].map(i => (
                    <div key={i} className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                        <div className="animate-pulse">
                            <div className="w-12 h-12 bg-gray-200 dark:bg-gray-600 rounded-full mb-4"></div>
                            <div className="w-24 h-4 bg-gray-200 dark:bg-gray-600 rounded mb-2"></div>
                            <div className="w-32 h-8 bg-gray-200 dark:bg-gray-600 rounded"></div>
                        </div>
                    </div>
                ))}
            </div>
        );
    }

    const cards = [
        {
            title: 'Total Income',
            amount: safeSummary.totalCredit || 0,
            icon: ArrowUpCircle,
            color: 'text-green-600 dark:text-green-400',
            bgColor: 'bg-green-100 dark:bg-green-900',
            prefix: '+'
        },
        {
            title: 'Total Expenses',
            amount: safeSummary.totalDebit || 0,
            icon: ArrowDownCircle,
            color: 'text-red-600 dark:text-red-400',
            bgColor: 'bg-red-100 dark:bg-red-900',
            prefix: '-'
        },
        {
            title: 'Net Balance',
            amount: safeSummary.balance || 0,
            icon: () => getBalanceIcon(safeSummary.balance || 0),
            color: getBalanceColor(safeSummary.balance || 0),
            bgColor: (safeSummary.balance || 0) >= 0 ? 'bg-blue-100 dark:bg-blue-900' : 'bg-orange-100 dark:bg-orange-900',
            prefix: (safeSummary.balance || 0) >= 0 ? '+' : ''
        }
    ];

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            {cards.map((card, index) => (
                <motion.div
                    key={card.title}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6"
                >
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                                {card.title}
                            </p>
                            <p className={`text-2xl font-bold ${card.color}`}>
                                {card.prefix}{formatAmount(Math.abs(card.amount))}
                            </p>
                        </div>
                        <div className={`p-3 rounded-full ${card.bgColor} ${card.color}`}>
                            <card.icon />
                        </div>
                    </div>

                    {/* Progress bar for expenses vs income */}
                    {(card.title === 'Total Income' || card.title === 'Total Expenses') && safeSummary.totalCredit > 0 && (
                        <div className="mt-4">
                            <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                                <div
                                    className={`h-2 rounded-full ${card.title === 'Total Income' ? 'bg-green-500' : 'bg-red-500'
                                        }`}
                                    style={{
                                        width: `${Math.min(
                                            (card.amount / Math.max(safeSummary.totalCredit, safeSummary.totalDebit)) * 100,
                                            100
                                        )}%`
                                    }}
                                ></div>
                            </div>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                {((card.amount / (safeSummary.totalCredit + safeSummary.totalDebit)) * 100).toFixed(1)}% of total
                            </p>
                        </div>
                    )}

                    {/* Balance status */}
                    {card.title === 'Net Balance' && (
                        <div className="mt-4">
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                                {safeSummary.balance > 0 && 'You have a positive balance!'}
                                {safeSummary.balance < 0 && 'You have spent more than earned.'}
                                {safeSummary.balance === 0 && 'Your income and expenses are balanced.'}
                            </p>
                        </div>
                    )}
                </motion.div>
            ))}
        </div>
    );
};

export default TransactionSummary;
