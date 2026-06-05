const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const banThaoController = require('../controllers/admin/banThaoController');
const truyenController = require('../controllers/admin/truyenController');
const DoanhthuController = require('../controllers/admin/DoanhthuController');
const TuongtacController = require('../controllers/admin/TuongtacController');
const NguoidungController = require('../controllers/admin/NguoidungController');

// Các route GET
router.get('/accounts', NguoidungController.getAllAccounts);
router.get('/readers', NguoidungController.getAllReaders);
router.get('/authors', NguoidungController.getAllAuthors);

// CÁC ROUTE DELETE (Phải đảm bảo tên hàm sau dấu chấm tồn tại trong Controller)
router.delete('/accounts/:id', NguoidungController.deleteAccount);
router.delete('/readers/:id', NguoidungController.deleteReader);
router.delete('/authors/:id', NguoidungController.deleteAuthor)

// QUẢN LÝ BẢN THẢO
router.get('/ban-thao/all', banThaoController.getAllDrafts);
router.get('/ban-thao/detail/:mabt', banThaoController.getDraftDetail);
router.put('/ban-thao/approve/:mabt', banThaoController.approveDraft);
router.delete('/ban-thao/delete/:mabt', banThaoController.deleteDraft);

// QUẢN LÝ TRUYỆN
router.get('/pending', truyenController.getPendingTruyen);
router.get('/all', truyenController.getAllManageTruyen);
router.get('/truyen-detail/:id', truyenController.getTruyenDetail);
router.put('/approve-truyen/:id', truyenController.approveTruyen);
router.put('/truyen/reject/:id', truyenController.rejectTruyen);
router.delete('/truyen/delete/:id', truyenController.deleteTruyen);

// DOANH THU & THỐNG KÊ
router.get('/quick-stats', adminController.getQuickStats);
router.get('/doanh-thu/stats', DoanhthuController.getQuickStats);
router.get('/doanh-thu/sales', DoanhthuController.getSalesRevenue);
router.get('/purchase-history', DoanhthuController.getPurchaseHistory);
router.get('/recharge-history', DoanhthuController.getRechargeHistory);

// GÓI NẠP
router.get('/goi-nap/all', DoanhthuController.getAllGoiNap);
router.post('/goi-nap/create', DoanhthuController.createGoiNap);
router.put('/goi-nap/update/:magoi', DoanhthuController.updateGoiNap);
router.delete('/goi-nap/delete/:magoi', DoanhthuController.deleteGoiNap);

// TƯƠNG TÁC
router.get('/binh-luan/all', TuongtacController.getAllBinhLuan);
router.delete('/binh-luan/delete/:id', TuongtacController.deleteBinhLuan);
router.get('/danh-gia/all', TuongtacController.getAllDanhGia);
router.delete('/danh-gia/delete/:id', TuongtacController.deleteDanhGia);
router.get('/phan-hoi/all', TuongtacController.getAllPhanHoi);
router.delete('/phan-hoi/delete/:id', TuongtacController.deletePhanHoi);

// Tạo tài khoản ADMIN mới
router.post('/accounts', adminController.createAdminAccount);
module.exports = router;