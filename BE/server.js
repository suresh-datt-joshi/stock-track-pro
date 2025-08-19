// server.js
const dotenv = require('dotenv');
dotenv.config(); 

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const userRoutes = require('./routes/users');
const stockRoutes = require('./routes/stocks');
const portfolioRoutes = require('./routes/portfolio');
const leaderboardRoutes = require('./routes/leaderboard'); // <-- ADD THIS LINE
const orderRoutes = require('./routes/orders');
const newsRoutes = require('./routes/news');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB connected successfully!'))
  .catch(err => console.error('MongoDB connection error:', err));

// Routes
app.use('/api/users', userRoutes);
app.use('/api/stocks', stockRoutes);
app.use('/api/portfolio', portfolioRoutes);
app.use('/api/leaderboard', leaderboardRoutes); // <-- ADD THIS LINE
app.use('/api/orders', orderRoutes);
app.use('/api/news', newsRoutes);

// Basic route for testing
app.get('/', (req, res) => {
  res.send('Stock Market Backend API is running!');
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});