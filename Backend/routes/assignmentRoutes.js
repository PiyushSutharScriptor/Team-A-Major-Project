const express = require('express');
const router = express.Router();
const { getAllAssignments, getAssignmentByIssue } = require('../controllers/assignmentController');
const { protect, adminOnly } = require('../middlewares/auth');

router.use(protect);
router.get('/', adminOnly, getAllAssignments);
router.get('/issue/:issueId', getAssignmentByIssue);

module.exports = router;
