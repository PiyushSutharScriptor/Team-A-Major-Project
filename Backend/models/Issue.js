const mongoose = require('mongoose');

const issueSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    issueType: {
      type: String,
      required: [true, 'Issue type is required'],
      enum: ['garbage', 'water_leakage', 'road_damage', 'electricity', 'sewage', 'other'],
    },
    severity: {
      type: String,
      required: [true, 'Severity is required'],
      enum: ['low', 'medium', 'high'],
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      minlength: [15, 'Description must be at least 15 characters'],
      maxlength: [500, 'Description cannot exceed 500 characters'],
    },
    rejectionReason: {
      type: String,
      default: '',
    },
    location: {
      type: {
        type: String,
        enum: ['Point'],
        required: true,
        default: 'Point',
      },
      coordinates: {
        type: [Number], // [longitude, latitude]
        required: true,
      },
      address: {
        type: String,
        default: '',
      },
    },
    zone: {
      type: String,
      required: [true, 'Zone is required'],
    },
    images: [
      {
        url: String,
        publicId: String,
      },
    ],
    status: {
      type: String,
      enum: ['pending', 'under_review', 'verified', 'assigned', 'in_progress', 'resolved', 'rejected'],
      default: 'under_review',
    },
    priorityScore: {
      type: Number,
      default: 0,
    },
    escalationCount: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

// Geospatial index for location-based queries
issueSchema.index({ location: '2dsphere' });
issueSchema.index({ zone: 1, status: 1 });
issueSchema.index({ userId: 1, createdAt: -1 });

module.exports = mongoose.model('Issue', issueSchema);
