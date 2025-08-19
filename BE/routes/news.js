// routes/news.js
const express = require('express');
const router = express.Router();
const fetch = require('node-fetch');
const { protect } = require('../middleware/authMiddleware');

// @route   GET /api/news
// @desc    Get RELEVANT financial news from NewsAPI.org
// @access  Private
router.get('/', protect, async (req, res) => {
    try {
        const user = req.user;
        const apiKey = process.env.NEWSAPI_KEY;
        let url;

        const userStocks = new Map();
        user.portfolio.stocks.forEach(stock => userStocks.set(stock.id, stock.name));
        user.watchlist.stocks.forEach(stock => userStocks.set(stock.id, stock.name));

        if (userStocks.size > 0) {
            // --- CHANGE 1: Make the search for specific stocks much more relevant ---
            // It now looks for the company AND a financial keyword in the same article.
            // Example Query: (("AAPL" OR "Apple") AND (stock OR market)) OR (("TSLA" OR "Tesla") AND (stock OR market))
            const stockQueryParts = Array.from(userStocks.entries())
                .map(([ticker, name]) => `(("${ticker}" OR "${name}") AND (stock OR shares OR investment OR market))`);
            
            const finalQuery = stockQueryParts.join(' OR ');
            
            url = `https://newsapi.org/v2/everything?q=${encodeURIComponent(finalQuery)}&sortBy=relevancy&language=en&pageSize=24`;
        } else {
            // --- CHANGE 2: Use the curated 'top-headlines' for the fallback ---
            // This provides high-quality, general business news from reputable sources.
            url = `https://newsapi.org/v2/top-headlines?country=us&category=business&pageSize=24`;
        }

        const apiResponse = await fetch(url, {
            headers: {
                'X-Api-Key': apiKey
            }
        });

        const data = await apiResponse.json();

        if (data.status !== 'ok') {
            return res.status(500).json({ message: data.message || 'Could not retrieve news articles from NewsAPI.org.' });
        }

        res.json(data.articles);

    } catch (error) {
        console.error('News fetching error:', error);
        res.status(500).json({ message: 'Server error while fetching news.' });
    }
});

module.exports = router;