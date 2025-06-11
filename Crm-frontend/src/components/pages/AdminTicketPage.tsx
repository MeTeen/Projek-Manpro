import React, { useEffect, useState } from 'react';
import Sidebar from '../dashboard/Sidebar';
import Header from '../dashboard/Header';
import ticketService, { Ticket, TicketStats, Admin, TicketFilters } from '../../services/ticketService';
import { toast } from 'react-toastify';

const AdminTicketPage: React.FC = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [stats, setStats] = useState<TicketStats | null>(null);
  const [admins, setAdmins] = useState<Admin[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  
  // Filter states
  const [filters, setFilters] = useState<TicketFilters>({
    page: 1,
    limit: 10,
    status: '',
    priority: '',
    category: '',
    assignedTo: undefined,
    search: ''
  });
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 0
  });

  const toggleSidebar = () => setSidebarCollapsed(!sidebarCollapsed);

  useEffect(() => {
    fetchInitialData();
  }, []);

  useEffect(() => {
    fetchTickets();
  }, [filters]);

  const fetchInitialData = async () => {
    try {
      const [statsResponse, adminsResponse] = await Promise.all([
        ticketService.getTicketStats(),
        ticketService.getAdminsForAssignment()
      ]);
      setStats(statsResponse.data);
      setAdmins(adminsResponse.data);
    } catch (error) {
      console.error('Failed to fetch initial data', error);
      toast.error('Failed to load dashboard data');
    }
  };

  const fetchTickets = async () => {
    try {
      setLoading(true);
      const response = await ticketService.getAllTickets(filters);
      setTickets(response.data);
      setPagination(response.pagination);
    } catch (error) {
      console.error('Failed to fetch tickets', error);
      toast.error('Failed to load tickets');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (ticketId: number, newStatus: Ticket['status']) => {
    try {
      await ticketService.updateTicket(ticketId, { status: newStatus });
      await fetchTickets();
      await fetchInitialData(); // Refresh stats
      toast.success('Ticket status updated successfully');
    } catch (error) {
      console.error('Failed to update ticket status', error);
      toast.error('Failed to update ticket status');
    }
  };

  const handleAssignTicket = async (ticketId: number, adminId: number | null) => {
    try {
      await ticketService.updateTicket(ticketId, { assignedTo: adminId });
      await fetchTickets();
      toast.success('Ticket assigned successfully');
    } catch (error) {
      console.error('Failed to assign ticket', error);
      toast.error('Failed to assign ticket');
    }
  };

  const handlePriorityChange = async (ticketId: number, newPriority: Ticket['priority']) => {
    try {
      await ticketService.updateTicket(ticketId, { priority: newPriority });
      await fetchTickets();
      toast.success('Ticket priority updated successfully');
    } catch (error) {
      console.error('Failed to update ticket priority', error);
      toast.error('Failed to update ticket priority');
    }
  };

  const openTicketDetail = async (ticket: Ticket) => {
    try {
      const response = await ticketService.getTicketById(ticket.id);
      setSelectedTicket(response.data);
      setShowDetailModal(true);
    } catch (error) {
      console.error('Failed to fetch ticket details', error);
      toast.error('Failed to load ticket details');
    }
  };

  const handleFilterChange = (key: keyof TicketFilters, value: any) => {
    setFilters(prev => ({
      ...prev,
      [key]: value,
      page: key !== 'page' ? 1 : value // Reset to first page when changing filters
    }));
  };

  const getPriorityBadgeStyle = (priority: string) => ({
    backgroundColor: ticketService.getPriorityColor(priority),
    color: 'white',
    padding: '4px 8px',
    borderRadius: '12px',
    fontSize: '12px',
    fontWeight: '600'
  });

  const getStatusBadgeStyle = (status: string) => ({
    backgroundColor: ticketService.getStatusColor(status),
    color: 'white',
    padding: '4px 8px',
    borderRadius: '12px',
    fontSize: '12px',
    fontWeight: '600'
  });

  return (
    <div style={{ display: 'flex', height: '100vh' }}>
      <Sidebar collapsed={sidebarCollapsed} onToggle={toggleSidebar} />
      <div style={{ flex: 1, overflowY: 'auto', backgroundColor: '#f8fafc' }}>
        <div style={{ padding: '20px 30px' }}>
          <Header onAddNewClick={() => {}} onCustomerCreated={() => {}} />
          
          {/* Page Header */}
          <div style={{ marginBottom: '24px' }}>
            <h1 style={{ fontSize: '32px', fontWeight: 'bold', color: '#1e293b', marginBottom: '8px' }}>
              🎫 Ticket Management
            </h1>
            <p style={{ color: '#64748b', fontSize: '16px' }}>
              Manage customer complaints and support requests
            </p>
          </div>

          {/* Stats Cards */}
          {stats && (
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
              gap: '16px', 
              marginBottom: '24px' 
            }}>
              <div style={{ 
                backgroundColor: 'white', 
                padding: '20px', 
                borderRadius: '12px', 
                boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                border: '1px solid #e2e8f0'
              }}>
                <div style={{ fontSize: '24px', marginBottom: '8px' }}>📊</div>
                <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#1e293b' }}>{stats.overview.total}</div>
                <div style={{ fontSize: '14px', color: '#64748b' }}>Total Tickets</div>
              </div>
              
              <div style={{ 
                backgroundColor: 'white', 
                padding: '20px', 
                borderRadius: '12px', 
                boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                border: '1px solid #e2e8f0'
              }}>
                <div style={{ fontSize: '24px', marginBottom: '8px' }}>🔓</div>
                <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#ef4444' }}>{stats.overview.open}</div>
                <div style={{ fontSize: '14px', color: '#64748b' }}>Open Tickets</div>
              </div>
              
              <div style={{ 
                backgroundColor: 'white', 
                padding: '20px', 
                borderRadius: '12px', 
                boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                border: '1px solid #e2e8f0'
              }}>
                <div style={{ fontSize: '24px', marginBottom: '8px' }}>⏳</div>
                <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#f59e0b' }}>{stats.overview.inProgress}</div>
                <div style={{ fontSize: '14px', color: '#64748b' }}>In Progress</div>
              </div>
              
              <div style={{ 
                backgroundColor: 'white', 
                padding: '20px', 
                borderRadius: '12px', 
                boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                border: '1px solid #e2e8f0'
              }}>
                <div style={{ fontSize: '24px', marginBottom: '8px' }}>🚨</div>
                <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#dc2626' }}>{stats.priority.urgent}</div>
                <div style={{ fontSize: '14px', color: '#64748b' }}>Urgent Tickets</div>
              </div>
            </div>
          )}

          {/* Filters */}
          <div style={{ 
            backgroundColor: 'white', 
            padding: '20px', 
            borderRadius: '12px', 
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
            marginBottom: '24px',
            border: '1px solid #e2e8f0'
          }}>
            <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '16px', color: '#1e293b' }}>
              🔍 Filters
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '4px', fontSize: '14px', fontWeight: '500' }}>Search</label>
                <input
                  type="text"
                  value={filters.search}
                  onChange={(e) => handleFilterChange('search', e.target.value)}
                  placeholder="Search subject or message..."
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    border: '1px solid #d1d5db',
                    borderRadius: '6px',
                    fontSize: '14px'
                  }}
                />
              </div>
              
              <div>
                <label style={{ display: 'block', marginBottom: '4px', fontSize: '14px', fontWeight: '500' }}>Status</label>
                <select
                  value={filters.status}
                  onChange={(e) => handleFilterChange('status', e.target.value)}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    border: '1px solid #d1d5db',
                    borderRadius: '6px',
                    fontSize: '14px'
                  }}
                >
                  <option value="">All Status</option>
                  <option value="Open">Open</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Resolved">Resolved</option>
                  <option value="Closed">Closed</option>
                </select>
              </div>
              
              <div>
                <label style={{ display: 'block', marginBottom: '4px', fontSize: '14px', fontWeight: '500' }}>Priority</label>
                <select
                  value={filters.priority}
                  onChange={(e) => handleFilterChange('priority', e.target.value)}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    border: '1px solid #d1d5db',
                    borderRadius: '6px',
                    fontSize: '14px'
                  }}
                >
                  <option value="">All Priorities</option>
                  <option value="Urgent">Urgent</option>
                  <option value="High">High</option>
                  <option value="Medium">Medium</option>
                  <option value="Low">Low</option>
                </select>
              </div>
              
              <div>
                <label style={{ display: 'block', marginBottom: '4px', fontSize: '14px', fontWeight: '500' }}>Category</label>
                <select
                  value={filters.category}
                  onChange={(e) => handleFilterChange('category', e.target.value)}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    border: '1px solid #d1d5db',
                    borderRadius: '6px',
                    fontSize: '14px'
                  }}
                >
                  <option value="">All Categories</option>
                  <option value="Delivery">Delivery</option>
                  <option value="Product Quality">Product Quality</option>
                  <option value="Payment">Payment</option>
                  <option value="General">General</option>
                  <option value="Refund">Refund</option>
                  <option value="Exchange">Exchange</option>
                </select>
              </div>
            </div>
          </div>

          {/* Tickets List */}
          <div style={{ 
            backgroundColor: 'white', 
            borderRadius: '12px', 
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
            border: '1px solid #e2e8f0'
          }}>
            <div style={{ padding: '20px', borderBottom: '1px solid #e2e8f0' }}>
              <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#1e293b' }}>
                📋 Tickets ({pagination.total})
              </h3>
            </div>
            
            {loading ? (
              <div style={{ padding: '40px', textAlign: 'center', color: '#64748b' }}>
                Loading tickets...
              </div>
            ) : tickets.length === 0 ? (
              <div style={{ padding: '40px', textAlign: 'center', color: '#64748b' }}>
                No tickets found
              </div>
            ) : (
              <>                {tickets.map((ticket) => (
                  <div
                    key={ticket.id}
                    style={{
                      padding: '20px',
                      borderBottom: '1px solid #f1f5f9',
                      cursor: 'pointer',
                      transition: 'background-color 0.2s'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f8fafc'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'white'}
                    onClick={() => openTicketDetail(ticket)}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                          <span style={{ fontSize: '20px' }}>{ticketService.getPriorityIcon(ticket.priority)}</span>
                          <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#1e293b', margin: 0 }}>
                            #{ticket.id} - {ticket.subject}
                          </h3>
                          <span style={getPriorityBadgeStyle(ticket.priority)}>
                            {ticket.priority}
                          </span>
                          <span style={getStatusBadgeStyle(ticket.status)}>
                            {ticketService.getStatusIcon(ticket.status)} {ticket.status}
                          </span>
                        </div>
                        
                        <p style={{ color: '#64748b', fontSize: '14px', margin: '0 0 8px 0' }}>
                          Customer: <strong>{ticket.customer?.firstName} {ticket.customer?.lastName}</strong> ({ticket.customer?.email})
                        </p>
                        
                        <p style={{ color: '#64748b', fontSize: '14px', margin: '0 0 8px 0' }}>
                          Category: <strong>{ticket.category}</strong> | 
                          Created: <strong>{new Date(ticket.createdAt).toLocaleDateString()}</strong>
                        </p>
                        
                        <p style={{ color: '#374151', fontSize: '14px', lineHeight: '1.4' }}>
                          {ticket.message.length > 150 ? `${ticket.message.substring(0, 150)}...` : ticket.message}
                        </p>
                        
                        {ticket.purchase && (
                          <div style={{ 
                            backgroundColor: '#f0f9ff', 
                            padding: '8px 12px', 
                            borderRadius: '6px', 
                            marginTop: '8px',
                            fontSize: '12px',
                            color: '#0369a1'
                          }}>
                            🛒 Related Purchase: {ticket.purchase.product?.name} (Qty: {ticket.purchase.quantity})
                          </div>
                        )}
                      </div>
                      
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', minWidth: '200px' }}>
                        <select
                          value={ticket.status}
                          onChange={(e) => {
                            e.stopPropagation();
                            handleStatusChange(ticket.id, e.target.value as Ticket['status']);
                          }}
                          style={{
                            padding: '6px 10px',
                            borderRadius: '6px',
                            border: '1px solid #d1d5db',
                            fontSize: '12px',
                            backgroundColor: 'white'
                          }}
                        >
                          <option value="Open">Open</option>
                          <option value="In Progress">In Progress</option>
                          <option value="Resolved">Resolved</option>
                          <option value="Closed">Closed</option>
                        </select>
                        
                        <select
                          value={ticket.priority}
                          onChange={(e) => {
                            e.stopPropagation();
                            handlePriorityChange(ticket.id, e.target.value as Ticket['priority']);
                          }}
                          style={{
                            padding: '6px 10px',
                            borderRadius: '6px',
                            border: '1px solid #d1d5db',
                            fontSize: '12px',
                            backgroundColor: 'white'
                          }}
                        >
                          <option value="Low">Low</option>
                          <option value="Medium">Medium</option>
                          <option value="High">High</option>
                          <option value="Urgent">Urgent</option>
                        </select>
                        
                        <select
                          value={ticket.assignedTo || ''}
                          onChange={(e) => {
                            e.stopPropagation();
                            handleAssignTicket(ticket.id, e.target.value ? parseInt(e.target.value) : null);
                          }}
                          style={{
                            padding: '6px 10px',
                            borderRadius: '6px',
                            border: '1px solid #d1d5db',
                            fontSize: '12px',
                            backgroundColor: 'white'
                          }}
                        >
                          <option value="">Unassigned</option>
                          {admins.map(admin => (
                            <option key={admin.id} value={admin.id}>
                              {admin.username}
                            </option>
                          ))}
                        </select>
                        
                        {ticket.assignedAdmin && (
                          <div style={{ fontSize: '11px', color: '#059669' }}>
                            ✓ Assigned to {ticket.assignedAdmin.username}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}              </>
            )}
            
            {/* Pagination */}
            {pagination.totalPages > 1 && (
              <div style={{ 
                padding: '20px', 
                borderTop: '1px solid #e2e8f0',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <div style={{ fontSize: '14px', color: '#64748b' }}>
                  Showing {(pagination.page - 1) * pagination.limit + 1} to {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} tickets
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    onClick={() => handleFilterChange('page', pagination.page - 1)}
                    disabled={pagination.page <= 1}
                    style={{
                      padding: '8px 12px',
                      border: '1px solid #d1d5db',
                      borderRadius: '6px',
                      backgroundColor: pagination.page <= 1 ? '#f9fafb' : 'white',
                      color: pagination.page <= 1 ? '#9ca3af' : '#374151',
                      cursor: pagination.page <= 1 ? 'not-allowed' : 'pointer'
                    }}
                  >
                    Previous
                  </button>
                  
                  {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                    const page = i + 1;
                    return (
                      <button
                        key={page}
                        onClick={() => handleFilterChange('page', page)}
                        style={{
                          padding: '8px 12px',
                          border: '1px solid #d1d5db',
                          borderRadius: '6px',
                          backgroundColor: pagination.page === page ? '#3b82f6' : 'white',
                          color: pagination.page === page ? 'white' : '#374151',
                          cursor: 'pointer'
                        }}
                      >
                        {page}
                      </button>
                    );
                  })}
                  
                  <button
                    onClick={() => handleFilterChange('page', pagination.page + 1)}
                    disabled={pagination.page >= pagination.totalPages}
                    style={{
                      padding: '8px 12px',
                      border: '1px solid #d1d5db',
                      borderRadius: '6px',
                      backgroundColor: pagination.page >= pagination.totalPages ? '#f9fafb' : 'white',
                      color: pagination.page >= pagination.totalPages ? '#9ca3af' : '#374151',
                      cursor: pagination.page >= pagination.totalPages ? 'not-allowed' : 'pointer'
                    }}
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </div>
          
          {/* Ticket Detail Modal */}
          {showDetailModal && selectedTicket && (
            <div style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'rgba(0, 0, 0, 0.5)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 1000
            }}>
              <div style={{
                backgroundColor: 'white',
                borderRadius: '12px',
                padding: '24px',
                maxWidth: '800px',
                width: '90%',
                maxHeight: '90vh',
                overflowY: 'auto'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                  <h2 style={{ fontSize: '24px', fontWeight: 'bold', color: '#1e293b' }}>
                    Ticket #{selectedTicket.id} Details
                  </h2>
                  <button
                    onClick={() => setShowDetailModal(false)}
                    style={{
                      background: 'none',
                      border: 'none',
                      fontSize: '24px',
                      cursor: 'pointer',
                      color: '#64748b'
                    }}
                  >
                    ×
                  </button>
                </div>
                
                <div style={{ display: 'grid', gap: '16px' }}>
                  <div>
                    <strong>Subject:</strong> {selectedTicket.subject}
                  </div>
                  <div>
                    <strong>Customer:</strong> {selectedTicket.customer?.firstName} {selectedTicket.customer?.lastName}
                    <br />
                    <span style={{ color: '#64748b' }}>
                      {selectedTicket.customer?.email} | {selectedTicket.customer?.phone}
                    </span>
                  </div>
                  <div>
                    <strong>Message:</strong>
                    <div style={{ 
                      backgroundColor: '#f8fafc', 
                      padding: '12px', 
                      borderRadius: '8px', 
                      marginTop: '8px',
                      lineHeight: '1.5'
                    }}>
                      {selectedTicket.message}
                    </div>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                    <div>
                      <strong>Status:</strong> <span style={getStatusBadgeStyle(selectedTicket.status)}>{selectedTicket.status}</span>
                    </div>
                    <div>
                      <strong>Priority:</strong> <span style={getPriorityBadgeStyle(selectedTicket.priority)}>{selectedTicket.priority}</span>
                    </div>
                    <div>
                      <strong>Category:</strong> {selectedTicket.category}
                    </div>
                    <div>
                      <strong>Created:</strong> {new Date(selectedTicket.createdAt).toLocaleString()}
                    </div>
                  </div>
                  
                  {selectedTicket.purchase && (
                    <div>
                      <strong>Related Purchase:</strong>
                      <div style={{ 
                        backgroundColor: '#f0f9ff', 
                        padding: '12px', 
                        borderRadius: '8px', 
                        marginTop: '8px'
                      }}>
                        Product: {selectedTicket.purchase.product?.name}<br />
                        Quantity: {selectedTicket.purchase.quantity}<br />
                        Price: Rp {selectedTicket.purchase.price?.toLocaleString()}<br />
                        Purchase Date: {new Date(selectedTicket.purchase.purchaseDate).toLocaleDateString()}
                      </div>
                    </div>
                  )}
                  
                  {selectedTicket.assignedAdmin && (
                    <div>
                      <strong>Assigned to:</strong> {selectedTicket.assignedAdmin.username} ({selectedTicket.assignedAdmin.email})
                    </div>
                  )}
                  
                  {selectedTicket.resolution && (
                    <div>
                      <strong>Resolution:</strong>
                      <div style={{ 
                        backgroundColor: '#f0fdf4', 
                        padding: '12px', 
                        borderRadius: '8px', 
                        marginTop: '8px',
                        lineHeight: '1.5'
                      }}>
                        {selectedTicket.resolution}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminTicketPage;
