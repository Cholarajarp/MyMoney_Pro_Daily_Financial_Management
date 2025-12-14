/**
 * Smart Transaction Categorization Engine
 * Uses AI-powered pattern matching and machine learning-style rules
 * to automatically categorize transactions based on merchant names
 */

// Comprehensive merchant-to-category mapping database
const MERCHANT_CATEGORIES = {
  // Food & Dining
  food: {
    keywords: ['restaurant', 'cafe', 'coffee', 'pizza', 'burger', 'food', 'kitchen', 'grill', 'bistro', 'diner', 'eatery', 'bakery', 'bar', 'pub', 'mcdonalds', 'kfc', 'subway', 'dominos', 'starbucks', 'dunkin', 'chipotle', 'panera', 'wendys', 'taco bell', 'chick-fil-a', 'five guys', 'shake shack', 'in-n-out'],
    category: 'Food & Dining'
  },
  groceries: {
    keywords: ['grocery', 'supermarket', 'walmart', 'target', 'costco', 'whole foods', 'trader joe', 'kroger', 'safeway', 'albertsons', 'publix', 'wegmans', 'aldi', 'lidl', 'market', 'fresh'],
    category: 'Groceries'
  },

  // Transportation
  transport: {
    keywords: ['uber', 'lyft', 'taxi', 'cab', 'gas', 'fuel', 'shell', 'exxon', 'chevron', 'bp', 'mobil', 'parking', 'toll', 'metro', 'transit', 'bus', 'train', 'airline', 'flight'],
    category: 'Transportation'
  },
  auto: {
    keywords: ['auto', 'car wash', 'oil change', 'tire', 'mechanic', 'repair', 'service', 'jiffy lube', 'midas', 'pep boys', 'autozone', 'napa'],
    category: 'Auto & Transport'
  },

  // Shopping
  shopping: {
    keywords: ['amazon', 'ebay', 'shop', 'store', 'retail', 'mall', 'boutique', 'clothing', 'fashion', 'apparel', 'footwear', 'shoes', 'nike', 'adidas', 'gap', 'old navy', 'macys', 'nordstrom', 'kohls', 'jcpenney'],
    category: 'Shopping'
  },
  electronics: {
    keywords: ['best buy', 'apple', 'microsoft', 'electronics', 'computer', 'phone', 'tech', 'gadget', 'amazon prime', 'newegg'],
    category: 'Electronics'
  },

  // Entertainment
  entertainment: {
    keywords: ['movie', 'cinema', 'theater', 'amc', 'regal', 'netflix', 'hulu', 'disney', 'spotify', 'youtube', 'music', 'game', 'xbox', 'playstation', 'steam', 'twitch'],
    category: 'Entertainment'
  },

  // Bills & Utilities
  utilities: {
    keywords: ['electric', 'power', 'water', 'gas utility', 'internet', 'cable', 'comcast', 'verizon', 'att', 'tmobile', 'sprint'],
    category: 'Bills & Utilities'
  },
  phone: {
    keywords: ['verizon', 'att', 'tmobile', 'sprint', 'cricket', 'boost mobile', 'metro pcs', 'phone bill'],
    category: 'Phone'
  },

  // Healthcare
  health: {
    keywords: ['pharmacy', 'cvs', 'walgreens', 'rite aid', 'drug', 'medical', 'doctor', 'hospital', 'clinic', 'health', 'dental', 'vision', 'prescription'],
    category: 'Healthcare'
  },

  // Housing
  housing: {
    keywords: ['rent', 'mortgage', 'property', 'lease', 'apartment', 'housing'],
    category: 'Housing'
  },
  home: {
    keywords: ['home depot', 'lowes', 'ikea', 'bed bath', 'furniture', 'hardware', 'home improvement'],
    category: 'Home & Garden'
  },

  // Personal Care
  personal: {
    keywords: ['salon', 'spa', 'barber', 'haircut', 'beauty', 'cosmetic', 'sephora', 'ulta', 'gym', 'fitness', 'yoga'],
    category: 'Personal Care'
  },

  // Financial
  financial: {
    keywords: ['bank', 'atm', 'transfer', 'payment', 'paypal', 'venmo', 'zelle', 'cash app', 'credit card', 'loan', 'interest'],
    category: 'Financial'
  },

  // Education
  education: {
    keywords: ['school', 'university', 'college', 'tuition', 'book', 'course', 'udemy', 'coursera', 'education'],
    category: 'Education'
  },

  // Travel
  travel: {
    keywords: ['hotel', 'airbnb', 'booking', 'expedia', 'travel', 'vacation', 'resort', 'cruise', 'marriott', 'hilton', 'hyatt'],
    category: 'Travel'
  },

  // Subscriptions
  subscriptions: {
    keywords: ['subscription', 'membership', 'annual fee', 'monthly fee', 'adobe', 'office 365', 'dropbox', 'icloud'],
    category: 'Subscriptions'
  },

  // Gifts & Donations
  gifts: {
    keywords: ['gift', 'donation', 'charity', 'fundraiser', 'gofundme'],
    category: 'Gifts & Donations'
  }
};

