import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Layout from "../../layout/layout.jsx";
import styles from "../../../static/css/Banthaoadmin.module.css"; 

const DanhSachBanthao = () => {
    const [drafts, setDrafts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState(""); 
    const navigate = useNavigate();

    const [pagePending, setPagePending] = useState(1);
    const [pageApproved, setPageApproved] = useState(1);
    const itemsPerPage = 6; 

    const fetchDrafts = async () => {
        try {
            const res = await axios.get('https://hkl-backend-v3uu.onrender.com/api/admin/ban-thao/all');
            if (res.data.success) {
                setDrafts(res.data.data);
            }
        } catch (error) {
            console.error("Lỗi fetch data:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDrafts();
    }, []);

    const handleDelete = async (id) => {
        const confirmDelete = window.confirm("Hành động này không thể hoàn tác. Xóa vĩnh viễn bản thảo này?");
        if (confirmDelete) {
            try {
                const res = await axios.delete(`https://hkl-backend-v3uu.onrender.com/api/admin/ban-thao/delete/${id}`);
                if (res.data.success) {
                    alert("Đã xóa bản thảo thành công!");
                    fetchDrafts();
                }
            } catch (error) {
                alert("Lỗi: Không thể xóa bản thảo.");
            }
        }
    };

    const filteredDrafts = drafts.filter(item => {
        const searchLower = searchTerm.trim().toLowerCase();
        if (!searchLower) return true;

        const maBT = item.mabt ? String(item.mabt).toLowerCase() : "";
        const tenTruyen = item.ten_truyen ? String(item.ten_truyen).toLowerCase() : "";
        const tenChuong = item.ten_chuong ? String(item.ten_chuong).toLowerCase() : "";

        return maBT.includes(searchLower) || 
               tenTruyen.includes(searchLower) || 
               tenChuong.includes(searchLower);
    });

    const pendingDrafts = filteredDrafts.filter(item => item.trangthai !== 'Đã Duyệt');
    const approvedDrafts = filteredDrafts.filter(item => item.trangthai === 'Đã Duyệt');

    const getPaginatedData = (data, page) => {
        const startIndex = (page - 1) * itemsPerPage;
        return data.slice(startIndex, startIndex + itemsPerPage);
    };

    const renderPagination = (totalItems, currentPage, setPage) => {
        const totalPages = Math.ceil(totalItems / itemsPerPage);
        if (totalPages <= 1) return null;

        return (
            <div className={styles['pagination-controls']} style={{ display: 'flex', gap: '10px', justifyContent: 'center', marginTop: '20px' }}>
                <button disabled={currentPage === 1} onClick={() => setPage(p => p - 1)} className={styles['btn-page']}> ← </button>
                <span style={{ alignSelf: 'center', color: '#64748b', fontSize: '0.85rem', fontWeight: '500' }}> {currentPage} / {totalPages} </span>
                <button disabled={currentPage === totalPages} onClick={() => setPage(p => p + 1)} className={styles['btn-page']}> → </button>
            </div>
        );
    };

    const renderTableContent = (data, currentPage) => {
        const currentItems = getPaginatedData(data, currentPage);
        if (data.length === 0) {
            return (
                <tr>
                    <td colSpan="5" style={{ textAlign: 'center', color: '#64748b', padding: '30px', fontStyle: 'italic' }}> 
                        Không tìm thấy bản thảo nào 
                    </td>
                </tr>
            );
        }

        return currentItems.map((item) => (
            <tr key={item.mabt}>
                <td style={{ fontWeight: '700' }}>
                    <small style={{ display: 'block', color: '#94a3b8', fontSize: '0.75rem', fontWeight: '500' }}>#{item.mabt}</small>
                    {item.ten_truyen}
                </td>
                <td style={{ fontWeight: '500' }}>{item.ten_chuong}</td>
                <td style={{ color: '#7c3aed', fontWeight: '600' }}>{item.ten_tac_gia}</td>
                <td>
                    <span className={`${styles['status-badge']} ${item.trangthai === 'Đã Duyệt' ? styles.active : styles.pending}`}>
                        {item.trangthai}
                    </span>
                </td>
                <td className={styles.actions}>
                    <button className={styles['btn-approve']} onClick={() => navigate(`/admin/ban-thao/detail/${item.mabt}`)}> Xem </button>
                    <button className={styles['btn-delete']} style={{ marginLeft: '6px' }} onClick={() => handleDelete(item.mabt)}> Xóa </button>
                </td>
            </tr>
        ));
    };

    return (
        <Layout>
            <div className={styles['detail-page-wrapper']}>
                <div className={`${styles['admin-glass-content']} ${styles['detail-page']}`}>
                    
                    {/* THANH ĐẦU TRANG */}
                    <header className={styles['admin-header']} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '20px' }}>
                        <h1 style={{ margin: 0 }}>
                            WORKSPACE <span style={{ fontWeight: '300', color: '#64748b' }}>| QUẢN LÝ BẢN THẢO</span>
                        </h1>
                        
                        <div className={styles['search-box']}>
                            <input 
                                type="text" 
                                placeholder="Tìm tên truyện, chương hoặc mã số..." 
                                className={styles['search-input']}
                                value={searchTerm}
                                onChange={(e) => {
                                    setSearchTerm(e.target.value);
                                    setPagePending(1); 
                                    setPageApproved(1);
                                }}
                                style={{ width: '320px' }}
                            />
                        </div>
                    </header>

                    {loading ? (
                        <div style={{ textAlign: 'center', color: '#0f172a', padding: '100px', fontWeight: '600' }}>
                            Đang tải danh sách dữ liệu...
                        </div>
                    ) : (
                        /* BỐ CỤC LƯỚI HAI BÊN */
                        <div className={styles['bento-grid-split']}>
                            
                            {/* BÊN TRÁI: DANH SÁCH CHỜ DUYỆT */}
                            <div className={styles['table-container']}>
                                <h2 style={{ color: '#b45309', display: 'flex', alignItems: 'center', gap: '10px', margin: '0 0 20px 0' }}>
                                    <span style={{ width: '12px', height: '12px', background: '#f59e0b', borderRadius: '50%', display: 'inline-block' }}></span>
                                    Chờ Kiểm Duyệt ({pendingDrafts.length})
                                </h2>
                                <table className={styles['custom-admin-table']}>
                                    <thead>
                                        <tr>
                                            <th style={{ textAlign: 'left' }}>Truyện</th>
                                            <th style={{ textAlign: 'left' }}>Chương</th>
                                            <th style={{ textAlign: 'left' }}>Tác giả</th>
                                            <th style={{ textAlign: 'left' }}>Trạng thái</th>
                                            <th style={{ textAlign: 'left' }}>Hành động</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {renderTableContent(pendingDrafts, pagePending)}
                                    </tbody>
                                </table>
                                {renderPagination(pendingDrafts.length, pagePending, setPagePending)}
                            </div>

                            {/* BÊN PHẢI: DANH SÁCH ĐÃ DUYỆT */}
                            <div className={styles['table-container']}>
                                <h2 style={{ color: '#1e3a8a', display: 'flex', alignItems: 'center', gap: '10px', margin: '0 0 20px 0' }}>
                                    <span style={{ width: '12px', height: '12px', background: '#10b981', borderRadius: '50%', display: 'inline-block' }}></span>
                                    Đã Xuất Bản ({approvedDrafts.length})
                                </h2>
                                <table className={styles['custom-admin-table']}>
                                    <thead>
                                        <tr>
                                            <th style={{ textAlign: 'left' }}>Truyện</th>
                                            <th style={{ textAlign: 'left' }}>Chương</th>
                                            <th style={{ textAlign: 'left' }}>Tác giả</th>
                                            <th style={{ textAlign: 'left' }}>Trạng thái</th>
                                            <th style={{ textAlign: 'left' }}>Hành động</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {renderTableContent(approvedDrafts, pageApproved)}
                                    </tbody>
                                </table>
                                {renderPagination(approvedDrafts.length, pageApproved, setPageApproved)}
                            </div>

                        </div>
                    )}
                </div>
            </div>
        </Layout>
    );
};

export default DanhSachBanthao;