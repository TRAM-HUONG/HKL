const express = require('express');
const router = express.Router();
// CHỈ GIỮ LẠI MỘT DÒNG NÀY, XÓA CÁC DÒNG TƯƠNG TỰ CÒN LẠI
const chuongController = require('../controllers/chuongController'); 
const truyenController = require('../controllers/truyenController');
// 1. Lấy danh sách chương của một truyện (dùng MAT)
router.get('/truyen/:mat', chuongController.getDanhSachChuong);

// 2. Lấy nội dung bản thảo để đọc (dùng MABT)
router.get('/noidung/:mabt', chuongController.getNoiDungChuong);
router.get('/tacgia/:matg', chuongController.getTruyenCuaTacGia);

// 4. Route để tác giả gửi bản thảo mới
router.post('/viet-bai', chuongController.dangBanThaoMoi);

router.get('/check-quyen', chuongController.checkQuyenDoc);
router.post('/mua-le', chuongController.muaChuongLe);
module.exports = router;