const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middleware/auth');
const { getAlatUkur, addAlatUkur, updateAlatUkur, deleteAlatUkur } = require('../controllers/registrasiController');

router.use(verifyToken);

router.get('/', getAlatUkur);
router.post('/', addAlatUkur);
router.put('/:id', updateAlatUkur);
router.delete('/:id', deleteAlatUkur);

module.exports = router;
