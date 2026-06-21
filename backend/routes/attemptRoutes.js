const router = require('express').Router();
const { protect } = require('../middleware/auth');
const ctrl = require('../controllers/attemptController');
router.post('/',     protect, ctrl.submitAttempt);
router.get('/my',    protect, ctrl.getMyAttempts);
router.get('/:id',   protect, ctrl.getAttempt);
module.exports = router;
