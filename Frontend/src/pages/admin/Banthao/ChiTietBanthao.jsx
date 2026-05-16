import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Layout from "../../layout/layout.jsx";
// Đặt tên biến đại diện khi import CSS Module
import styles from "../../../static/css/Banthaoadmin.module.css"; 

const ChiTietBanthao = () => {
    const { mabt } = useParams();
    const navigate = useNavigate();
    const [draft, setDraft] = useState(null);
    const [loading, setLoading] = useState(true);

    const fetchDetail = async () => {
        try {
            const res = await axios.get(`http://localhost:5000/api/admin/ban-thao/detail/${mabt}`);
            if (res.data.success) {
                setDraft(res.data.data);
            }
        } catch (error) {
            console.error("Lỗi khi lấy chi tiết bản thảo:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDetail();
    }, [mabt]);

    const handleApprove = async () => {
        if (window.confirm("Bệ hạ có chắc chắn muốn sắc phong phê duyệt ban thảo này?")) {
            try {
                const res = await axios.put(`http://localhost:5000/api/admin/ban-thao/approve/${mabt}`);
                if (res.data.success) {
                    alert("Khải hoàn! Phê duyệt bản thảo thành công!");
                    navigate('/admin/ban-thao');
                }
            } catch (error) {
                alert("Lỗi khi phê duyệt bản thảo!");
            }
        }
    };

    if (loading) {
        return (
            <Layout>
                <div style={{ textAlign: 'center', padding: '100px', color: '#800000', fontFamily: 'Cinzel Decorative, serif', fontSize: '1.5rem', fontWeight: '900' }}>
                    ⚡ ĐANG KHAI PHÁ ĐIỆN VĂN... ⚡
                </div>
            </Layout>
        );
    }

    if (!draft) {
        return (
            <Layout>
                <div style={{ textAlign: 'center', padding: '100px', color: '#800000' }}>
                    <h2 style={{ fontFamily: 'Cinzel Decorative, serif' }}>MẬT THƯ KHÔNG TỒN TẠI HOẶC ĐÃ BỊ THIÊU HỦY.</h2>
                    <button onClick={() => navigate('/admin/ban-thao')} className={styles['btn-back-outline']} style={{ marginTop: '20px', width: 'auto' }}>Quay lại bản doanh</button>
                </div>
            </Layout>
        );
    }

    return (
        <Layout>
            <div className={styles['detail-page-wrapper']}>
                <div className={`${styles['admin-glass-content']} ${styles['detail-page']}`}>
                    
                    {/* TIÊU ĐỀ HOÀNG GIA */}
                    <header className={styles['detail-header']}>
                        <h1>PHÁN QUYẾT BẢN THẢO</h1>
                        <p className={styles.subtitle}>Điện văn tối cao — Rà soát kỹ lưỡng trước khi truyền ban thiên hạ</p>
                    </header>

                    {/* KHUNG GRID QUÝ TỘC */}
                    <div className={styles['detail-grid']}>
                        
                        {/* THANH THÔNG TIN BÊN TRÁI */}
                        <aside className={styles['info-sidebar']}>
                            <div className={styles['info-card']}>
                                <h3>MINH CHỨNG</h3>
                                <div className={styles['info-item']}>
                                    <label>Chương Hồi:</label>
                                    <span>{draft.tenbt || draft.ten_chuong}</span>
                                </div>
                                <div className={styles['info-item']}>
                                    <label>Thuộc Thiên Truyện:</label>
                                    <span>{draft.ten_truyen}</span>
                                </div>
                                
                                <div className={styles['info-item']}>
                                    <label>Trạng Thái:</label>
                                    <span className={`${styles['status-badge']} ${draft.trangthai === 'Đã Duyệt' ? styles.active : styles.pending}`}>
                                        {draft.trangthai}
                                    </span>
                                </div>
                                
                                <div style={{ marginTop: '30px' }}>
                                    {draft.trangthai !== 'Đã Duyệt' && (
                                        <button onClick={handleApprove} className={styles['btn-approve-large']}>
                                            ✦ PHÊ DUYỆT ✦
                                        </button>
                                    )}
                                    <button onClick={() => navigate('/admin/ban-thao')} className={styles['btn-back-outline']}>
                                        Lui Về Bản Doanh
                                    </button>
                                </div>
                            </div>
                        </aside>

                        {/* PHẦN ĐỌC VĂN BẢN MÀU ĐỎ CỔ ĐIỂN CĂN ĐỀU HAI BÊN */}
                        <main className={styles['content-reader']}>
                            <div className={styles['reader-paper']}>
                                <div className={styles['reader-header']}>
                                    <h2>{draft.tenbt || draft.ten_chuong}</h2>
                                    <hr />
                                </div>
                                
                                <div className={styles['reader-body']}>
                                    {draft.nd ? (
                                        <div 
                                            className="ql-editor" 
                                            dangerouslySetInnerHTML={{ __html: draft.nd }} 
                                        />
                                    ) : (
                                        <p style={{ textAlign: 'center', fontStyle: 'italic', color: '#800000' }}>Điện văn trống rỗng, không tìm thấy ký tự.</p>
                                    )}
                                </div>
                            </div>
                        </main>

                    </div>
                </div>
            </div>
        </Layout>
    );
};

export default ChiTietBanthao;