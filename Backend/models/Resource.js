const mongoose = require('mongoose');

const resourceSchema = new mongoose.Schema(
  {
    teamName: {
      type: String,
      required: [true, 'Team name is required'],
      trim: true,
    },
    specialization: {
      type: String,
      required: [true, 'Specialization is required'],
      enum: ['garbage', 'water_leakage', 'road_damage', 'electricity', 'sewage', 'general'],
    },
    zone: {
      type: String,
      required: [true, 'Zone is required'],
    },
    availabilityStatus: {
      type: String,
      enum: ['available', 'busy', 'offline'],
      default: 'available',
    },
    currentLoad: {
      type: Number,
      default: 0,
      min: 0,
    },
    maxCapacity: {
      type: Number,
      default: 5,
    },
    contactInfo: {
      phone: { type: String, default: '' },
      email: { type: String, default: '' },
    },
  },
  { timestamps: true }
);

resourceSchema.index({ zone: 1, specialization: 1, availabilityStatus: 1 });

module.exports = mongoose.model('Resource', resourceSchema);
