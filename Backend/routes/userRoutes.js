const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController'); // Đảm bảo đúng đường dẫn

// Dòng này sẽ giải quyết lỗi 404 trong image_6586d9.png
router.put('/update', userController.updateUser);

router.get('/financial-info/:matk', userController.getFinancialInfo);
router.post('/nap-tien', userController.napTien);
router.get('/tac-gia/doanh-thu/:matg', userController.getDoanhThuTacGia);
// Thêm route này để giải quyết lỗi 404 /api/user/withdraw/request
router.post('/withdraw/request', userController.requestWithdrawal);
// Đảm bảo dùng router.get (vì trang ManageWithdrawal dùng axios.get)
router.get('/withdraw/requests', userController.getWithdrawalRequests);
// Đảm bảo dùng router.put và đúng đường dẫn
router.put('/withdraw/approve', userController.approveWithdrawal);
router.put('/withdraw/reject', userController.rejectWithdrawal);
// Thêm dòng này vào nhóm các route rút tiền (trước module.exports = router;)
router.get('/tac-gia/lich-su-rut/:matg', userController.getLichSuRutTien);
// Thêm route xóa từng lịch sử rút tiền cụ thể
router.delete('/tac-gia/lich-su-rut/delete/:mayc', userController.deleteLichSuRutTienDon);

// Thêm route xóa toàn bộ lịch sử rút tiền của tác giả
router.delete('/tac-gia/lich-su-rut/delete-all/:matg', userController.deleteAllLichSuRutTien);
module.exports = router;