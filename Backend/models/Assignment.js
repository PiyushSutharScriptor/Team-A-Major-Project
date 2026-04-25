const mongoose = require('mongoose');

const assignmentSchema = new mongoose.Schema(
  {
    issueId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Issue',
      required: true,
    },
    resourceId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Resource',
      required: true,
    },
    status: {
      type: String,
      enum: ['active', 'completed', 'cancelled'],
      default: 'active',
    },
    assignedAt: {
      type: Date,
      default: Date.now,
    },
    completedAt: {
      type: Date,
    },
    notes: {
      type: String,
      default: '',
    },
  },
  { timestamps: true }
);

assignmentSchema.index({ issueId: 1 });
assignmentSchema.index({ resourceId: 1, status: 1 });

module.exports = mongoose.model('Assignment', assignmentSchema);
