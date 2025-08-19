// src/components/dashboard/StockMarketDashboard.jsx
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { API_BASE_URL } from '../../api/config';
import AboutSidebar from '../ui/AboutSidebar';
import SkeletonLoader from './SkeletonLoader';
import StockChart from './StockChart';
import Leaderboard from './Leaderboard';
import LimitOrders from './LimitOrders';    
import FinancialNews from './FinancialNews'; 

const StockMarketDashboard = () => {
    const { currentUser, userId, logout } = useAuth();
    const [showAboutSidebar, setShowAboutSidebar] = useState(false);
    const searchResultRef = useRef(null);

    // This list is for the "Market Watch" simulation only.
    const initialStocks = [
        { id: 'AAPL', name: 'Apple Inc.', price: 170.00 }, { id: 'MSFT', name: 'Microsoft Corp.', price: 420.00 }, { id: 'GOOGL', name: 'Alphabet Inc. (Class A)', price: 150.00 }, { id: 'AMZN', name: 'Amazon.com Inc.', price: 180.00 }, { id: 'TSLA', name: 'Tesla Inc.', price: 190.00 }, { id: 'NVDA', name: 'NVIDIA Corp.', price: 900.00 }, { id: 'META', name: 'Meta Platforms Inc.', price: 470.00 }, { id: 'NFLX', name: 'Netflix Inc.', price: 650.00 }, { id: 'ADBE', name: 'Adobe Inc.', price: 500.00 }, { id: 'CRM', name: 'Salesforce Inc.', price: 250.00 }, { id: 'INTC', name: 'Intel Corp.', price: 35.00 }, { id: 'CSCO', name: 'Cisco Systems Inc.', price: 50.00 }, { id: 'PYPL', name: 'PayPal Holdings Inc.', price: 60.00 }, { id: 'CMCSA', name: 'Comcast Corp.', price: 45.00 }, { id: 'PEP', name: 'PepsiCo Inc.', price: 180.00 }, { id: 'KO', name: 'Coca-Cola Co.', price: 60.00 }, { id: 'WMT', name: 'Walmart Inc.', price: 150.00 }, { id: 'JPM', name: 'JPMorgan Chase & Co.', price: 140.00 },
    ];

    const [stocks, setStocks] = useState(initialStocks);
    const [portfolio, setPortfolio] = useState({ stocks: [], balance: 0, totalWithdrawn: 0, realizedProfit: 0 });
    const [watchlist, setWatchlist] = useState([]);
    const [transactions, setTransactions] = useState([]);
    const [userProfile, setUserProfile] = useState(null);
    const [message, setMessage] = useState({ type: '', text: '' });
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [confirmAction, setConfirmAction] = useState(null);
    const [activeSection, setActiveSection] = useState('home');
    const [searchSymbol, setSearchSymbol] = useState('');
    const [searchedStock, setSearchedStock] = useState(null);
    const [searchLoading, setSearchLoading] = useState(false);
    const [searchError, setSearchError] = useState(null);
    const [topMarketWatchStocks, setTopMarketWatchStocks] = useState([]);
    const [fundAmount, setFundAmount] = useState('');
    const [fundActionType, setFundActionType] = useState(null);
    
    // State for the chart
    const [chartData, setChartData] = useState(null);
    const [chartRange, setChartRange] = useState('1D');
    const [chartLoading, setChartLoading] = useState(false);
    const [chartError, setChartError] = useState(null);
    
    const DEFAULT_INITIAL_CASH = 10000;

    const showMessage = (type, text) => {
        setMessage({ type, text });
        setTimeout(() => setMessage({ type: '', text: '' }), 3000);
    };

    const fetchUserData = useCallback(async () => {
        if (!userId || !currentUser?.token) return;
        try {
            const response = await fetch(`${API_BASE_URL}/users/${userId}/data`, { 
                headers: { 'Authorization': `Bearer ${currentUser.token}` } 
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.message || 'Failed to fetch user data.');
            
            setUserProfile(data.profile || {});
            setPortfolio(data.portfolio || { balance: DEFAULT_INITIAL_CASH, stocks: [], totalWithdrawn: 0, realizedProfit: 0 });
            setWatchlist(data.watchlist?.stocks || []);
            setTransactions(data.transactions || []);
        } catch (error) {
            console.error("Error fetching user data:", error);
            showMessage('error', 'Could not load user data.');
        }
    }, [userId, currentUser?.token]);

    useEffect(() => {
        fetchUserData();
    }, [fetchUserData]);

    const simulatePriceChange = (currentPrice) => {
        const change = (Math.random() * 10 - 5) / 100;
        return parseFloat((currentPrice * (1 + change)).toFixed(2));
    };

    useEffect(() => {
        const interval = setInterval(() => {
            setStocks(prevStocks =>
                prevStocks.map(stock => ({ ...stock, price: simulatePriceChange(stock.price) }))
            );
        }, 5000);
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        if (stocks.length > 0) {
            const stocksWithChange = stocks.map(stock => {
                const initialStockData = initialStocks.find(s => s.id === stock.id);
                const initialP = initialStockData ? initialStockData.price : stock.price;
                const currentP = stock.price;
                const calculatedChangePercent = initialP !== 0 ? ((currentP - initialP) / initialP) * 100 : 0;
                return { ...stock, changePercent: calculatedChangePercent };
            });
            const sortedStocks = stocksWithChange.sort((a, b) => b.changePercent - a.changePercent);
            setTopMarketWatchStocks(sortedStocks.slice(0, 10));
        }
    }, [stocks]);

    const fetchChartData = async (symbol, range) => {
        setChartLoading(true);
        setChartError(null);
        try {
            const response = await fetch(`${API_BASE_URL}/stocks/${symbol}/chart?range=${range}`, {
                headers: { 'Authorization': `Bearer ${currentUser.token}` }
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.message || 'Failed to fetch chart data.');
            setChartData(data);
        } catch (err) {
            setChartError(err.message);
            setChartData(null);
        } finally {
            setChartLoading(false);
        }
    };

    const handleSearchSubmit = async (e) => {
        if (e) e.preventDefault();
        if (!searchSymbol.trim()) { setSearchError('Please enter a stock symbol.'); return; }

        setSearchLoading(true);
        setSearchError(null);
        setSearchedStock(null);
        setChartData(null);
        setChartError(null);
        const currentSearchSymbol = searchSymbol.trim().toUpperCase();

        try {
            // Fetch Quote Data
            const quoteResponse = await fetch(`${API_BASE_URL}/stocks/${currentSearchSymbol}`, {
                headers: { 'Authorization': `Bearer ${currentUser.token}` }
            });
            const quoteData = await quoteResponse.json();
            if (!quoteResponse.ok) throw new Error(quoteData.message);

            const stockData = {
                id: quoteData.symbol,
                name: quoteData.shortName || quoteData.displayName || currentSearchSymbol,
                price: parseFloat(quoteData.regularMarketPrice),
                changePercent: parseFloat(quoteData.regularMarketChangePercent || 0),
                exchange: quoteData.fullExchangeName || 'N/A'
            };
            setSearchedStock(stockData);
            
            // Set default range and fetch initial chart data
            const defaultRange = '1D';
            setChartRange(defaultRange);
            await fetchChartData(currentSearchSymbol, defaultRange);

        } catch (err) {
            setSearchError(err.message);
        } finally {
            setSearchLoading(false);
        }
    };

    const handleChartRangeChange = (newRange) => {
        if (!searchedStock) return;
        setChartRange(newRange);
        fetchChartData(searchedStock.id, newRange);
    };

    useEffect(() => {
        function handleClickOutside(event) {
            if (searchResultRef.current && !searchResultRef.current.contains(event.target)) {
                setSearchedStock(null);
                setSearchSymbol('');
                setSearchError(null);
                setChartData(null);
                setChartError(null);
            }
        }
        if (searchedStock) {
            document.addEventListener("mousedown", handleClickOutside);
        }
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [searchedStock]);

    const handleTransaction = async (endpoint, body, successMessage) => {
        try {
            const response = await fetch(`${API_BASE_URL}/portfolio/${endpoint}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${currentUser.token}`
                },
                body: JSON.stringify(body)
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.message);
            
            setPortfolio(data.portfolio);
            if(data.transactions) setTransactions(data.transactions);
            showMessage('success', successMessage);
            return true;
        } catch (error) {
            showMessage('error', error.message || 'Transaction failed.');
            return false;
        }
    };
    
    const confirmTransaction = async () => {
        setShowConfirmModal(false);
        if (!confirmAction) return;
        const { action, stock, quantity, amount } = confirmAction;

        let success = false;
        if (action === 'buy') {
            success = await handleTransaction('buy', { stockId: stock.id, quantity }, `Successfully bought ${quantity} of ${stock.name}.`);
        } else if (action === 'sell') {
            success = await handleTransaction('sell', { stockId: stock.id, quantity }, `Successfully sold ${quantity} of ${stock.name}.`);
        } else if (action === 'addFunds') {
            success = await handleTransaction('add-funds', { amount }, `Added $${amount.toFixed(2)} to balance.`);
        } else if (action === 'withdrawFunds') {
            success = await handleTransaction('withdraw-funds', { amount }, `Withdrew $${amount.toFixed(2)}.`);
        }
        
        if (success && (action === 'addFunds' || action === 'withdrawFunds')) {
            setFundAmount('');
            setFundActionType(null);
        }
        setConfirmAction(null);
    };

    const handleUpdateWatchlist = async (newWatchlistStocks) => {
        try {
            const response = await fetch(`${API_BASE_URL}/users/${userId}/watchlist`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${currentUser.token}`
                },
                body: JSON.stringify({ watchlist: { stocks: newWatchlistStocks }})
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.message);
            setWatchlist(data.watchlist.stocks);
            return true;
        } catch (error) {
            showMessage('error', error.message || 'Could not update watchlist.');
            return false;
        }
    };

    const handleAddToWatchlist = async (stockToAdd) => {
        if (watchlist.some(item => item.id === stockToAdd.id)) {
            showMessage('info', 'Already in watchlist.');
            return;
        }
        const newWatchlist = [...watchlist, stockToAdd];
        const success = await handleUpdateWatchlist(newWatchlist);
        if (success) showMessage('success', 'Added to watchlist!');
    };

    const handleRemoveFromWatchlist = async (stockToRemoveId) => {
        const newWatchlist = watchlist.filter(item => item.id !== stockToRemoveId);
        const success = await handleUpdateWatchlist(newWatchlist);
        if (success) showMessage('success', 'Removed from watchlist.');
    };

    const getPortfolioValue = () => portfolio.stocks.reduce((total, item) => {
        const currentStock = stocks.find(s => s.id === item.id) || searchedStock;
        return total + (currentStock ? currentStock.price * item.quantity : (item.purchasePrice || 0) * item.quantity);
    }, 0);

    const getTotalInvestment = () => portfolio.stocks.reduce((total, item) => total + ((item.purchasePrice || 0) * item.quantity), 0);

    const isStockInWatchlist = (stockId) => watchlist.some(item => item.id === stockId);
    
    const cancelTransaction = () => { setShowConfirmModal(false); setConfirmAction(null); showMessage('info', 'Transaction cancelled.'); setFundAmount(''); setFundActionType(null); };
    const selectFundAction = (type) => { setFundActionType(type); setFundAmount(''); };
    const dynamicTexts = ["Invest Smarter, Live Better.", "Your Financial Journey Starts Here.", "Unlock Market Opportunities.", "Track, Trade, Thrive."];
    const [currentDynamicTextIndex, setCurrentDynamicTextIndex] = useState(0);
    useEffect(() => { const textInterval = setInterval(() => { setCurrentDynamicTextIndex((prevIndex) => (prevIndex + 1) % dynamicTexts.length); }, 4000); return () => clearInterval(textInterval); }, []);

    const renderSection = () => {
        switch (activeSection) {
            case 'home':
                return (
                    <div className="lg:col-span-3 bg-white p-6 rounded-xl shadow-lg border border-gray-200 text-center">
                        <h2 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-purple-600 mb-6 animate-pulse">{dynamicTexts[currentDynamicTextIndex]}</h2>
                        <p className="text-lg text-gray-700 mb-8">Search for stocks, add them to your watchlist, and manage your portfolio.</p>
                        <h2 className="text-2xl font-bold text-gray-800 mb-4 border-b pb-2">Search NASDAQ Stocks</h2>
                        <form onSubmit={handleSearchSubmit} className="flex gap-3 mb-6 max-w-lg mx-auto">
                            <input type="text" value={searchSymbol} onChange={(e) => setSearchSymbol(e.target.value.toUpperCase())} placeholder="Enter stock symbol (e.g., GOOGL)" className="flex-grow p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
                            <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-3 rounded-lg font-semibold shadow-md" disabled={searchLoading}>{searchLoading ? 'Searching...' : 'Search'}</button>
                        </form>
                        {searchLoading && <SkeletonLoader />}
                        {searchError && (<div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-6 max-w-lg mx-auto">{searchError}</div>)}
                        {searchedStock && (
                            <div ref={searchResultRef} className="bg-blue-50 p-5 rounded-lg shadow-md border border-blue-200 mb-8 max-w-4xl mx-auto">
                                <h3 className="text-xl font-bold text-blue-800 mb-3">Searched Stock: {searchedStock.id}</h3>
                                <div className="grid grid-cols-2 gap-3 text-gray-700">
                                    <p><span className="font-semibold">Company:</span> {searchedStock.name}</p>
                                    <p><span className="font-semibold">Price:</span> ${searchedStock.price.toFixed(2)}</p>
                                    <p><span className="font-semibold">Change %:</span> <span className={searchedStock.changePercent >= 0 ? 'text-green-600' : 'text-red-600'}>{searchedStock.changePercent?.toFixed(2)}%</span></p>
                                    <p><span className="font-semibold">Exchange:</span> {searchedStock.exchange}</p>
                                </div>
                                <div className="mt-5 flex justify-center space-x-4">
                                    <button onClick={() => setShowConfirmModal(true) & setConfirmAction({ action: 'buy', stock: searchedStock, quantity: 1 })} className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-semibold shadow-md disabled:bg-gray-400" disabled={(1 * searchedStock.price) > portfolio.balance}>Buy 1 Share</button>
                                    {!isStockInWatchlist(searchedStock.id) ? (<button onClick={() => handleAddToWatchlist(searchedStock)} className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg font-semibold shadow-md">Add to Watchlist</button>) : (<button onClick={() => handleRemoveFromWatchlist(searchedStock.id)} className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-3 rounded-lg font-semibold shadow-md">Remove from Watchlist</button>)}
                                </div>
                                
                                <StockChart 
                                    data={chartData}
                                    onRangeChange={handleChartRangeChange}
                                    currentRange={chartRange}
                                    isLoading={chartLoading}
                                    error={chartError}
                                />
                            </div>
                        )}
                    </div>
                );
            case 'portfolio':
                return (
                    <div className="lg:col-span-3 bg-white p-6 rounded-xl shadow-lg border border-gray-200">
                        <h2 className="text-2xl font-bold text-gray-800 mb-4 border-b pb-2">Your Portfolio</h2>
                        <div className="space-y-3 mb-6">
                            <div className="flex justify-between items-center text-lg"><span className="font-semibold text-gray-700">Cash Balance:</span><span className="text-green-600 font-bold">${portfolio.balance.toFixed(2)}</span></div>
                            <div className="flex justify-between items-center text-lg"><span className="font-semibold text-gray-700">Portfolio Value:</span><span className="text-purple-600 font-bold">${getPortfolioValue().toFixed(2)}</span></div>
                            <div className="flex justify-between items-center text-lg"><span className="font-semibold text-gray-700">Total Investment:</span><span className="text-orange-600 font-bold">${getTotalInvestment().toFixed(2)}</span></div>
                            <div className="flex justify-between items-center text-lg"><span className="font-semibold text-gray-700">Net Worth:</span><span className="text-blue-600 font-bold">${(portfolio.balance + getPortfolioValue()).toFixed(2)}</span></div>
                        </div>
                        <h3 className="text-xl font-semibold text-gray-800 mt-6 mb-3 border-b pb-2">Holdings</h3>
                        {portfolio.stocks.length === 0 ? (<p className="text-gray-500 italic">No stocks in your portfolio yet.</p>) : (
                            <ul className="space-y-3">
                                {portfolio.stocks.map(item => {
                                    if (!item) return null;
                                    const currentStock = stocks.find(s => s.id === item.id) || searchedStock;
                                    const purchasePrice = item.purchasePrice ?? 0;
                                    const currentValue = currentStock ? currentStock.price * item.quantity : purchasePrice * item.quantity;
                                    const profitLoss = currentValue - (purchasePrice * item.quantity);
                                    const profitLossColor = profitLoss >= 0 ? 'text-green-600' : 'text-red-600';
                                    return (
                                        <li key={item.id} className="bg-gray-50 p-4 rounded-lg shadow-sm border border-gray-100">
                                            <div className="flex justify-between items-center"><span className="font-bold text-gray-800">{item.name} ({item.id})</span><span className="text-gray-700">Qty: {item.quantity}</span></div>
                                            <div className="flex justify-between items-center text-sm text-gray-600 mt-1"><span>Avg Buy: ${purchasePrice.toFixed(2)}</span><span>Current: ${currentStock ? currentStock.price.toFixed(2) : 'N/A'}</span></div>
                                            <div className="flex justify-between items-center text-sm mt-1"><span className="font-semibold">P/L:</span><span className={`${profitLossColor} font-bold`}>${profitLoss.toFixed(2)}</span></div>
                                            <div className="mt-3 text-right"><button onClick={() => setShowConfirmModal(true) & setConfirmAction({ action: 'sell', stock: item, quantity: 1 })} className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded-md text-xs font-semibold shadow-sm">Sell 1</button></div>
                                        </li>
                                    );
                                })}
                            </ul>
                        )}
                    </div>
                );
            
            case 'orders':
                return <LimitOrders portfolio={portfolio} onOrderChange={(newPortfolio) => setPortfolio(newPortfolio)} />;
                
                
            case 'marketWatch':
                return (
                    <div className="lg:col-span-3 bg-white p-6 rounded-xl shadow-lg border border-gray-200">
                        <h2 className="text-2xl font-bold text-gray-800 mb-4 border-b pb-2">Top 10 Performing Stocks (Simulated)</h2>
                        {topMarketWatchStocks.length === 0 ? (<p className="text-gray-500 italic">No top performing stock data available.</p>) : (
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50"><tr><th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Symbol</th><th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Company Name</th><th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th><th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Change %</th><th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th></tr></thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {topMarketWatchStocks.map(stock => (<tr key={stock.id} className="hover:bg-gray-50"><td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{stock.id}</td><td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{stock.name}</td><td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-semibold">${stock.price.toFixed(2)}</td><td className={`px-6 py-4 whitespace-nowrap text-sm font-semibold ${stock.changePercent >= 0 ? 'text-green-600' : 'text-red-600'}`}>{stock.changePercent?.toFixed(2)}%</td><td className="px-6 py-4 whitespace-nowrap text-sm"><button onClick={() => setShowConfirmModal(true) & setConfirmAction({ action: 'buy', stock, quantity: 1 })} className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded-md text-xs font-semibold shadow-sm disabled:bg-gray-400" disabled={(1 * stock.price) > portfolio.balance}>Buy 1</button></td></tr>))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                );
            case 'watchlist':
                return (
                    <div className="lg:col-span-3 bg-white p-6 rounded-xl shadow-lg border border-gray-200">
                        <h2 className="text-2xl font-bold text-gray-800 mb-4 border-b pb-2">Your Watchlist</h2>
                        {watchlist.length === 0 ? (<p className="text-gray-500 italic">Your watchlist is empty.</p>) : (
                            <ul className="space-y-3">
                                {watchlist.map(item => (<li key={item.id} className="bg-gray-50 p-4 rounded-lg shadow-sm border border-gray-100 flex justify-between items-center"><div><span className="font-bold text-gray-800">{item.name} ({item.id})</span><p className="text-sm text-gray-600">Price: ${item.price?.toFixed(2) || 'N/A'}</p></div><div className="flex space-x-2"><button onClick={() => setShowConfirmModal(true) & setConfirmAction({ action: 'buy', stock: item, quantity: 1 })} className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded-md text-xs font-semibold shadow-sm disabled:bg-gray-400" disabled={(1 * item.price) > portfolio.balance}>Buy 1</button><button onClick={() => handleRemoveFromWatchlist(item.id)} className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded-md text-xs font-semibold shadow-sm">Remove</button></div></li>))}
                            </ul>
                        )}
                    </div>
                );
            case 'history':
                return (
                    <div className="lg:col-span-3 bg-white p-6 rounded-xl shadow-lg border border-gray-200">
                        <h2 className="text-2xl font-bold text-gray-800 mb-4 border-b pb-2">Transaction History</h2>
                        {transactions.length === 0 ? (<p className="text-gray-500 italic">You have no transaction history yet.</p>) : (
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50"><tr><th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th><th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th><th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Stock</th><th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quantity</th><th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th></tr></thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {[...transactions].reverse().map((trx, index) => (<tr key={index} className="hover:bg-gray-50"><td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{new Date(trx.date).toLocaleString()}</td><td className={`px-6 py-4 whitespace-nowrap text-sm font-semibold ${trx.type === 'buy' ? 'text-green-600' : 'text-red-600'}`}>{trx.type.toUpperCase()}</td><td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{trx.stockName} ({trx.stockId})</td><td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{trx.quantity}</td><td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-semibold">${trx.price.toFixed(2)}</td></tr>))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                );
            case 'leaderboard':
                return <Leaderboard />;
            
            case 'news':
                return <FinancialNews />;

            case 'profile':
                return (
                    <div className="lg:col-span-3 bg-white p-6 rounded-xl shadow-lg border border-gray-200">
                        <h2 className="text-2xl font-bold text-gray-800 mb-4 border-b pb-2">Profile Information</h2>
                        {currentUser && userProfile ? (<div className="space-y-3 text-lg text-gray-700"><p><span className="font-semibold">Email:</span> {userProfile.email || 'N/A'}</p><p><span className="font-semibold">User ID:</span> {userId}</p><p><span className="font-semibold">Name:</span> {userProfile.name || 'N/A'}</p><p><span className="font-semibold">Date of Birth:</span> {userProfile.dob || 'N/A'}</p><p><span className="font-semibold">Address:</span> {userProfile.address || 'N/A'}</p><p><span className="font-semibold">Phone Number:</span> {userProfile.phoneNo || 'N/A'}</p></div>) : (<p className="text-gray-500 italic">User information not available.</p>)}
                        <h3 className="text-xl font-bold text-gray-800 mt-6 mb-4 border-b pb-2">Manage Funds</h3>
                        {!fundActionType ? ( <div className="flex justify-center space-x-4"><button onClick={() => selectFundAction('addFunds')} className="bg-green-600 hover:bg-green-700 text-white px-5 py-3 rounded-lg font-semibold shadow-md">Add Funds</button><button onClick={() => selectFundAction('withdrawFunds')} className="bg-red-600 hover:bg-red-700 text-white px-5 py-3 rounded-lg font-semibold shadow-md">Withdraw Funds</button><button onClick={() => selectFundAction('showWallet')} className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-3 rounded-lg font-semibold shadow-md">Wallet</button></div>) : fundActionType === 'showWallet' ? (<div className="space-y-4 text-center"><p className="text-xl font-semibold text-gray-800">Total Realized Profit: <span className="text-green-600">${portfolio.realizedProfit.toFixed(2)}</span></p><p className="text-xl font-semibold text-gray-800">Total Withdrawn: <span className="text-purple-600">${portfolio.totalWithdrawn.toFixed(2)}</span></p><p className="text-xl font-semibold text-gray-800">Initial Deposit: <span className="text-blue-600">${DEFAULT_INITIAL_CASH.toFixed(2)}</span></p><button onClick={() => selectFundAction(null)} className="px-5 py-2 bg-gray-300 hover:bg-gray-400 text-gray-800 rounded-lg font-semibold">Back</button></div>) : (<div className="space-y-4"><div className="flex items-center space-x-3"><input type="number" value={fundAmount} onChange={(e) => setFundAmount(e.target.value)} placeholder={`Amount to ${fundActionType === 'addFunds' ? 'add' : 'withdraw'}`} className="flex-grow p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 no-spin-buttons"/><button onClick={() => setShowConfirmModal(true) & setConfirmAction({ action: fundActionType, amount: parseFloat(fundAmount) })} className={`px-5 py-3 rounded-lg font-semibold shadow-md text-white ${fundActionType === 'addFunds' ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'}`} disabled={!fundAmount || parseFloat(fundAmount) <= 0}>Confirm</button></div><div className="text-center"><button onClick={() => { setFundActionType(null); setFundAmount(''); }} className="px-5 py-2 bg-gray-300 hover:bg-gray-400 text-gray-800 rounded-lg font-semibold">Cancel</button></div></div>)}
                    </div>
                );
            default:
                return null;
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col font-inter">
            <header className="bg-gradient-to-r from-blue-600 to-purple-700 text-white p-4 shadow-md flex justify-between items-center rounded-b-lg">
                <div className="flex items-center space-x-3">
                    <img src="/p1.jpeg" alt="StockSim Pro Logo" className="h-8 w-8" />
                    <h1 className="text-3xl font-extrabold tracking-tight">StockSim Pro</h1>
                </div>
                <div className="flex items-center space-x-4">
                    <span className="text-sm font-medium">User ID: {userId}</span>
                    <button onClick={() => setShowAboutSidebar(true)} className="bg-white text-blue-700 px-4 py-2 rounded-full shadow-md hover:bg-gray-100 font-semibold transition duration-300 ease-in-out">About</button>
                    <button onClick={logout} className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-full shadow-md font-semibold transition duration-300 ease-in-out">Logout</button>
                </div>
            </header>
            <nav className="bg-white shadow-md py-3 px-6 flex justify-center space-x-6 rounded-t-lg">
                <button onClick={() => setActiveSection('home')} className={`px-4 py-2 rounded-lg font-semibold ${activeSection === 'home' ? 'bg-blue-600 text-white shadow-md' : 'text-gray-700 hover:bg-gray-100'}`}>Home</button>
                <button onClick={() => setActiveSection('portfolio')} className={`px-4 py-2 rounded-lg font-semibold ${activeSection === 'portfolio' ? 'bg-blue-600 text-white shadow-md' : 'text-gray-700 hover:bg-gray-100'}`}>Portfolio</button>
                <button onClick={() => setActiveSection('marketWatch')} className={`px-4 py-2 rounded-lg font-semibold ${activeSection === 'marketWatch' ? 'bg-blue-600 text-white shadow-md' : 'text-gray-700 hover:bg-gray-100'}`}>Market Watch</button>
                <button onClick={() => setActiveSection('watchlist')} className={`px-4 py-2 rounded-lg font-semibold ${activeSection === 'watchlist' ? 'bg-blue-600 text-white shadow-md' : 'text-gray-700 hover:bg-gray-100'}`}>Watchlist</button>
                <button onClick={() => setActiveSection('orders')} className={`px-4 py-2 rounded-lg font-semibold ${activeSection === 'orders' ? 'bg-blue-600 text-white shadow-md' : 'text-gray-700 hover:bg-gray-100'}`}>Orders</button>
                <button onClick={() => setActiveSection('history')} className={`px-4 py-2 rounded-lg font-semibold ${activeSection === 'history' ? 'bg-blue-600 text-white shadow-md' : 'text-gray-700 hover:bg-gray-100'}`}>History</button>
                <button onClick={() => setActiveSection('news')} className={`px-4 py-2 rounded-lg font-semibold ${activeSection === 'news' ? 'bg-blue-600 text-white shadow-md' : 'text-gray-700 hover:bg-gray-100'}`}>News</button>
                <button onClick={() => setActiveSection('leaderboard')} className={`px-4 py-2 rounded-lg font-semibold ${activeSection === 'leaderboard' ? 'bg-blue-600 text-white shadow-md' : 'text-gray-700 hover:bg-gray-100'}`}>Leaderboard</button>
                <button onClick={() => setActiveSection('profile')} className={`px-4 py-2 rounded-lg font-semibold ${activeSection === 'profile' ? 'bg-blue-600 text-white shadow-md' : 'text-gray-700 hover:bg-gray-100'}`}>Profile</button>
            </nav>
            <main className="flex-grow p-6 grid grid-cols-1 gap-6">
                {message.text && (<div className={`col-span-full p-3 rounded-lg text-center ${message.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>{message.text}</div>)}
                {renderSection()}
            </main>

            <AboutSidebar isOpen={showAboutSidebar} onClose={() => setShowAboutSidebar(false)} />

            {showConfirmModal && confirmAction && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white p-6 rounded-lg shadow-xl max-w-sm w-full text-center">
                        <h3 className="text-xl font-bold mb-4 text-gray-800">Confirm Transaction</h3>
                        <p className="text-gray-700 mb-6">
                            {confirmAction.action === 'buy' && `Are you sure you want to buy ${confirmAction.quantity} share(s) of ${confirmAction.stock.name} for $${(confirmAction.stock.price * confirmAction.quantity).toFixed(2)}?`}
                            {confirmAction.action === 'sell' && `Are you sure you want to sell ${confirmAction.quantity} share(s) of ${confirmAction.stock.name} for $${(confirmAction.stock.price * confirmAction.quantity).toFixed(2)}?`}
                            {confirmAction.action === 'addFunds' && `Are you sure you want to add $${confirmAction.amount.toFixed(2)} to your balance?`}
                            {confirmAction.action === 'withdrawFunds' && `Are you sure you want to withdraw $${confirmAction.amount.toFixed(2)} from your balance?`}
                        </p>
                        <div className="flex justify-center space-x-4">
                            <button onClick={confirmTransaction} className={`px-5 py-2 rounded-lg font-semibold text-white ${confirmAction.action === 'buy' || confirmAction.action === 'addFunds' ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'}`}>Confirm</button>
                            <button onClick={cancelTransaction} className="px-5 py-2 bg-gray-300 hover:bg-gray-400 text-gray-800 rounded-lg font-semibold">Cancel</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default StockMarketDashboard;