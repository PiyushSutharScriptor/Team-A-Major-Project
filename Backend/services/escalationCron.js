const cron = require('node-cron');
const Issue = require('../models/Issue');
const { calculatePriorityScore } = require('../utils/priorityEngine');
const { assignResourceToIssue } = require('./resourceService');
const { createNotification } = require('../utils/notificationHelper');

/**
 * Escalation Cron Job — runs every 10 minutes
 *
 * Tasks:
 * 1. Re-calculate priority scores for all pending/assigned issues
 * 2. Try to assign resources to still-pending issues
 * 3. Escalate issues older than 2 hours with no resolution
 */
const startEscalationCron = () => {
  // Every 10 minutes
  cron.schedule('*/10 * * * *', async () => {
    console.log(`🔁 [CRON] Escalation job started at ${new Date().toISOString()}`);

    try {
      // 1. Find all non-resolved issues
      const openIssues = await Issue.find({
        status: { $in: ['pending', 'assigned', 'in_progress'] },
      });

      for (const issue of openIssues) {
        // 2. Recalculate priority score
        const newScore = await calculatePriorityScore(issue);
        issue.priorityScore = newScore;

        // 3. Issues pending for more than 2 hours → escalate
        const hoursOld = (Date.now() - new Date(issue.createdAt).getTime()) / (1000 * 60 * 60);
        if (issue.status === 'pending' && hoursOld >= 2) {
          issue.escalationCount += 1;
          issue.priorityScore += 5;

          // Try to assign again
          const result = await assignResourceToIssue(issue);
          if (!result.assigned) {
            // Notify user about delay
            await createNotification({
              userId: issue.userId,
              issueId: issue._id,
              message: `Your issue (${issue.issueType}) has been waiting for ${Math.floor(hoursOld)} hours. We are working on assigning a resource.`,
              type: 'escalation',
            });
          }
        } else {
          await issue.save();
        }
      }

      console.log(`✅ [CRON] Processed ${openIssues.length} issues`);
    } catch (error) {
      console.error(`❌ [CRON] Escalation error: ${error.message}`);
    }
  });

  console.log('⏰ Escalation cron job scheduled (every 10 minutes)');
};

module.exports = { startEscalationCron };
