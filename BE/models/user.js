// models/user.js
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// transactionSchema remains the same
const transactionSchema = new mongoose.Schema({
  type: { type: String, required: true, enum: ['buy', 'sell'] },
  stockId: { type: String, required: true },
  stockName: { type: String, required: true },
  quantity: { type: Number, required: true },
  price: { type: Number, required: true },
  date: { type: Date, default: Date.now }
});

const userSchema = new mongoose.Schema({
  customId: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  name: { type: String, required: true },
  dob: { type: String }, 
  address: { type: String },
  phoneNo: { type: String },
  createdAt: { type: Date, default: Date.now },
  portfolio: { 
    balance: { type: Number, default: 10000 },
    reservedBalance: { type: Number, default: 0 }, // <-- ADD THIS LINE
    stocks: [{ id: String, name: String, quantity: Number, purchasePrice: Number }],
    totalWithdrawn: { type: Number, default: 0 },
    realizedProfit: { type: Number, default: 0 },
  },
  watchlist: {
    stocks: [{ id: String, name: String, price: Number }],
  },
  transactions: [transactionSchema]
});

// pre-save hook and matchPassword method remain the same
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) {
    return next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

userSchema.methods.matchPassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);