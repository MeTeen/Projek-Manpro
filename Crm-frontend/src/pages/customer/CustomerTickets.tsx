import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Ticket, 
  Purchase, 
  TicketMessage, 
  CreateTicketRequest,
  TicketFormData,
  TICKET_STATUSES,
  TICKET_PRIORITIES,
  TICKET_CATEGORIES,
  getStatusBadgeStyle,
  getPriorityBadgeStyle
} from '../../types/ticket';
import { Customer as CustomerProfile } from '../../types/ticket';
import customerTicketService from '../../services/customerTicketService';
import ticketMessageService from '../../services/ticketMessageService';
import customerAuthService from '../../services/customerAuthService';
import { NeedHelp, Modal } from '../../components/ui';

const CustomerTickets: React.FC = () => {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [customer, setCustomer] = useState<CustomerProfile | null>(null);
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [createLoading, setCreateLoading] = useState(false);
  const [filter, setFilter] = useState({
    status: 'all',
    priority: 'all',
    category: 'all'
  });
  
  // Chat modal states
  const [showChatModal, setShowChatModal] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [messages, setMessages] = useState<TicketMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [messagesLoading, setMessagesLoading] = useState(false);
  const [sendingMessage, setSendingMessage] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);
  
  const navigate = useNavigate();
  
  const [newTicket, setNewTicket] = useState<TicketFormData>({
    subject: '',
    message: '',
    priority: 'medium',
    category: 'general',
    purchaseId: undefined
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      await Promise.all([
        fetchCustomerProfile(),
        fetchTickets(),
        fetchPurchases()
      ]);
    } catch (error) {
      console.error('Error fetching data:', error);
      setError('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const fetchCustomerProfile = async () => {
    try {
      const response = await customerAuthService.getProfile();
      if (response.success && response.data) {
        setCustomer(response.data);
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    }
  };

  const fetchTickets = async () => {
    try {
      const response = await customerTicketService.getMyTickets();
      if (response.success) {
        setTickets(response.data.tickets || []);
      }
    } catch (error) {
      console.error('Error fetching tickets:', error);
    }
  };

  const fetchPurchases = async () => {
    try {
      const response = await customerTicketService.getMyPurchases();
      if (response.success) {
        setPurchases(response.data);
      }
    } catch (error) {
      console.error('Error fetching purchases:', error);
    }
  };

  const handleCreateTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreateLoading(true);
    setError('');

    try {
      const ticketData: CreateTicketRequest = {
        subject: newTicket.subject,
        message: newTicket.message,
        priority: newTicket.priority,
        category: newTicket.category,
        purchaseId: newTicket.purchaseId
      };

      const response = await customerTicketService.createTicket(ticketData);
      console.log('Create ticket response:', response);
      
      if (response.success) {
        setShowCreateForm(false);
        setNewTicket({
          subject: '',
          message: '',
          priority: 'medium',
          category: 'general',
          purchaseId: undefined
        });
        await fetchTickets();
      } else {
        setError(response.message || 'Failed to create ticket');
      }
    } catch (error) {
      console.error('Error creating ticket:', error);
      setError(error instanceof Error ? error.message : 'An error occurred while creating the ticket');
    } finally {
      setCreateLoading(false);
    }
  };
  const handleLogout = () => {
    customerAuthService.logout();
    navigate('/customer/login');
  };

  // Chat functions
  const openChatModal = async (ticket: Ticket) => {
    setSelectedTicket(ticket);
    setShowChatModal(true);
    await fetchMessages(ticket.id);
  };

  const closeChatModal = () => {
    setShowChatModal(false);
    setSelectedTicket(null);
    setMessages([]);
    setNewMessage('');
    setError('');
  };

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
      setError('Failed to load messages');
    } finally {
      setMessagesLoading(false);
    }
  };

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedTicket) return;

    try {
      setSendingMessage(true);
      const response = await ticketMessageService.createMessage(selectedTicket.id, {
        message: newMessage.trim()
      });
      
      if (response.success) {
        setMessages(prev => [...prev, response.data]);
        setNewMessage('');
        setTimeout(() => scrollToBottom(), 100);
      }
    } catch (error) {
      console.error('Error sending message:', error);
      setError('Failed to send message');
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

  const filteredTickets = (tickets || []).filter(ticket => {
    if (filter.status !== 'all' && ticket.status !== filter.status) return false;
    if (filter.priority !== 'all' && ticket.priority !== filter.priority) return false;
    if (filter.category !== 'all' && ticket.category !== filter.category) return false;
    return true;
  });

  if (loading) {
    return (
      <div style={{ 
        minHeight: '100vh', 
        backgroundColor: '#f9fafb',
        background: 'linear-gradient(to right, #8B4513, #D2691E)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <div style={{ color: 'white', fontSize: '18px', textAlign: 'center' }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>⏳</div>
          Loading...
        </div>
      </div>
    );
  }

  return (
    <div style={{ 
      minHeight: '100vh', 
      backgroundColor: '#f9fafb',
      background: 'linear-gradient(to right, #8B4513, #D2691E)'
    }}>
      <div style={{ 
        padding: '20px 30px', 
        backgroundColor: 'rgba(255, 255, 255, 0.95)', 
        backdropFilter: 'blur(6px)',
        minHeight: '100vh'
      }}>
        {/* Header */}
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          marginBottom: '30px',
          padding: '15px 0',
          borderBottom: '1px solid #e5e7eb'
        }}>
          <div>
            <h1 style={{ 
              fontSize: '24px', 
              fontWeight: 'bold', 
              color: '#8B4513',
              margin: 0,
              marginBottom: '4px'
            }}>
              🪑 Customer Portal - Support Tickets
            </h1>
            {customer && (
              <p style={{
                color: '#6b5b47',
                margin: 0,
                fontSize: '14px'
              }}>
                Welcome back, {customer.firstName} {customer.lastName}
              </p>
            )}
          </div>
          <div style={{ display: 'flex', gap: '12px' }}>
            <button
              onClick={() => navigate('/')}
              style={{
                padding: '8px 16px',
                backgroundColor: 'transparent',
                color: '#8B4513',
                border: '2px solid #8B4513',
                borderRadius: '6px',
                fontWeight: '600',
                fontSize: '14px',
                cursor: 'pointer',
                transition: 'all 0.3s ease'
              }}
              onMouseEnter={(e) => {
                (e.target as HTMLButtonElement).style.backgroundColor = '#8B4513';
                (e.target as HTMLButtonElement).style.color = 'white';
              }}
              onMouseLeave={(e) => {
                (e.target as HTMLButtonElement).style.backgroundColor = 'transparent';
                (e.target as HTMLButtonElement).style.color = '#8B4513';
              }}
            >
              Home
            </button>
            <button
              onClick={handleLogout}
              style={{
                padding: '8px 16px',
                backgroundColor: '#dc2626',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                fontWeight: '600',
                fontSize: '14px',
                cursor: 'pointer',
                transition: 'background-color 0.3s ease'
              }}
              onMouseEnter={(e) => (e.target as HTMLButtonElement).style.backgroundColor = '#b91c1c'}
              onMouseLeave={(e) => (e.target as HTMLButtonElement).style.backgroundColor = '#dc2626'}
            >
              Logout
            </button>
          </div>
        </div>

        {/* Main Content */}
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          {/* Customer Info Card */}
          {customer && (
            <div style={{
              backgroundColor: 'white',
              borderRadius: '12px',
              padding: '24px',
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
              marginBottom: '24px'
            }}>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: '20px'
              }}>
                <div>
                  <h3 style={{ color: '#8B4513', marginBottom: '8px', fontSize: '16px' }}>Account Information</h3>
                  <p style={{ margin: '4px 0', color: '#6b5b47' }}>
                    <strong>Name:</strong> {customer.firstName} {customer.lastName}
                  </p>
                  <p style={{ margin: '4px 0', color: '#6b5b47' }}>
                    <strong>Email:</strong> {customer.email}
                  </p>
                  {customer.phone && (
                    <p style={{ margin: '4px 0', color: '#6b5b47' }}>
                      <strong>Phone:</strong> {customer.phone}
                    </p>
                  )}
                </div>
                <div>
                  <h3 style={{ color: '#8B4513', marginBottom: '8px', fontSize: '16px' }}>Support Statistics</h3>
                  <p style={{ margin: '4px 0', color: '#6b5b47' }}>
                    <strong>Total Tickets:</strong> {tickets.length}
                  </p>
                  <p style={{ margin: '4px 0', color: '#6b5b47' }}>
                    <strong>Open Tickets:</strong> {tickets.filter(t => t.status === 'open' || t.status === 'in_progress').length}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Need Help Section */}
          <div style={{
            backgroundColor: 'white',
            borderRadius: '12px',
            padding: '24px',
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
            marginBottom: '24px'
          }}>
            <h3 style={{ color: '#8B4513', marginBottom: '12px', fontSize: '18px' }}>
              🆘 Need Immediate Help?
            </h3>
            <p style={{ color: '#6b5b47', marginBottom: '16px' }}>
              Having trouble with your order or need technical support? Our team is here to help!
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '20px' }}>📱</span>
                <div>
                  <div style={{ fontWeight: '600' }}>Phone</div>
                  <div style={{ color: '#6b5b47' }}>+62 812-3456-7890</div>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '20px' }}>✉️</span>
                <div>
                  <div style={{ fontWeight: '600' }}>Email</div>
                  <div style={{ color: '#6b5b47' }}>help@beefurniture.com</div>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '20px' }}>💬</span>
                <div>
                  <div style={{ fontWeight: '600' }}>WhatsApp</div>
                  <div style={{ color: '#6b5b47' }}>+62 812-3456-7890</div>
                </div>
              </div>
            </div>
          </div>

          {/* Action Bar */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '24px',
            flexWrap: 'wrap',
            gap: '16px'
          }}>
            <h2 style={{ color: '#8B4513', margin: 0, fontSize: '20px' }}>
              🎫 My Support Tickets ({filteredTickets.length})
            </h2>
            <button
              onClick={() => setShowCreateForm(true)}
              style={{
                padding: '12px 24px',
                backgroundColor: '#8B4513',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontWeight: '600',
                fontSize: '16px',
                cursor: 'pointer',
                transition: 'background-color 0.3s'
              }}
              onMouseEnter={(e) => (e.target as HTMLButtonElement).style.backgroundColor = '#6b3410'}
              onMouseLeave={(e) => (e.target as HTMLButtonElement).style.backgroundColor = '#8B4513'}
            >
              + Create New Ticket
            </button>
          </div>

          {/* Filters */}
          <div style={{
            backgroundColor: 'white',
            borderRadius: '12px',
            padding: '20px',
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
            marginBottom: '24px'
          }}>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
              gap: '16px'
            }}>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#8B4513' }}>
                  Status
                </label>
                <select
                  value={filter.status}
                  onChange={(e) => setFilter(prev => ({ ...prev, status: e.target.value }))}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    border: '2px solid #e5e7eb',
                    borderRadius: '6px',
                    fontSize: '14px',
                    outline: 'none'
                  }}
                >
                  <option value="all">All Statuses</option>
                  {Object.entries(TICKET_STATUSES).map(([key, label]) => (
                    <option key={key} value={key}>{label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#8B4513' }}>
                  Priority
                </label>
                <select
                  value={filter.priority}
                  onChange={(e) => setFilter(prev => ({ ...prev, priority: e.target.value }))}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    border: '2px solid #e5e7eb',
                    borderRadius: '6px',
                    fontSize: '14px',
                    outline: 'none'
                  }}
                >
                  <option value="all">All Priorities</option>
                  {Object.entries(TICKET_PRIORITIES).map(([key, label]) => (
                    <option key={key} value={key}>{label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#8B4513' }}>
                  Category
                </label>
                <select
                  value={filter.category}
                  onChange={(e) => setFilter(prev => ({ ...prev, category: e.target.value }))}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    border: '2px solid #e5e7eb',
                    borderRadius: '6px',
                    fontSize: '14px',
                    outline: 'none'
                  }}
                >
                  <option value="all">All Categories</option>
                  {Object.entries(TICKET_CATEGORIES).map(([key, label]) => (
                    <option key={key} value={key}>{label}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Tickets List */}
          {filteredTickets.length === 0 ? (
            <div style={{
              backgroundColor: 'white',
              borderRadius: '12px',
              padding: '48px',
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '48px', marginBottom: '16px' }}>📝</div>
              <h3 style={{ color: '#8B4513', marginBottom: '8px' }}>No Tickets Found</h3>
              <p style={{ color: '#6b5b47', marginBottom: '24px' }}>
                You haven't created any support tickets yet. Click "Create New Ticket" to get started.
              </p>
              <button
                onClick={() => setShowCreateForm(true)}
                style={{
                  padding: '12px 24px',
                  backgroundColor: '#8B4513',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  fontWeight: '600',
                  cursor: 'pointer'
                }}
              >
                Create Your First Ticket
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {filteredTickets.map((ticket) => (
                <div
                  key={ticket.id}
                  style={{
                    backgroundColor: 'white',
                    borderRadius: '12px',
                    padding: '24px',
                    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
                    border: '1px solid #e5e7eb'
                  }}
                >
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                    marginBottom: '16px',
                    flexWrap: 'wrap',
                    gap: '12px'
                  }}>
                    <div style={{ flex: 1 }}>
                      <h3 style={{ 
                        fontSize: '18px', 
                        fontWeight: '600', 
                        color: '#1f2937', 
                        margin: '0 0 8px 0' 
                      }}>
                        #{ticket.id} - {ticket.subject}
                      </h3>
                      <p style={{ 
                        color: '#6b7280', 
                        margin: '0 0 8px 0',
                        lineHeight: '1.5'
                      }}>
                        {ticket.message.length > 150 
                          ? `${ticket.message.substring(0, 150)}...` 
                          : ticket.message}
                      </p>
                    </div>
                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                      <span style={getStatusBadgeStyle(ticket.status)}>
                        {TICKET_STATUSES[ticket.status]}
                      </span>
                      <span style={getPriorityBadgeStyle(ticket.priority)}>
                        {TICKET_PRIORITIES[ticket.priority]}
                      </span>
                      <span style={{
                        backgroundColor: '#f3f4f6',
                        color: '#374151',
                        padding: '4px 12px',
                        borderRadius: '12px',
                        fontSize: '12px',
                        fontWeight: '600'
                      }}>
                        {TICKET_CATEGORIES[ticket.category]}
                      </span>
                    </div>
                  </div>
                  
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                    gap: '16px',
                    paddingTop: '16px',
                    borderTop: '1px solid #e5e7eb',
                    fontSize: '14px'
                  }}>
                    <div>
                      <strong style={{ color: '#8B4513' }}>Created:</strong>
                      <br />
                      {formatDate(ticket.createdAt)}
                    </div>
                    <div>
                      <strong style={{ color: '#8B4513' }}>Last Activity:</strong>
                      <br />
                      {formatDate(ticket.lastActivityAt)}
                    </div>
                    {ticket.purchase && (
                      <div>
                        <strong style={{ color: '#8B4513' }}>Related Purchase:</strong>
                        <br />
                        {ticket.purchase.product.name} (#{ticket.purchase.id})
                      </div>
                    )}
                  </div>
                  
                  {/* Chat Button */}
                  <div style={{
                    marginTop: '16px',
                    paddingTop: '16px',
                    borderTop: '1px solid #e5e7eb',
                    display: 'flex',
                    justifyContent: 'flex-end'
                  }}>
                    <button
                      onClick={() => openChatModal(ticket)}
                      style={{
                        padding: '8px 16px',
                        backgroundColor: '#8B4513',
                        color: 'white',
                        border: 'none',
                        borderRadius: '6px',
                        fontWeight: '600',
                        fontSize: '14px',
                        cursor: 'pointer',
                        transition: 'background-color 0.3s'
                      }}
                      onMouseEnter={(e) => (e.target as HTMLButtonElement).style.backgroundColor = '#6b3410'}
                      onMouseLeave={(e) => (e.target as HTMLButtonElement).style.backgroundColor = '#8B4513'}
                    >
                      💬 View Messages
                    </button>
                  </div>
                </div>
              ))}            </div>
          )}

          {/* Need Help Section */}
          <NeedHelp 
            variant="customer"
            title="Need Help?"
            description="Contact our customer support team for assistance with your account or products."
            contacts={[
              { icon: "📱", label: "Phone", value: "+62 812-3456-7890", type: "phone" },
              { icon: "✉️", label: "Email", value: "help@beefurniture.com", type: "email" },
              { icon: "💬", label: "WhatsApp", value: "+62 812-3456-7890", type: "whatsapp" }
            ]}
            style={{ marginTop: '32px', marginBottom: '32px' }}
          />
        </div>

        {/* Create Ticket Modal */}
        <Modal
          isOpen={showCreateForm}
          onClose={() => setShowCreateForm(false)}
          title="Create New Support Ticket"
          size="lg"
        >
          <p style={{ color: '#6b5b47', margin: '0 0 24px 0' }}>
            Describe your issue or inquiry and we'll help you resolve it.
          </p>
          
          <form onSubmit={handleCreateTicket} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#8B4513' }}>
                    Subject *
                  </label>
                  <input
                    type="text"
                    required
                    value={newTicket.subject}
                    onChange={(e) => setNewTicket(prev => ({ ...prev, subject: e.target.value }))}
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      border: '2px solid #e5e7eb',
                      borderRadius: '8px',
                      fontSize: '16px',
                      outline: 'none',
                      boxSizing: 'border-box'
                    }}
                    placeholder="Brief description of your issue"
                    onFocus={(e) => (e.target as HTMLInputElement).style.borderColor = '#D2691E'}
                    onBlur={(e) => (e.target as HTMLInputElement).style.borderColor = '#e5e7eb'}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#8B4513' }}>
                    Message *
                  </label>
                  <textarea
                    required
                    rows={4}
                    value={newTicket.message}
                    onChange={(e) => setNewTicket(prev => ({ ...prev, message: e.target.value }))}
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      border: '2px solid #e5e7eb',
                      borderRadius: '8px',
                      fontSize: '16px',
                      outline: 'none',
                      boxSizing: 'border-box',
                      resize: 'vertical'
                    }}
                    placeholder="Provide detailed information about your issue..."
                    onFocus={(e) => (e.target as HTMLTextAreaElement).style.borderColor = '#D2691E'}
                    onBlur={(e) => (e.target as HTMLTextAreaElement).style.borderColor = '#e5e7eb'}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div>
                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#8B4513' }}>
                      Priority
                    </label>
                    <select
                      value={newTicket.priority}
                      onChange={(e) => setNewTicket(prev => ({ 
                        ...prev, 
                        priority: e.target.value as 'low' | 'medium' | 'high' | 'urgent'
                      }))}
                      style={{
                        width: '100%',
                        padding: '12px 16px',
                        border: '2px solid #e5e7eb',
                        borderRadius: '8px',
                        fontSize: '16px',
                        outline: 'none',
                        boxSizing: 'border-box'
                      }}
                    >
                      {Object.entries(TICKET_PRIORITIES).map(([key, label]) => (
                        <option key={key} value={key}>{label}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#8B4513' }}>
                      Category
                    </label>
                    <select
                      value={newTicket.category}
                      onChange={(e) => setNewTicket(prev => ({ 
                        ...prev, 
                        category: e.target.value as 'delivery' | 'product_quality' | 'payment' | 'general' | 'refund' | 'exchange'
                      }))}
                      style={{
                        width: '100%',
                        padding: '12px 16px',
                        border: '2px solid #e5e7eb',
                        borderRadius: '8px',
                        fontSize: '16px',
                        outline: 'none',
                        boxSizing: 'border-box'
                      }}
                    >
                      {Object.entries(TICKET_CATEGORIES).map(([key, label]) => (
                        <option key={key} value={key}>{label}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#8B4513' }}>
                    Related Purchase (Optional)
                  </label>
                  <select
                    value={newTicket.purchaseId || ''}
                    onChange={(e) => setNewTicket(prev => ({ 
                      ...prev, 
                      purchaseId: e.target.value ? Number(e.target.value) : undefined
                    }))}
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      border: '2px solid #e5e7eb',
                      borderRadius: '8px',
                      fontSize: '16px',
                      outline: 'none',
                      boxSizing: 'border-box'
                    }}
                  >
                    <option value="">No related purchase</option>
                    {purchases.map((purchase) => (
                      <option key={purchase.id} value={purchase.id}>
                        {purchase.product.name} - #{purchase.id} ({formatDate(purchase.purchaseDate)})
                      </option>
                    ))}
                  </select>
                </div>

                {error && (
                  <div style={{
                    padding: '12px',
                    backgroundColor: '#fef2f2',
                    border: '1px solid #fecaca',
                    borderRadius: '8px',
                    color: '#dc2626'
                  }}>
                    {error}
                  </div>
                )}

                <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '8px' }}>
                  <button
                    type="button"
                    onClick={() => setShowCreateForm(false)}
                    style={{
                      padding: '12px 24px',
                      backgroundColor: 'transparent',
                      color: '#6b7280',
                      border: '2px solid #e5e7eb',
                      borderRadius: '8px',
                      fontWeight: '600',
                      cursor: 'pointer'
                    }}
                  >
                    Cancel
                  </button>                  <button
                    type="submit"
                    disabled={createLoading}
                    style={{
                      padding: '12px 24px',
                      backgroundColor: createLoading ? '#9ca3af' : '#8B4513',
                      color: 'white',
                      border: 'none',
                      borderRadius: '8px',
                      fontWeight: '600',
                      cursor: createLoading ? 'not-allowed' : 'pointer'
                    }}                  >
                    {createLoading ? 'Creating...' : 'Create Ticket'}
                  </button>
                </div>
              </form>
        </Modal>

        {/* Chat Modal */}
        <Modal
          isOpen={showChatModal}
          onClose={closeChatModal}
          title={`Chat - Ticket #${selectedTicket?.id}: ${selectedTicket?.subject}`}
          size="lg"
        >
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
                <div style={{ textAlign: 'center', padding: '16px', color: '#6b7280' }}>
                  <div style={{ fontSize: '24px', marginBottom: '8px' }}>💬</div>
                  No messages yet. Start the conversation!
                </div>              )}
              
              {messages.map((message) => (
                <div key={message.id} style={{
                  marginBottom: '12px',
                  display: 'flex',
                  flexDirection: message.senderType === 'customer' ? 'row-reverse' : 'row',
                  alignItems: 'flex-start',
                  gap: '12px'
                }}>
                  <div style={{
                    backgroundColor: message.senderType === 'customer' ? '#8B4513' : '#f3f4f6',
                    color: message.senderType === 'customer' ? 'white' : '#1f2937',
                    padding: '12px 16px',
                    borderRadius: '12px',
                    maxWidth: '70%',
                    wordWrap: 'break-word'
                  }}>
                    <div style={{ fontSize: '14px', marginBottom: '4px' }}>
                      {message.message}
                    </div>
                    <div style={{
                      fontSize: '12px',
                      opacity: 0.7,
                      textAlign: message.senderType === 'customer' ? 'right' : 'left'
                    }}>
                      {message.senderType === 'admin' 
                        ? (message.adminSender?.username || 'Support')
                        : 'You'
                      } • {formatMessageTime(message.createdAt)}
                    </div>
                  </div>
                </div>
              ))}
              <div ref={chatEndRef} />
            </div>            {/* New Message Form */}
            <form onSubmit={sendMessage} style={{ display: 'flex', gap: '12px' }}>
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Type your message..."
                    style={{
                      flex: 1,
                      padding: '12px 16px',
                      border: '2px solid #e5e7eb',
                      borderRadius: '8px',
                      fontSize: '16px',
                      outline: 'none',
                      boxSizing: 'border-box'
                    }}
                    onFocus={(e) => (e.target as HTMLInputElement).style.borderColor = '#D2691E'}
                    onBlur={(e) => (e.target as HTMLInputElement).style.borderColor = '#e5e7eb'}
                  />                  <button
                    type="submit"
                    disabled={sendingMessage}
                    style={{
                      padding: '12px 16px',
                      backgroundColor: sendingMessage ? '#9ca3af' : '#8B4513',
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
        </Modal>
      </div>
    </div>
  );
};

export default CustomerTickets;
