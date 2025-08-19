// src/components/auth/ResetPassword.jsx
import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';

const ResetPassword = ({ switchToLogin }) => {
    const { resetPassword } = useAuth();
    const [customId, setCustomId] = useState('');
    const [identifier, setIdentifier] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [passwordError, setPasswordError] = useState('');
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (newPassword !== confirmPassword) {
            setPasswordError('Passwords do not match.');
            return;
        }
        setError('');
        setPasswordError('');
        setMessage('');
        setLoading(true);
        try {
            const data = await resetPassword(customId, identifier, newPassword);
            setMessage(data.message + " You will be redirected to login shortly.");
            setTimeout(() => switchToLogin(), 3000);
        } catch (err) {
            const errorMessage = err.message || 'Failed to reset password.';
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
                <h2 className="text-3xl font-bold text-center text-gray-800 mb-6">Reset Password</h2>
                {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4">{error}</div>}
                {message && <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative mb-4">{message}</div>}
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="customId">User ID</label>
                        <input type="text" id="customId" className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700" value={customId} onChange={(e) => setCustomId(e.target.value)} placeholder="e.g., STOK1001" required />
                    </div>
                    <div>
                        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="identifier">Email or Phone Number</label>
                        <input type="text" id="identifier" className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700" value={identifier} onChange={(e) => setIdentifier(e.target.value)} required />
                    </div>
                    <div>
                        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="newPassword">New Password</label>
                        <input type="password" id="newPassword" className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required />
                    </div>
                     <div>
                        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="confirmPassword">Confirm New Password</label>
                        <input type="password" id="confirmPassword" className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required />
                        {passwordError && <p className="text-red-500 text-xs italic mt-2">{passwordError}</p>}
                    </div>
                    <button type="submit" className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-lg w-full" disabled={loading}>{loading ? 'Resetting...' : 'Reset Password'}</button>
                </form>
                 <p className="mt-6 text-center text-gray-600">
                    Remembered your password?{' '}
                    <button onClick={switchToLogin} className="text-blue-600 hover:text-blue-800 font-bold focus:outline-none">
                        Login
                    </button>
                </p>
            </div>
        </div>
    );
};

export default ResetPassword;
