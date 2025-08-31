const CATEGORY_COLORS = {
    food: 'bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300',
    transport: 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300',
    entertainment: 'bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300',
    utilities: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300',
    healthcare: 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300',
    education: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900 dark:text-indigo-300',
    shopping: 'bg-pink-100 text-pink-700 dark:bg-pink-900 dark:text-pink-300',
    travel: 'bg-teal-100 text-teal-700 dark:bg-teal-900 dark:text-teal-300',
    investment: 'bg-cyan-100 text-cyan-700 dark:bg-cyan-900 dark:text-cyan-300',
    salary: 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300',
    freelance: 'bg-lime-100 text-lime-700 dark:bg-lime-900 dark:text-lime-300',
    business: 'bg-sky-100 text-sky-700 dark:bg-sky-900 dark:text-sky-300',
    rent: 'bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300',
    insurance: 'bg-rose-100 text-rose-700 dark:bg-rose-900 dark:text-rose-300',
    other: 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
};

/**
 * Gets the Tailwind CSS color classes for a given category.
 * @param {string} category - The category name.
 * @returns {string} The Tailwind CSS classes for the category color.
 */
export const getCategoryColor = (category) => {
    return CATEGORY_COLORS[category.toLowerCase()] || CATEGORY_COLORS.other;
};
