const express = require('express');
const router = express.Router();
const { getSpare, addSpare, updateSpare, deleteSpare, getTraceability, addTraceability, updateTraceability, deleteTraceability, getScheduleTraceability, addScheduleTraceability, updateScheduleTraceability, deleteScheduleTraceability } = require('../controllers/traceabilityController');

router.get('/spare', getSpare);
router.post('/spare', addSpare);
router.put('/spare/:id', updateSpare);
router.delete('/spare/:id', deleteSpare);

router.get('/', getTraceability);
router.post('/', addTraceability);
router.put('/:id', updateTraceability);
router.delete('/:id', deleteTraceability);

router.get('/schedule', getScheduleTraceability);
router.post('/schedule', addScheduleTraceability);
router.put('/schedule/:id', updateScheduleTraceability);
router.delete('/schedule/:id', deleteScheduleTraceability);

module.exports = router;
