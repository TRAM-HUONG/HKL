const pool = require('../../config/db');

// 1. Lấy danh sách truyện đang chờ duyệt
exports.getPendingTruyen = async (req, res) => {
    try {
        const query = `
            SELECT t.*, tg.TENTG as ten_tac_gia
            FROM TRUYEN t
            LEFT JOIN TAC_GIA tg ON t.MATG = tg.MATG
            WHERE t.TRANGTHAI = 'Đợi duyệt'
            ORDER BY t.NGAYDANG DESC
        `;
        const result = await pool.query(query);
        res.json({ success: true, data: result.rows });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};
exports.approveTruyen = async (req, res) => {
    const { id } = req.params;
    try {
        await pool.query('BEGIN');
        const query = `
            UPDATE TRUYEN 
            SET TRANGTHAI = 'Đang ra', 
                NGAYDANG = CURRENT_TIMESTAMP 
            WHERE MAT = $1 AND TRANGTHAI = 'Đợi duyệt'
            RETURNING *;
        `;
        const result = await pool.query(query, [id]);
        if (result.rowCount === 0) {
            await pool.query('ROLLBACK');
            return res.status(404).json({ success: false, message: "Không tìm thấy truyện" });
        }
        await pool.query('COMMIT');
        res.json({ success: true, message: "Duyệt thành công!" });
    } catch (err) {
        await pool.query('ROLLBACK');
        res.status(500).json({ success: false, error: err.message });
    }
};


// Hàm lấy tất cả truyện và phân loại
exports.getAllManageTruyen = async (req, res) => {
    try {
        const query = `
            SELECT t.*, tg.TENTG as ten_tac_gia 
            FROM TRUYEN t
            LEFT JOIN TAC_GIA tg ON t.MATG = tg.MATG
            ORDER BY t.NGAYDANG DESC
        `;
        const result = await pool.query(query);

        // Chia làm 2 mảng: Chờ duyệt và Đã duyệt/Còn lại[cite: 1, 2]
        const choDuyet = result.rows.filter(r => r.trangthai === 'Đợi duyệt');
        const daDuyet = result.rows.filter(r => r.trangthai !== 'Đợi duyệt');

        res.json({ success: true, choDuyet, daDuyet });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};

// Hàm duyệt truyện
exports.approveTruyen = async (req, res) => {
    const { id } = req.params;
    try {
        const query = `
            UPDATE TRUYEN 
            SET TRANGTHAI = 'Đang ra', NGAYDANG = CURRENT_TIMESTAMP 
            WHERE MAT = $1 
            RETURNING *
        `;
        await pool.query(query, [id]);
        res.json({ success: true, message: "Duyệt thành công!" });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};

exports.getTruyenDetail = async (req, res) => {
    const { id } = req.params;
    try {
        const query = `
            SELECT 
                t.TENT as ten_truyen,
                t.NXB as nha_xuat_ban,
                t.NGAYDANG as ngay_dang,
                t.HINHANH as hinh_anh,
                t.TRANGTHAI as trang_thai,
                tg.TENTG as ten_tac_gia,
                tl.TENTL as ten_the_loai,
                ct.MOTA as mo_ta
            FROM TRUYEN t
            LEFT JOIN TAC_GIA tg ON t.MATG = tg.MATG
            LEFT JOIN CHI_TIET_TRUYEN ct ON t.MAT = ct.MAT
            LEFT JOIN THE_LOAI tl ON ct.MATL = tl.MATL
            WHERE t.MAT = $1
        `;
        const result = await pool.query(query, [id]);
        
        if (result.rows.length === 0) {
            return res.status(404).json({ success: false, message: "Không tìm thấy truyện" });
        }
        
        res.json({ success: true, data: result.rows[0] });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};

// 2. Từ chối duyệt truyện
exports.rejectTruyen = async (req, res) => {
    const { id } = req.params;
    try {
        const query = `UPDATE TRUYEN SET TRANGTHAI = 'Không được duyệt' WHERE MAT = $1`;
        await pool.query(query, [id]);
        res.json({ success: true, message: "Đã từ chối truyện này!" });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};

// 3. Xóa truyện (Sẽ tự động xóa chi tiết do ON DELETE CASCADE)
exports.deleteTruyen = async (req, res) => {
    const { id } = req.params;
    try {
        await pool.query('DELETE FROM TRUYEN WHERE MAT = $1', [id]);
        res.json({ success: true, message: "Xóa truyện thành công!" });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};