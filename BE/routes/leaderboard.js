// routes/leaderboard.js
const express = require('express');
const router = express.Router();
const User = require('../models/user');

// @route   GET /api/leaderboard
// @desc    Get top users ranked by net worth
// @access  Public
router.get('/', async (req, res) => {
    try {
        // Fetch all users and select only the fields we need
        const users = await User.find({}).select('name portfolio.balance portfolio.stocks').lean();

        if (!users) {
            return res.status(404).json({ message: 'No users found.' });
        }

        const rankedUsers = users.map(user => {
            // Calculate the total value of all stocks held by the user based on their purchase price.
            // For a real-time leaderboard, you would need a more complex system to fetch
            // current market prices for all stocks, which can be API intensive.
            const totalStockValue = user.portfolio.stocks.reduce((acc, stock) => {
                return acc + (stock.purchasePrice * stock.quantity);
            }, 0);

            // Net worth is the user's cash balance plus the total value of their stocks.
            const netWorth = user.portfolio.balance + totalStockValue;

            return {
                name: user.name,
                netWorth: netWorth,
            };
        });

        // Sort users by net worth in descending order
        rankedUsers.sort((a, b) => b.netWorth - a.netWorth);

        // Return the top 20 users
        res.json(rankedUsers.slice(0, 20));

    } catch (error) {
        console.error('Leaderboard error:', error);
        res.status(500).json({ message: 'Server error while fetching leaderboard.' });
    }
});

module.exports = router;