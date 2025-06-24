// frontend/src/pages/RegisterPage.tsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom'; // Import useNavigate for redirection

const RegisterPage: React.FC = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState(''); // To display success or error messages
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(''); // Clear previous messages

    // For initial registration, we'll assume an Administrator role and a dummy institution ID.
    // In a real application, institutionId would be dynamic (e.g., after institution creation)
    // and roles would be managed by a Super Admin or through a more complex registration flow.
    const institutionId = '60c72b2f9a1b4d0015b8e1a0'; // Replace with a valid/dummy institution ID or dynamic input
    const role = 'Administrator'; // Assuming initial registration is for an Administrator

    try {
      const response = await fetch('http://localhost:5000/api/auth/register', { // Ensure this URL matches your backend
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, email, password, role, institutionId }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage(data.message + '. Redirecting to login...');
        // Optionally store the token if you want to auto-login
        // localStorage.setItem('token', data.token);
        setTimeout(() => navigate('/login'), 2000); // Redirect to login page after 2 seconds
      } else {
        setMessage(data.message || 'Registration failed');
      }
    } catch (error) {
      console.error('Error during registration:', error);
      setMessage('Network error or server unreachable');
    }
  };

  return (
    <main className="flex items-center justify-center min-h-screen bg-gray-50">
      <form className="bg-white p-8 rounded-lg shadow-md w-full max-w-md" onSubmit={handleSubmit}>
        <h2 className="text-2xl font-bold mb-6 text-blue-700">Register Administrator</h2>
        <input
          type="text"
          placeholder="Name"
          className="w-full mb-4 p-2 border rounded"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
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
          Register
        </button>
        {message && <p className="mt-4 text-center text-sm">{message}</p>}
      </form>
    </main>
  );
};

export default RegisterPage;
