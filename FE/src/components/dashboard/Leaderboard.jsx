// src/components/dashboard/Leaderboard.jsx
import React, { useState, useEffect } from 'react';
import { API_BASE_URL } from '../../api/config';

const Leaderboard = () => {
    const [leaderboardData, setLeaderboardData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchLeaderboard = async () => {
            try {
                setLoading(true);
                const response = await fetch(`${API_BASE_URL}/leaderboard`);
                if (!response.ok) {
                    throw new Error('Could not fetch leaderboard data.');
                }
                const data = await response.json();
                setLeaderboardData(data);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchLeaderboard();
    }, []);

    if (loading) {
        return <div className="text-center p-8">Loading Leaderboard...</div>;
    }

    if (error) {
        return <div className="text-center p-8 text-red-500">Error: {error}</div>;
    }

    return (
        <div className="lg:col-span-3 bg-white p-6 rounded-xl shadow-lg border border-gray-200">
            <h2 className="text-3xl font-bold text-gray-800 mb-6 text-center border-b pb-4">
                🏆 Top Traders Leaderboard 🏆
            </h2>
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rank</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Net Worth</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {leaderboardData.map((user, index) => (
                            <tr key={index} className="hover:bg-gray-50">
                                <td className="px-6 py-4 whitespace-nowrap text-lg font-bold text-gray-700">{index + 1}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-md font-medium text-gray-900">{user.name}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-md text-gray-800 font-semibold text-right">
                                    {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(user.netWorth)}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default Leaderboard;