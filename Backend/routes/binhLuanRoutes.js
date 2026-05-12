const express = require('express');
const router = express.Router();
const binhLuanController = require('../controllers/binhLuanController');

// Khai báo đường dẫn khớp với lệnh fetch trong DocTruyen.jsx
router.get('/binh-luan/chuong/:mabt', binhLuanController.getBinhLuanByBanThao);
router.post('/binh-luan', binhLuanController.postBinhLuan);
// routes/binhLuanRoutes.js
router.delete('/phan-hoi/:maph', binhLuanController.deletePhanHoi);
router.delete('/:mabl', binhLuanController.deleteBinhLuan);
router.delete('/phan-hoi/:maph', binhLuanController.deletePhanHoi);
module.exports = router;