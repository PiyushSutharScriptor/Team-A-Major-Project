const express = require('express');
const router = express.Router();
const {
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
} = require('../controllers/issueController');
const { protect, adminOnly } = require('../middlewares/auth');
const { upload } = require('../config/cloudinary');

router.use(protect);

router.get('/stats', getIssueStats);
router.get('/my', getMyIssues);
router.get('/map', getIssuesForMap);
router.get('/', getAllIssues);
router.post('/', upload.array('images', 3), createIssue);
router.get('/:id', getIssueById);
router.patch('/:id/status', adminOnly, updateIssueStatus);
router.patch('/:id/verify', adminOnly, verifyIssue);
router.patch('/:id/reject', adminOnly, rejectIssue);
router.post('/:id/assign', adminOnly, triggerAutoAssign);

module.exports = router;
