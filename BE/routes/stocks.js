// routes/stocks.js
const express = require('express');
const router = express.Router();
const fetch = require('node-fetch');
const User = require('../models/user');
const jwt = require('jsonwebtoken');

// (Your 'protect' middleware function remains the same)
const protect = async (req, res, next) => {
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = await User.findById(decoded.id).select('-password');
      if (!req.user) return res.status(401).json({ message: 'Not authorized, user not found' });
      next();
    } catch (error) {
      res.status(401).json({ message: 'Not authorized, token failed' });
    }
  } else {
    res.status(401).json({ message: 'Not authorized, no token' });
  }
};


// (Your '/:symbol' quote route remains the same)
router.get('/:symbol', protect, async (req, res) => {
    const { symbol } = req.params;
    const url = `https://yahoo-finance15.p.rapidapi.com/api/yahoo/qu/quote/${symbol}`;
    const options = {
        method: 'GET',
        headers: {
            'X-RapidAPI-Key': process.env.RAPIDAPI_KEY,
            'X-RapidAPI-Host': 'yahoo-finance15.p.rapidapi.com'
        }
    };
    try {
        const apiResponse = await fetch(url, options);
        const data = await apiResponse.json();
        if (!apiResponse.ok || !data.body || data.body.length === 0) {
            return res.status(404).json({ message: `No data found for symbol "${symbol}".` });
        }
        res.json(data.body[0]);
    } catch (error) {
        console.error('API proxy error:', error);
        res.status(500).json({ message: 'Server error while fetching stock data.' });
    }
});


// @route   GET /api/stocks/:symbol/chart?range=...
// @desc    Fetch stock chart data for a specific range
// @access  Private
router.get('/:symbol/chart', protect, async (req, res) => {
    const { symbol } = req.params;
    const { range } = req.query;
    const apiKey = process.env.ALPHA_VANTAGE_API_KEY;

    let url;
    let timeSeriesKey;
    let sliceNum = null;
    let isYTD = false;

    // Determine API call based on requested range
    switch (range) {
        case '1D':
            url = `https://www.alphavantage.co/query?function=TIME_SERIES_INTRADAY&symbol=${symbol}&interval=15min&outputsize=full&apikey=${apiKey}`;
            timeSeriesKey = 'Time Series (15min)';
            break;
        case '5D':
            url = `https://www.alphavantage.co/query?function=TIME_SERIES_INTRADAY&symbol=${symbol}&interval=60min&outputsize=full&apikey=${apiKey}`;
            timeSeriesKey = 'Time Series (60min)';
            break;
        case '1M':
            url = `https://www.alphavantage.co/query?function=TIME_SERIES_DAILY&symbol=${symbol}&apikey=${apiKey}`;
            timeSeriesKey = 'Time Series (Daily)';
            sliceNum = 22; // Approx. 22 trading days in a month
            break;
        case '6M':
            url = `https://www.alphavantage.co/query?function=TIME_SERIES_DAILY&symbol=${symbol}&apikey=${apiKey}`;
            timeSeriesKey = 'Time Series (Daily)';
            sliceNum = 126; // Approx. 126 trading days in 6 months
            break;
        case 'YTD':
            url = `https://www.alphavantage.co/query?function=TIME_SERIES_DAILY&symbol=${symbol}&outputsize=full&apikey=${apiKey}`;
            timeSeriesKey = 'Time Series (Daily)';
            isYTD = true;
            break;
        case '1Y':
            url = `https://www.alphavantage.co/query?function=TIME_SERIES_DAILY&symbol=${symbol}&outputsize=full&apikey=${apiKey}`;
            timeSeriesKey = 'Time Series (Daily)';
            sliceNum = 252; // Approx. 252 trading days in a year
            break;
        case '5Y':
            url = `https://www.alphavantage.co/query?function=TIME_SERIES_WEEKLY&symbol=${symbol}&apikey=${apiKey}`;
            timeSeriesKey = 'Weekly Time Series';
            sliceNum = 260; // 52 * 5
            break;
        case 'Max':
            url = `https://www.alphavantage.co/query?function=TIME_SERIES_MONTHLY&symbol=${symbol}&apikey=${apiKey}`;
            timeSeriesKey = 'Monthly Time Series';
            break;
        default:
            return res.status(400).json({ message: 'Invalid time range specified.' });
    }

    try {
        const apiResponse = await fetch(url);
        const data = await apiResponse.json();

        if (data['Error Message'] || !data[timeSeriesKey]) {
            return res.status(404).json({ message: `No chart data found for symbol "${symbol}" in range "${range}".`, info: data['Information'] });
        }

        let timeSeries = data[timeSeriesKey];
        let formattedData = Object.entries(timeSeries).map(([date, values]) => ({
            date: date,
            price: parseFloat(values['4. close'])
        }));

        if (isYTD) {
            const currentYear = new Date().getFullYear();
            formattedData = formattedData.filter(item => new Date(item.date).getFullYear() === currentYear);
        }
        
        if (sliceNum) {
            formattedData = formattedData.slice(0, sliceNum);
        }

        // For 1D, filter to only the most recent trading day
        if (range === '1D') {
             const mostRecentDay = formattedData[0] ? formattedData[0].date.split(' ')[0] : null;
             if(mostRecentDay) {
                formattedData = formattedData.filter(item => item.date.startsWith(mostRecentDay));
             }
        }

        // For 5D, filter to the last 5 unique days
         if (range === '5D') {
            const days = [...new Set(formattedData.map(item => item.date.split(' ')[0]))].slice(0, 5);
            formattedData = formattedData.filter(item => days.includes(item.date.split(' ')[0]));
        }

        res.json(formattedData.reverse());

    } catch (error) {
        console.error('Alpha Vantage API error:', error);
        res.status(500).json({ message: 'Server error while fetching chart data.' });
    }
});

module.exports = router;