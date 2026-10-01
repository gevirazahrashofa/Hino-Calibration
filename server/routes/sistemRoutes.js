const express = require('express');
const router = express.Router();
const { getUsers, addUser, updateUser, deleteUser, getSettings, updateSettings } = require('../controllers/sistemController');

router.get('/akun', getUsers);
router.post('/akun', addUser);
router.put('/akun/:id', updateUser);
router.delete('/akun/:id', deleteUser);

router.get('/pengaturan', getSettings);
router.put('/pengaturan', updateSettings);

module.exports = router;
