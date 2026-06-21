const router = require('express').Router();
const { protect, authorize } = require('../middleware/auth');
const ctrl = require('../controllers/analyticsController');
router.get('/dashboard', protect, ctrl.getDashboard);
router.get('/platform',  protect, authorize('admin'), ctrl.getPlatformAnalytics);
module.exports = router;
