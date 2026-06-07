const pool = require('../config/db');

exports.updateUser = async (req, res) => {
    const { matk, ten_that, email, sdt, vai_tro } = req.body;

    try {
        await pool.query('BEGIN');

        // 1. Update bảng TAI_KHOAN (email, sdt)
        await pool.query(
            "UPDATE TAI_KHOAN SET EMAIL = $1, SDT = $2 WHERE MATK = $3",
            [email, sdt, matk]
        );

        // 2. Update tên thật vào bảng vai trò tương ứng
        if (vai_tro === 'TacGia') {
            await pool.query("UPDATE TAC_GIA SET TENTG = $1 WHERE MATK = $2", [ten_that, matk]);
        } else {
            await pool.query("UPDATE DOC_GIA SET TENDG = $1 WHERE MATK = $2", [ten_that, matk]);
        }

        await pool.query('COMMIT');
        res.status(200).json({ message: "Cập nhật thành công!" });
    } catch (err) {
        await pool.query('ROLLBACK');
        res.status(500).json({ error: "Lỗi cập nhật" });
    }
};
exports.getFinancialInfo = async (req, res) => {
    const { matk } = req.params;
    try {
        // 1. Lấy số dư và tổng tiền đã nạp
        const userRes = await pool.query(
            `SELECT T.SO_DU, 
             (SELECT COALESCE(SUM(G.SO_TIEN_VND), 0) FROM LICH_SU_NAP L JOIN GOI_NAP G ON L.MAGOI = G.MAGOI WHERE L.MATK = T.MATK) as tong_nap
             FROM TAI_KHOAN T WHERE T.MATK = $1`, [matk]
        );

        // 2. Lấy danh sách chương đã mua
        const boughtRes = await pool.query(
            `SELECT M.*, B.TENBT, T.TENT 
             FROM LICH_SU_MUA M
             LEFT JOIN BAN_THAO B ON M.MABT = B.MABT
             LEFT JOIN TRUYEN T ON M.MAT = T.MAT
             WHERE M.MADG = (SELECT MADG FROM DOC_GIA WHERE MATK = $1)`, [matk]
        );

        res.json({
            so_du: userRes.rows[0]?.so_du || 0,
            tong_nap: userRes.rows[0]?.tong_nap || 0,
            da_mua: boughtRes.rows
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
// Backend/controllers/userController.js
exports.napTien = async (req, res) => {
    const { matk, magoi, so_xu } = req.body;
    
    // LOGIC RANDOM: 7 lần thành công (70%), 3 lần thất bại (30%)
    const isSuccess = Math.random() < 0.7; 

    if (!isSuccess) {
        return res.status(400).json({ 
            success: false, 
            message: "Giao dịch thất bại. Vui lòng kiểm tra lại kết nối hoặc số dư tài khoản ngân hàng." 
        });
    }

    try {
        // 1. Nếu thành công -> Cộng xu vào tài khoản
        await pool.query("UPDATE TAI_KHOAN SET SO_DU = SO_DU + $1 WHERE MATK = $2", [so_xu, matk]);
        
        // 2. Lưu lịch sử nạp
        const maNap = 'N' + Date.now().toString().slice(-8);
        await pool.query("INSERT INTO LICH_SU_NAP (MANAP, MATK, MAGOI) VALUES ($1, $2, $3)", [maNap, matk, magoi]);

        res.json({ 
            success: true, 
            message: "Xác nhận nạp tiền thành công!", 
            so_xu_moi: so_xu 
        });
    } catch (err) {
        res.status(500).json({ success: false, error: "Lỗi hệ thống khi xử lý nạp tiền." });
    }
};

exports.getDoanhThuTacGia = async (req, res) => {
    const { matg } = req.params;
    try {
        // 1. Lấy số dư hiện tại của tác giả từ bảng TAI_KHOAN thông qua MATG
        const balanceRes = await pool.query(
            `SELECT T.SO_DU 
             FROM TAI_KHOAN T 
             JOIN TAC_GIA TG ON T.MATK = TG.MATK 
             WHERE TG.MATG = $1`, [matg]
        );

        // 2. Lấy chi tiết lịch sử bán truyện (Giữ nguyên logic cũ của bạn)
        const result = await pool.query(
            `SELECT 
                DT.*, 
                COALESCE(T.TENT, 'Truyện đã xóa') as tent, 
                COALESCE(BT.TENBT, 'Trọn bộ') as tenbt 
             FROM DOANH_THU DT
             LEFT JOIN LICH_SU_MUA LSM ON DT.MAMUA = LSM.MAMUA
             LEFT JOIN TRUYEN T ON LSM.MAT = T.MAT
             LEFT JOIN BAN_THAO BT ON LSM.MABT = BT.MABT
             WHERE DT.MATG = $1
             ORDER BY DT.NGAY_GIAO_DICH DESC`, [matg]
        );

        // Số dư thực tế trong ví của tài khoản
        const soDuHienTai = balanceRes.rows[0]?.so_du || 0;

        res.json({
            so_du_hien_tai: soDuHienTai, // Trả về thêm trường này
            chi_tiet: result.rows
        });
    } catch (err) {
        console.error("Lỗi SQL:", err.message);
        res.status(500).json({ error: err.message });
    }
};
// backend/controllers/userController.js

// 1. Tác giả gửi yêu cầu rút tiền
exports.requestWithdrawal = async (req, res) => {
    const { matg, matk, so_xu, thong_tin_the } = req.body;
    const ty_gia = 100; // 1 Xu = 100 VNĐ (Tùy bạn chỉnh sửa)
    const mayc = 'RT' + Date.now().toString().slice(-8);

    try {
        // Kiểm tra số dư hiện tại trong TAI_KHOAN
        const userRes = await pool.query("SELECT SO_DU FROM TAI_KHOAN WHERE MATK = $1", [matk]);
        if (userRes.rows[0].so_du < so_xu) {
            return res.status(400).json({ message: "Số dư xu không đủ để thực hiện yêu cầu này!" });
        }

        const so_tien_vnd = so_xu * ty_gia;

        await pool.query(
            `INSERT INTO YEU_CAU_RUT_TIEN (MAYC, MATG, SO_XU_RUT, SO_TIEN_VND, THONG_TIN_NHAN_TIEN, TRANGTHAI) 
             VALUES ($1, $2, $3, $4, $5, 'Chờ duyệt')`,
            [mayc, matg, so_xu, so_tien_vnd, thong_tin_the]
        );

        res.json({ success: true, message: "Gửi yêu cầu thành công! Admin sẽ xử lý trong 24h-48h." });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// 2. Admin lấy danh sách yêu cầu rút tiền
exports.getWithdrawalRequests = async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT yc.*, tg.TENTG, tk.MATK 
             FROM YEU_CAU_RUT_TIEN yc 
             JOIN TAC_GIA tg ON yc.MATG = tg.MATG 
             JOIN TAI_KHOAN tk ON tg.MATK = tk.MATK
             ORDER BY yc.NGAY_YC DESC`
        );
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// 3. Admin phê duyệt và trừ xu
exports.approveWithdrawal = async (req, res) => {
    const { mayc, matk, so_xu } = req.body;
    try {
        await pool.query('BEGIN');

        // Trừ xu của tác giả
        await pool.query("UPDATE TAI_KHOAN SET SO_DU = SO_DU - $1 WHERE MATK = $2", [so_xu, matk]);

        // Cập nhật trạng thái yêu cầu
        await pool.query(
            "UPDATE YEU_CAU_RUT_TIEN SET TRANGTHAI = 'Đã chuyển tiền', NGAY_XU_LY = CURRENT_TIMESTAMP WHERE MAYC = $1",
            [mayc]
        );

        await pool.query('COMMIT');
        res.json({ success: true, message: "Phê duyệt thành công và đã trừ xu tác giả!" });
    } catch (err) {
        await pool.query('ROLLBACK');
        res.status(500).json({ error: err.message });
    }
};
// 4. Admin từ chối yêu cầu và nối lý do vào cột THONG_TIN_NHAN_TIEN có sẵn
exports.rejectWithdrawal = async (req, res) => {
    const { mayc, reason } = req.body;
    try {
        // Lấy thông tin cũ ra trước để nối chuỗi (hoặc ghi đè tùy bạn, ở đây mình nối chuỗi để giữ lại stk cũ)
        const currentReq = await pool.query("SELECT THONG_TIN_NHAN_TIEN FROM YEU_CAU_RUT_TIEN WHERE MAYC = $1", [mayc]);
        const oldInfo = currentReq.rows[0]?.thong_tin_nhan_tien || "";
        
        const newInfo = `${oldInfo}\n❌ LÝ DO TỪ CHỐI: ${reason}`;

        // Cập nhật lại vào database
        await pool.query(
            `UPDATE YEU_CAU_RUT_TIEN 
             SET TRANGTHAI = 'Từ chối', 
                 THONG_TIN_NHAN_TIEN = $1, 
                 NGAY_XU_LY = CURRENT_TIMESTAMP 
             WHERE MAYC = $2`,
            [newInfo, mayc]
        );

        res.json({ success: true, message: "Đã từ chối yêu cầu và gửi lý do tới tác giả!" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
// 4. Admin từ chối yêu cầu và nối lý do vào cột THONG_TIN_NHAN_TIEN có sẵn
// Thêm vào cuối file userController.js của bạn

// 4. Admin từ chối yêu cầu rút tiền và lưu lý do
exports.rejectWithdrawal = async (req, res) => {
    const { mayc, reason } = req.body;
    
    if (!mayc) {
        return res.status(400).json({ success: false, message: "Thiếu mã yêu cầu rút tiền!" });
    }

    try {
        // 1. Lấy thông tin hiện tại để nối chuỗi lý do từ chối vào mà không làm mất thông tin số tài khoản cũ
        const currentReq = await pool.query("SELECT THONG_TIN_NHAN_TIEN FROM YEU_CAU_RUT_TIEN WHERE MAYC = $1", [mayc]);
        
        if (currentReq.rows.length === 0) {
            return res.status(404).json({ success: false, message: "Không tìm thấy yêu cầu này!" });
        }

        const oldInfo = currentReq.rows[0].thong_tin_nhan_tien;
        const updatedInfo = `${oldInfo} | ❌ LÝ DO TỪ CHỐI: ${reason || 'Không có lý do cụ thể'}`;

        // 2. Cập nhật trạng thái thành 'Từ chối' và lưu lý do vào database
        await pool.query(
            `UPDATE YEU_CAU_RUT_TIEN 
             SET TRANGTHAI = 'Từ chối', 
                 THONG_TIN_NHAN_TIEN = $1, 
                 NGAY_XU_LY = CURRENT_TIMESTAMP 
             WHERE MAYC = $2`,
            [updatedInfo, mayc]
        );

        res.json({ success: true, message: "Đã từ chối yêu cầu và lưu lý do thành công." });
    } catch (err) {
        console.error("Lỗi từ chối rút tiền:", err.message);
        res.status(500).json({ success: false, error: err.message });
    }
};
// Lấy lịch sử rút tiền riêng của một tác giả
exports.getLichSuRutTien = async (req, res) => {
    const { matg } = req.params;
    try {
        const result = await pool.query(
            `SELECT MAYC, SO_XU_RUT, SO_TIEN_VND, TRANGTHAI, NGAY_YC, THONG_TIN_NHAN_TIEN 
             FROM YEU_CAU_RUT_TIEN 
             WHERE MATG = $1 
             ORDER BY NGAY_YC DESC`, [matg]
        );
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
// Xóa một yêu cầu rút tiền cụ thể của tác giả
exports.deleteLichSuRutTienDon = async (req, res) => {
    const { mayc } = req.params;
    try {
        await pool.query("DELETE FROM YEU_CAU_RUT_TIEN WHERE MAYC = $1", [mayc]);
        res.json({ success: true, message: "Đã xóa lịch sử rút tiền thành công." });
    } catch (err) {
        console.error("Lỗi khi xóa lịch sử rút tiền đơn:", err.message);
        res.status(500).json({ success: false, error: err.message });
    }
};

// Xóa tất cả lịch sử rút tiền của một tác giả
exports.deleteAllLichSuRutTien = async (req, res) => {
    const { matg } = req.params;
    try {
        await pool.query("DELETE FROM YEU_CAU_RUT_TIEN WHERE MATG = $1", [matg]);
        res.json({ success: true, message: "Đã xóa toàn bộ lịch sử rút tiền." });
    } catch (err) {
        console.error("Lỗi khi xóa toàn bộ lịch sử rút tiền:", err.message);
        res.status(500).json({ success: false, error: err.message });
    }
};