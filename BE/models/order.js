// models/order.js
const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    stockId: { type: String, required: true },
    stockName: { type: String, required: true },
    type: { type: String, required: true, enum: ['buy', 'sell'] },
    quantity: { type: Number, required: true },
    limitPrice: { type: Number, required: true },
    status: { type: String, required: true, default: 'pending', enum: ['pending', 'executed', 'cancelled'] },
    createdAt: { type: Date, default: Date.now },
    executedAt: { type: Date }
});

module.exports = mongoose.model('Order', orderSchema);