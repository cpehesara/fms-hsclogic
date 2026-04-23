/**
 * @file formatters.js
 * @description Display-layer formatting helpers.
 * These functions transform raw data values into locale-appropriate strings
 * for rendering in the UI. They are pure and safe to use in JSX expressions.
 */

/**
 * Formats a numeric amount as a Sri Lankan Rupee currency string.
 * Example: 120000 → "LKR 120,000.00"
 *
 * @param {number} amount - The monetary value to format.
 * @returns {string} Formatted LKR currency string.
 */
export const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-LK', {
    style: 'currency',
    currency: 'LKR',
    minimumFractionDigits: 2,
  }).format(amount);
};

/**
 * Formats an ISO date string into a human-readable short date.
 * Example: "2026-03-31" → "Mar 31, 2026"
 *
 * @param {string|null|undefined} dateString - ISO date string (YYYY-MM-DD).
 * @returns {string} Formatted date string, or "–" if the input is falsy.
 */
export const formatDate = (dateString) => {
  if (!dateString) return '–';
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

/**
 * Maps a record status string to its corresponding Tailwind CSS classes.
 * Used by the Badge component to apply consistent colour coding across the app.
 *
 * @param {string} status - One of: Draft, Sent, Paid, Overdue, Active, Inactive, Finalized, Pending.
 * @returns {string} Space-separated Tailwind utility classes for background, text, and border.
 */
export const getStatusStyle = (status) => {
  const styles = {
    Draft:     'bg-gray-500/20   text-gray-400   border-gray-500/30',
    Sent:      'bg-blue-500/20   text-blue-400   border-blue-500/30',
    Paid:      'bg-green-500/20  text-green-400  border-green-500/30',
    Overdue:   'bg-red-500/20    text-red-400    border-red-500/30',
    Active:    'bg-green-500/20  text-green-400  border-green-500/30',
    Inactive:  'bg-gray-500/20   text-gray-400   border-gray-500/30',
    Finalized: 'bg-blue-500/20   text-blue-400   border-blue-500/30',
    Pending:   'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  };
  return styles[status] || styles.Draft;
};