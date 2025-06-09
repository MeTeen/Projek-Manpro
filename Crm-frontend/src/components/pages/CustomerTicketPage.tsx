import { useState } from 'react';
import axios from 'axios';

export default function CustomerTicketPage() {
  const [form, setForm] = useState<{ title: string; description: string }>({ title: '', description: '' });

  const submitTicket = async () => {
    const token = localStorage.getItem('token');
    if (!token) return alert('No token found');

    try {
      await axios.post('http://localhost:3000/tickets', form, {
        headers: { Authorization: `Bearer ${token}` },
      });
      alert('Ticket submitted');
    } catch (error) {
      alert('Submission failed');
      console.error(error);
    }
  };

  return (
    <div>
      <input
        placeholder="Title"
        onChange={(e) => setForm({ ...form, title: e.target.value })}
        value={form.title}
        required
      />
      <textarea
        placeholder="Description"
        onChange={(e) => setForm({ ...form, description: e.target.value })}
        value={form.description}
        required
      />
      <button onClick={submitTicket}>Submit</button>
    </div>
  );
}
