const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    issueId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Issue',
      default: null,
    },
    message: {
      type: String,
      required: [true, 'Message is required'],
    },
    type: {
      type: String,
      enum: ['issue_created', 'issue_assigned', 'issue_resolved', 'escalation', 'general'],
      default: 'general',
    },
    isRead: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

notificationSchema.index({ userId: 1, isRead: 1, createdAt: -1 });

module.exports = mongoose.model('Notification', notificationSchema);
