const pool = require('../config/db');
exports.getAllTheLoai = async (req, res) => {
    try {
        const result = await pool.query("SELECT * FROM THE_LOAI ORDER BY TENTL ASC");
        res.json(result.rows);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: "Lỗi máy chủ khi lấy danh mục" });
    }
};
exports.getTruyenByTheLoai = async (req, res) => {
    const { matl } = req.params;
    try {
        const query = `
            SELECT T.*, TL.TENTL 
            FROM TRUYEN T
            JOIN CHI_TIET_TRUYEN CTT ON T.MAT = CTT.MAT
            JOIN THE_LOAI TL ON CTT.MATL = TL.MATL
            WHERE CTT.MATL = $1
            AND t.TRANGTHAI NOT LIKE '%Đợi duyệt%'
        `;
        const result = await pool.query(query, [matl]);
        res.json(result.rows);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: "Lỗi máy chủ khi lọc truyện" });
    }
};