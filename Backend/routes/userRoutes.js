const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController'); // Đảm bảo đúng đường dẫn

// Dòng này sẽ giải quyết lỗi 404 trong image_6586d9.png
router.put('/update', userController.updateUser);

router.get('/financial-info/:matk', userController.getFinancialInfo);
router.post('/nap-tien', userController.napTien);
router.get('/tac-gia/doanh-thu/:matg', userController.getDoanhThuTacGia);

// Đảm bảo dùng router.get (vì trang ManageWithdrawal dùng axios.get)
router.get('/withdraw/requests', userController.getWithdrawalRequests);
// Đảm bảo dùng router.put và đúng đường dẫn
router.put('/withdraw/approve', userController.approveWithdrawal);
module.exports = router;