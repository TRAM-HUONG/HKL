import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Layout from "../../layout/layout.jsx";
import styles from "../../../static/css/Nguoidungadmin.module.css"; 

const Tacgia = () => {
    const [authors, setAuthors] = useState([]);
    const [searchTerm, setSearchTerm] = useState(""); // State cho từ khóa tìm kiếm

    const fetchData = () => {
        axios.get('http://localhost:5173//api/admin/authors')
            .then(res => setAuthors(res.data))
            .catch(err => console.error("Lỗi lấy dữ liệu:", err));
    };

    useEffect(() => {
        fetchData();
    }, []);

    const deleteAuthor = async (id, matk) => {
        if (window.confirm("Xóa tác giả này sẽ xóa tài khoản liên quan. Tiếp tục?")) {
            try {
                const res = await axios.delete(`http://localhost:5173//api/admin/accounts/${matk}`);
                if (res.data.success) {
                    setAuthors(authors.filter(a => a.matk !== matk));
                    alert("Xóa thành công!");
                }
            } catch (err) { 
                alert("Lỗi xóa tác giả"); 
            }
        }
    };

    // --- LOGIC TÌM KIẾM ---
    const filteredAuthors = authors.filter(a => {
        const search = searchTerm.trim().toLowerCase();
        if (!search) return true;

        // Tìm theo Bút danh (tentg) hoặc Mã tác giả (matg)
        const nameMatch = a.tentg ? a.tentg.toLowerCase().includes(search) : false;
        const idMatch = a.matg ? String(a.matg).toLowerCase().includes(search) : false;

        return nameMatch || idMatch;
    });

    return (
        <Layout>
            <div className={styles['admin-glass-content']}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                    <h2 className={styles['page-title']}>Danh sách Tác giả</h2>

                    {/* THANH TÌM KIẾM */}
                    <input 
                        type="text" 
                        placeholder="Tìm bút danh hoặc mã tác giả..." 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className={styles['search-input']}
                    />
                </div>

                <div className={styles['user-grid']}>
                    {filteredAuthors.length > 0 ? (
                        filteredAuthors.map(a => (
                            <div key={a.matg} className={styles['user-card']}>
                                <p><strong>Mã TG:</strong> <span className={styles['id-badge']}>#{a.matg}</span></p>
                                <p><strong>Bút danh:</strong> {a.tentg}</p>
                                <p><strong>Mã TK:</strong> {a.matk}</p>
                                <p><strong>Email:</strong> {a.email}</p>
                                <p><strong>Ví:</strong> <span className={styles['balance-text']}>{a.so_du} xu</span></p>
                                <button 
                                    onClick={() => deleteAuthor(a.matg, a.matk)} 
                                    className={styles['btn-delete']}
                                >
                                    Xóa Tác Giả
                                </button>
                            </div>
                        ))
                    ) : (
                        <div style={{ width: '100%', gridColumn: 'span 3', textAlign: 'center', padding: '40px', color: '#94a3b8' }}>
                            Không tìm thấy tác giả nào phù hợp.
                        </div>
                    )}
                </div>
            </div>
        </Layout>
    );
};

export default Tacgia;