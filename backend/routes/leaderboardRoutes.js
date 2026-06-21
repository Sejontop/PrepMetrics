const router = require('express').Router();
const { protect } = require('../middleware/auth');
const ctrl = require('../controllers/leaderboardController');
router.get('/global',           protect, ctrl.getGlobalLeaderboard);
router.get('/subject/:subjectId', protect, ctrl.getSubjectLeaderboard);
module.exports = router;
