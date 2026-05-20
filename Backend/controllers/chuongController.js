const pool = require('../config/db');

// 1. Lấy danh sách chương đã duyệt của truyện
exports.getDanhSachChuong = async (req, res) => {
    const { mat } = req.params;
    try {
        const query = `
            SELECT MABT, TENBT, TRANGTHAI, GIA_XU
            FROM BAN_THAO
            WHERE MAT = $1 AND TRANGTHAI = 'Đã Duyệt'
            ORDER BY MABT ASC
        `;
        const result = await pool.query(query, [mat]);
        res.json(result.rows);
    } catch (err) {
        console.error("Lỗi Controller:", err.message);
        res.status(500).json({ error: "Lỗi hệ thống khi lấy danh sách chương" });
    }
};

// 2. Lấy nội dung chi tiết chương (QUAN TRỌNG: Phải lấy thêm cột MAT)
// 2. Lấy nội dung chi tiết chương (QUAN TRỌNG: Phải lấy thêm cột MAT và GIA_XU)
exports.getNoiDungChuong = async (req, res) => {
    const { mabt } = req.params; 
    try {
        // SỬA TẠI ĐÂY: Thêm cột GIA_XU vào chuỗi SELECT
        const query = `
            SELECT MABT, TENBT, ND, MAT, GIA_XU
            FROM BAN_THAO 
            WHERE MABT = $1 AND TRANGTHAI = 'Đã Duyệt'
        `;
        const result = await pool.query(query, [mabt]);

        if (result.rows.length === 0) {
            return res.status(404).json({ message: "Không tìm thấy nội dung bản thảo này." });
        }

        res.json(result.rows[0]); 
    } catch (err) {
        console.error("Lỗi getNoiDungChuong:", err.message);
        res.status(500).json({ error: "Lỗi hệ thống khi tải nội dung" });
    }
};

exports.getTruyenCuaTacGia = async (req, res) => {
    // Đổi tên biến thành matk để đồng bộ với Frontend gửi lên
    const { matg: matk } = req.params; 
    try {
        // Query chuẩn theo Database: Tìm MATG thông qua MATK trước rồi mới lấy TRUYEN
        const query = `
            SELECT t.MAT as mat, t.TENT as tent 
            FROM TRUYEN t
            JOIN TAC_GIA tg ON t.MATG = tg.MATG
            WHERE tg.MATK = $1
            ORDER BY t.NGAYDANG DESC
        `;
        const result = await pool.query(query, [matk]);
        res.json(result.rows); 
    } catch (err) {
        console.error("Lỗi getTruyenCuaTacGia:", err.message);
        res.status(500).json({ error: "Lỗi hệ thống khi tải danh sách truyện tác giả" });
    }
};
// 4. Tác giả gửi bản thảo mới (Viết bài)
// Sửa hàm dangBanThaoMoi trong chuongController.js
exports.dangBanThaoMoi = async (req, res) => {
    // Nhận MATK từ Frontend gửi lên thay vì MATG
    const { MAT, TENBT, ND, MATK, GIA_XU } = req.body;
    
    const MABT = 'BT' + Date.now().toString().slice(-8);

    try {
        // 1. Tìm MATG của tác giả dựa trên MATK
        const tgRes = await pool.query('SELECT MATG FROM TAC_GIA WHERE MATK = $1', [MATK]);
        
        if (tgRes.rows.length === 0) {
            return res.status(400).json({ error: "Tài khoản này chưa được cấu hình làm Tác giả!" });
        }
        
        const v_matg = tgRes.rows[0].matg; // Lấy được mã dạng 'TG01'

        // 2. Tiến hành chèn bản thảo với MATG vừa tìm được
        const query = `
            INSERT INTO BAN_THAO (MABT, MAT, TENBT, ND, TRANGTHAI, MATG, NGAY_DUYET, GIA_XU)
            VALUES ($1, $2, $3, $4, 'Chờ Duyệt', $5, NULL, $6)
        `;
        await pool.query(query, [MABT, MAT, TENBT, ND, v_matg, GIA_XU || 0]);
        
        res.status(201).json({ message: "Gửi bản thảo thành công! Vui lòng đợi quản trị viên phê duyệt." });
    } catch (err) {
        console.error("Lỗi dangBanThaoMoi:", err.message);
        res.status(500).json({ error: "Lỗi hệ thống khi gửi bản thảo" });
    }
};

// 1. Kiểm tra xem người dùng đã mua chương này hoặc trọn bộ truyện này chưa
exports.checkQuyenDoc = async (req, res) => {
    const { mabt, madg } = req.query;
    try {
        const query = `
            SELECT 1 FROM LICH_SU_MUA 
            WHERE MADG = $1 
            AND (MABT = $2 OR (MAT = (SELECT MAT FROM BAN_THAO WHERE MABT = $2) AND LOAI_MUA = 'TRON_GOI'))
            LIMIT 1
        `;
        const result = await pool.query(query, [madg, mabt]);
        res.json({ purchased: result.rows.length > 0 });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// 2. Thực hiện giao dịch mua chương lẻ
// Backend/controllers/chuongController.js

// Backend/controllers/chuongController.js

exports.muaChuongLe = async (req, res) => {
    const { madg, mabt, so_xu, mat } = req.body;
    
    // RẤT QUAN TRỌNG: MAMUA trong DB là VARCHAR(10). 
    // Ta dùng tiền tố 'C' + 7 số cuối của timestamp để đảm bảo không quá 10 ký tự.
    const mamua = 'C' + Date.now().toString().slice(-7); 

    try {
        await pool.query('BEGIN');

        // 1. Kiểm tra số dư (Query qua MATK liên kết từ DOC_GIA)
        const userRes = await pool.query(
            `SELECT SO_DU FROM TAI_KHOAN 
             WHERE MATK = (SELECT MATK FROM DOC_GIA WHERE MADG = $1)`, 
            [madg]
        );
        
        if (userRes.rows.length === 0) {
            await pool.query('ROLLBACK');
            return res.status(404).json({ message: "Không tìm thấy tài khoản!" });
        }

        const soDuHienTai = userRes.rows[0].so_du;
        if (soDuHienTai < so_xu) {
            await pool.query('ROLLBACK');
            return res.status(400).json({ message: "Số dư xu không đủ!" });
        }

        // 2. Chèn vào LICH_SU_MUA
        // Các cột: MAMUA, MADG, MAT, MABT, SO_XU_RA, LOAI_MUA
        const insertQuery = `
            INSERT INTO LICH_SU_MUA (MAMUA, MADG, MAT, MABT, SO_XU_RA, LOAI_MUA) 
            VALUES ($1, $2, $3, $4, $5, 'CHUONG')
        `;
        
        await pool.query(insertQuery, [mamua, madg, mat, mabt, so_xu]);

        // Sau lệnh này, Trigger trg_sau_khi_mua sẽ tự động trừ xu người dùng
        await pool.query('COMMIT');
        
        res.json({ success: true, message: "Mở khóa chương thành công!" });

    } catch (err) {
        await pool.query('ROLLBACK');
        console.error("Lỗi mua chương lẻ:", err.message);
        res.status(500).json({ message: "Lỗi hệ thống: " + err.message });
    }
};