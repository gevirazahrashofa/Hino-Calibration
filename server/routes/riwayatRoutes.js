const express = require('express');
const router = express.Router();
const { getRiwayat, addRiwayat, deleteRiwayat } = require('../controllers/riwayatController');

router.get('/', getRiwayat);
router.post('/', addRiwayat);
router.delete('/:id', deleteRiwayat);

module.exports = router;
