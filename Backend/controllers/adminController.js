const AdminEmail = require('../models/AdminEmail');

// @route POST /api/admin/add-admin
// @access Private/Admin
const addAdminEmail = async (req, res, next) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ success: false, message: 'Please provide an email' });
    }

    const existingAdmin = await AdminEmail.findOne({ email });
    if (existingAdmin) {
      return res.status(400).json({ success: false, message: 'Email is already authorized as admin' });
    }

    const newAdmin = await AdminEmail.create({
      email,
      addedBy: req.user._id,
    });

    res.status(201).json({ success: true, message: 'Admin email added successfully', data: newAdmin });
  } catch (error) {
    next(error);
  }
};

// @route GET /api/admin/emails
// @access Private/Admin
const getAdminEmails = async (req, res, next) => {
  try {
    const emails = await AdminEmail.find().populate('addedBy', 'name email');
    res.json({ success: true, count: emails.length, data: emails });
  } catch (error) {
    next(error);
  }
};

// @route PATCH /api/admin/emails/:id/status
// @access Private/Admin
const updateAdminStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    if (!['active', 'restricted'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status provided' });
    }

    const adminEmail = await AdminEmail.findById(req.params.id);
    if (!adminEmail) return res.status(404).json({ success: false, message: 'Admin record not found' });

    // Prevent restricting the root seed or oneself to avoid lockouts
    if (adminEmail.email === req.user.email && status === 'restricted') {
      return res.status(400).json({ success: false, message: 'You cannot restrict your own access' });
    }

    adminEmail.status = status;
    await adminEmail.save();

    res.json({ success: true, message: `Admin successfully set to ${adminEmail.status}` });
  } catch (error) {
    next(error);
  }
};

module.exports = { addAdminEmail, getAdminEmails, updateAdminStatus };
