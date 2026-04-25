const User = require('../models/User');

// @route GET /api/users/profile
const getProfile = async (req, res) => {
  res.json({ success: true, user: req.user });
};

// @route PUT /api/users/profile
const updateProfile = async (req, res, next) => {
  try {
    const { name, zone, phone } = req.body;
    const updates = {};
    if (name) updates.name = name;
    if (zone) updates.zone = zone;
    if (phone) updates.phone = phone;
    if (req.file) updates.avatar = req.file.path;

    const user = await User.findByIdAndUpdate(req.user._id, updates, {
      new: true,
      runValidators: true,
    });

    res.json({ success: true, user });
  } catch (error) {
    next(error);
  }
};

// @route PUT /api/users/change-password
const changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user._id).select('+password');

    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Incorrect current password' });
    }

    user.password = newPassword;
    await user.save();

    res.json({ success: true, message: 'Password changed successfully' });
  } catch (error) {
    next(error);
  }
};

// @route GET /api/users  (admin)
const getAllUsers = async (req, res, next) => {
  try {
    const users = await User.find().select('-password').sort('-createdAt');
    res.json({ success: true, count: users.length, users });
  } catch (error) {
    next(error);
  }
};

module.exports = { getProfile, updateProfile, changePassword, getAllUsers };
