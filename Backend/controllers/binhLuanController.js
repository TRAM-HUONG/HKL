const pool = require('../config/db');

/// File: binhLuanController.js

exports.getBinhLuanByBanThao = async (req, res) => {
    const { mabt } = req.params;
    try {
        const query = `
            SELECT 
                bl.MABL, bl.NOI_DUNG, bl.NGAY_BL,
                bl.MADG as madg_chu_bl,
                dg_bl.TENDG as ten_nguoi_binh_luan,
                ph.MAPH, ph.NOI_DUNG as noi_dung_ph, ph.NGAY_PH,
                ph.MATG as ma_tac_gia_ph,   -- QUAN TRỌNG: Để check tick xanh
                ph.MADG as ma_doc_gia_ph,
                tg.TENTG as ten_tac_gia_ph, -- Tên tác giả
                dg_ph.TENDG as ten_doc_gia_ph -- Tên độc giả phản hồi
            FROM BINH_LUAN bl
            LEFT JOIN DOC_GIA dg_bl ON bl.MADG = dg_bl.MADG
            LEFT JOIN PHAN_HOI ph ON bl.MABL = ph.MABL
            LEFT JOIN TAC_GIA tg ON ph.MATG = tg.MATG
            LEFT JOIN DOC_GIA dg_ph ON ph.MADG = dg_ph.MADG
            WHERE bl.MABT = $1
            ORDER BY bl.NGAY_BL ASC, ph.NGAY_PH ASC
        `;
        const result = await pool.query(query, [mabt]);
        res.json(result.rows);
    } catch (err) {
        console.error("Lỗi getBinhLuan:", err);
        res.status(500).json({ error: "Lỗi lấy dữ liệu" });
    }
};
// Cập nhật hàm postBinhLuan để xử lý cả phản hồi của Độc giả
exports.postBinhLuan = async (req, res) => {
    const { mabt, noi_dung, madg, matg, mabl_cha, madgia } = req.body;

    try {
        // Nếu có mabl_cha (phản hồi bình luận) hoặc madgia (phản hồi đánh giá)
        if (mabl_cha || madgia) {
            const maph = `PH${Date.now().toString().slice(-8)}`;
            const queryPH = `
                INSERT INTO PHAN_HOI (MAPH, MABL, MADGIA, MADG, MATG, NOI_DUNG)
                VALUES ($1, $2, $3, $4, $5, $6) RETURNING *
            `;
            // madg hoặc matg sẽ được truyền vào tùy theo ai đang đăng nhập
            const result = await pool.query(queryPH, [
                maph, 
                mabl_cha || null, 
                madgia || null, 
                madg || null, 
                matg || null, 
                noi_dung
            ]);
            return res.status(201).json({ message: "Phản hồi thành công", data: result.rows[0] });
        }

        // Nếu là bình luận gốc mới
        const mabl = `BL${Date.now().toString().slice(-8)}`;
        const queryBL = `
            INSERT INTO BINH_LUAN (MABL, MABT, NOI_DUNG, MADG)
            VALUES ($1, $2, $3, $4) RETURNING *
        `;
        const result = await pool.query(queryBL, [mabl, mabt, noi_dung, madg]);
        res.status(201).json(result.rows[0]);

    } catch (err) {
        console.error("Lỗi postBinhLuan:", err.message);
        res.status(500).json({ error: "Không thể gửi nội dung" });
    }
};
exports.postPhanHoiTacGia = async (req, res) => {
    const { matg, noi_dung, mabl, madgia } = req.body;
    const maph = `PH${Date.now().toString().slice(-8)}`;

    try {
        const query = `
            INSERT INTO PHAN_HOI_TAC_GIA (MAPH, MATG, NOI_DUNG, MABL, MADGIA)
            VALUES ($1, $2, $3, $4, $5) RETURNING *
        `;
        const result = await pool.query(query, [maph, matg, noi_dung, mabl || null, madgia || null]);
        res.status(201).json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: "Lỗi khi tác giả phản hồi" });
    }
};
// 1. Xóa Bình luận gốc (Chương)
exports.deleteBinhLuan = async (req, res) => {
    const { mabl } = req.params;
    const { userId } = req.body; 
    try {
        // Chỉ người tạo ra bình luận (Độc giả) mới có quyền xóa
        const result = await pool.query(
            "DELETE FROM BINH_LUAN WHERE MABL = $1 AND MADG = $2",
            [mabl, userId]
        );
        if (result.rowCount === 0) return res.status(403).json({ error: "Không có quyền xóa hoặc không tìm thấy" });
        res.json({ message: "Đã xóa bình luận thành công" });
    } catch (err) {
        res.status(500).json({ error: "Lỗi hệ thống" });
    }
};
exports.deletePhanHoi = async (req, res) => {
    const { maph } = req.params;
    const { userId } = req.body; // ID người dùng hiện tại từ Frontend gửi lên

    try {
        // Xóa phản hồi nếu MAPH khớp và người thực hiện là chủ sở hữu (MADG hoặc MATG)
        const result = await pool.query(
            "DELETE FROM PHAN_HOI WHERE MAPH = $1 AND (MADG = $2 OR MATG = $3)",
            [maph, userId, userId]
        );

        if (result.rowCount === 0) {
            return res.status(403).json({ error: "Bạn không có quyền xóa phản hồi này!" });
        }

        res.json({ message: "Đã xóa phản hồi thành công" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Lỗi hệ thống khi xóa phản hồi" });
    }
};