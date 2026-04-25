const Assignment = require('../models/Assignment');

// @route GET /api/assignments  (admin)
const getAllAssignments = async (req, res, next) => {
  try {
    const assignments = await Assignment.find()
      .populate('issueId', 'issueType severity status zone')
      .populate('resourceId', 'teamName specialization zone')
      .sort('-assignedAt');

    res.json({ success: true, count: assignments.length, assignments });
  } catch (error) {
    next(error);
  }
};

// @route GET /api/assignments/issue/:issueId
const getAssignmentByIssue = async (req, res, next) => {
  try {
    const assignment = await Assignment.findOne({
      issueId: req.params.issueId,
      status: 'active',
    })
      .populate('issueId', 'issueType severity status zone')
      .populate('resourceId', 'teamName specialization zone contactInfo');

    if (!assignment) {
      return res.status(404).json({ success: false, message: 'No active assignment for this issue' });
    }

    res.json({ success: true, assignment });
  } catch (error) {
    next(error);
  }
};

module.exports = { getAllAssignments, getAssignmentByIssue };
