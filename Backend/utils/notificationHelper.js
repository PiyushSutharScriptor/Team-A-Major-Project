const Notification = require('../models/Notification');

/**
 * Create a notification for a user
 */
const createNotification = async ({ userId, issueId = null, message, type = 'general' }) => {
  try {
    const notification = await Notification.create({ userId, issueId, message, type });
    return notification;
  } catch (error) {
    console.error('Notification creation error:', error.message);
  }
};

/**
 * Create notifications for multiple users
 */
const createBulkNotifications = async (notifications) => {
  try {
    return await Notification.insertMany(notifications);
  } catch (error) {
    console.error('Bulk notification error:', error.message);
  }
};

module.exports = { createNotification, createBulkNotifications };
