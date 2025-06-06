// Login.tsx
import { useState, FormEvent } from 'react';
import axios from 'axios';

interface LoginProps {
  setToken: (token: string) => void;
  setRole: (role: string) => void;
}

export default function Login({ setToken, setRole }: LoginProps) {
  const [form, setForm] = useState<{ username: string; password: string }>({ username: '', password: '' });

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const res = await axios.post('http://localhost:3000/auth/login', form);
    localStorage.setItem('token', res.data.token);
    setToken(res.data.token);
    setRole(res.data.role);
  };

  return (
    <form onSubmit={handleSubmit}>
      <input type="text" placeholder="Username" onChange={(e) => setForm({ ...form, username: e.target.value })} />
      <input type="password" placeholder="Password" onChange={(e) => setForm({ ...form, password: e.target.value })} />
      <button type="submit">Login</button>
    </form>
  );
}
