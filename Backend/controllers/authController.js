const jwt = require('jsonwebtoken');
const User = require('../models/User');
const AdminEmail = require('../models/AdminEmail');
const { createNotification } = require('../utils/notificationHelper');

const generateToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRE || '7d' });

// @route POST /api/auth/register
const register = async (req, res, next) => {
  try {
    const { name, email, password, zone, phone, role } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'Email already registered' });
    }

    let finalRole = role || 'user';
    if (email === 'piyushsuthar6300@gmail.com') {
      finalRole = 'admin';
    }

    if (finalRole === 'admin' && email !== 'piyushsuthar6300@gmail.com') {
      const isAllowedAdmin = await AdminEmail.findOne({ email });
      if (!isAllowedAdmin) {
        return res.status(403).json({ success: false, message: 'Email not authorized for admin access' });
      }
    }

    const user = await User.create({ name, email, password, zone, phone, role: finalRole });

    await createNotification({
      userId: user._id,
      message: `Welcome to Adaptive Resource Allocation System, ${name}! Start by reporting issues in your zone.`,
      type: 'general',
    });

    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        zone: user.zone,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @route POST /api/auth/login
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide email and password' });
    }

    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    // Root admin always keeps admin role
    if (user.email === 'piyushsuthar6300@gmail.com') {
      if (user.role !== 'admin') {
        user.role = 'admin';
        await user.save();
      }
    } else {
      // Sync role based on AdminEmail authorization status
      const adminRecord = await AdminEmail.findOne({ email: user.email });
      if (adminRecord && adminRecord.status === 'active' && user.role !== 'admin') {
        // Email is authorized as admin but user account hasn't been upgraded yet
        user.role = 'admin';
        await user.save();
      } else if ((!adminRecord || adminRecord.status === 'restricted') && user.role === 'admin') {
        // Email authorization was removed or restricted — revoke admin access
        user.role = 'user';
        await user.save();
      }
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    const token = generateToken(user._id);

    res.json({
      success: true,
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        zone: user.zone,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @route GET /api/auth/me
const getMe = async (req, res) => {
  res.json({ success: true, user: req.user });
};

module.exports = { register, login, getMe };
