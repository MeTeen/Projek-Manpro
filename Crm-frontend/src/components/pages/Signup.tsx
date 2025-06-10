import { useState, FormEvent } from 'react';
import axios from 'axios';
import { checkEmailTerdaftar } from '../../context/AuthContext';



export default function Signup() {
  const [form, setForm] = useState<{ username: string; email: string; password: string }>({ username: '', email: '', password: '' });
  const [error, setError] = useState<string | null>(null);




  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    const emailValid = await checkEmailTerdaftar(form.email);
    if (!emailValid) {
      setError("Email belum didaftarkan oleh admin");
      return;
    }

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
      {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
      <button type="submit">Signup</button>
    </form>
  );
}
