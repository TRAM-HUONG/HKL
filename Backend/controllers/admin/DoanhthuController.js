const db = require("../../config/db"); 

const DoanhthuController = {
    // 1. Lấy tổng quan doanh thu (Dashboard)
// DoanhthuController.js
getQuickStats: async (req, res) => {
    try {
        const statsQuery = `
            SELECT 
                (SELECT COALESCE(SUM(GN.SO_TIEN_VND), 0) 
                 FROM LICH_SU_NAP LN 
                 JOIN GOI_NAP GN ON LN.MAGOI = GN.MAGOI) as total_vnd,
                
                (SELECT COALESCE(SUM(TONG_XU), 0) FROM DOANH_THU) as total_xu,
                
                (SELECT COALESCE(SUM(XU_ADMIN), 0) FROM DOANH_THU) as total_profit,
                
                (SELECT COUNT(*) FROM YEU_CAU_RUT_TIEN WHERE TRANGTHAI = 'Chờ duyệt') as pending
        `;
        const result = await db.query(statsQuery);
            const row = result.rows[0];
            
            res.json({
                success: true,
                data: {
                    tong_tien_nap: parseFloat(row.total_vnd),
                    tong_xu_ban_duoc: parseInt(row.total_xu),
                    loi_nhuan_admin: parseFloat(row.total_profit),
                    yeu_cau_cho: parseInt(row.pending)
                }
            });
        } catch (error) {
            console.error("Stats Error:", error);
            res.status(500).json({ success: false, message: "Lỗi thống kê" });
        }
    },

    // 2. Lịch sử nạp tiền (VND)
    getRechargeHistory: async (req, res) => {
        try {
            const query = `
                SELECT 
                    L.MANAP, 
                    T.TENDN, 
                    G.TEN_GOI, 
                    G.SO_TIEN_VND, 
                    G.SO_XU_NHAN, 
                    L.NGAY_NAP
                FROM LICH_SU_NAP L
                JOIN TAI_KHOAN T ON L.MATK = T.MATK
                JOIN GOI_NAP G ON L.MAGOI = G.MAGOI
                ORDER BY L.NGAY_NAP DESC
            `;
            const result = await db.query(query);
            res.json({ success: true, data: result.rows });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    },

    // 3. Doanh thu bán truyện (Chi tiết chia 70/30)
    getSalesRevenue: async (req, res) => {
        try {
            const query = `
                SELECT 
                    DT.MADT,
                    TG.TENTG,
                    COALESCE(TR.TENT, 'Mua chương lẻ') as ten_truyen,
                    DT.TONG_XU,
                    DT.XU_TAC_GIA,
                    DT.XU_ADMIN,
                    DT.NGAY_GIAO_DICH
                FROM DOANH_THU DT
                JOIN TAC_GIA TG ON DT.MATG = TG.MATG
                JOIN LICH_SU_MUA LM ON DT.MAMUA = LM.MAMUA
                LEFT JOIN TRUYEN TR ON LM.MAT = TR.MAT
                ORDER BY DT.NGAY_GIAO_DICH DESC
            `;
            const result = await db.query(query);
            res.json({ success: true, data: result.rows });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    },

    // 4. Thống kê gói nạp phổ biến
    getTopGoiNap: async (req, res) => {
        try {
            const query = `
                SELECT 
                    G.TEN_GOI, 
                    COUNT(L.MANAP) as so_luot_nap, 
                    SUM(COALESCE(G.SO_TIEN_VND, 0)) as tong_vnd
                FROM GOI_NAP G
                LEFT JOIN LICH_SU_NAP L ON G.MAGOI = L.MAGOI
                GROUP BY G.MAGOI, G.TEN_GOI
                ORDER BY tong_vnd DESC
            `;
            const result = await db.query(query);
            res.json({ success: true, data: result.rows });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    },

    // ==========================================
    // CÁC HÀM QUẢN LÝ GÓI NẠP (CRUD GOI_NAP)
    // ==========================================

    // Lấy tất cả gói nạp (Xem)
    getAllGoiNap: async (req, res) => {
        try {
            const result = await db.query("SELECT * FROM GOI_NAP ORDER BY SO_TIEN_VND ASC");
            res.json({ success: true, data: result.rows });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    },

    // Thêm gói nạp mới (Thêm)
    // DoanhthuController.js
createGoiNap: async (req, res) => {
    const { ten_goi, so_tien_vnd, so_xu_nhan } = req.body;
    try {
        // 1. Lấy mã gói lớn nhất hiện có
        const lastPkg = await db.query("SELECT MAGOI FROM GOI_NAP ORDER BY MAGOI DESC LIMIT 1");
        
        let newMaGoi = "G01"; // Mặc định nếu bảng chưa có gì
        if (lastPkg.rows.length > 0) {
            const lastMa = lastPkg.rows[0].magoi; // Ví dụ: "G05"
            const lastNum = parseInt(lastMa.substring(1)); // Lấy phần số: 5
            newMaGoi = "G" + (lastNum + 1).toString().padStart(2, '0'); // Tạo mã mới: "G06"
        }

        // 2. Insert với mã tự tạo
        await db.query(
            "INSERT INTO GOI_NAP (MAGOI, TEN_GOI, SO_TIEN_VND, SO_XU_NHAN) VALUES ($1, $2, $3, $4)",
            [newMaGoi, ten_goi, so_tien_vnd, so_xu_nhan]
        );
        res.json({ success: true, message: `Thêm thành công gói ${newMaGoi}!` });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
},

    // Cập nhật thông tin gói nạp (Sửa)
    updateGoiNap: async (req, res) => {
        const { magoi } = req.params;
        const { ten_goi, so_tien_vnd, so_xu_nhan } = req.body;
        try {
            const result = await db.query(
                "UPDATE GOI_NAP SET TEN_GOI = $1, SO_TIEN_VND = $2, SO_XU_NHAN = $3 WHERE MAGOI = $4",
                [ten_goi, so_tien_vnd, so_xu_nhan, magoi]
            );
            if (result.rowCount === 0) {
                return res.status(404).json({ success: false, message: "Không tìm thấy gói nạp" });
            }
            res.json({ success: true, message: "Cập nhật gói nạp thành công!" });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    },

    // Xóa gói nạp (Xóa)
    deleteGoiNap: async (req, res) => {
        const { magoi } = req.params;
        try {
            // Kiểm tra xem gói nạp có đang được sử dụng trong LICH_SU_NAP không
            const checkUsage = await db.query("SELECT COUNT(*) FROM LICH_SU_NAP WHERE MAGOI = $1", [magoi]);
            if (parseInt(checkUsage.rows[0].count) > 0) {
                return res.status(400).json({ 
                    success: false, 
                    message: "Không thể xóa gói nạp này vì đã có người dùng nạp gói này." 
                });
            }

            await db.query("DELETE FROM GOI_NAP WHERE MAGOI = $1", [magoi]);
            res.json({ success: true, message: "Xóa gói nạp thành công!" });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    },
getPurchaseHistory: async (req, res) => {
    try {
        const query = `
            SELECT 
                LM.MAMUA,
                TK.TENDN as ten_doc_gia, -- Thử lấy TENDN từ bảng TAI_KHOAN
                COALESCE(TR.TENT, 'N/A') as ten_truyen,
                COALESCE(BT.TENBT, 'Toàn bộ truyện') as chi_tiet_mua,
                LM.SO_XU_RA,
                LM.LOAI_MUA,
                LM.NGAY_MUA
            FROM LICH_SU_MUA LM
            JOIN DOC_GIA DG ON LM.MADG = DG.MADG
            JOIN TAI_KHOAN TK ON DG.MATK = TK.MATK -- JOIN thêm bảng tài khoản nếu cần lấy tên
            LEFT JOIN TRUYEN TR ON LM.MAT = TR.MAT
            LEFT JOIN BAN_THAO BT ON LM.MABT = BT.MABT
            ORDER BY LM.NGAY_MUA DESC
        `;
        const result = await db.query(query);
        res.json({ success: true, data: result.rows });
    } catch (error) {
        console.error("SQL Error:", error.message); // Dòng này sẽ hiện lỗi cụ thể ở terminal Backend
        res.status(500).json({ success: false, message: error.message });
    }
},
}; // Kết thúc đối tượng

module.exports = DoanhthuController; // Luôn nằm ở cuối cùng