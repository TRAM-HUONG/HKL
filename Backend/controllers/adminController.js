// Thêm dòng này vào đầu tệp adminController.js
const pool = require('../config/db'); // Đảm bảo đường dẫn này đúng với cấu trúc thư mục của bạn

exports.getQuickStats = async (req, res) => {
    try {
        const query = `
            SELECT 
                (SELECT COUNT(*) FROM TRUYEN) as total_stories,
                (SELECT COUNT(*) FROM TAI_KHOAN WHERE VAI_TRO = 'DocGia') as total_subscribers,
                (SELECT COUNT(*) FROM BAN_THAO WHERE TRANGTHAI = 'Đang chờ' OR TRANGTHAI = 'Chờ Duyệt') as pending_drafts,
                (SELECT COUNT(*) FROM TRUYEN WHERE TRANGTHAI = 'Đợi duyệt') as pending_stories
        `;
        
        const result = await pool.query(query); // Bây giờ pool đã được định nghĩa[cite: 2]
        
        res.json({
            success: true,
            data: {
                totalStories: parseInt(result.rows[0].total_stories),
                totalSubscribers: parseInt(result.rows[0].total_subscribers),
                pendingDrafts: parseInt(result.rows[0].pending_drafts),
                pendingStories: parseInt(result.rows[0].pending_stories)
            }
        });
    } catch (err) {
        console.error("Lỗi lấy thống kê Admin:", err.message);
        res.status(500).json({ success: false, error: err.message });
    }
};
// Thêm tài khoản ADMIN mới
exports.createAdminAccount = async (req, res) => {
    const { tendn, matkhau, email } = req.body;

    if (!tendn || !matkhau || !email) {
        return res.status(400).json({ success: false, message: "Vui lòng điền đầy đủ thông tin!" });
    }

    try {
        // 1. Kiểm tra xem tên đăng nhập hoặc email đã tồn tại chưa
        const checkExist = await pool.query(
            "SELECT matk FROM TAI_KHOAN WHERE tendn = $1 OR email = $2",
            [tendn, email]
        );

        if (checkExist.rows.length > 0) {
            return res.status(400).json({ success: false, message: "Tên đăng nhập hoặc Email đã tồn tại!" });
        }

        // 2. TỰ ĐỘNG SINH MÃ TÀI KHOẢN (matk) dạng TK00X
        const maxIdResult = await pool.query("SELECT matk FROM TAI_KHOAN ORDER BY matk DESC LIMIT 1");
        let newMatk = "TK001"; 
        
        if (maxIdResult.rows.length > 0) {
            const lastMatk = maxIdResult.rows[0].matk; 
            const currentNumber = parseInt(lastMatk.replace("TK", ""), 10); 
            const nextNumber = currentNumber + 1; 
            newMatk = `TK${String(nextNumber).padStart(3, '0')}`;
        }

        // 3. Cập nhật câu lệnh INSERT chứa đủ 5 cột và 5 tham số truyền vào
        const insertQuery = `
            INSERT INTO TAI_KHOAN (matk, tendn, mk, email, vai_tro, so_du)
            VALUES ($1, $2, $3, $4, 'Admin', 0)
            RETURNING matk, tendn, email, vai_tro
        `;
        
        // Mảng này gồm 4 phần tử tương ứng với $1, $2, $3, $4 ở trên
        const newAccount = await pool.query(insertQuery, [newMatk, tendn, matkhau, email]);

        res.status(201).json({
            success: true,
            message: `Thêm tài khoản Admin thành công với mã ${newMatk}!`,
            data: newAccount.rows[0]
        });

    } catch (err) {
        console.error("Lỗi khi thêm tài khoản Admin:", err.message);
        res.status(500).json({ success: false, error: err.message });
    }
};