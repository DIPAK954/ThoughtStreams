import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Login = () => {
  const [formData, setFormData] = useState({
    identifier: '', // username or email
    password: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const result = await login(formData.identifier, formData.password);
    if (!result.success) {
      setError(result.error);
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-zinc-900 text-white flex flex-col items-center justify-center p-5">
      <div className="mb-6 text-center">
        <h3 className="text-5xl font-bold text-blue-500 drop-shadow-lg">ThoughtStreams</h3>
        <p className="text-sm text-zinc-400 mt-1">Flow your thoughts freely</p>
      </div>
      <div className="w-full max-w-md bg-zinc-800 p-8 rounded-lg shadow-lg">
        <h3 className="text-3xl font-semibold mb-5 text-center">Login to Your Account</h3>
        <p className="text-center text-sm text-zinc-400 mb-5">Welcome back to the ThoughtStreams!</p>
        {error && (
          <div className="mb-4 p-3 bg-red-500 text-white rounded-md text-sm">
            {error}
          </div>
        )}
        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <input
            className="w-full px-3 py-2 outline-none bg-transparent rounded-lg border-2 border-zinc-700 focus:border-blue-500 transition-colors"
            type="text"
            placeholder="Username or Email"
            name="identifier"
            value={formData.identifier}
            onChange={handleChange}
            required
          />
          <input
            className="w-full px-3 py-2 outline-none bg-transparent rounded-lg border-2 border-zinc-700 focus:border-blue-500 transition-colors"
            type="password"
            placeholder="Password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            required
          />
          <button
            className="w-full px-5 py-2 rounded-md bg-blue-500 hover:bg-blue-600 transition cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            type="submit"
            disabled={loading}
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>
        <div className="mt-5 text-center">
          <Link to="/" className="text-blue-400 hover:underline">
            Don't have an account? Register
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Login; 
