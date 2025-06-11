"use strict";
/**
 * Transaction ID Formatter Utility for Backend
 * Formats simple numeric IDs into professional transaction numbers
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.formatTransactionReference = exports.formatTransactionId = void 0;
/**
 * Formats a numeric transaction ID into a professional format
 * @param id - The numeric transaction ID from the database
 * @returns Formatted transaction ID (e.g., TXN-000001)
 */
const formatTransactionId = (id) => {
    const numericId = typeof id === 'string' ? parseInt(id, 10) : id;
    if (isNaN(numericId) || numericId < 0) {
        return 'TXN-INVALID';
    }
    // Pad with zeros to make it 6 digits
    const paddedId = numericId.toString().padStart(6, '0');
    return `TXN-${paddedId}`;
};
exports.formatTransactionId = formatTransactionId;
/**
 * Creates a short transaction reference for notifications or logs
 * @param id - The numeric transaction ID
 * @returns Short reference (e.g., TXN-001)
 */
const formatTransactionReference = (id) => {
    const numericId = typeof id === 'string' ? parseInt(id, 10) : id;
    if (isNaN(numericId) || numericId < 0) {
        return 'TXN-ERR';
    }
    // For references, use 3 digits for shorter display
    const paddedId = numericId.toString().padStart(3, '0');
    return `TXN-${paddedId}`;
};
exports.formatTransactionReference = formatTransactionReference;
//# sourceMappingURL=transactionFormatter.js.map