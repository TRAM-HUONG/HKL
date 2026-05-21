const pool = require('../config/db');

exports.getChiTietByMat = async (req, res) => {
    const { mat } = req.params;
    try {
        const query = `
            SELECT 
                t.*, 
                ct.MOTA, 
                tl.TENTL as ten_the_loai,
                tg.TENTG as ten_tac_gia, -- Thêm tên tác giả từ bảng TAC_GIA
                COALESCE(
                    (SELECT MAX(NGAY_DUYET) FROM BAN_THAO bt WHERE bt.MAT = t.MAT AND bt.TRANGTHAI = 'Đã Duyệt'), 
                    t.NGAYDANG
                ) as ngay_cap_nhat,
                (SELECT COUNT(*) FROM BAN_THAO bt WHERE bt.MAT = t.MAT AND bt.TRANGTHAI = 'Đã Duyệt') as so_chuong,
                COALESCE((SELECT AVG(SOSAO) FROM DANH_GIA dg WHERE dg.MAT = t.MAT), 0) as sao_trung_binh
            FROM TRUYEN t
            LEFT JOIN CHI_TIET_TRUYEN ct ON t.MAT = ct.MAT
            LEFT JOIN THE_LOAI tl ON ct.MATL = tl.MATL
            LEFT JOIN TAC_GIA tg ON t.MATG = tg.MATG -- Liên kết lấy thông tin tác giả
            WHERE t.MAT = $1
        `;
        const result = await pool.query(query, [mat]);
        if (result.rows.length === 0) {
            return res.status(404).json({ message: "Không tìm thấy truyện" });
        }
        res.json(result.rows[0]);
    } catch (err) {
        console.error("Lỗi lấy chi tiết:", err.message);
        res.status(500).json({ error: "Lỗi hệ thống" });
    }
};
exports.getDanhGiaByMat = async (req, res) => {
    const { mat } = req.params;
    try {
        const query = `
            SELECT 
                dg.MADGIA, dg.ND as noi_dung, dg.SOSAO as so_sao, doc.TENDG as ten_doc_gia,
                ph.MAPH, ph.NOI_DUNG as noi_dung_tl, 
                ph.MATG as ma_tac_gia_tl, -- Để hiện tick xanh
                ph.MADG as ma_doc_gia_tl, -- Để hiện tên độc giả trả lời
                tg.TENTG as ten_tac_gia_tl,
                dg_ph.TENDG as ten_doc_gia_tl
            FROM DANH_GIA dg
            JOIN DOC_GIA doc ON dg.MADG = doc.MADG
            LEFT JOIN PHAN_HOI ph ON dg.MADGIA = ph.MADGIA -- Đổi tên bảng ở đây
            LEFT JOIN TAC_GIA tg ON ph.MATG = tg.MATG
            LEFT JOIN DOC_GIA dg_ph ON ph.MADG = dg_ph.MADG -- Join thêm để lấy tên người phản hồi nếu là độc giả
            WHERE dg.MAT = $1
        `;
        const result = await pool.query(query, [mat]);
        res.json(result.rows);
    } catch (err) {
        console.error("Lỗi getDanhGia:", err.message);
        res.status(500).json({ error: "Lỗi lấy đánh giá" });
    }
};
exports.postDanhGia = async (req, res) => {
    const { mat, madg, nd, sosao } = req.body;

    try {
        // 1. KIỂM TRA CHẶN: Độc giả này đã đánh giá truyện này chưa?
        const checkExist = await pool.query(
            'SELECT * FROM DANH_GIA WHERE MAT = $1 AND MADG = $2',
            [mat, madg]
        );

        if (checkExist.rows.length > 0) {
            // Nếu đã tồn tại, trả về lỗi 400
            return res.status(400).json({ 
                message: "Bạn đã đánh giá truyện này rồi. Mỗi truyện chỉ được đánh giá một lần!" 
            });
        }

        // 2. Nếu chưa có, tiến hành tạo mã và lưu
        const madgia = `DG${Date.now().toString().slice(-8)}`; 
        const insertQuery = `
            INSERT INTO DANH_GIA (MADGIA, MAT, MADG, ND, SOSAO) 
            VALUES ($1, $2, $3, $4, $5) RETURNING *`;
        
        const result = await pool.query(insertQuery, [madgia, mat, madg, nd, sosao]);
        
        res.status(201).json({ 
            message: "Đánh giá thành công!", 
            data: result.rows[0] 
        });

    } catch (err) {
        console.error("Lỗi Server:", err.message);
        res.status(500).json({ error: "Lỗi hệ thống khi lưu đánh giá" });
    }
};
// Xóa Đánh giá gốc
// controllers/ChiTietTruyenController.js
exports.deleteDanhGia = async (req, res) => {
    const { madgia } = req.params;
    const { madg } = req.body; // Frontend gửi { madg: currentId }
    try {
        const result = await pool.query(
            "DELETE FROM DANH_GIA WHERE MADGIA = $1 AND MADG = $2",
            [madgia, madg]
        );
        if (result.rowCount === 0) {
            return res.status(403).json({ error: "Bạn không có quyền xóa hoặc không tìm thấy đánh giá" });
        }
        res.json({ message: "Đã xóa đánh giá thành công" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Lỗi hệ thống khi xóa" });
    }
};
// Thêm vào controllers/ChiTietTruyenController.js hoặc binhLuanController.js

exports.deletePhanHoi = async (req, res) => {
    const { maph } = req.params;
    const { userId } = req.body; // Frontend gửi { userId: currentId }

    try {
        // Xóa phản hồi nếu mã phản hồi khớp và người thực hiện là chủ sở hữu
        // Kiểm tra đồng thời cả cột MADG (Độc giả) và MATG (Tác giả)
        const result = await pool.query(
            "DELETE FROM PHAN_HOI WHERE MAPH = $1 AND (MADG = $2 OR MATG = $3)",
            [maph, userId, userId]
        );

        if (result.rowCount === 0) {
            return res.status(403).json({ 
                error: "Bạn không có quyền xóa phản hồi này hoặc phản hồi không tồn tại" 
            });
        }

        res.json({ message: "Đã xóa phản hồi thành công" });
    } catch (err) {
        console.error("Lỗi xóa phản hồi:", err);
        res.status(500).json({ error: "Lỗi hệ thống khi xóa phản hồi" });
    }
};
// Lấy danh sách truyện cùng thể loại (Gợi ý)
exports.getTruyenCungTheLoai = async (req, res) => {
    const { mat } = req.params; // Mã truyện hiện tại đang xem
    try {
        // Bước 1: Tìm mã thể loại (MATL) của truyện hiện tại
        const queryTheLoai = `SELECT MATL FROM CHI_TIET_TRUYEN WHERE MAT = $1`;
        const resTheLoai = await pool.query(queryTheLoai, [mat]);

        if (resTheLoai.rows.length === 0 || !resTheLoai.rows[0].matl) {
            return res.json([]); // Nếu truyện chưa phân loại, trả về mảng rỗng
        }

        const maTheLoai = resTheLoai.rows[0].matl;

        // Bước 2: Lấy các truyện khác có cùng mã thể loại đó (Giới hạn lấy 4 truyện)
        const queryGoiY = `
            SELECT 
                t.MAT, 
                t.TENT, 
                t.HINHANH,
                (SELECT COUNT(*) FROM BAN_THAO bt WHERE bt.MAT = t.MAT AND bt.TRANGTHAI = 'Đã Duyệt') as so_chuong,
                COALESCE((SELECT AVG(SOSAO) FROM DANH_GIA dg WHERE dg.MAT = t.MAT), 0) as sao_trung_binh
            FROM TRUYEN t
            JOIN CHI_TIET_TRUYEN ct ON t.MAT = ct.MAT
            WHERE ct.MATL = $1 AND t.MAT != $2
            LIMIT 4
        `;
        
        const result = await pool.query(queryGoiY, [maTheLoai, mat]);
        res.json(result.rows);
    } catch (err) {
        console.error("Lỗi lấy truyện cùng thể loại:", err.message);
        res.status(500).json({ error: "Lỗi hệ thống" });
    }
};