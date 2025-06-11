import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import customerTicketService, { CustomerTicket, CustomerPurchase } from '../../services/customerTicketService';
import customerAuthService, { CustomerProfile } from '../../services/customerAuthService';
import { NeedHelp } from '../../components/ui';

const CustomerTickets: React.FC = () => {
  const [tickets, setTickets] = useState<CustomerTicket[]>([]);
  const [customer, setCustomer] = useState<CustomerProfile | null>(null);
  const [purchases, setPurchases] = useState<CustomerPurchase[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [createLoading, setCreateLoading] = useState(false);
  const [filter, setFilter] = useState({
    status: 'all',
    priority: 'all',
    category: 'all'
  });
  const navigate = useNavigate();
  const [newTicket, setNewTicket] = useState({
    subject: '',
    description: '',
    priority: 'medium' as const,
    category: 'inquiry' as const,
    purchaseId: undefined as number | undefined
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
        setTickets(response.data);
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
      const response = await customerTicketService.createTicket(newTicket);
      if (response.success) {
        setShowCreateForm(false);        setNewTicket({
          subject: '',
          description: '',
          priority: 'medium',
          category: 'inquiry',
          purchaseId: undefined
        });
        await fetchTickets();
      } else {
        setError(response.message || 'Failed to create ticket');
      }
    } catch (error) {
      setError('An error occurred while creating the ticket');
      console.error('Create ticket error:', error);
    } finally {
      setCreateLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('customerToken');
    localStorage.removeItem('customerData');
    navigate('/customer/login');
  };

  const filteredTickets = tickets.filter(ticket => {
    if (filter.status !== 'all' && ticket.status !== filter.status) return false;
    if (filter.priority !== 'all' && ticket.priority !== filter.priority) return false;
    if (filter.category !== 'all' && ticket.category !== filter.category) return false;
    return true;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return '#f59e0b';
      case 'in_progress': return '#3b82f6';
      case 'resolved': return '#10b981';
      case 'closed': return '#6b5b73';
      default: return '#6b5b73';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return '#dc2626';
      case 'high': return '#ea580c';
      case 'medium': return '#ca8a04';
      case 'low': return '#65a30d';
      default: return '#6b5b73';
    }
  };

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
              🪑 Customer Portal
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
                  <p style={{ margin: '4px 0', color: '#6b5b47' }}><strong>Email:</strong> {customer.email}</p>
                  <p style={{ margin: '4px 0', color: '#6b5b47' }}><strong>Phone:</strong> {customer.phone}</p>
                </div>
                <div>
                  <h3 style={{ color: '#8B4513', marginBottom: '8px', fontSize: '16px' }}>Purchase History</h3>
                  <p style={{ margin: '4px 0', color: '#6b5b47' }}><strong>Total Orders:</strong> {customer.purchaseCount}</p>
                  <p style={{ margin: '4px 0', color: '#6b5b47' }}><strong>Total Spent:</strong> {customer.totalSpent}</p>
                </div>
              </div>            </div>
          )}

          {/* Need Help Section */}
          <NeedHelp 
            variant="customer"
            title="Need Assistance?"
            description="Having trouble with your order or need technical support? Our team is here to help!"
            contacts={[
              { icon: "📱", label: "Phone", value: "+62 812-3456-7890" },
              { icon: "✉️", label: "Email", value: "support@mebelpremium.com" },
              { icon: "💬", label: "WhatsApp", value: "+62 812-3456-7890" }
            ]}
            style={{ marginBottom: '24px' }}
          />

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
              My Support Tickets ({filteredTickets.length})
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
                  <option value="open">Open</option>
                  <option value="in_progress">In Progress</option>
                  <option value="resolved">Resolved</option>
                  <option value="closed">Closed</option>
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
                  <option value="urgent">Urgent</option>
                  <option value="high">High</option>
                  <option value="medium">Medium</option>
                  <option value="low">Low</option>
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
                >                  <option value="all">All Categories</option>
                  <option value="inquiry">General Inquiry</option>
                  <option value="complaint">Product Complaint</option>
                  <option value="delivery_issue">Delivery Issue</option>
                  <option value="payment_issue">Payment Issue</option>
                  <option value="warranty_claim">Warranty Claim</option>
                  <option value="return_refund">Return/Refund</option>
                  <option value="other">Other</option>
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
                        color: '#8B4513',
                        marginBottom: '8px',
                        fontSize: '18px'
                      }}>
                        {ticket.subject}
                      </h3>
                      <p style={{
                        color: '#6b5b47',
                        lineHeight: '1.5',
                        marginBottom: '12px'
                      }}>
                        {ticket.description}
                      </p>
                    </div>
                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                      <span style={{
                        padding: '4px 12px',
                        borderRadius: '16px',
                        fontSize: '12px',
                        fontWeight: '600',
                        backgroundColor: getStatusColor(ticket.status) + '20',
                        color: getStatusColor(ticket.status)
                      }}>
                        {ticket.status.replace('_', ' ').toUpperCase()}
                      </span>
                      <span style={{
                        padding: '4px 12px',
                        borderRadius: '16px',
                        fontSize: '12px',
                        fontWeight: '600',
                        backgroundColor: getPriorityColor(ticket.priority) + '20',
                        color: getPriorityColor(ticket.priority)
                      }}>
                        {ticket.priority.toUpperCase()}
                      </span>
                      <span style={{
                        padding: '4px 12px',
                        borderRadius: '16px',
                        fontSize: '12px',
                        fontWeight: '600',
                        backgroundColor: '#8B451320',
                        color: '#8B4513'
                      }}>
                        {ticket.category.replace('_', ' ').toUpperCase()}
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
                      <span style={{ color: '#8B4513', fontWeight: '600' }}>Created:</span>
                      <span style={{ color: '#6b5b47', marginLeft: '8px' }}>
                        {new Date(ticket.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <div>
                      <span style={{ color: '#8B4513', fontWeight: '600' }}>Updated:</span>
                      <span style={{ color: '#6b5b47', marginLeft: '8px' }}>
                        {new Date(ticket.updatedAt).toLocaleDateString()}
                      </span>
                    </div>
                    {ticket.purchase && (
                      <div>
                        <span style={{ color: '#8B4513', fontWeight: '600' }}>Related Product:</span>
                        <span style={{ color: '#6b5b47', marginLeft: '8px' }}>
                          {ticket.purchase.product.name}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Create Ticket Modal */}
        {showCreateForm && (
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
              overflow: 'auto'
            }}>
              <div style={{ marginBottom: '24px' }}>
                <h3 style={{ color: '#8B4513', marginBottom: '8px', fontSize: '24px' }}>
                  Create New Support Ticket
                </h3>
                <p style={{ color: '#6b5b47', margin: 0 }}>
                  Describe your issue or inquiry and we'll help you resolve it.
                </p>
              </div>

              <form onSubmit={handleCreateTicket} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div>
                  <label style={{
                    display: 'block',
                    fontSize: '14px',
                    fontWeight: '600',
                    color: '#8B4513',
                    marginBottom: '8px'
                  }}>
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
                  <label style={{
                    display: 'block',
                    fontSize: '14px',
                    fontWeight: '600',
                    color: '#8B4513',
                    marginBottom: '8px'
                  }}>
                    Description *
                  </label>
                  <textarea
                    required
                    rows={4}
                    value={newTicket.description}
                    onChange={(e) => setNewTicket(prev => ({ ...prev, description: e.target.value }))}
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
                    <label style={{
                      display: 'block',
                      fontSize: '14px',
                      fontWeight: '600',
                      color: '#8B4513',
                      marginBottom: '8px'
                    }}>
                      Priority
                    </label>
                    <select
                      value={newTicket.priority}
                      onChange={(e) => setNewTicket(prev => ({ ...prev, priority: e.target.value as any }))}
                      style={{
                        width: '100%',
                        padding: '12px 16px',
                        border: '2px solid #e5e7eb',
                        borderRadius: '8px',
                        fontSize: '16px',
                        outline: 'none'
                      }}
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                      <option value="urgent">Urgent</option>
                    </select>
                  </div>

                  <div>
                    <label style={{
                      display: 'block',
                      fontSize: '14px',
                      fontWeight: '600',
                      color: '#8B4513',
                      marginBottom: '8px'
                    }}>
                      Category
                    </label>
                    <select
                      value={newTicket.category}
                      onChange={(e) => setNewTicket(prev => ({ ...prev, category: e.target.value as any }))}
                      style={{
                        width: '100%',
                        padding: '12px 16px',
                        border: '2px solid #e5e7eb',
                        borderRadius: '8px',
                        fontSize: '16px',
                        outline: 'none'
                      }}
                    >                      <option value="inquiry">General Inquiry</option>
                      <option value="complaint">Product Complaint</option>
                      <option value="delivery_issue">Delivery Issue</option>
                      <option value="payment_issue">Payment Issue</option>
                      <option value="warranty_claim">Warranty Claim</option>
                      <option value="return_refund">Return/Refund</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                </div>

                {purchases.length > 0 && (
                  <div>
                    <label style={{
                      display: 'block',
                      fontSize: '14px',
                      fontWeight: '600',
                      color: '#8B4513',
                      marginBottom: '8px'
                    }}>                      Related Transaction (Optional)
                    </label>
                    <p style={{
                      fontSize: '12px',
                      color: '#6b5b47',
                      marginBottom: '8px',
                      lineHeight: '1.4'
                    }}>
                      Select a transaction if your issue is related to a specific purchase
                    </p><select
                      value={newTicket.purchaseId || ''}
                      onChange={(e) => setNewTicket(prev => ({ 
                        ...prev, 
                        purchaseId: e.target.value ? parseInt(e.target.value) : undefined 
                      }))}
                      style={{
                        width: '100%',
                        padding: '12px 16px',
                        border: '2px solid #e5e7eb',
                        borderRadius: '8px',
                        fontSize: '16px',
                        outline: 'none'
                      }}
                    >                      <option value="">No related transaction</option>
                      {purchases.map((purchase) => (
                        <option key={purchase.id} value={purchase.id}>
                          {purchase.product.name} - Qty: {purchase.quantity} - {purchase.price} - {new Date(purchase.purchaseDate).toLocaleDateString('id-ID', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric'
                          })}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {error && (
                  <div style={{
                    backgroundColor: '#fef2f2',
                    border: '1px solid #fecaca',
                    color: '#dc2626',
                    padding: '12px',
                    borderRadius: '8px',
                    fontSize: '14px'
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
                      color: '#6b5b73',
                      border: '2px solid #e5e7eb',
                      borderRadius: '8px',
                      fontWeight: '600',
                      cursor: 'pointer',
                      transition: 'all 0.3s'
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={createLoading}
                    style={{
                      padding: '12px 24px',
                      backgroundColor: createLoading ? '#9ca3af' : '#8B4513',
                      color: 'white',
                      border: 'none',
                      borderRadius: '8px',
                      fontWeight: '600',
                      cursor: createLoading ? 'not-allowed' : 'pointer',
                      transition: 'background-color 0.3s'
                    }}
                  >
                    {createLoading ? 'Creating...' : 'Create Ticket'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CustomerTickets;
