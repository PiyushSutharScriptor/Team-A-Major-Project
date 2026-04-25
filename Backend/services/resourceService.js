const Resource = require('../models/Resource');
const Assignment = require('../models/Assignment');
const Issue = require('../models/Issue');
const { calculatePriorityScore } = require('../utils/priorityEngine');
const { createNotification } = require('../utils/notificationHelper');

/**
 * Find the best available resource for an issue
 * Priority: same zone > same specialization > least current load
 */
const findBestResource = async (issue) => {
  // Map issueType to specialization
  const specializationMap = {
    garbage: 'garbage',
    water_leakage: 'water_leakage',
    road_damage: 'road_damage',
    electricity: 'electricity',
    sewage: 'sewage',
    other: 'general',
  };
  const requiredSpecialization = specializationMap[issue.issueType] || 'general';

  // First: exact match — same zone + same required specialization
  let resource = await Resource.findOne({
    zone: issue.zone,
    specialization: requiredSpecialization,
    availabilityStatus: 'available',
  }).sort({ currentLoad: 1 });

  // Second: any zone + same required specialization
  if (!resource) {
    resource = await Resource.findOne({
      specialization: requiredSpecialization,
      availabilityStatus: 'available',
    }).sort({ currentLoad: 1 });
  }

  // Third: same zone + 'general' specialization (fallback)
  if (!resource) {
    resource = await Resource.findOne({
      zone: issue.zone,
      specialization: 'general',
      availabilityStatus: 'available',
    }).sort({ currentLoad: 1 });
  }

  // Fourth: any zone + 'general' specialization
  if (!resource) {
    resource = await Resource.findOne({
      specialization: 'general',
      availabilityStatus: 'available',
    }).sort({ currentLoad: 1 });
  }

  return resource;
};

/**
 * Auto-assign a resource to an issue
 * Called after every new issue is created
 */
const assignResourceToIssue = async (issue) => {
  try {
    // Calculate priority score
    const priorityScore = await calculatePriorityScore(issue);
    issue.priorityScore = priorityScore;

    const resource = await findBestResource(issue);

    if (!resource) {
      // No resources available — keep pending, notify user
      await issue.save();
      await createNotification({
        userId: issue.userId,
        issueId: issue._id,
        message: `Your issue "${issue.issueType}" has been submitted. No resources are currently available; you'll be notified when one is assigned.`,
        type: 'issue_created',
      });
      return { assigned: false, reason: 'No available resources' };
    }

    // Create assignment
    const assignment = await Assignment.create({
      issueId: issue._id,
      resourceId: resource._id,
      status: 'active',
    });

    // Update issue status
    issue.status = 'assigned';
    await issue.save();

    // Update resource load
    resource.currentLoad += 1;
    if (resource.currentLoad >= resource.maxCapacity) {
      resource.availabilityStatus = 'busy';
    }
    await resource.save();

    // Notify user
    await createNotification({
      userId: issue.userId,
      issueId: issue._id,
      message: `Your issue "${issue.issueType}" (Priority: ${priorityScore}) has been assigned to team "${resource.teamName}".`,
      type: 'issue_assigned',
    });

    return { assigned: true, assignment, resource };
  } catch (error) {
    console.error('Resource assignment error:', error.message);
    throw error;
  }
};

/**
 * Release resource when an issue is resolved
 */
const releaseResource = async (issueId) => {
  try {
    const assignment = await Assignment.findOne({ issueId, status: 'active' });
    if (!assignment) return;

    assignment.status = 'completed';
    assignment.completedAt = new Date();
    await assignment.save();

    const resource = await Resource.findById(assignment.resourceId);
    if (resource) {
      resource.currentLoad = Math.max(0, resource.currentLoad - 1);
      if (resource.currentLoad < resource.maxCapacity) {
        resource.availabilityStatus = 'available';
      }
      await resource.save();
    }
  } catch (error) {
    console.error('Release resource error:', error.message);
  }
};

module.exports = { assignResourceToIssue, releaseResource, findBestResource };
