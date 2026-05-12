const db = require('../../config/db');

const NguoidungController = {
    // 1. Lấy tất cả tài khoản
    getAllAccounts: async (req, res) => {
        try {
            // BỎ dấu ngoặc kép ở TAI_KHOAN và các cột
            const result = await db.query(`
                SELECT 
                    MATK as matk, TENDN as tendn, VAI_TRO as vai_tro, 
                    EMAIL as email, SDT as sdt, SO_DU as so_du 
                FROM TAI_KHOAN 
                ORDER BY MATK DESC
            `);
            res.status(200).json(result.rows);
        } catch (error) {
            console.error("Database Error (Accounts):", error.message);
            res.status(500).json({ error: error.message });
        }
    },

    // 2. Lấy danh sách độc giả
    getAllReaders: async (req, res) => {
        try {
            const query = `
                SELECT 
                    dg.MADG as madg, dg.TENDG as tendg, 
                    dg.MATK as matk, tk.EMAIL as email, 
                    tk.SO_DU as so_du
                FROM DOC_GIA dg
                JOIN TAI_KHOAN tk ON dg.MATK = tk.MATK
            `;
            const result = await db.query(query);
            res.status(200).json(result.rows);
        } catch (error) {
            console.error("Database Error (Readers):", error.message);
            res.status(500).json({ error: error.message });
        }
    },

    // 3. Lấy danh sách tác giả
    getAllAuthors: async (req, res) => {
        try {
            const query = `
                SELECT 
                    tg.MATG as matg, tg.TENTG as tentg, 
                    tg.MATK as matk, tk.EMAIL as email, 
                    tk.SO_DU as so_du
                FROM TAC_GIA tg
                JOIN TAI_KHOAN tk ON tg.MATK = tk.MATK
            `;
            const result = await db.query(query);
            res.status(200).json(result.rows);
        } catch (error) {
            console.error("Database Error (Authors):", error.message);
            res.status(500).json({ error: error.message });
        }
    },

    // 4. Xóa tài khoản
    deleteAccount: async (req, res) => {
        try {
            await db.query('DELETE FROM TAI_KHOAN WHERE MATK = $1', [req.params.id]);
            res.status(200).json({ success: true });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },

    // 5. Xóa độc giả
    deleteReader: async (req, res) => {
        try {
            await db.query('DELETE FROM DOC_GIA WHERE MADG = $1', [req.params.id]);
            res.status(200).json({ success: true });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },

    // 6. Xóa tác giả
    deleteAuthor: async (req, res) => {
        try {
            await db.query('DELETE FROM TAC_GIA WHERE MATG = $1', [req.params.id]);
            res.status(200).json({ success: true });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
};

module.exports = NguoidungController;