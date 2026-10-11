const express = require('express');
const router = express.Router();
const { verifyToken, adminOnly } = require('../middleware/auth');
const sistem = require('../controllers/sistemController');

router.use(verifyToken, adminOnly);

router.get('/users', sistem.getUsers);
router.post('/users', sistem.addUser);
router.put('/users/:id', sistem.updateUser);
router.delete('/users/:id', sistem.deleteUser);

router.get('/settings', sistem.getSettings);
router.put('/settings', sistem.updateSettings);

module.exports = router;
