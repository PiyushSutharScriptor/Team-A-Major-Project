const Issue = require('../models/Issue');
const { assignResourceToIssue, releaseResource } = require('../services/resourceService');
const { createNotification } = require('../utils/notificationHelper');

// @route POST /api/issues
const createIssue = async (req, res, next) => {
  try {
    const { issueType, severity, description, coordinates, address, zone } = req.body;

    // 1. Description minimum length (extra guard beyond schema)
    if (!description || description.trim().length < 15) {
      return res.status(400).json({
        success: false,
        message: 'Description must be at least 15 characters',
      });
    }

    // 2. Daily issue limit per user (max 5 issues per day)
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    const issueCountToday = await Issue.countDocuments({
      userId: req.user._id,
      createdAt: { $gte: startOfDay },
    });
    if (issueCountToday >= 5) {
      return res.status(429).json({
        success: false,
        message: 'Daily issue limit reached (max 5 per day). Please try again tomorrow.',
      });
    }

    // 3. Duplicate detection within 100m radius in last 24 hours
    const coords = JSON.parse(coordinates); // [lng, lat]
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const duplicate = await Issue.findOne({
      issueType,
      createdAt: { $gte: oneDayAgo },
      location: {
        $near: {
          $geometry: { type: 'Point', coordinates: coords },
          $maxDistance: 100, // 100 meters
        },
      },
    });

    if (duplicate) {
      // Optionally boost the priority of the duplicate issue
      await Issue.findByIdAndUpdate(duplicate._id, { $inc: { priorityScore: 5 } });
      return res.status(409).json({
        success: false,
        message: 'This issue has already been reported nearby. Your report has increased its priority.',
        existingIssueId: duplicate._id,
      });
    }

    // 4. Build images array from uploaded files
    const images = req.files
      ? req.files.map((f) => ({ url: f.path, publicId: f.filename }))
      : [];

    // 5. Create issue — default status is 'under_review' (from model default)
    const issue = await Issue.create({
      userId: req.user._id,
      issueType,
      severity,
      description: description.trim(),
      location: {
        type: 'Point',
        coordinates: coords,
        address: address || '',
      },
      zone: zone || req.user.zone,
      images,
    });

    // Notify user that issue is under review
    await createNotification({
      userId: issue.userId,
      issueId: issue._id,
      message: `Your issue "${issue.issueType}" has been submitted and is now under review. You'll be notified once it's verified.`,
      type: 'issue_created',
    });

    res.status(201).json({ success: true, message: 'Issue reported successfully and is under review', issue });
  } catch (error) {
    next(error);
  }
};

// @route GET /api/issues  (all — admin)
const getAllIssues = async (req, res, next) => {
  try {
    const { status, zone, issueType, severity, page = 1, limit = 20, sort = '-createdAt' } = req.query;

    const filter = {};
    if (status) filter.status = status;
    if (zone) filter.zone = zone;
    if (issueType) filter.issueType = issueType;
    if (severity) filter.severity = severity;

    const total = await Issue.countDocuments(filter);
    const issues = await Issue.find(filter)
      .populate('userId', 'name email zone phone')
      .sort(sort)
      .skip((page - 1) * limit)
      .limit(Number(limit));

    res.json({
      success: true,
      total,
      page: Number(page),
      pages: Math.ceil(total / limit),
      issues,
    });
  } catch (error) {
    next(error);
  }
};

// @route GET /api/issues/my
const getMyIssues = async (req, res, next) => {
  try {
    const { status, issueType, sort = '-createdAt', page = 1, limit = 10 } = req.query;

    const filter = { userId: req.user._id };
    if (status) filter.status = status;
    if (issueType) filter.issueType = issueType;

    const total = await Issue.countDocuments(filter);
    const issues = await Issue.find(filter)
      .sort(sort)
      .skip((page - 1) * limit)
      .limit(Number(limit));

    res.json({
      success: true,
      total,
      page: Number(page),
      pages: Math.ceil(total / limit),
      issues,
    });
  } catch (error) {
    next(error);
  }
};

// @route GET /api/issues/map
const getIssuesForMap = async (req, res, next) => {
  try {
    const issues = await Issue.find({}, 'location status issueType severity zone createdAt')
      .limit(500)
      .lean();

    // Return GeoJSON FeatureCollection
    const geojson = {
      type: 'FeatureCollection',
      features: issues.map((issue) => ({
        type: 'Feature',
        geometry: issue.location,
        properties: {
          id: issue._id,
          status: issue.status,
          issueType: issue.issueType,
          severity: issue.severity,
          zone: issue.zone,
          createdAt: issue.createdAt,
        },
      })),
    };

    res.json({ success: true, geojson });
  } catch (error) {
    next(error);
  }
};

