const express = require('express');
const router = express.Router();
const danhMucController = require('../controllers/danhMucController');

router.get('/', danhMucController.getAllTheLoai);
router.get('/:matl/truyen', danhMucController.getTruyenByTheLoai);

// QUAN TRỌNG: Phải có dòng này
module.exports = router;