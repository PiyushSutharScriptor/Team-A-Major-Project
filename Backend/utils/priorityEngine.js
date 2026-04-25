/**
 * Priority Calculation Engine
 *
 * Priority Score = (Severity Weight) + (Zone Frequency Bonus) + (Age/Delay Penalty)
 *
 * Severity Weights:
 *   high   = 50
 *   medium = 30
 *   low    = 10
 *
 * Zone Frequency: +5 per recent open issue in same zone (capped at 25)
 * Age Factor: +2 per hour the issue remains unresolved (capped at 20)
 */

const Issue = require('../models/Issue');

const SEVERITY_WEIGHTS = {
  high: 50,
  medium: 30,
  low: 10,
};

const ISSUE_TYPE_WEIGHTS = {
  water_leakage: 10,
  sewage: 8,
  electricity: 7,
  road_damage: 5,
  garbage: 3,
  other: 1,
};

/**
 * Calculate priority score for an issue
 * @param {Object} issue - Issue document
 * @returns {number} priorityScore
 */
const calculatePriorityScore = async (issue) => {
  // 1. Severity weight
  const severityScore = SEVERITY_WEIGHTS[issue.severity] || 10;

  // 2. Issue type weight
  const typeScore = ISSUE_TYPE_WEIGHTS[issue.issueType] || 1;

  // 3. Zone frequency — count open issues in same zone in last 24h
  const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
  const recentIssueCount = await Issue.countDocuments({
    zone: issue.zone,
    status: { $in: ['pending', 'assigned'] },
    createdAt: { $gte: twentyFourHoursAgo },
    _id: { $ne: issue._id },
  });
  const frequencyScore = Math.min(recentIssueCount * 5, 25);

  // 4. Age delay penalty — hours since creation
  const hoursOld = Math.floor((Date.now() - new Date(issue.createdAt).getTime()) / (1000 * 60 * 60));
  const ageScore = Math.min(hoursOld * 2, 20);

  // 5. Escalation bonus
  const escalationScore = (issue.escalationCount || 0) * 5;

  const total = severityScore + typeScore + frequencyScore + ageScore + escalationScore;
  return Math.round(total);
};

module.exports = { calculatePriorityScore };
