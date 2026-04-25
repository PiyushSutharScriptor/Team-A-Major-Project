const express = require('express');
const router = express.Router();
const {
  getAllResources,
  createResource,
  updateResource,
  deleteResource,
} = require('../controllers/resourceController');
const { protect, adminOnly } = require('../middlewares/auth');

router.use(protect);
router.get('/', getAllResources);
router.post('/', adminOnly, createResource);
router.put('/:id', adminOnly, updateResource);
router.delete('/:id', adminOnly, deleteResource);

module.exports = router;
