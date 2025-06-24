// frontend/src/pages/LoginPage.tsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom'; // Import useNavigate for redirection

const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState(''); // To display success or error messages
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(''); // Clear previous messages

    try {
      const response = await fetch('http://localhost:5000/api/auth/login', { // Ensure this URL matches your backend
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage(data.message);
        // Store the JWT token in local storage
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user)); // Store user details too

        // Redirect to the dashboard
        setTimeout(() => navigate('/dashboard'), 1000);
      } else {
        setMessage(data.message || 'Login failed');
      }
    } catch (error) {
      console.error('Error during login:', error);
      setMessage('Network error or server unreachable');
    }
  };

  return (
    <main className="flex items-center justify-center min-h-screen bg-gray-50">
      <form className="bg-white p-8 rounded-lg shadow-md w-full max-w-md" onSubmit={handleSubmit}>
        <h2 className="text-2xl font-bold mb-6 text-blue-700">Login to EducateNext</h2>
        <input
          type="email"
          placeholder="Email"
          className="w-full mb-4 p-2 border rounded"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Password"
          className="w-full mb-6 p-2 border rounded"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button
          type="submit"
          className="bg-blue-600 w-full py-2 text-white rounded hover:bg-blue-700"
        >
          Login
        </button>
        {message && <p className="mt-4 text-center text-sm">{message}</p>}
      </form>
    </main>
  );
};

export default LoginPage;
