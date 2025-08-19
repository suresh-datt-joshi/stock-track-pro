// src/components/auth/Signup.jsx
import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';

const Signup = ({ switchToLogin }) => {
  const { signup } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState(''); 
  const [dob, setDob] = useState('');
  const [address, setAddress] = useState(''); 
  const [phoneNo, setPhoneNo] = useState('');
  const [error, setError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setPasswordError('');

    if (password !== confirmPassword) {
      setPasswordError('Passwords do not match.');
      return;
    }

    setLoading(true);
    try {
      await signup(email, password, name, dob, address, phoneNo);
      alert('Signup successful! Please remember your User ID and log in.');
      switchToLogin();
    } catch (err) {
      const errorMessage = err.message || 'An unknown error occurred during signup.';
      if (errorMessage.toLowerCase().includes('password')) {
          setPasswordError(errorMessage);
      } else {
          setError(errorMessage);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md">
        <h2 className="text-3xl font-bold text-center text-gray-800 mb-6">Sign Up</h2>
        {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4">{error}</div>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div><label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="name">Full Name</label><input type="text" id="name" className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700" value={name} onChange={(e) => setName(e.target.value)} required /></div>
          <div><label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="dob">Date of Birth</label><input type="date" id="dob" className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700" value={dob} onChange={(e) => setDob(e.target.value)} required /></div>
          <div><label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="address">Address</label><input type="text" id="address" className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700" value={address} onChange={(e) => setAddress(e.target.value)} required /></div>
          <div><label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="phoneNo">Phone Number</label><input type="tel" id="phoneNo" className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700" value={phoneNo} onChange={(e) => setPhoneNo(e.target.value)} required /></div>
          <div><label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="email">Email</label><input type="email" id="email" className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700" value={email} onChange={(e) => setEmail(e.target.value)} required /></div>
          <div>
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="password">Create Password</label>
            <input type="password" id="password" className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700" value={password} onChange={(e) => setPassword(e.target.value)} required />
          </div>
          <div>
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="confirmPassword">Confirm Password</label>
            <input type="password" id="confirmPassword" className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required />
            {passwordError && <p className="text-red-500 text-xs italic mt-2">{passwordError}</p>}
          </div>
          <button type="submit" className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-lg w-full" disabled={loading}>{loading ? 'Signing up...' : 'Sign Up'}</button>
        </form>
        <p className="mt-6 text-center text-gray-600">Already have an account?{' '}<button onClick={switchToLogin} className="text-blue-600 hover:text-blue-800 font-bold">Login</button></p>
      </div>
    </div>
  );
};

export default Signup;
