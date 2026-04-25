const express = require('express');
const router = express.Router();
const { addAdminEmail, getAdminEmails, updateAdminStatus } = require('../controllers/adminController');
const { protect, adminOnly } = require('../middlewares/auth');

router.use(protect);
router.use(adminOnly);

router.post('/add-admin', addAdminEmail);
router.get('/emails', getAdminEmails);
router.patch('/emails/:id/status', updateAdminStatus);

module.exports = router;
