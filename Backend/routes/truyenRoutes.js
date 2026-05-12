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

// --- CÁC ROUTE CỐ ĐỊNH (PHẢI ĐỂ TRÊN CÙNG) ---
router.post('/register', upload.single('hinhanh'), truyenController.registerTruyen);
router.post('/danh-gia', chiTietController.postDanhGia);




// --- CÁC ROUTE CÓ THAM SỐ BIẾN ---
router.get('/:mat/danh-gia', chiTietController.getDanhGiaByMat); 

// Dòng này rất "nguy hiểm", nếu để trên cùng nó sẽ hốt hết mọi request dạng /xxx
router.get('/:mat', chiTietController.getChiTietByMat); 

router.get('/', truyenController.getAllTruyen);
router.get('/truyen/:mat/chuong', chuongController.getDanhSachChuong);
router.get('/noidung/:mabt', chuongController.getNoiDungChuong);
router.delete('/danh-gia/:madgia', chiTietController.deleteDanhGia);
// Ví dụ trong routes/truyenRoutes.js hoặc binhLuanRoutes.js
router.delete('/phan-hoi/:maph', chiTietController.deletePhanHoi);
// Backend/routes/truyenRoutes.js
router.post('/mua-tron-goi', truyenController.muaTronGoi);
module.exports = router;