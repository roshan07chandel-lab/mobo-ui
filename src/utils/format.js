/**
 * Format helper to display prices in Indian Rupees (₹) with proper comma separators.
 * @param {number|string} price - The price value to format
 * @returns {string} Formatted price
 */
export const formatPrice = (price) => {
  const num = Number(price);
  if (isNaN(num)) return '₹0.00';
  
  // Format as Indian Currency (₹)
  return '₹' + num.toLocaleString('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
};

/**
 * Format helper to display dates in IST (UTC+5:30) as DD MMM YYYY.
 * @param {string|Date} dateString - Date representation
 * @returns {string} Formatted date
 */
export const formatDate = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return '';

  const options = {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    timeZone: 'Asia/Kolkata'
  };

  try {
    const formatter = new Intl.DateTimeFormat('en-IN', options);
    const parts = formatter.formatToParts(date);
    const day = parts.find(p => p.type === 'day')?.value || '';
    const month = parts.find(p => p.type === 'month')?.value || '';
    const year = parts.find(p => p.type === 'year')?.value || '';
    return `${day} ${month} ${year}`;
  } catch (err) {
    // Fallback if timeZone isn't supported (highly unlikely)
    return date.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
  }
};

/**
 * Maps status names to standard Tailwind color schemes.
 * @param {string} status - repair status
 * @returns {string} Tailwind CSS badge mapping key
 */
export const getStatusBadgeStyle = (status) => {
  const s = (status || '').toLowerCase();
  switch (s) {
    case 'received': return 'received';
    case 'diagnosing': return 'diagnosing';
    case 'repairing': return 'repairing';
    case 'ready': return 'ready';
    case 'delivered': return 'delivered';
    case 'cancelled': return 'cancelled';
    default: return '';
  }
};
