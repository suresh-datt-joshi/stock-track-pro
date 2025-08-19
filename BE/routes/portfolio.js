// routes/portfolio.js
const express = require('express');
const router = express.Router();
const User = require('../models/user');
const fetch = require('node-fetch');

// Middleware to protect routes
const jwt = require('jsonwebtoken');
const protect = async (req, res, next) => {
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = await User.findById(decoded.id);
      if (!req.user) return res.status(401).json({ message: 'Not authorized, user not found' });
      next();
    } catch (error) {
      res.status(401).json({ message: 'Not authorized, token failed' });
    }
  } else {
    res.status(401).json({ message: 'Not authorized, no token' });
  }
};

// Helper function to get current stock price
const getStockPrice = async (symbol) => {
    const url = `https://yahoo-finance15.p.rapidapi.com/api/yahoo/qu/quote/${symbol}`;
    const options = {
        method: 'GET',
        headers: {
            'X-RapidAPI-Key': process.env.RAPIDAPI_KEY,
            'X-RapidAPI-Host': 'yahoo-finance15.p.rapidapi.com'
        }
    };
    const response = await fetch(url, options);
    const data = await response.json();
    if (!response.ok || !data.body || data.body.length === 0) {
        throw new Error('Could not fetch stock price');
    }
    const stockData = data.body[0];
    return {
        price: parseFloat(stockData.regularMarketPrice),
        name: stockData.shortName || stockData.displayName || symbol
    };
};


// @route   POST /api/portfolio/buy
// @desc    Buy a stock
// @access  Private
router.post('/buy', protect, async (req, res) => {
    const { stockId, quantity } = req.body;
    
    if (!stockId || !quantity || quantity <= 0) {
        return res.status(400).json({ message: 'Invalid request data.' });
    }

    try {
        const user = req.user;
        const { price: currentPrice, name: stockName } = await getStockPrice(stockId);
        const cost = currentPrice * quantity;

        if (user.portfolio.balance < cost) {
            return res.status(400).json({ message: 'Insufficient funds.' });
        }

        user.portfolio.balance -= cost;
        
        const existingStockIndex = user.portfolio.stocks.findIndex(s => s.id === stockId);

        if (existingStockIndex > -1) {
            const existingStock = user.portfolio.stocks[existingStockIndex];
            const newTotalQuantity = existingStock.quantity + quantity;
            const newTotalCost = (existingStock.purchasePrice * existingStock.quantity) + cost;
            existingStock.purchasePrice = newTotalCost / newTotalQuantity;
            existingStock.quantity = newTotalQuantity;
        } else {
            user.portfolio.stocks.push({ id: stockId, name: stockName, quantity, purchasePrice: currentPrice });
        }

        user.transactions.push({ type: 'buy', stockId, stockName, quantity, price: currentPrice });

        await user.save();
        res.json({ portfolio: user.portfolio, transactions: user.transactions });

    } catch (error) {
        console.error('Buy transaction error:', error);
        res.status(500).json({ message: 'Server error during purchase.' });
    }
});

// @route   POST /api/portfolio/sell
// @desc    Sell a stock
// @access  Private
router.post('/sell', protect, async (req, res) => {
    const { stockId, quantity } = req.body;

    if (!stockId || !quantity || quantity <= 0) {
        return res.status(400).json({ message: 'Invalid request data.' });
    }

    try {
        const user = req.user;
        const existingStockIndex = user.portfolio.stocks.findIndex(s => s.id === stockId);

        if (existingStockIndex === -1 || user.portfolio.stocks[existingStockIndex].quantity < quantity) {
            return res.status(400).json({ message: 'Not enough shares to sell.' });
        }

        const { price: currentPrice, name: stockName } = await getStockPrice(stockId);
        const stockToSell = user.portfolio.stocks[existingStockIndex];
        
        const proceeds = currentPrice * quantity;
        const costOfSharesSold = stockToSell.purchasePrice * quantity;
        const profitLoss = proceeds - costOfSharesSold;

        user.portfolio.balance += proceeds;
        user.portfolio.realizedProfit += profitLoss;
        stockToSell.quantity -= quantity;

        if (stockToSell.quantity === 0) {
            user.portfolio.stocks.splice(existingStockIndex, 1);
        }

        user.transactions.push({ type: 'sell', stockId, stockName, quantity, price: currentPrice });
        
        await user.save();
        res.json({ portfolio: user.portfolio, transactions: user.transactions });

    } catch (error) {
        console.error('Sell transaction error:', error);
        res.status(500).json({ message: 'Server error during sale.' });
    }
});

// @route   POST /api/portfolio/add-funds
// @desc    Add funds to balance from realized profit
// @access  Private
router.post('/add-funds', protect, async (req, res) => {
    const { amount } = req.body;
    if (!amount || isNaN(amount) || amount <= 0) {
        return res.status(400).json({ message: 'Invalid amount specified.' });
    }

    try {
        const user = req.user;
        if (amount > user.portfolio.realizedProfit) {
            return res.status(400).json({ message: 'Amount exceeds available realized profit.' });
        }

        user.portfolio.balance += amount;
        user.portfolio.realizedProfit -= amount;

        await user.save();
        res.json(user.portfolio);
    } catch (error) {
        console.error('Add funds error:', error);
        res.status(500).json({ message: 'Server error while adding funds.' });
    }
});

// @route   POST /api/portfolio/withdraw-funds
// @desc    Withdraw funds from balance
// @access  Private
router.post('/withdraw-funds', protect, async (req, res) => {
    const { amount } = req.body;
    if (!amount || isNaN(amount) || amount <= 0) {
        return res.status(400).json({ message: 'Invalid amount specified.' });
    }

    try {
        const user = req.user;
        if (amount > user.portfolio.balance) {
            return res.status(400).json({ message: 'Withdrawal amount exceeds your cash balance.' });
        }

        user.portfolio.balance -= amount;
        user.portfolio.totalWithdrawn += amount;

        await user.save();
        res.json(user.portfolio);
    } catch (error) {
        console.error('Withdraw funds error:', error);
        res.status(500).json({ message: 'Server error while withdrawing funds.' });
    }
});

module.exports = router;
