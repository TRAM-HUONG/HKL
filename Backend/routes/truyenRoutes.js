const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const truyenController = require('../controllers/truyenController');
const chiTietController = require('../controllers/ChiTietTruyenController');
const chuongController = require('../controllers/chuongController');

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const destPath = path.join(__dirname, '../../Frontend/src/static/images/truyen');
        cb(null, destPath);
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});

const upload = multer({ storage: storage });

// =========================================================================
// 1. --- CÁC ROUTE CỐ ĐỊNH CHẤT LƯỢNG (BẮT BUỘC ĐỂ TRÊN CÙNG) ---
// =========================================================================
router.post('/register', upload.single('hinhanh'), truyenController.registerTruyen);
router.post('/danh-gia', chiTietController.postDanhGia);
router.post('/mua-tron-goi', truyenController.muaTronGoi);

// =========================================================================
// 2. --- CÁC ROUTE CÓ BIẾN DYNAMIC CHI TIẾT (PHẢI ĐỂ TRÊN /:mat) ---
// =========================================================================

// Khớp với URL: http://localhost:5000/api/truyen/:mat/danh-gia
router.get('/:mat/danh-gia', chiTietController.getDanhGiaByMat); 

// ĐÃ SỬA: Bỏ chữ /truyen dư thừa ở đầu. Khớp với URL: http://localhost:5000/api/truyen/:mat/cung-the-loai
router.get('/:mat/cung-the-loai', chiTietController.getTruyenCungTheLoai);

// ĐÃ SỬA: Bỏ chữ /truyen dư thừa ở đầu. Khớp với URL: http://localhost:5000/api/truyen/:mat/chuong
router.get('/:mat/chuong', chuongController.getDanhSachChuong); 

// =========================================================================
// 3. --- ROUTE NGUY HIỂM (BẮT BUỘC PHẢI ĐỂ DƯỚI CÙNG CỦA CÁC ĐƯỜNG DẪN /:mat) ---
// =========================================================================
// Dòng này hốt tất cả request có dạng /api/truyen/XYZ. Do đó các route /:mat/xxx phải nằm TRÊN nó.
router.get('/:mat', chiTietController.getChiTietByMat); 

// =========================================================================
// 4. --- CÁC ROUTE KHÁC ---
// =========================================================================
router.get('/', truyenController.getAllTruyen);
router.get('/noidung/:mabt', chuongController.getNoiDungChuong);
router.delete('/danh-gia/:madgia', chiTietController.deleteDanhGia);
router.delete('/phan-hoi/:maph', chiTietController.deletePhanHoi);

module.exports = router;