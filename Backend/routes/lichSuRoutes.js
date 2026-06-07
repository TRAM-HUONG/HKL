const express = require('express');
const router = express.Router();
const lichSuController = require('../controllers/lichSuController');

router.post('/update', lichSuController.updateLichSu)
router.delete('/delete', lichSuController.deleteLichSu);
router.get('/:madg', lichSuController.getLichSuByDocGia);
// Route xóa toàn bộ lịch sử đọc theo mã độc giả
router.delete('/delete-all/:madg', lichSuController.deleteAllLichSu);
module.exports = router;