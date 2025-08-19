// orderExecutor.js
const cron = require('node-cron');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const fetch = require('node-fetch');
const Order = require('./models/order');
const User = require('./models/user');

dotenv.config();

const getStockPrice = async (symbol) => {
    try {
        const url = `https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${symbol}&apikey=${process.env.ALPHA_VANTAGE_API_KEY}`;
        const response = await fetch(url);
        const data = await response.json();
        const price = data['Global Quote'] ? parseFloat(data['Global Quote']['05. price']) : null;
        if (!price) throw new Error(`Price not found for ${symbol}`);
        return price;
    } catch (error) {
        console.error(error.message);
        return null;
    }
};

const executeOrders = async () => {
    console.log('Running order execution job...');
    const pendingOrders = await Order.find({ status: 'pending' }).populate('user');
    if (pendingOrders.length === 0) {
        console.log('No pending orders to process.');
        return;
    }

    // Get unique stock symbols to fetch prices efficiently
    const uniqueSymbols = [...new Set(pendingOrders.map(o => o.stockId))];
    const prices = {};

    for (const symbol of uniqueSymbols) {
        // To respect API limits (5 calls/min), add a delay
        await new Promise(resolve => setTimeout(resolve, 15000)); // 15-second delay
        prices[symbol] = await getStockPrice(symbol);
    }

    for (const order of pendingOrders) {
        const currentPrice = prices[order.stockId];
        if (!currentPrice) continue; // Skip if price couldn't be fetched

        const user = order.user;
        let shouldExecute = false;

        if (order.type === 'buy' && currentPrice <= order.limitPrice) {
            shouldExecute = true;
        } else if (order.type === 'sell' && currentPrice >= order.limitPrice) {
            const stockInPortfolio = user.portfolio.stocks.find(s => s.id === order.stockId);
            if (stockInPortfolio && stockInPortfolio.quantity >= order.quantity) {
                shouldExecute = true;
            }
        }

        if (shouldExecute) {
            console.log(`Executing order ${order._id} for user ${user.name}`);
            // Database operations should be atomic in a real app (transactions)
            if (order.type === 'buy') {
                const cost = order.quantity * order.limitPrice;
                user.portfolio.reservedBalance -= cost;
                
                const existingStock = user.portfolio.stocks.find(s => s.id === order.stockId);
                if (existingStock) {
                    existingStock.quantity += order.quantity;
                } else {
                    user.portfolio.stocks.push({ id: order.stockId, name: order.stockName, quantity: order.quantity, purchasePrice: order.limitPrice });
                }
            } else { // Sell
                const stockIndex = user.portfolio.stocks.findIndex(s => s.id === order.stockId);
                const stockToSell = user.portfolio.stocks[stockIndex];
                
                const proceeds = order.quantity * currentPrice; // Use current price for proceeds
                user.portfolio.balance += proceeds;

                stockToSell.quantity -= order.quantity;
                if (stockToSell.quantity === 0) {
                    user.portfolio.stocks.splice(stockIndex, 1);
                }
            }
            
            user.transactions.push({ type: order.type, stockId: order.stockId, stockName: order.stockName, quantity: order.quantity, price: currentPrice });
            order.status = 'executed';
            order.executedAt = new Date();
            
            await user.save();
            await order.save();
        }
    }
    console.log('Order execution job finished.');
};

mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('MongoDB connected for cron job.');
    // Schedule to run every minute
    cron.schedule('*/1 * * * *', executeOrders);
  })
  .catch(err => console.error('MongoDB connection error for cron:', err));