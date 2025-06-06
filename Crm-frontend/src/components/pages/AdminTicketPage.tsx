// AdminTicketPage.tsx
import { useEffect, useState } from 'react';
import axios from 'axios';

interface Ticket {
  id: number;
  title: string;
  description: string;
  status: string;
}

export default function AdminTicketPage() {
  const [tickets, setTickets] = useState<Ticket[]>([]);

  useEffect(() => {
    const fetchTickets = async () => {
      const token = localStorage.getItem('token');
      if (!token) return;

      const res = await axios.get('http://localhost:3000/tickets', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setTickets(res.data);
    };
    fetchTickets();
  }, []);

  const updateStatus = async (id: number, status: string) => {
    const token = localStorage.getItem('token');
    if (!token) return;

    await axios.put(`http://localhost:3000/tickets/${id}`, { status }, {
      headers: { Authorization: `Bearer ${token}` },
    });
    alert('Updated');
  };

  return (
    <div>
      {tickets.map((ticket) => (
        <div key={ticket.id}>
          <h4>{ticket.title}</h4>
          <p>{ticket.description}</p>
          <p>Status: {ticket.status}</p>
          <button onClick={() => updateStatus(ticket.id, 'resolved')}>Mark as Resolved</button>
        </div>
      ))}
    </div>
  );
}
