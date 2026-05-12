const express = require('express');
const router = express.Router();
const lichSuController = require('../controllers/lichSuController');

router.post('/update', lichSuController.updateLichSu)
router.delete('/delete', lichSuController.deleteLichSu);
router.get('/:madg', lichSuController.getLichSuByDocGia);
module.exports = router;