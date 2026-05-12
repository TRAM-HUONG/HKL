const pool = require('../../config/db');

// Lấy toàn bộ danh sách bản thảo
exports.getAllDrafts = async (req, res) => {
    try {
        const query = `
            SELECT 
                bt.mabt, 
                bt.tenbt as ten_chuong, -- Khớp với item.ten_chuong ở Frontend
                bt.trangthai,
                t.tent as ten_truyen, 
                tg.tentg as ten_tac_gia -- Lấy tên từ bảng TAC_GIA thay vì TAI_KHOAN
            FROM BAN_THAO bt
            LEFT JOIN TRUYEN t ON bt.mat = t.mat
            LEFT JOIN TAC_GIA tg ON bt.matg = tg.matg
            ORDER BY bt.mabt DESC -- Hoặc dùng ngay_duyet nếu đã có dữ liệu
        `;
        const result = await pool.query(query);
        res.status(200).json({
            success: true,
            data: result.rows
        });
    } catch (err) {
        console.error("Lỗi lấy danh sách bản thảo:", err.message);
        res.status(500).json({ success: false, error: err.message });
    }
};
// Duyệt bản thảo (Cập nhật trạng thái)
exports.approveDraft = async (req, res) => {
    const { mabt } = req.params;
    try {
        await pool.query(
            "UPDATE BAN_THAO SET trangthai = 'Đã Duyệt', ngay_duyet = CURRENT_TIMESTAMP WHERE mabt = $1",
            [mabt]
        );
        res.json({ success: true, message: "Đã duyệt bản thảo thành công!" });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};

// Xóa bản thảo trong banThaoController.js
exports.deleteDraft = async (req, res) => {
    const { mabt } = req.params;
    try {
        // Thực hiện lệnh DELETE trong Database
        const result = await pool.query("DELETE FROM BAN_THAO WHERE mabt = $1", [mabt]);
        
        if (result.rowCount > 0) {
            res.json({ success: true, message: "Đã xóa bản thảo vĩnh viễn!" });
        } else {
            res.status(404).json({ success: false, message: "Không tìm thấy mã bản thảo để xóa." });
        }
    } catch (err) {
        console.error("Lỗi SQL xóa bản thảo:", err.message);
        res.status(500).json({ success: false, error: "Lỗi hệ thống khi xóa dữ liệu." });
    }
};
// XEM
// Thêm vào file banThaoController.js
exports.getDraftDetail = async (req, res) => {
    const { mabt } = req.params;
    try {
        const query = `
            SELECT bt.mabt, bt.tenbt, bt.nd, bt.trangthai, t.tent as ten_truyen
            FROM BAN_THAO bt
            LEFT JOIN TRUYEN t ON bt.mat = t.mat
            WHERE bt.mabt = $1
        `;
        const result = await pool.query(query, [mabt]);
        
        if (result.rows.length > 0) {
            res.status(200).json({ success: true, data: result.rows[0] });
        } else {
            res.status(404).json({ success: false, message: "Không tìm thấy bản thảo" });
        }
    } catch (err) {
        console.error("Lỗi lấy chi tiết:", err.message);
        res.status(500).json({ success: false, error: err.message });
    }
};