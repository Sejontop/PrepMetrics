const router = require('express').Router();
const { protect } = require('../middleware/auth');
const ctrl = require('../controllers/certificateController');
router.get('/my',              protect, ctrl.getMyCertificates);
router.post('/check/:subjectId', protect, ctrl.checkAndIssue);
module.exports = router;
