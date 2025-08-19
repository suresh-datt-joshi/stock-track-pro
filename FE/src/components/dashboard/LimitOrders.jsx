// src/components/dashboard/LimitOrders.jsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { API_BASE_URL } from '../../api/config';

const LimitOrders = ({ portfolio, onOrderChange }) => {
    const { currentUser } = useAuth();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    // Form state
    const [orderType, setOrderType] = useState('buy');
    const [stockId, setStockId] = useState('');
    const [quantity, setQuantity] = useState('');
    const [limitPrice, setLimitPrice] = useState('');
    const [error, setError] = useState('');
    const [message, setMessage] = useState('');

    const fetchOrders = async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/orders`, {
                headers: { 'Authorization': `Bearer ${currentUser.token}` }
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.message);
            setOrders(data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchOrders();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setMessage('');

        try {
            // A simple lookup for stock name - in a real app, you might validate the symbol first
            const stockName = portfolio.stocks.find(s => s.id.toUpperCase() === stockId.toUpperCase())?.name || stockId.toUpperCase();
            
            const response = await fetch(`${API_BASE_URL}/orders`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${currentUser.token}` },
                body: JSON.stringify({ stockId: stockId.toUpperCase(), stockName, type: orderType, quantity: Number(quantity), limitPrice: Number(limitPrice) })
            });
            const data = await response.json();

            if (!response.ok) throw new Error(data.message);
            
            setMessage('Order placed successfully!');
            onOrderChange(data.portfolio); // Update parent portfolio state
            fetchOrders(); // Refresh the list
            // Reset form
            setStockId(''); setQuantity(''); setLimitPrice('');
        } catch (err) {
            setError(err.message);
        }
    };

    const handleCancelOrder = async (orderId) => {
        if (!window.confirm('Are you sure you want to cancel this order?')) return;
        try {
             const response = await fetch(`${API_BASE_URL}/orders/${orderId}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${currentUser.token}` }
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.message);
            
            setMessage('Order cancelled.');
            onOrderChange(data.portfolio);
            fetchOrders();
        } catch (err) {
             setError(err.message);
        }
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Place Order Form */}
            <div className="lg:col-span-1 bg-white p-6 rounded-xl shadow-lg border">
                <h3 className="text-xl font-bold mb-4 border-b pb-2">Place Limit Order</h3>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Order Type</label>
                        <select value={orderType} onChange={e => setOrderType(e.target.value)} className="mt-1 block w-full p-2 border border-gray-300 rounded-md">
                            <option value="buy">Buy</option>
                            <option value="sell">Sell</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Stock Symbol</label>
                        <input type="text" value={stockId} onChange={e => setStockId(e.target.value)} placeholder="e.g., AAPL" required className="mt-1 block w-full p-2 border border-gray-300 rounded-md uppercase" />
                    </div>
                     <div>
                        <label className="block text-sm font-medium text-gray-700">Quantity</label>
                        <input type="number" value={quantity} onChange={e => setQuantity(e.target.value)} min="1" required className="mt-1 block w-full p-2 border border-gray-300 rounded-md" />
                    </div>
                     <div>
                        <label className="block text-sm font-medium text-gray-700">Limit Price ($)</label>
                        <input type="number" value={limitPrice} onChange={e => setLimitPrice(e.target.value)} step="0.01" min="0.01" required className="mt-1 block w-full p-2 border border-gray-300 rounded-md" />
                    </div>
                    <button type="submit" className="w-full bg-blue-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-blue-700">Place Order</button>
                    {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
                    {message && <p className="text-green-500 text-sm mt-2">{message}</p>}
                </form>
            </div>

            {/* Pending Orders List */}
            <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-lg border">
                <h3 className="text-xl font-bold mb-4 border-b pb-2">Pending Orders</h3>
                {loading ? <p>Loading orders...</p> : (
                    <div className="space-y-3">
                        {orders.length === 0 && <p className="text-gray-500">No pending orders.</p>}
                        {orders.map(order => (
                            <div key={order._id} className="p-3 bg-gray-50 rounded-lg flex justify-between items-center">
                                <div>
                                    <p className="font-bold">
                                        <span className={order.type === 'buy' ? 'text-green-600' : 'text-red-600'}>{order.type.toUpperCase()}</span> {order.quantity} x {order.stockName}
                                    </p>
                                    <p className="text-sm text-gray-600">@ ${order.limitPrice.toFixed(2)}</p>
                                </div>
                                <button onClick={() => handleCancelOrder(order._id)} className="bg-red-500 text-white text-xs font-bold py-1 px-3 rounded-md hover:bg-red-600">Cancel</button>
                            </div>
                        ))}
                    </div>
                )}
                 <div className="mt-4 p-3 bg-yellow-100 text-yellow-800 text-sm rounded-lg">
                    <p><strong className="font-bold">Note:</strong> Pending orders are checked and executed automatically every minute if price conditions are met.</p>
                </div>
            </div>
        </div>
    );
};

export default LimitOrders;