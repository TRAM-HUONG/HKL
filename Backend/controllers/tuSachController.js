const pool = require('../config/db');
const multer = require('multer');
const path = require('path');

// 1. Cấu hình Multer (Giữ nguyên như file bạn gửi)
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, path.join(__dirname, '../../Frontend/src/static/images/truyen'));
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + '-' + file.originalname);
    }
});
const upload = multer({ storage: storage });
exports.uploadImage = upload.single('image'); // Tên field gửi lên từ client là 'image'


// File: controllers/truyenController.js hoặc tuSachController.js (tùy cấu trúc của bạn)
// File: controllers/tuSachController.js

exports.updateTruyen = async (req, res) => {
    const { id } = req.params;
    const { tent, nxb, matl, mota, hinhanh, gia_tron_goi } = req.body;
    const trangThaiMoi = 'Đợi duyệt'; 
    const finalImage = req.file ? req.file.filename : hinhanh;
    
    // Parse lại matl từ String sang Array vì gửi qua FormData nó là String
    const danhSachTheLoai = JSON.parse(matl); 

    const client = await pool.connect();
    try {
        await client.query('BEGIN');
        
        // 1. Cập nhật TRUYEN (thêm cột GIA_TRON_GOI nếu có)
        await client.query(
            'UPDATE TRUYEN SET TENT = $1, NXB = $2, TRANGTHAI = $3, HINHANH = $4, GIA_TRON_GOI = $5 WHERE MAT = $6',
            [tent, nxb, trangThaiMoi, finalImage, gia_tron_goi, id]
        );

        // 2. Xóa các thể loại cũ
        await client.query('DELETE FROM CHI_TIET_TRUYEN WHERE MAT = $1', [id]);

        // 3. Chèn các thể loại mới (Vòng lặp để chèn nhiều dòng)
        for (const maTL of danhSachTheLoai) {
            // Thay đổi logic tạo mã trong hàm updateTruyen
const shortRandom = Math.random().toString(36).substring(2, 5); // Tạo 3 ký tự ngẫu nhiên
const newMACTT = (id + shortRandom).slice(0, 10); // Đảm bảo tối đa 10 ký tự
            await client.query(`
                INSERT INTO CHI_TIET_TRUYEN (MACTT, MAT, MATL, MOTA)
                VALUES ($1, $2, $3, $4)
            `, [newMACTT, id, maTL, mota]);
        }

        await client.query('COMMIT');
        res.json({ success: true, message: "Cập nhật thành công!" });
    } catch (err) {
        await client.query('ROLLBACK');
        console.error("Lỗi chi tiết:", err.message); // Kiểm tra log ở Terminal để xem lỗi cụ thể
        res.status(500).json({ success: false, error: err.message });
    } finally {
        client.release();
    }
};
// 2. Hàm lấy danh sách thể loại (Lỗi 404 của bạn nằm ở đây)
exports.getAllTheLoai = async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM THE_LOAI');
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: "Lỗi lấy thể loại" });
    }
};




exports.getTuSachTacGia = async (req, res) => {
    const { matk } = req.params;

    try {
        // 1. Lấy bản thảo (Giữ nguyên hoặc ép kiểu clear)
        const queryBanThao = `
            SELECT 
                bt.MABT as ma_so,
                bt.TENBT as ten_truyen,
                bt.TRANGTHAI as trang_thai,
                bt.NGAY_DUYET as ngay_tao,
                bt.MAT as ma_goc,
                t.TENT as ten_truyen_goc,
                'Bản thảo' as loai
            FROM BAN_THAO bt
            JOIN TAC_GIA tg ON bt.MATG = tg.MATG
            LEFT JOIN TRUYEN t ON bt.MAT = t.MAT
            WHERE CAST(tg.MATK AS TEXT) = CAST($1 AS TEXT) -- Đảm bảo chuẩn hóa kiểu dữ liệu
            ORDER BY bt.NGAY_DUYET DESC
        `;

        // 2. SỬA TẠI ĐÂY: Dùng STRING_AGG để gộp thể loại, tránh trùng lặp dòng truyện
        const queryTruyen = `
            SELECT 
                t.MAT as ma_so,
                t.TENT as ten_truyen,
                t.HINHANH as hinh_anh,
                t.TRANGTHAI as trang_thai,
                t.NGAYDANG as ngay_tao,
                STRING_AGG(tl.TENTL, ', ') as the_loai, -- Gom các thể loại lại thành "Tiên Hiệp, Huyền Huyễn"
                'Truyện' as loai
            FROM TRUYEN t
            JOIN TAC_GIA tg ON t.MATG = tg.MATG
            LEFT JOIN CHI_TIET_TRUYEN ct ON t.MAT = ct.MAT
            LEFT JOIN THE_LOAI tl ON ct.MATL = tl.MATL
            WHERE CAST(tg.MATK AS TEXT) = CAST($1 AS TEXT)
            GROUP BY t.MAT, t.TENT, t.HINHANH, t.TRANGTHAI, t.NGAYDANG -- Bắt buộc phải GROUP BY khi dùng hàm gộp
            ORDER BY t.NGAYDANG DESC
        `;

        const [btRes, tRes] = await Promise.all([
            pool.query(queryBanThao, [matk]),
            pool.query(queryTruyen, [matk])
        ]);

        res.json({
            success: true,
            data: {
                banThaoChoDuyet: btRes.rows.filter(r => r.trang_thai !== 'Đã Duyệt'),
                banThaoDaDuyet: btRes.rows.filter(r => r.trang_thai === 'Đã Duyệt'),
                daXuatBan: tRes.rows
            }
        });
    } catch (err) {
        console.error("Lỗi TuSachController:", err);
        res.status(500).json({ success: false, message: "Lỗi hệ thống" });
    }
};


