const Notification = require('../models/Notification');

// @route GET /api/notifications
const getMyNotifications = async (req, res, next) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const total = await Notification.countDocuments({ userId: req.user._id });
    const notifications = await Notification.find({ userId: req.user._id })
      .sort('-createdAt')
      .skip((page - 1) * limit)
      .limit(Number(limit))
      .populate('issueId', 'issueType status');

    const unreadCount = await Notification.countDocuments({ userId: req.user._id, isRead: false });

    res.json({ success: true, total, unreadCount, page: Number(page), notifications });
  } catch (error) {
    next(error);
  }
};

// @route PATCH /api/notifications/:id/read
const markAsRead = async (req, res, next) => {
  try {
    const notification = await Notification.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      { isRead: true },
      { new: true }
    );
    if (!notification) return res.status(404).json({ success: false, message: 'Notification not found' });
    res.json({ success: true, notification });
  } catch (error) {
    next(error);
  }
};

// @route PATCH /api/notifications/read-all
const markAllAsRead = async (req, res, next) => {
  try {
    await Notification.updateMany({ userId: req.user._id, isRead: false }, { isRead: true });
    res.json({ success: true, message: 'All notifications marked as read' });
  } catch (error) {
    next(error);
  }
};

module.exports = { getMyNotifications, markAsRead, markAllAsRead };
