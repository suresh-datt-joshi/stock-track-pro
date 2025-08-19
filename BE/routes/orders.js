// routes/orders.js
const express = require('express');
const router = express.Router();
const User = require('../models/user');
const Order = require('../models/order');
const { protect } = require('../middleware/authMiddleware');

// POST /api/orders - Place a new limit order
router.post('/', protect, async (req, res) => {
    const { stockId, stockName, type, quantity, limitPrice } = req.body;
    const user = req.user;

    if (type === 'buy') {
        const cost = quantity * limitPrice;
        if (user.portfolio.balance < cost) {
            return res.status(400).json({ message: 'Insufficient funds.' });
        }
        user.portfolio.balance -= cost;
        user.portfolio.reservedBalance += cost;
    } else { // type === 'sell'
        const stockInPortfolio = user.portfolio.stocks.find(s => s.id === stockId);
        if (!stockInPortfolio || stockInPortfolio.quantity < quantity) {
            return res.status(400).json({ message: 'Not enough shares to place sell order.' });
        }
        // Note: For simplicity, we are not reserving shares. A more robust system would.
    }

    const order = new Order({ user: user._id, stockId, stockName, type, quantity, limitPrice });
    
    await order.save();
    await user.save();
    
    res.status(201).json({ message: 'Order placed successfully.', portfolio: user.portfolio, order });
});

// GET /api/orders - Get user's pending orders
router.get('/', protect, async (req, res) => {
    const orders = await Order.find({ user: req.user._id, status: 'pending' }).sort({ createdAt: -1 });
    res.json(orders);
});

// DELETE /api/orders/:id - Cancel an order
router.delete('/:id', protect, async (req, res) => {
    const order = await Order.findById(req.params.id);
    if (!order || order.user.toString() !== req.user._id.toString()) {
        return res.status(404).json({ message: 'Order not found.' });
    }
    if (order.status !== 'pending') {
        return res.status(400).json({ message: 'Only pending orders can be cancelled.' });
    }

    order.status = 'cancelled';
    
    // If it was a buy order, release the reserved funds
    if (order.type === 'buy') {
        const cost = order.quantity * order.limitPrice;
        req.user.portfolio.reservedBalance -= cost;
        req.user.portfolio.balance += cost;
    }

    await order.save();
    await req.user.save();

    res.json({ message: 'Order cancelled.', portfolio: req.user.portfolio });
});

module.exports = router;