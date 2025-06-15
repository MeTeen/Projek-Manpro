export interface Customer {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  address?: string;
  city?: string;
}

export interface Product {
  id: number;
  name: string;
  dimensions?: string;
}

export interface Purchase {
  id: number;
  quantity: number;
  unitPrice: number;
  purchaseDate: string;
  product: Product;
}

export interface Admin {
  id: number;
  username: string;
  email: string;
}

export interface Ticket {
  id: number;
  customerId: number;
  purchaseId?: number | null;
  subject: string;
  message: string;
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  category: 'delivery' | 'product_quality' | 'payment' | 'general' | 'refund' | 'exchange';
  assignedTo?: number | null;
  resolution?: string | null;
  attachmentUrls?: string[] | null;
  firstResponseAt?: string | null;
  lastActivityAt: string;
  escalatedAt?: string | null;
  createdAt: string;
  updatedAt: string;
  resolvedAt?: string | null;
  
  // Relationships
  customer?: Customer;
  purchase?: Purchase;
  assignedAdmin?: Admin;
}

export interface TicketMessage {
  id: number;
  ticketId: number;
  senderId: number;
  senderType: 'customer' | 'admin';
  message: string;
  attachmentUrls?: string[] | null;
  createdAt: string;
  updatedAt: string;
  
  // Relationships
  customerSender?: Customer;
  adminSender?: Admin;
}

export interface TicketStats {
  overview: {
    total: number;
    open: number;
    inProgress: number;
    resolved: number;
    closed: number;
  };
  priority: {
    urgent: number;
    high: number;
  };
  categories: Array<{
    category: string;
    count: number;
  }>;
  recent: number;
}

export interface TicketFilters {
  page?: number;
  limit?: number;
  status?: string;
  priority?: string;
  category?: string;
  assignedTo?: number | string | null | undefined;
  search?: string;
}

export interface CreateTicketRequest {
  subject: string;
  message: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  category: 'delivery' | 'product_quality' | 'payment' | 'general' | 'refund' | 'exchange';
  purchaseId?: number;
  attachmentUrls?: string[];
}

export interface UpdateTicketRequest {
  status?: 'open' | 'in_progress' | 'resolved' | 'closed';
  priority?: 'low' | 'medium' | 'high' | 'urgent';
  assignedTo?: number | null;
  resolution?: string;
}

export interface PaginationInfo {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  pagination?: PaginationInfo;
}

// Utility types for form handling
export interface TicketFormData {
  subject: string;
  message: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  category: 'delivery' | 'product_quality' | 'payment' | 'general' | 'refund' | 'exchange';
  purchaseId?: number;
}

// Constants for UI rendering
export const TICKET_STATUSES = {
  open: 'Open',
  in_progress: 'In Progress',
  resolved: 'Resolved',
  closed: 'Closed'
} as const;

export const TICKET_PRIORITIES = {
  low: 'Low',
  medium: 'Medium',
  high: 'High',
  urgent: 'Urgent'
} as const;

export const TICKET_CATEGORIES = {
  delivery: 'Delivery Issue',
  product_quality: 'Product Quality',
  payment: 'Payment Issue',
  general: 'General Inquiry',
  refund: 'Refund Request',
  exchange: 'Exchange Request'
} as const;

// Helper functions
export const getStatusColor = (status: string): string => {
  switch (status) {
    case 'open': return '#f59e0b';
    case 'in_progress': return '#3b82f6';
    case 'resolved': return '#10b981';
    case 'closed': return '#6b7280';
    default: return '#6b7280';
  }
};

export const getPriorityColor = (priority: string): string => {
  switch (priority) {
    case 'urgent': return '#dc2626';
    case 'high': return '#ea580c';
    case 'medium': return '#ca8a04';
    case 'low': return '#65a30d';
    default: return '#6b7280';
  }
};

export const getStatusBadgeStyle = (status: string) => ({
  backgroundColor: getStatusColor(status),
  color: 'white',
  padding: '4px 12px',
  borderRadius: '12px',
  fontSize: '12px',
  fontWeight: '600',
  textTransform: 'capitalize' as const
});

export const getPriorityBadgeStyle = (priority: string) => ({
  backgroundColor: getPriorityColor(priority),
  color: 'white',
  padding: '4px 12px',
  borderRadius: '12px',
  fontSize: '12px',
  fontWeight: '600',
  textTransform: 'capitalize' as const
});
