import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Layout from "../../layout/layout.jsx";
import styles from "../../../static/css/Nguoidungadmin.module.css"; 

const Docgia = () => {
    const [readers, setReaders] = useState([]);
    const [searchTerm, setSearchTerm] = useState(""); // State lưu từ khóa tìm kiếm

    const fetchData = () => {
        axios.get('http://localhost:5000/api/admin/readers')
            .then(res => setReaders(res.data))
            .catch(err => console.error("Lỗi lấy dữ liệu:", err));
    };

    useEffect(() => {
        fetchData();
    }, []);

    const deleteReader = async (id) => {
        if (window.confirm("Xóa độc giả này?")) {
            try {
                const res = await axios.delete(`http://localhost:5000/api/admin/accounts/${id}`);
                if (res.data.success) {
                    setReaders(readers.filter(r => r.matk !== id));
                    alert("Xóa thành công!");
                }
            } catch (err) { 
                alert("Không thể xóa độc giả"); 
            }
        }
    };

    // --- LOGIC LỌC DỮ LIỆU ---
    const filteredReaders = readers.filter(r => {
        const search = searchTerm.trim().toLowerCase();
        if (!search) return true;

        // Tìm theo Tên độc giả (tendg) hoặc Mã độc giả (madg)
        const nameMatch = r.tendg ? r.tendg.toLowerCase().includes(search) : false;
        const idMatch = r.madg ? String(r.madg).toLowerCase().includes(search) : false;

        return nameMatch || idMatch;
    });

    return (
        <Layout>
            <div className={styles['admin-glass-content']}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                    <h2 className={styles['page-title']}>Danh sách Độc giả</h2>

                    {/* THANH TÌM KIẾM */}
                    <input 
                        type="text" 
                        placeholder="Tìm theo tên hoặc mã độc giả..." 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className={styles['search-input']}
                    />
                </div>

                <div className={styles['user-grid']}>
                    {filteredReaders.length > 0 ? (
                        filteredReaders.map(r => (
                            <div key={r.madg} className={styles['user-card']}>
                                <p><strong>Mã ĐG:</strong> <span className={styles['id-badge']}>#{r.madg}</span></p>
                                <p><strong>Tên:</strong> {r.tendg}</p>
                                <p><strong>Mã TK:</strong> {r.matk}</p>
                                <p><strong>Email:</strong> {r.email}</p>
                                <p><strong>Số dư:</strong> <span className={styles['balance-text']}>{r.so_du} xu</span></p>
                                <div style={{ marginTop: '10px' }}>
                                    <button 
                                        onClick={() => deleteReader(r.matk)} 
                                        className={styles['btn-delete']}
                                    >
                                        Xóa
                                    </button>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div style={{ gridColumn: 'span 3', textAlign: 'center', padding: '40px', color: '#94a3b8' }}>
                            Không tìm thấy độc giả nào phù hợp.
                        </div>
                    )}
                </div>
            </div>
        </Layout>
    );
};

export default Docgia;