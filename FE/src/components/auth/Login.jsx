// src/components/auth/Login.jsx
import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';

// Accept loginAttempts and setLoginAttempts as props
const Login = ({ switchToSignup, goToForgotPassword, loginAttempts, setLoginAttempts }) => {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  // REMOVE the local state for login attempts
  // const [loginAttempts, setLoginAttempts] = useState(0);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
    } catch (err) {
      setError('Failed to log in: ' + err.message);
      // USE the setLoginAttempts function from props
      setLoginAttempts(prev => prev + 1);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md">
        <h2 className="text-3xl font-bold text-center text-gray-800 mb-6">Login</h2>
        {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">{error}</div>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="email">Email</label>
            <input type="email" id="email" className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>
          <div>
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="password">Password</label>
            <input type="password" id="password" className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700" value={password} onChange={(e) => setPassword(e.target.value)} required />
          </div>
          {/* This part remains the same and will now work correctly */}
          {loginAttempts >= 2 && (
            <div className="text-right">
                <button onClick={goToForgotPassword} type="button" className="text-sm text-blue-600 hover:text-blue-800 font-bold">
                    Forgot Password?
                </button>
            </div>
          )}
          <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg w-full" disabled={loading}>
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>
        <p className="mt-6 text-center text-gray-600">
          Don't have an account?{' '}
          <button onClick={switchToSignup} className="text-blue-600 hover:text-blue-800 font-bold">
            Sign Up
          </button>
        </p>
      </div>
    </div>
  );
};

export default Login;