// Lấy chi tiết bản thảo để đổ vào form
exports.getBanThaoById = async (req, res) => {
    const { id } = req.params;
    try {
        const result = await pool.query(
            'SELECT MABT, TENBT, ND FROM BAN_THAO WHERE MABT = $1', [id]
        );
        if (result.rows.length > 0) {
            res.json({ success: true, data: result.rows[0] }); // Gửi qua field 'data'
        } else {
            res.status(404).json({ success: false, message: "Không tìm thấy bản thảo" });
        }
    } catch (err) {
        res.status(500).json({ success: false, message: "Lỗi server" });
    }
};


// Lấy thông tin chi tiết để sửa
exports.getTruyenById = async (req, res) => {
    const { id } = req.params;
    try {
        const query = `
            SELECT t.*, ct.MATL, ct.MOTA 
            FROM TRUYEN t
            LEFT JOIN CHI_TIET_TRUYEN ct ON t.MAT = ct.MAT
            WHERE t.MAT = $1
        `;
        const result = await pool.query(query, [id]);
        
        if (result.rows.length > 0) {
            // Trả về dữ liệu gốc từ Postgres (thường là viết thường)
            res.json({ success: true, data: result.rows[0] });
        } else {
            res.status(404).json({ success: false, message: "Không tìm thấy truyện" });
        }
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};

// Hàm lấy thông tin chi tiết để đổ vào Form sửa
// File: controllers/tuSachController.js

exports.getTruyenById = async (req, res) => {
    const { id } = req.params;
    try {
        const query = `
            SELECT 
                t.MAT as mat, 
                t.TENT as tent, 
                t.NXB as nxb, 
                t.TRANGTHAI as trangthai, 
                t.HINHANH as hinhanh,
                ct.MATL as matl, 
                ct.MOTA as mota
            FROM TRUYEN t
            LEFT JOIN CHI_TIET_TRUYEN ct ON t.MAT = ct.MAT
            WHERE t.MAT = $1
        `;
        const result = await pool.query(query, [id]);
        
        if (result.rows.length > 0) {
            res.json({ success: true, data: result.rows[0] });
        } else {
            res.status(404).json({ success: false, message: "Không tìm thấy truyện" });
        }
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};
// Lấy danh sách thể loại cho Dropdown
exports.getTheLoai = async (req, res) => {
    try {
        const result = await pool.query('SELECT MATL, TENTL FROM THE_LOAI ORDER BY TENTL ASC');
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
// Cập nhật bản thảo
// file: controllers/tuSachController.js
exports.updateBanThao = async (req, res) => {
    const { id } = req.params;
    const { tenbt, nd } = req.body;
    try {
        await pool.query(
            // Cưỡng bức trạng thái về 'Chờ Duyệt' mỗi khi update[cite: 7]
            'UPDATE BAN_THAO SET TENBT = $1, ND = $2, TRANGTHAI = $3 WHERE MABT = $4',
            [tenbt, nd, 'Chờ Duyệt', id] 
        );
        res.json({ success: true, message: "Cập nhật thành công, đang chờ duyệt lại!" });
    } catch (err) {
        res.status(500).json({ success: false });
    }
};
exports.hoanThanhTruyen = async (req, res) => {
    const { id } = req.params; // Lấy mã truyện từ URL (ví dụ: T01)[cite: 7]
    try {
        // Thực hiện câu lệnh SQL cập nhật trạng thái[cite: 7, 8]
        // Quan trọng: Hãy kiểm tra tên bảng và tên cột trong DB của bạn (ví dụ TRUYEN, MAT, TRANGTHAI)[cite: 7]
        const result = await pool.query(
            "UPDATE TRUYEN SET TRANGTHAI = 'Hoàn thành' WHERE MAT = $1 RETURNING *",
            [id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ success: false, message: "Không tìm thấy mã truyện này." });
        }

        res.json({ success: true, message: "Tác phẩm đã hoàn thành!" });
    } catch (err) {
        console.error("Lỗi Backend:", err);
        res.status(500).json({ success: false, message: "Lỗi kết nối cơ sở dữ liệu." });
    }
};
// Xóa bản thảo
exports.deleteBanThao = async (req, res) => {
    const { id } = req.params;
    try {
        await pool.query('DELETE FROM BAN_THAO WHERE MABT = $1', [id]);
        res.json({ success: true, message: "Đã xóa bản thảo thành công!" });
    } catch (err) {
        console.error("Lỗi xóa bản thảo:", err);
        res.status(500).json({ success: false, message: "Lỗi hệ thống khi xóa bản thảo." });
    }
};

// Xóa truyện đã xuất bản
exports.deleteTruyen = async (req, res) => {
    const { id } = req.params;
    const client = await pool.connect();
    try {
        await client.query('BEGIN');
        // Xóa chi tiết truyện trước (khóa ngoại)
        await client.query('DELETE FROM CHI_TIET_TRUYEN WHERE MAT = $1', [id]);
        // Xóa truyện chính
        await client.query('DELETE FROM TRUYEN WHERE MAT = $1', [id]);
        
        await client.query('COMMIT');
        res.json({ success: true, message: "Đã xóa truyện vĩnh viễn!" });
    } catch (err) {
        await client.query('ROLLBACK');
        console.error("Lỗi xóa truyện:", err);
        res.status(500).json({ success: false, message: "Không thể xóa truyện này." });
    } finally {
        client.release();
    }
};
