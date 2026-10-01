const express = require('express');
const router = express.Router();
const { getKalibrasi, addKalibrasi, updateKalibrasi, deleteKalibrasi, getChecksheet, addChecksheet, updateChecksheet, deleteChecksheet, getSchedule, addSchedule, updateSchedule, deleteSchedule } = require('../controllers/kalibrasiController');

router.get('/', getKalibrasi);
router.post('/', addKalibrasi);
router.put('/:id', updateKalibrasi);
router.delete('/:id', deleteKalibrasi);

router.get('/checksheet', getChecksheet);
router.post('/checksheet', addChecksheet);
router.put('/checksheet/:id', updateChecksheet);
router.delete('/checksheet/:id', deleteChecksheet);

router.get('/schedule', getSchedule);
router.post('/schedule', addSchedule);
router.put('/schedule/:id', updateSchedule);
router.delete('/schedule/:id', deleteSchedule);

module.exports = router;
