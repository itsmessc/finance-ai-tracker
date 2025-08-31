/**
 * Formats a number into Indian Rupee (INR) currency format.
 * @param {number} amount - The amount to format.
 * @returns {string} The formatted currency string.
 */
export const formatAmount = (amount) => {
    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR'
    }).format(amount || 0);
};

/**
 * Formats a date string or Date object into a more readable format.
 * @param {string | Date} date - The date to format.
 * @param {string} formatString - The desired output format (e.g., 'MMM dd, yyyy').
 * @returns {string} The formatted date string.
 */
import { format } from 'date-fns';

export const formatDate = (date, formatString = 'MMM dd, yyyy') => {
    if (!date) return '';
    return format(new Date(date), formatString);
};
