import React, { useEffect, useState } from 'react';
import Sidebar from '../dashboard/Sidebar';
import Header from '../dashboard/Header';
import axios from 'axios';

interface Ticket {
  id: number;
  subject: string;
  message: string;
  status: 'Open' | 'In Progress' | 'Resolved';
  createdAt: string;
  customerName: string;
}

const AdminTicketPage: React.FC = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [tickets, setTickets] = useState<Ticket[]>([]);

  const toggleSidebar = () => setSidebarCollapsed(!sidebarCollapsed);

  useEffect(() => {
    fetchTickets();
  }, []);

  const fetchTickets = async () => {
    try {
      const response = await axios.get('/api/admin/tickets');
      setTickets(response.data);
    } catch (error) {
      console.error('Failed to fetch tickets', error);
    }
  };

  const handleStatusChange = async (id: number, newStatus: Ticket['status']) => {
    try {
      await axios.patch(`/api/admin/tickets/${id}`, { status: newStatus });
      fetchTickets();
    } catch (error) {
      console.error('Failed to update ticket status', error);
    }
  };

  return (
    <div style={{ display: 'flex', height: '100vh' }}>
      <Sidebar collapsed={sidebarCollapsed} onToggle={toggleSidebar} />
      <div style={{ flex: 1, overflowY: 'auto' }}>
        <div style={{ padding: '20px 30px' }}>
          <Header onAddNewClick={() => {}} onCustomerCreated={() => {}} />
          <h1 style={{ fontSize: '28px', fontWeight: 'bold', marginBottom: '20px' }}>Handle Ticket Complaints</h1>

          {tickets.map((ticket) => (
            <div
              key={ticket.id}
              style={{
                border: '1px solid #ccc',
                borderRadius: '8px',
                padding: '16px',
                marginBottom: '16px',
                backgroundColor: '#fff'
              }}
            >
              <h2 style={{ marginBottom: '8px', color: '#1e3a8a' }}>{ticket.subject}</h2>
              <p><strong>Customer:</strong> {ticket.customerName}</p>
              <p><strong>Message:</strong> {ticket.message}</p>
              <p><strong>Status:</strong> {ticket.status}</p>
              <p><strong>Submitted:</strong> {new Date(ticket.createdAt).toLocaleString()}</p>

              <div style={{ marginTop: '10px' }}>
                <select
                  value={ticket.status}
                  onChange={(e) => handleStatusChange(ticket.id, e.target.value as Ticket['status'])}
                  style={{ padding: '6px 12px', borderRadius: '4px' }}
                >
                  <option value="Open">Open</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Resolved">Resolved</option>
                </select>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AdminTicketPage;
