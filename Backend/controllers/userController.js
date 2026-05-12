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
        // Sử dụng LEFT JOIN để tránh mất dữ liệu nếu thông tin liên kết bị thiếu
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

        // Tính tổng và ép kiểu Number để tránh lỗi cộng chuỗi
        const tongNhan = result.rows.reduce((sum, item) => {
            return sum + Number(item.xu_tac_gia || 0);
        }, 0);

        res.json({
            tong_nhan: tongNhan,
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