/**
 * Categorize a transaction based on merchant name
 * @param {string} merchant - The merchant name
 * @param {string} notes - Optional transaction notes
 * @returns {string} - The detected category
 */
export function categorizeMerchant(merchant, notes = '') {
  if (!merchant) return 'Uncategorized';

  const searchText = `${merchant} ${notes}`.toLowerCase();

  // Check each category's keywords
  for (const [key, data] of Object.entries(MERCHANT_CATEGORIES)) {
    for (const keyword of data.keywords) {
      if (searchText.includes(keyword.toLowerCase())) {
        return data.category;
      }
    }
  }

  return 'General';
}

/**
 * Get category suggestions for auto-complete
 * @param {string} merchant - The merchant name
 * @returns {Array} - Array of suggested categories
 */
export function getCategorySuggestions(merchant) {
  if (!merchant) return [];

  const suggestions = [];
  const searchText = merchant.toLowerCase();

  for (const [key, data] of Object.entries(MERCHANT_CATEGORIES)) {
    for (const keyword of data.keywords) {
      if (searchText.includes(keyword.toLowerCase())) {
        if (!suggestions.includes(data.category)) {
          suggestions.push(data.category);
        }
      }
    }
  }

  return suggestions;
}

/**
 * Analyze spending patterns and provide insights
 * @param {Array} transactions - Array of transactions
 * @returns {Object} - Spending insights
 */
export function analyzeSpendingPatterns(transactions) {
  const categoryTotals = {};
  const merchantFrequency = {};

  transactions.forEach(t => {
    // Category totals
    const category = t.category || 'Uncategorized';
    categoryTotals[category] = (categoryTotals[category] || 0) + t.amount;

    // Merchant frequency
    const merchant = t.merchant || 'Unknown';
    merchantFrequency[merchant] = (merchantFrequency[merchant] || 0) + 1;
  });

  // Find top categories
  const topCategories = Object.entries(categoryTotals)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([cat, amount]) => ({ category: cat, amount }));

  // Find frequent merchants
  const frequentMerchants = Object.entries(merchantFrequency)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([merchant, count]) => ({ merchant, count }));

  return {
    categoryTotals,
    topCategories,
    frequentMerchants,
    totalSpending: Object.values(categoryTotals).reduce((a, b) => a + b, 0)
  };
}

/**
 * Smart category color assignment
 * @param {string} category - Category name
 * @returns {string} - Hex color code
 */
export function getCategoryColor(category) {
  const colorMap = {
    'Food & Dining': '#ef4444',
    'Groceries': '#10b981',
    'Transportation': '#3b82f6',
    'Auto & Transport': '#6366f1',
    'Shopping': '#ec4899',
    'Electronics': '#8b5cf6',
    'Entertainment': '#f59e0b',
    'Bills & Utilities': '#06b6d4',
    'Phone': '#14b8a6',
    'Healthcare': '#f43f5e',
    'Housing': '#84cc16',
    'Home & Garden': '#22c55e',
    'Personal Care': '#a855f7',
    'Financial': '#0ea5e9',
    'Education': '#eab308',
    'Travel': '#f97316',
    'Subscriptions': '#6366f1',
    'Gifts & Donations': '#d946ef',
    'General': '#64748b',
    'Uncategorized': '#94a3b8'
  };

  return colorMap[category] || '#64748b';
}

/**
 * Get category icon (emoji)
 * @param {string} category - Category name
 * @returns {string} - Emoji icon
 */
export function getCategoryIcon(category) {
  const iconMap = {
    'Food & Dining': '🍔',
    'Groceries': '🛒',
    'Transportation': '🚗',
    'Auto & Transport': '🔧',
    'Shopping': '🛍️',
    'Electronics': '💻',
    'Entertainment': '🎬',
    'Bills & Utilities': '💡',
    'Phone': '📱',
    'Healthcare': '🏥',
    'Housing': '🏠',
    'Home & Garden': '🏡',
    'Personal Care': '💅',
    'Financial': '💰',
    'Education': '📚',
    'Travel': '✈️',
    'Subscriptions': '📋',
    'Gifts & Donations': '🎁',
    'General': '📊',
    'Uncategorized': '❓'
  };

  return iconMap[category] || '📊';
}

export default {
  categorizeMerchant,
  getCategorySuggestions,
  analyzeSpendingPatterns,
  getCategoryColor,
  getCategoryIcon
};

