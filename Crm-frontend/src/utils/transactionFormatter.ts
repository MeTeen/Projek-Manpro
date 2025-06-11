/**
 * Transaction ID Formatter Utility
 * Formats simple numeric IDs into professional transaction numbers
 */

/**
 * Formats a numeric transaction ID into a professional format
 * @param id - The numeric transaction ID from the database
 * @returns Formatted transaction ID (e.g., TXN-000001)
 */
export const formatTransactionId = (id: number | string): string => {
  const numericId = typeof id === 'string' ? parseInt(id, 10) : id;
  
  if (isNaN(numericId) || numericId < 0) {
    return 'TXN-INVALID';
  }
  
  // Pad with zeros to make it 6 digits
  const paddedId = numericId.toString().padStart(6, '0');
  return `TXN-${paddedId}`;
};

/**
 * Extracts the numeric ID from a formatted transaction ID
 * @param formattedId - The formatted transaction ID (e.g., TXN-000001)
 * @returns The numeric ID, or null if invalid format
 */
export const parseTransactionId = (formattedId: string): number | null => {
  const match = formattedId.match(/^TXN-(\d+)$/);
  if (!match) {
    return null;
  }
  
  const numericId = parseInt(match[1], 10);
  return isNaN(numericId) ? null : numericId;
};

/**
 * Formats a transaction ID for display with additional context
 * @param id - The numeric transaction ID
 * @param includePrefix - Whether to include "Transaction #" prefix
 * @returns Formatted string for display
 */
export const formatTransactionDisplay = (id: number | string, includePrefix: boolean = false): string => {
  const formattedId = formatTransactionId(id);
  return includePrefix ? `Transaction #${formattedId}` : formattedId;
};

/**
 * Creates a short transaction reference for notifications or logs
 * @param id - The numeric transaction ID
 * @returns Short reference (e.g., TXN-001)
 */
export const formatTransactionReference = (id: number | string): string => {
  const numericId = typeof id === 'string' ? parseInt(id, 10) : id;
  
  if (isNaN(numericId) || numericId < 0) {
    return 'TXN-ERR';
  }
  
  // For references, use 3 digits for shorter display
  const paddedId = numericId.toString().padStart(3, '0');
  return `TXN-${paddedId}`;
};
