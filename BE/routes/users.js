// routes/users.js
const express = require('express');
const router = express.Router();
const User = require('../models/user');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '1h' });
};

const validatePassword = (password) => {
    const minLength = 8;
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

    if (password.length < minLength) return "Password must be at least 8 characters long.";
    if (!hasUpperCase) return "Password must contain at least one uppercase letter.";
    if (!hasLowerCase) return "Password must contain at least one lowercase letter.";
    if (!hasNumber) return "Password must contain at least one number.";
    if (!hasSpecialChar) return "Password must contain at least one special character.";
    return null;
};

const generateNextUserId = async () => {
    let newId;
    let isUnique = false;
    do {
        const randomPart = crypto.randomBytes(3).toString('hex').toUpperCase();
        newId = `STOK${randomPart}`;
        const existingUser = await User.findOne({ customId: newId });
        if (!existingUser) isUnique = true;
    } while (!isUnique);
    return newId;
};

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

router.post('/signup', async (req, res) => {
  const { email, password, name, dob, address, phoneNo } = req.body;
  try {
    const passwordError = validatePassword(password);
    if (passwordError) return res.status(400).json({ message: passwordError });
    if (await User.findOne({ email })) return res.status(400).json({ message: 'User already exists' });
    
    const customId = await generateNextUserId();
    const user = await User.create({ customId, email, password, name, dob, address, phoneNo });
    
    if (user) {
      res.status(201).json({ message: 'User registered successfully', userId: user.customId });
    } else {
      res.status(400).json({ message: 'Invalid user data' });
    }
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (user && (await user.matchPassword(password))) {
      res.json({
        message: 'Logged in successfully',
        userId: user.customId,
        token: generateToken(user._id),
      });
    } else {
      res.status(401).json({ message: 'Invalid email or password' });
    }
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

router.post('/verify-and-reset', async (req, res) => {
    try {
        const { customId, identifier, newPassword } = req.body;
        const passwordError = validatePassword(newPassword);
        if (passwordError) return res.status(400).json({ message: passwordError });
        
        const user = await User.findOne({ customId });
        if (!user) return res.status(404).json({ message: 'User ID not found.' });
        if (user.email !== identifier && user.phoneNo !== identifier) {
            return res.status(400).json({ message: 'Email or phone number does not match the User ID.' });
        }
        
        user.password = newPassword;
        await user.save();
        res.status(200).json({ message: 'Password has been reset successfully.' });
    } catch (error) {
        console.error('Reset password error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// @route   GET /api/users/:userId/data
// @desc    Get all user data (profile, portfolio, watchlist)
// @access  Private
router.get('/:userId/data', protect, async (req, res) => {
  try {
    // We use req.user from the protect middleware to ensure a user can only fetch their own data
    const user = await User.findById(req.user.id).select('-password');
    if (user) {
      res.json({
        profile: { name: user.name, email: user.email, dob: user.dob, address: user.address, phoneNo: user.phoneNo },
        portfolio: user.portfolio,
        watchlist: user.watchlist,
        transactions: user.transactions, // <-- Also send transactions
      });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/users/:userId/watchlist
// @desc    Update user's watchlist
// @access  Private
router.put('/:userId/watchlist', protect, async (req, res) => {
    const { watchlist } = req.body;
    try {
        const user = await User.findById(req.user.id);
        if (user) {
            if (watchlist) {
                user.watchlist.stocks = watchlist.stocks;
            }
            await user.save();
            res.json({ message: 'Watchlist updated', watchlist: user.watchlist });
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;
