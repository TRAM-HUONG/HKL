const pool = require('../config/db');

exports.updateLichSu = async (req, res) => {
    const { madg, mat, tenbt } = req.body;

    if (!madg || !mat || !tenbt) {
        return res.status(400).json({ error: "Thiếu thông tin cập nhật." });
    }

    const client = await pool.connect();
    try {
        await client.query('BEGIN');

        const mactdg = 'CTD' + Date.now().toString().slice(-7);

        // 1. Ghi nhận chương vừa đọc (Thêm mới hoặc cập nhật thời gian)
        const upsertQuery = `
            INSERT INTO CHI_TIET_DOC_GIA (mactdg, madg, mat, lsd, ngay_cap_nhat, trangthai)
            VALUES ($1, $2, $3, $4, CURRENT_TIMESTAMP, 'Đang đọc')
            ON CONFLICT (madg, mat, lsd) 
            DO UPDATE SET ngay_cap_nhat = CURRENT_TIMESTAMP;
        `;
        await client.query(upsertQuery, [mactdg, madg, mat, tenbt]);

        // 2. XÓA TỔNG THỂ: Chỉ giữ lại đúng 3 bản ghi mới nhất của độc giả này (BỎ lọc theo MAT)
        const deleteGlobalQuery = `
            DELETE FROM CHI_TIET_DOC_GIA
            WHERE mactdg IN (
                SELECT mactdg FROM (
                    SELECT mactdg FROM CHI_TIET_DOC_GIA
                    WHERE madg = $1
                    ORDER BY ngay_cap_nhat DESC
                    OFFSET 3
                ) AS to_delete
            );
        `;
        await client.query(deleteGlobalQuery, [madg]);

        await client.query('COMMIT');
        res.status(200).json({ message: "Hệ thống đã dọn dẹp, chỉ còn 3 chương mới nhất." });
    } catch (err) {
        await client.query('ROLLBACK');
        console.error("Lỗi xóa lịch sử:", err.message);
        res.status(500).json({ error: "Lỗi hệ thống.", details: err.message });
    } finally {
        client.release();
    }
};
// lichSuController.js
exports.getLichSuByDocGia = async (req, res) => {
    const { madg } = req.params; // Lấy DG01 từ URL
    try {
        const query = `
            SELECT T.mat, T.tent, T.hinhanh, CT.lsd AS ten_chuong, CT.ngay_cap_nhat
            FROM CHI_TIET_DOC_GIA CT
            JOIN TRUYEN T ON CT.mat = T.mat
            WHERE CT.madg = $1
            ORDER BY CT.ngay_cap_nhat DESC;
        `;
        const result = await pool.query(query, [madg]);
        res.status(200).json(result.rows); // Trả về JSON
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: "Lỗi server" });
    }
};



exports.deleteLichSu = async (req, res) => {
    const { madg, mat } = req.body;

    if (!madg || !mat) {
        return res.status(400).json({ error: "Thiếu thông tin để xóa lịch sử." });
    }

    try {
        // Xóa tất cả các bản ghi lịch sử của bộ truyện này đối với độc giả đó
        const query = `DELETE FROM CHI_TIET_DOC_GIA WHERE madg = $1 AND mat = $2`;
        const result = await pool.query(query, [madg, mat]);

        if (result.rowCount === 0) {
            return res.status(404).json({ error: "Không tìm thấy lịch sử để xóa." });
        }

        res.status(200).json({ message: "Đã xóa lịch sử đọc thành công." });
    } catch (err) {
        console.error("Lỗi khi xóa lịch sử:", err.message);
        res.status(500).json({ error: "Lỗi hệ thống khi xóa." });
    }
};