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