const pool = require('../config/db');

// file: backend/controllers/truyenController.js[cite: 4, 5]
exports.getAllTruyen = async (req, res) => {
    try {
        const query = `
            SELECT 
                t.mat, 
                t.tent, 
                t.hinhanh, 
                t.trangthai,
                tg.TENTG as ten_tac_gia, -- Thêm tên tác giả
                COALESCE((SELECT MAX(ngay_duyet) FROM ban_thao bt WHERE bt.mat = t.mat AND bt.trangthai = 'Đã Duyệt'), t.ngaydang) as ngay_cap_nhat,
                (SELECT COUNT(*) FROM ban_thao bt WHERE bt.mat = t.mat AND bt.trangthai = 'Đã Duyệt') as so_chuong,
                COALESCE((SELECT AVG(sosao) FROM danh_gia dg WHERE dg.mat = t.mat), 0) as sao_trung_binh
            FROM truyen t
            LEFT JOIN TAC_GIA tg ON t.MATG = tg.MATG -- Join lấy tên tác giả
            WHERE t.TRANGTHAI != 'Đợi duyệt'  
            ORDER BY ngay_cap_nhat DESC
        `;
        const result = await pool.query(query);
        res.json(result.rows);
    } catch (err) {
        console.error("Lỗi truy vấn:", err.message);
        res.status(500).json({ error: err.message });
    }
};
// backend/controllers/truyenController.js

exports.registerTruyen = async (req, res) => {
    // 1. Lấy dữ liệu từ FormData
    const hinhanh = req.file ? req.file.filename : 'default.jpg';
    
    // Bổ sung gia_tron_goi từ req.body
    const { tent, matg, nxb, mota, theloai, gia_tron_goi } = req.body; 
    
    // Tự sinh mã truyện
    const mat = "MT" + Math.floor(10000 + Math.random() * 90000); 

    const client = await pool.connect();
    try {
        await client.query('BEGIN');

        // 2. Chèn vào bảng TRUYEN - Bổ sung cột GIA_TRON_GOI
        await client.query(
            `INSERT INTO TRUYEN (MAT, TENT, MATG, NXB, HINHANH, TRANGTHAI, NGAYDANG, GIA_TRON_GOI) 
             VALUES ($1, $2, $3, $4, $5, 'Đợi duyệt', CURRENT_TIMESTAMP, $6)`,
            [mat, tent, matg, nxb, hinhanh, gia_tron_goi || 0] // Mặc định là 0 nếu không nhập
        );

        // 3. Giải mã chuỗi JSON thể loại gửi từ Frontend
        const danhSachTL = JSON.parse(theloai);

        for (const tl of danhSachTL) {
            let currentMatl = tl.id;

            // Nếu là thể loại mới (id === 'new')
            if (tl.id === 'new') {
                // Tạo mã thể loại mới (TL + số ngẫu nhiên)
                currentMatl = "TL" + Math.floor(100 + Math.random() * 899);
                
                // Thêm vào bảng THE_LOAI
                await client.query(
                    'INSERT INTO THE_LOAI (MATL, TENTL) VALUES ($1, $2) ON CONFLICT DO NOTHING',
                    [currentMatl, tl.name]
                );
            }

            // 4. Chèn vào bảng CHI_TIET_TRUYEN
            // Mỗi thể loại được chọn sẽ là 1 dòng trong bảng chi tiết
            const mactt = "CTT" + Math.random().toString(36).substr(2, 7).toUpperCase();
            await client.query(
                `INSERT INTO CHI_TIET_TRUYEN (MACTT, MAT, MATL, MOTA) 
                 VALUES ($1, $2, $3, $4)`,
                [mactt, mat, currentMatl, mota]
            );
        }

        await client.query('COMMIT');
        res.status(201).json({ success: true, message: "Đã gửi yêu cầu đăng truyện!", mat: mat });
    } catch (err) {
        await client.query('ROLLBACK');
        console.error("Lỗi server:", err.message);
        res.status(500).json({ success: false, error: "Lỗi hệ thống: " + err.message });
    } finally {
        client.release();
    }
};
// Backend/controllers/truyenController.js

exports.muaTronGoi = async (req, res) => {
    const { madg, mat, so_xu } = req.body;
    
    // Tạo mã mua rút gọn (VD: F + 7 số cuối của timestamp) để không quá 10 ký tự
    const mamua = 'F' + Date.now().toString().slice(-7); 

    try {
        await pool.query('BEGIN');

        // 1. Kiểm tra số dư của độc giả (Lấy MATK từ bảng DOC_GIA để so khớp với TAI_KHOAN)
        const userRes = await pool.query(
            `SELECT SO_DU FROM TAI_KHOAN 
             WHERE MATK = (SELECT MATK FROM DOC_GIA WHERE MADG = $1)`, 
            [madg]
        );
        
        if (userRes.rows.length === 0) {
            await pool.query('ROLLBACK');
            return res.status(404).json({ message: "Không tìm thấy tài khoản độc giả!" });
        }

        if (userRes.rows[0].so_du < so_xu) {
            await pool.query('ROLLBACK');
            return res.status(400).json({ message: "Số dư xu không đủ để mua trọn bộ!" });
        }

        // 2. Chèn vào bảng LICH_SU_MUA 
        // Trong Database của bạn: MAMUA, MADG, MAT, MABT, SO_XU_RA, LOAI_MUA
        const insertQuery = `
            INSERT INTO LICH_SU_MUA (MAMUA, MADG, MAT, MABT, SO_XU_RA, LOAI_MUA) 
            VALUES ($1, $2, $3, NULL, $4, 'TRON_GOI')
        `;
        
        await pool.query(insertQuery, [mamua, madg, mat, so_xu]);

        // TRIGGER trg_sau_khi_mua trong SQL sẽ tự động trừ xu và chia tiền cho tác giả
        await pool.query('COMMIT');
        
        res.json({ 
            success: true, 
            message: "Chúc mừng! Bạn đã sở hữu trọn bộ truyện này." 
        });

    } catch (err) {
        await pool.query('ROLLBACK');
        console.error("Lỗi mua trọn gói:", err.message);
        // Trả về lỗi chi tiết để Frontend không bị 'undefined'
        res.status(500).json({ message: "Lỗi hệ thống: " + err.message });
    }
};