/**
 * Transaction ID Formatter Utility for Backend
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
