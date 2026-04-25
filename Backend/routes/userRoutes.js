const express = require('express');
const router = express.Router();
const { getProfile, updateProfile, changePassword, getAllUsers } = require('../controllers/userController');
const { protect, adminOnly } = require('../middlewares/auth');
const { upload } = require('../config/cloudinary');

router.use(protect);
router.get('/profile', getProfile);
router.put('/profile', upload.single('avatar'), updateProfile);
router.put('/change-password', changePassword);
router.get('/', adminOnly, getAllUsers);

module.exports = router;