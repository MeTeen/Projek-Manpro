import { useState, FormEvent } from 'react';
import axios from 'axios';

export default function Signup() {
  const [form, setForm] = useState<{ username: string; password: string }>({ username: '', password: '' });

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:3000/auth/signup', form);
      alert('Signup success, please login');
    } catch (error) {
      alert('Signup failed');
      console.error(error);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="text"
        placeholder="Username"
        onChange={(e) => setForm({ ...form, username: e.target.value })}
        required
      />
      <input
        type="password"
        placeholder="Password"
        onChange={(e) => setForm({ ...form, password: e.target.value })}
        required
      />
      <button type="submit">Signup</button>
    </form>
  );
}
