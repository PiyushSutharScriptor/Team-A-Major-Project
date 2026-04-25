const Resource = require('../models/Resource');

// @route GET /api/resources  (admin)
const getAllResources = async (req, res, next) => {
  try {
    const { zone, specialization, availabilityStatus } = req.query;
    const filter = {};
    if (zone) filter.zone = zone;
    if (specialization) filter.specialization = specialization;
    if (availabilityStatus) filter.availabilityStatus = availabilityStatus;

    const resources = await Resource.find(filter).sort({ zone: 1, currentLoad: 1 });
    res.json({ success: true, count: resources.length, resources });
  } catch (error) {
    next(error);
  }
};

// @route POST /api/resources  (admin)
const createResource = async (req, res, next) => {
  try {
    const resource = await Resource.create(req.body);
    res.status(201).json({ success: true, resource });
  } catch (error) {
    next(error);
  }
};

// @route PUT /api/resources/:id  (admin)
const updateResource = async (req, res, next) => {
  try {
    const resource = await Resource.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!resource) return res.status(404).json({ success: false, message: 'Resource not found' });
    res.json({ success: true, resource });
  } catch (error) {
    next(error);
  }
};

// @route DELETE /api/resources/:id  (admin)
const deleteResource = async (req, res, next) => {
  try {
    const resource = await Resource.findByIdAndDelete(req.params.id);
    if (!resource) return res.status(404).json({ success: false, message: 'Resource not found' });
    res.json({ success: true, message: 'Resource deleted' });
  } catch (error) {
    next(error);
  }
};

module.exports = { getAllResources, createResource, updateResource, deleteResource };
