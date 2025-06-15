import React, { useState, useEffect, useRef } from 'react';
import { 
  Ticket, 
  TicketStats, 
  TicketMessage, 
  TicketFilters,
  Admin,
  TICKET_STATUSES,
  TICKET_PRIORITIES,
  TICKET_CATEGORIES,
  getStatusBadgeStyle,
  getPriorityBadgeStyle
} from '../../types/ticket';
import adminTicketService from '../../services/adminTicketService';
import ticketMessageService from '../../services/ticketMessageService';
import Sidebar from '../../components/dashboard/Sidebar';
import Header from '../../components/dashboard/Header';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-toastify';

// Add CSS animations
const styles = `
  @keyframes pulse {
    0%, 100% {
      opacity: 1;
    }
    50% {
      opacity: 0.5;
    }
  }
`;

const AdminTicketPage: React.FC = () => {
  const { user } = useAuth(); // Get current admin user
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [stats, setStats] = useState<TicketStats | null>(null);
  const [admins, setAdmins] = useState<Admin[]>([]);  const [loading, setLoading] = useState(true);
  
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

  // Chat modal states
  const [showChatModal, setShowChatModal] = useState(false);
  const [chatTicket, setChatTicket] = useState<Ticket | null>(null);
  const [messages, setMessages] = useState<TicketMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [messagesLoading, setMessagesLoading] = useState(false);
  const [sendingMessage, setSendingMessage] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

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
        adminTicketService.getTicketStats(),
        adminTicketService.getAdminsForAssignment()
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
      const response = await adminTicketService.getAllTickets(filters);
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
      await adminTicketService.updateTicket(ticketId, { status: newStatus });
      await fetchTickets();
      await fetchInitialData(); // Refresh stats
      toast.success('Ticket status updated successfully');
    } catch (error) {
      console.error('Failed to update ticket status', error);
      toast.error('Failed to update ticket status');
    }
  };
  const handleClaimTicket = async (ticketId: number, allowReclaim = false) => {
    try {
      const response = await adminTicketService.claimTicket(ticketId, allowReclaim);
      if (response.success) {
        await fetchTickets();
        await fetchInitialData(); // Refresh stats
        toast.success('Ticket claimed successfully');
      } else {
        // Handle specific error cases
        if (response.message?.includes('already claimed')) {
          toast.error(response.message);
        } else {
          toast.error('Failed to claim ticket');
        }
      }
    } catch (error) {
      console.error('Failed to claim ticket', error);
      toast.error('Failed to claim ticket');
    }
  };

  const handleReleaseTicket = async (ticketId: number) => {
    try {
      const response = await adminTicketService.releaseTicket(ticketId);
      if (response.success) {
        await fetchTickets();
        await fetchInitialData(); // Refresh stats
        toast.success('Ticket released successfully');
      } else {
        toast.error('Failed to release ticket');
      }
    } catch (error) {
      console.error('Failed to release ticket', error);
      toast.error('Failed to release ticket');
    }
  };
  const handlePriorityChange = async (ticketId: number, newPriority: Ticket['priority']) => {
    try {
      await adminTicketService.updateTicket(ticketId, { priority: newPriority });
      await fetchTickets();
      toast.success('Ticket priority updated successfully');
    } catch (error) {
      console.error('Failed to update ticket priority', error);
      toast.error('Failed to update ticket priority');
    }
  };

  // Chat functions
  const fetchMessages = async (ticketId: number) => {
    try {
      setMessagesLoading(true);
      const response = await ticketMessageService.getTicketMessages(ticketId);
      if (response.success) {
        setMessages(response.data.messages);
        setTimeout(() => scrollToBottom(), 100);
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
      toast.error('Failed to load messages');
    } finally {
      setMessagesLoading(false);
    }
  };

  const openChatModal = async (ticket: Ticket) => {
    setChatTicket(ticket);
    setShowChatModal(true);
    await fetchMessages(ticket.id);
  };

  const closeChatModal = () => {
    setShowChatModal(false);
    setChatTicket(null);
    setMessages([]);
    setNewMessage('');
  };

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !chatTicket) return;

    try {
      setSendingMessage(true);
      const response = await ticketMessageService.createMessage(chatTicket.id, {
        message: newMessage.trim()
      });
      
      if (response.success) {
        setMessages(prev => [...prev, response.data]);
        setNewMessage('');
        setTimeout(() => scrollToBottom(), 100);
      }
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Failed to send message');
    } finally {
      setSendingMessage(false);
    }
  };

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const formatMessageTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);
    
    if (diffInHours < 24) {
      return date.toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit' 
      });
    } else {
      return date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric',
        hour: '2-digit', 
        minute: '2-digit'
      });
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleFilterChange = (key: keyof TicketFilters, value: any) => {
    setFilters(prev => ({
      ...prev,
      [key]: value,
      page: key !== 'page' ? 1 : value // Reset to first page when changing filters
    }));
  };

  const getResponseTime = (ticket: Ticket): string => {
    if (!ticket.firstResponseAt) return 'No response yet';
    
    const created = new Date(ticket.createdAt);
    const firstResponse = new Date(ticket.firstResponseAt);
    const diffHours = Math.round((firstResponse.getTime() - created.getTime()) / (1000 * 60 * 60));
    
    if (diffHours < 1) return 'Less than 1 hour';
    if (diffHours < 24) return `${diffHours} hours`;
    return `${Math.round(diffHours / 24)} days`;
  };

  const isEscalated = (ticket: Ticket): boolean => {
    const created = new Date(ticket.createdAt);
    const now = new Date();
    const hoursOld = (now.getTime() - created.getTime()) / (1000 * 60 * 60);
    
    // Escalation rules
    if (ticket.priority === 'urgent' && hoursOld > 2) return true;
    if (ticket.priority === 'high' && hoursOld > 8) return true;
    if (ticket.priority === 'medium' && hoursOld > 24) return true;
    if (ticket.priority === 'low' && hoursOld > 72) return true;
    
    return false;
  };
  return (
    <div style={{ display: 'flex', height: '100vh' }}>
      <style dangerouslySetInnerHTML={{ __html: styles }} />
      <Sidebar collapsed={sidebarCollapsed} onToggle={toggleSidebar} />
      <div style={{ flex: 1, overflowY: 'auto', backgroundColor: '#f8fafc' }}>
        <div style={{ padding: '20px 30px' }}>
          <Header onAddNewClick={() => {}} onCustomerCreated={() => {}} />
          
          {/* Page Header */}
          <div style={{ marginBottom: '24px' }}>
            <h1 style={{ fontSize: '32px', fontWeight: 'bold', color: '#1e293b', marginBottom: '8px' }}>
              🎫 Ticket Management System
            </h1>
            <p style={{ color: '#64748b', fontSize: '16px' }}>
              Manage customer support tickets efficiently with real-time updates and analytics
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
                <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#f59e0b' }}>{stats.overview.open}</div>
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
                <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#3b82f6' }}>{stats.overview.inProgress}</div>
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

              <div style={{ 
                backgroundColor: 'white', 
                padding: '20px', 
                borderRadius: '12px', 
                boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                border: '1px solid #e2e8f0'
              }}>
                <div style={{ fontSize: '24px', marginBottom: '8px' }}>📈</div>
                <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#10b981' }}>{stats.recent}</div>
                <div style={{ fontSize: '14px', color: '#64748b' }}>This Week</div>
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
              🔍 Advanced Filters
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
                  {Object.entries(TICKET_STATUSES).map(([key, label]) => (
                    <option key={key} value={key}>{label}</option>
                  ))}
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
                  {Object.entries(TICKET_PRIORITIES).map(([key, label]) => (
                    <option key={key} value={key}>{label}</option>
                  ))}
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
                  {Object.entries(TICKET_CATEGORIES).map(([key, label]) => (
                    <option key={key} value={key}>{label}</option>
                  ))}
                </select>
              </div>              <div>
                <label style={{ display: 'block', marginBottom: '4px', fontSize: '14px', fontWeight: '500' }}>Assignment</label>
                <select
                  value={
                    filters.assignedTo === parseInt(user?.id || '0') ? 'my_tickets' :
                    filters.assignedTo === null ? 'unassigned' :
                    filters.assignedTo === undefined ? 'all' : 
                    filters.assignedTo.toString()
                  }
                  onChange={(e) => {
                    const value = e.target.value;
                    if (value === 'my_tickets') {
                      handleFilterChange('assignedTo', parseInt(user?.id || '0'));
                    } else if (value === 'unassigned') {
                      handleFilterChange('assignedTo', null);
                    } else if (value === 'all') {
                      handleFilterChange('assignedTo', undefined);
                    } else {
                      handleFilterChange('assignedTo', parseInt(value));
                    }
                  }}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    border: '1px solid #d1d5db',
                    borderRadius: '6px',
                    fontSize: '14px'
                  }}
                >
                  <option value="all">All Tickets</option>
                  <option value="my_tickets">🎯 My Tickets</option>
                  <option value="unassigned">📭 Unassigned</option>
                  {admins.filter(admin => admin.id !== parseInt(user?.id || '0')).map((admin) => (
                    <option key={admin.id} value={admin.id}>{admin.username}'s Tickets</option>
                  ))}
                </select>
              </div>
            </div>
          </div>          {/* Tickets List */}
          <div style={{ 
            backgroundColor: 'white', 
            borderRadius: '16px', 
            boxShadow: '0 4px 6px rgba(0,0,0,0.05), 0 1px 3px rgba(0,0,0,0.1)',
            border: '1px solid #e2e8f0',
            overflow: 'hidden'
          }}>
            <div style={{ 
              padding: '24px 28px', 
              borderBottom: '2px solid #f1f5f9',
              background: 'linear-gradient(135deg, #1e293b 0%, #334155 100%)',
              color: 'white'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 style={{ fontSize: '20px', fontWeight: '700', margin: 0, display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <span style={{ fontSize: '24px' }}>🎫</span>
                  Support Tickets
                  <span style={{ 
                    backgroundColor: 'rgba(255,255,255,0.2)', 
                    padding: '4px 12px', 
                    borderRadius: '20px', 
                    fontSize: '14px', 
                    fontWeight: '600' 
                  }}>
                    {pagination.total}
                  </span>
                </h3>
                <div style={{ fontSize: '14px', opacity: 0.9 }}>
                  Page {pagination.page} of {pagination.totalPages}
                </div>
              </div>
            </div>
            
            {loading ? (
              <div style={{ padding: '60px', textAlign: 'center', color: '#64748b' }}>
                <div style={{ 
                  fontSize: '48px', 
                  marginBottom: '16px',
                  background: 'linear-gradient(45deg, #1e293b, #3b82f6)',
                  backgroundClip: 'text',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent'
                }}>
                  ⏳
                </div>
                <div style={{ fontSize: '18px', fontWeight: '500' }}>Loading tickets...</div>
                <div style={{ fontSize: '14px', marginTop: '4px' }}>Please wait while we fetch the latest data</div>
              </div>
            ) : tickets.length === 0 ? (
              <div style={{ padding: '60px', textAlign: 'center', color: '#64748b' }}>
                <div style={{ 
                  fontSize: '48px', 
                  marginBottom: '16px',
                  background: 'linear-gradient(45deg, #64748b, #94a3b8)',
                  backgroundClip: 'text',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent'
                }}>
                  📭
                </div>
                <div style={{ fontSize: '18px', fontWeight: '500' }}>No tickets found</div>
                <div style={{ fontSize: '14px', marginTop: '4px' }}>Try adjusting your filters to see more results</div>
              </div>
            ) : (              <div style={{ padding: '16px' }}>
                {tickets.map((ticket) => (                  <div
                    key={ticket.id}
                    style={{
                      marginBottom: '16px',
                      backgroundColor: isEscalated(ticket) ? '#fef2f2' : 'white',
                      border: isEscalated(ticket) ? '2px solid #ef4444' : '1px solid #e2e8f0',
                      borderRadius: '12px',
                      padding: '20px',
                      transition: 'all 0.3s ease',
                      boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                      position: 'relative',
                      overflow: 'hidden'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'translateY(-2px)';
                      e.currentTarget.style.boxShadow = '0 8px 25px rgba(0,0,0,0.15)';
                      e.currentTarget.style.borderColor = '#1e293b';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.1)';
                      e.currentTarget.style.borderColor = isEscalated(ticket) ? '#ef4444' : '#e2e8f0';
                    }}
                  >
                    {/* Escalation Indicator */}
                    {isEscalated(ticket) && (
                      <div style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        height: '4px',
                        background: 'linear-gradient(90deg, #ef4444, #dc2626)',
                        animation: 'pulse 2s infinite'
                      }} />
                    )}
                    
                    {/* Main Content */}
                    <div style={{ display: 'flex', gap: '20px' }}>
                      {/* Left Section - Ticket Info */}
                      <div style={{ flex: 1 }}>
                        {/* Header with ID and Title */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px', flexWrap: 'wrap' }}>
                          <div style={{ 
                            backgroundColor: '#1e293b', 
                            color: 'white', 
                            padding: '6px 12px', 
                            borderRadius: '8px', 
                            fontSize: '14px', 
                            fontWeight: '700',
                            letterSpacing: '0.5px'
                          }}>
                            #{ticket.id}
                          </div>
                          <h4 style={{ 
                            margin: 0, 
                            fontSize: '18px', 
                            fontWeight: '600', 
                            color: '#1e293b',
                            flex: 1,
                            minWidth: '200px'
                          }}>
                            {ticket.subject}
                          </h4>
                        </div>

                        {/* Badges Row */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px', flexWrap: 'wrap' }}>
                          {isEscalated(ticket) && (
                            <span style={{
                              backgroundColor: '#ef4444',
                              color: 'white',
                              padding: '6px 12px',
                              borderRadius: '20px',
                              fontSize: '12px',
                              fontWeight: '700',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '4px',
                              animation: 'pulse 2s infinite'
                            }}>
                              🚨 ESCALATED
                            </span>
                          )}
                          <span style={{
                            ...getStatusBadgeStyle(ticket.status),
                            padding: '6px 14px',
                            borderRadius: '20px',
                            fontSize: '12px',
                            fontWeight: '600'
                          }}>
                            {TICKET_STATUSES[ticket.status]}
                          </span>
                          <span style={{
                            ...getPriorityBadgeStyle(ticket.priority),
                            padding: '6px 14px',
                            borderRadius: '20px',
                            fontSize: '12px',
                            fontWeight: '600'
                          }}>
                            {TICKET_PRIORITIES[ticket.priority]}
                          </span>
                          <span style={{
                            backgroundColor: '#f1f5f9',
                            color: '#475569',
                            padding: '6px 14px',
                            borderRadius: '20px',
                            fontSize: '12px',
                            fontWeight: '600'
                          }}>
                            {TICKET_CATEGORIES[ticket.category]}
                          </span>
                        </div>

                        {/* Customer Info */}
                        <div style={{ 
                          backgroundColor: '#f8fafc', 
                          padding: '12px 16px', 
                          borderRadius: '8px', 
                          marginBottom: '12px',
                          border: '1px solid #e2e8f0'
                        }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                            <span style={{ fontSize: '16px' }}>👤</span>
                            <span style={{ fontSize: '14px', fontWeight: '600', color: '#374151' }}>
                              {ticket.customer?.firstName} {ticket.customer?.lastName}
                            </span>
                          </div>
                          <div style={{ fontSize: '13px', color: '#64748b', marginLeft: '24px' }}>
                            📧 {ticket.customer?.email}
                          </div>
                        </div>

                        {/* Timeline Info */}
                        <div style={{ display: 'flex', gap: '20px', marginBottom: '12px', fontSize: '13px', color: '#64748b' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <span>🕒</span>
                            <span>Created: {formatDate(ticket.createdAt)}</span>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <span>⏱️</span>
                            <span>Response: {getResponseTime(ticket)}</span>
                          </div>
                        </div>

                        {/* Message Preview */}
                        <div style={{ 
                          backgroundColor: '#fafafa', 
                          padding: '14px', 
                          borderRadius: '8px', 
                          marginBottom: '12px',
                          borderLeft: '4px solid #1e293b'
                        }}>
                          <p style={{ 
                            color: '#374151', 
                            fontSize: '14px', 
                            lineHeight: '1.5', 
                            margin: 0,
                            fontStyle: 'italic'
                          }}>
                            "{ticket.message.length > 150 
                              ? `${ticket.message.substring(0, 150)}...` 
                              : ticket.message}"
                          </p>
                        </div>
                        
                        {/* Purchase Info */}
                        {ticket.purchase && (
                          <div style={{ 
                            backgroundColor: '#fff7ed', 
                            padding: '10px 14px', 
                            borderRadius: '8px',
                            border: '1px solid #fed7aa',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px'
                          }}>
                            <span style={{ fontSize: '16px' }}>🛒</span>
                            <span style={{ color: '#c2410c', fontSize: '14px', fontWeight: '500' }}>
                              Related Purchase: {ticket.purchase.product.name} (#{ticket.purchase.id})
                            </span>
                          </div>
                        )}
                      </div>
                      
                      {/* Right Section - Actions */}
                      <div style={{ 
                        display: 'flex', 
                        flexDirection: 'column', 
                        gap: '12px', 
                        minWidth: '220px',
                        backgroundColor: '#f8fafc',
                        padding: '16px',
                        borderRadius: '10px',
                        border: '1px solid #e2e8f0'
                      }}>
                        <h5 style={{ margin: '0 0 8px 0', fontSize: '14px', fontWeight: '600', color: '#374151' }}>
                          Quick Actions
                        </h5>

                        {/* Status Dropdown */}
                        <div>
                          <label style={{ fontSize: '12px', color: '#64748b', fontWeight: '500', display: 'block', marginBottom: '4px' }}>
                            Status
                          </label>
                          <select
                            value={ticket.status}
                            onChange={(e) => {
                              e.stopPropagation();
                              handleStatusChange(ticket.id, e.target.value as Ticket['status']);
                            }}
                            style={{
                              width: '100%',
                              padding: '8px 12px',
                              border: '1px solid #d1d5db',
                              borderRadius: '8px',
                              fontSize: '13px',
                              backgroundColor: 'white',
                              cursor: 'pointer'
                            }}
                          >
                            {Object.entries(TICKET_STATUSES).map(([key, label]) => (
                              <option key={key} value={key}>{label}</option>
                            ))}
                          </select>
                        </div>

                        {/* Priority Dropdown */}
                        <div>
                          <label style={{ fontSize: '12px', color: '#64748b', fontWeight: '500', display: 'block', marginBottom: '4px' }}>
                            Priority
                          </label>
                          <select
                            value={ticket.priority}
                            onChange={(e) => {
                              e.stopPropagation();
                              handlePriorityChange(ticket.id, e.target.value as Ticket['priority']);
                            }}
                            style={{
                              width: '100%',
                              padding: '8px 12px',
                              border: '1px solid #d1d5db',
                              borderRadius: '8px',
                              fontSize: '13px',
                              backgroundColor: 'white',
                              cursor: 'pointer'
                            }}
                          >
                            {Object.entries(TICKET_PRIORITIES).map(([key, label]) => (
                              <option key={key} value={key}>{label}</option>
                            ))}
                          </select>
                        </div>                        {/* Claim/Release Section */}
                        <div>
                          <label style={{ fontSize: '12px', color: '#64748b', fontWeight: '500', display: 'block', marginBottom: '8px' }}>
                            Assignment Status
                          </label>
                          {ticket.assignedTo ? (
                            <div style={{ marginBottom: '8px' }}>
                              <div style={{ 
                                fontSize: '12px', 
                                color: ticket.assignedTo === parseInt(user?.id || '0') ? '#059669' : '#6b7280',
                                fontWeight: '600',
                                marginBottom: '6px'
                              }}>
                                {ticket.assignedTo === parseInt(user?.id || '0') 
                                  ? '✅ Claimed by You' 
                                  : `🔒 Claimed by ${ticket.assignedAdmin?.username || 'Unknown'}`
                                }
                              </div>
                              {ticket.assignedTo === parseInt(user?.id || '0') ? (
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleReleaseTicket(ticket.id);
                                  }}
                                  style={{
                                    width: '100%',
                                    padding: '8px 12px',
                                    backgroundColor: '#ef4444',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '8px',
                                    fontSize: '12px',
                                    fontWeight: '600',
                                    cursor: 'pointer',
                                    transition: 'all 0.2s ease'
                                  }}
                                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#dc2626'}
                                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#ef4444'}
                                >
                                  🔓 Release Ticket
                                </button>
                              ) : (
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    if (window.confirm(`This ticket is already claimed by ${ticket.assignedAdmin?.username}. Do you want to take it over?`)) {
                                      handleClaimTicket(ticket.id, true);
                                    }
                                  }}
                                  style={{
                                    width: '100%',
                                    padding: '8px 12px',
                                    backgroundColor: '#f59e0b',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '8px',
                                    fontSize: '12px',
                                    fontWeight: '600',
                                    cursor: 'pointer',
                                    transition: 'all 0.2s ease'
                                  }}
                                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#d97706'}
                                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#f59e0b'}
                                >
                                  ⚡ Take Over
                                </button>
                              )}
                            </div>
                          ) : (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleClaimTicket(ticket.id);
                              }}
                              style={{
                                width: '100%',
                                padding: '10px 12px',
                                backgroundColor: '#10b981',
                                color: 'white',
                                border: 'none',
                                borderRadius: '8px',
                                fontSize: '13px',
                                fontWeight: '600',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '6px',
                                transition: 'all 0.2s ease'
                              }}
                              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#059669'}
                              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#10b981'}
                            >
                              🎯 Claim Ticket
                            </button>
                          )}
                        </div>                        {/* Action Buttons */}
                        <div style={{ marginTop: '8px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              openChatModal(ticket);
                            }}
                            style={{
                              width: '100%',
                              padding: '10px 16px',
                              backgroundColor: '#1e293b',
                              color: 'white',
                              border: 'none',
                              borderRadius: '8px',
                              fontSize: '13px',
                              fontWeight: '600',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              gap: '6px',
                              transition: 'all 0.2s ease'
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#0f172a'}
                            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#1e293b'}
                          >
                            💬 Open Chat
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div style={{ 
              backgroundColor: 'white', 
              borderRadius: '16px', 
              boxShadow: '0 4px 6px rgba(0,0,0,0.05), 0 1px 3px rgba(0,0,0,0.1)',
              border: '1px solid #e2e8f0',
              marginTop: '16px',
              padding: '20px', 
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <div style={{ fontSize: '14px', color: '#64748b', fontWeight: '500' }}>
                Showing {(pagination.page - 1) * pagination.limit + 1} to {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} tickets
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  onClick={() => handleFilterChange('page', pagination.page - 1)}
                  disabled={pagination.page <= 1}
                  style={{
                    padding: '10px 16px',
                    border: '1px solid #d1d5db',
                    borderRadius: '8px',
                    backgroundColor: pagination.page <= 1 ? '#f9fafb' : 'white',
                    color: pagination.page <= 1 ? '#9ca3af' : '#374151',
                    cursor: pagination.page <= 1 ? 'not-allowed' : 'pointer',
                    fontSize: '14px',
                    fontWeight: '500',
                    transition: 'all 0.2s ease'
                  }}
                >
                  ← Previous
                </button>
                
                {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                  const page = i + 1;
                  return (
                    <button
                      key={page}
                      onClick={() => handleFilterChange('page', page)}
                      style={{
                        padding: '10px 16px',
                        border: '1px solid #d1d5db',
                        borderRadius: '8px',
                        backgroundColor: pagination.page === page ? '#1e293b' : 'white',
                        color: pagination.page === page ? 'white' : '#374151',
                        cursor: 'pointer',
                        fontSize: '14px',
                        fontWeight: '600',
                        minWidth: '44px',
                        transition: 'all 0.2s ease'
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
                    padding: '10px 16px',
                    border: '1px solid #d1d5db',
                    borderRadius: '8px',
                    backgroundColor: pagination.page >= pagination.totalPages ? '#f9fafb' : 'white',
                    color: pagination.page >= pagination.totalPages ? '#9ca3af' : '#374151',
                    cursor: pagination.page >= pagination.totalPages ? 'not-allowed' : 'pointer',
                    fontSize: '14px',
                    fontWeight: '500',
                    transition: 'all 0.2s ease'
                  }}
                >
                  Next →
                </button>
              </div>
            </div>
          )}          {/* Chat Modal */}
          {showChatModal && chatTicket && (
            <div style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'rgba(0, 0, 0, 0.7)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 1000,
              padding: '20px'
            }}>
              <div style={{
                backgroundColor: 'white',
                borderRadius: '16px',
                padding: '32px',
                maxWidth: '600px',
                width: '100%',
                maxHeight: '90vh',
                overflow: 'auto',
                position: 'relative'
              }}>
                <div style={{
                  marginBottom: '24px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <h3 style={{ color: '#1e293b', margin: 0, fontSize: '20px' }}>
                    Chat - Ticket #{chatTicket.id}: {chatTicket.subject}
                  </h3>
                  <button
                    onClick={closeChatModal}
                    style={{
                      backgroundColor: 'transparent',
                      border: 'none',
                      cursor: 'pointer',
                      padding: '8px',
                      borderRadius: '50%',
                      transition: 'background-color 0.3s'
                    }}
                    onMouseEnter={(e) => (e.target as HTMLButtonElement).style.backgroundColor = '#f3f4f6'}
                    onMouseLeave={(e) => (e.target as HTMLButtonElement).style.backgroundColor = 'transparent'}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" style={{ color: '#1e293b', width: '24px', height: '24px' }}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                {/* Messages List */}
                <div style={{
                  maxHeight: '400px',
                  overflowY: 'auto',
                  marginBottom: '16px',
                  paddingRight: '8px'
                }}>
                  {messagesLoading && (
                    <div style={{ textAlign: 'center', padding: '16px' }}>
                      <div style={{ fontSize: '24px', marginBottom: '8px' }}>⏳</div>
                      Loading messages...
                    </div>
                  )}
                  {!messagesLoading && messages.length === 0 && (
                    <div style={{ textAlign: 'center', padding: '16px', color: '#64748b' }}>
                      <div style={{ fontSize: '24px', marginBottom: '8px' }}>💬</div>
                      No messages yet. Start the conversation!
                    </div>
                  )}
                  {messages.map((message) => (
                    <div key={message.id} style={{
                      marginBottom: '12px',
                      display: 'flex',
                      flexDirection: message.senderType === 'admin' ? 'row-reverse' : 'row',
                      alignItems: 'flex-start',
                      gap: '12px'
                    }}>
                      <div style={{
                        backgroundColor: message.senderType === 'admin' ? '#1e293b' : '#f3f4f6',
                        color: message.senderType === 'admin' ? 'white' : '#1f2937',
                        padding: '12px 16px',
                        borderRadius: '12px',
                        maxWidth: '70%',
                        wordWrap: 'break-word'
                      }}>
                        <div style={{ fontSize: '14px', marginBottom: '4px' }}>
                          {message.message}
                        </div>                        <div style={{
                          fontSize: '12px',
                          opacity: 0.7,
                          textAlign: 'right'
                        }}>
                          {message.senderType === 'admin' 
                            ? (message.adminSender?.username || 'Admin')
                            : (message.customerSender 
                                ? `${message.customerSender.firstName} ${message.customerSender.lastName}` 
                                : 'Customer')
                          } • {formatMessageTime(message.createdAt)}
                        </div>
                      </div>
                    </div>
                  ))}
                  <div ref={chatEndRef} />
                </div>

                {/* New Message Form */}
                <form onSubmit={sendMessage} style={{ display: 'flex', gap: '12px' }}>
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Type your response..."
                    style={{
                      flex: 1,
                      padding: '12px 16px',
                      border: '2px solid #e5e7eb',
                      borderRadius: '8px',
                      fontSize: '16px',
                      outline: 'none',
                      boxSizing: 'border-box'
                    }}
                    onFocus={(e) => (e.target as HTMLInputElement).style.borderColor = '#3b82f6'}
                    onBlur={(e) => (e.target as HTMLInputElement).style.borderColor = '#e5e7eb'}
                  />
                  <button
                    type="submit"
                    disabled={sendingMessage}
                    style={{
                      padding: '12px 16px',
                      backgroundColor: sendingMessage ? '#9ca3af' : '#1e293b',
                      color: 'white',
                      border: 'none',
                      borderRadius: '8px',
                      fontWeight: '600',
                      cursor: sendingMessage ? 'not-allowed' : 'pointer',
                      transition: 'background-color 0.3s'
                    }}
                  >
                    {sendingMessage ? 'Sending...' : 'Send'}
                  </button>
                </form>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminTicketPage;