// @route GET /api/issues/:id
const getIssueById = async (req, res, next) => {
  try {
    const issue = await Issue.findById(req.params.id).populate('userId', 'name email zone');
    if (!issue) return res.status(404).json({ success: false, message: 'Issue not found' });

    res.json({ success: true, issue });
  } catch (error) {
    next(error);
  }
};

// @route PATCH /api/issues/:id/status  (admin)
const updateIssueStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    const issue = await Issue.findById(req.params.id);
    if (!issue) return res.status(404).json({ success: false, message: 'Issue not found' });

    const prevStatus = issue.status;
    issue.status = status;
    await issue.save();

    // If resolved → release resource
    if (status === 'resolved') {
      await releaseResource(issue._id);
      await createNotification({
        userId: issue.userId,
        issueId: issue._id,
        message: `Great news! Your issue "${issue.issueType}" has been resolved.`,
        type: 'issue_resolved',
      });
    }

    // If status manually set to verified → trigger assignment
    if (status === 'verified') {
      const result = await assignResourceToIssue(issue);
      if (result.assigned) {
        console.log(`[VERIFY] Issue ${issue._id} auto-assigned after status set to verified.`);
      }
    }

    res.json({ success: true, message: `Status updated from ${prevStatus} to ${status}`, issue });
  } catch (error) {
    next(error);
  }
};

// @route PATCH /api/issues/:id/verify  (admin only)
const verifyIssue = async (req, res, next) => {
  try {
    const issue = await Issue.findById(req.params.id);
    if (!issue) return res.status(404).json({ success: false, message: 'Issue not found' });

    if (issue.status !== 'under_review') {
      return res.status(400).json({
        success: false,
        message: `Issue cannot be verified from status "${issue.status}". It must be under_review.`,
      });
    }

    issue.status = 'verified';
    await issue.save();

    // Trigger auto-assignment immediately
    const result = await assignResourceToIssue(issue);

    // Notify user
    await createNotification({
      userId: issue.userId,
      issueId: issue._id,
      message: `Your issue "${issue.issueType}" has been verified by an admin${result.assigned ? ` and assigned to team "${result.resource?.teamName}"` : '. Resources will be assigned shortly'}.`,
      type: 'issue_assigned',
    });

    res.json({
      success: true,
      message: result.assigned
        ? `Issue verified and assigned to "${result.resource?.teamName}"`
        : 'Issue verified but no resources available right now.',
      issue,
      assignment: result.assignment || null,
    });
  } catch (error) {
    next(error);
  }
};

// @route PATCH /api/issues/:id/reject  (admin only)
const rejectIssue = async (req, res, next) => {
  try {
    const { reason } = req.body;
    const issue = await Issue.findById(req.params.id);
    if (!issue) return res.status(404).json({ success: false, message: 'Issue not found' });

    if (issue.status !== 'under_review') {
      return res.status(400).json({
        success: false,
        message: `Issue cannot be rejected from status "${issue.status}". It must be under_review.`,
      });
    }

    issue.status = 'rejected';
    issue.rejectionReason = reason || 'Rejected by admin.';
    await issue.save();

    // Notify user
    await createNotification({
      userId: issue.userId,
      issueId: issue._id,
      message: `Your issue "${issue.issueType}" was rejected. Reason: ${issue.rejectionReason}`,
      type: 'issue_rejected',
    });

    res.json({ success: true, message: 'Issue rejected successfully', issue });
  } catch (error) {
    next(error);
  }
};

// @route GET /api/issues/stats
const getIssueStats = async (req, res, next) => {
  try {
    const userId = req.user.role === 'user' ? req.user._id : null;
    const matchStage = userId ? { userId } : {};

    const stats = await Issue.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
        },
      },
    ]);

    const total = await Issue.countDocuments(matchStage);
    const byType = await Issue.aggregate([
      { $match: matchStage },
      { $group: { _id: '$issueType', count: { $sum: 1 } } },
    ]);

    res.json({ success: true, total, stats, byType });
  } catch (error) {
    next(error);
  }
};

// @route POST /api/issues/:id/assign  (admin)
const triggerAutoAssign = async (req, res, next) => {
  try {
    const issue = await Issue.findById(req.params.id);
    if (!issue) return res.status(404).json({ success: false, message: 'Issue not found' });

    if (issue.status !== 'verified') {
      return res.status(400).json({
        success: false,
        message: 'Issue must be verified before a resource can be assigned. Please verify the issue first.',
      });
    }

    const result = await assignResourceToIssue(issue);
    if (!result.assigned) {
      return res.status(400).json({ success: false, message: 'No available resources found for this issue at this time.' });
    }

    res.json({ success: true, message: 'Resource assigned successfully', assignment: result.assignment });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createIssue,
  getAllIssues,
  getMyIssues,
  getIssuesForMap,
  getIssueById,
  updateIssueStatus,
  verifyIssue,
  rejectIssue,
  getIssueStats,
  triggerAutoAssign,
};
