const db = require('../../config/db'); 

const TuongtacController = {
    // Lấy tất cả bình luận + Tên truyện + Fix lỗi hiện nội dung
    getAllBinhLuan: async (req, res) => {
        try {
            const query = `
                SELECT 
                    bl.MABL as "mabl", 
                    bl.NOI_DUNG as "noi_dung", 
                    bl.NGAY_BL as "ngay_bl", 
                    tk.TENDN as "ten_nguoi_binh_luan", 
                    bt.TENBT as "ten_ban_thao",
                    t.TENT as "ten_truyen"
                FROM BINH_LUAN bl
                LEFT JOIN DOC_GIA dg ON bl.MADG = dg.MADG
                LEFT JOIN TAI_KHOAN tk ON dg.MATK = tk.MATK
                LEFT JOIN BAN_THAO bt ON bl.MABT = bt.MABT
                LEFT JOIN TRUYEN t ON bt.MAT = t.MAT
                ORDER BY bl.NGAY_BL DESC
            `;
            const result = await db.query(query);
            res.json({ success: true, data: result.rows });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    },

    // Lấy tất cả đánh giá
    getAllDanhGia: async (req, res) => {
        try {
            const query = `
                SELECT 
                    dga.MADGIA as "madgia", 
                    dga.ND as "nd", 
                    dga.SOSAO as "sosao", 
                    tk.TENDN as "tendn", 
                    t.TENT as "tent" 
                FROM DANH_GIA dga
                LEFT JOIN DOC_GIA dg ON dga.MADG = dg.MADG
                LEFT JOIN TAI_KHOAN tk ON dg.MATK = tk.MATK
                LEFT JOIN TRUYEN t ON dga.MAT = t.MAT
            `;
            const result = await db.query(query);
            res.json({ success: true, data: result.rows });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    },

    // Lấy tất cả phản hồi
    getAllPhanHoi: async (req, res) => {
        try {
            const query = `
                SELECT 
                    ph.MAPH as "maph", 
                    ph.NOI_DUNG as "noi_dung", 
                    ph.NGAY_PH as "ngay_ph",
                    COALESCE(tk_dg.TENDN, tk_tg.TENDN) as "nguoi_ph",
                    COALESCE(bl.NOI_DUNG, dga.ND) as "noidung_goc"
                FROM PHAN_HOI ph
                LEFT JOIN DOC_GIA dg ON ph.MADG = dg.MADG
                LEFT JOIN TAI_KHOAN tk_dg ON dg.MATK = tk_dg.MATK
                LEFT JOIN TAC_GIA tg ON ph.MATG = tg.MATG
                LEFT JOIN TAI_KHOAN tk_tg ON tg.MATK = tk_tg.MATK
                LEFT JOIN BINH_LUAN bl ON ph.MABL = bl.MABL
                LEFT JOIN DANH_GIA dga ON ph.MADGIA = dga.MADGIA
                ORDER BY ph.NGAY_PH DESC
            `;
            const result = await db.query(query);
            res.json({ success: true, data: result.rows });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    },

    // --- CÁC HÀM XÓA (Quan trọng: PostgreSQL dùng $1) ---
   // File: TuongtacController.js

deleteBinhLuan: async (req, res) => {
    try {
        const { id } = req.params; // Lấy ID từ đường dẫn API
        
        // SỬA TẠI ĐÂY: Dùng $1 thay vì ? cho PostgreSQL
        const result = await db.query('DELETE FROM BINH_LUAN WHERE MABL = $1', [id]);
        
        if (result.rowCount === 0) {
            return res.status(404).json({ success: false, message: "Không tìm thấy bình luận" });
        }

        res.json({ success: true });
    } catch (error) {
        console.error("Lỗi xóa:", error.message);
        res.status(500).json({ success: false, message: error.message });
    }
},

    deleteDanhGia: async (req, res) => {
        try {
            await db.query('DELETE FROM DANH_GIA WHERE MADGIA = $1', [req.params.id]);
            res.json({ success: true });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    },

    deletePhanHoi: async (req, res) => {
        try {
            await db.query('DELETE FROM PHAN_HOI WHERE MAPH = $1', [req.params.id]);
            res.json({ success: true });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    }
};

module.exports = TuongtacController;