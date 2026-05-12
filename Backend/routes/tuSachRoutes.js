const express = require('express');
const router = express.Router();
const tuSachController = require('../controllers/tuSachController');

router.get('/my-library/:matk', tuSachController.getTuSachTacGia);
router.get('/ban-thao/:id', tuSachController.getBanThaoById); // Cần cho SuaBanThao.jsx[cite: 5]
router.get('/truyen/:id', tuSachController.getTruyenById);      // Cần cho SuaTruyen.jsx[cite: 5]
router.put('/update-ban-thao/:id', tuSachController.updateBanThao);
// File: routes/tacGiaRoutes.js
router.put('/update-truyen/:id', tuSachController.uploadImage, tuSachController.updateTruyen);
router.get('/the-loai', tuSachController.getAllTheLoai);
// ĐƯA DÒNG NÀY LÊN TRÊN DÒNG /:mat ĐỂ KHÔNG BỊ NHẦM LẪN
router.put('/hoan-thanh-truyen/:id', tuSachController.hoanThanhTruyen);

// Thêm vào file routes của bạn
router.delete('/delete-ban-thao/:id', tuSachController.deleteBanThao);
router.delete('/delete-truyen/:id', tuSachController.deleteTruyen);
module.exports = router;
