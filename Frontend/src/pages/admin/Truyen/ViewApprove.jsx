import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import styles from "../../../static/css/Truyenadmin.module.css"; 
import Layout from "../../layout/layout.jsx";

const ViewApprove = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchDetail = async () => {
            try {
                // Gọi API lấy chi tiết truyện đã join các bảng TAC_GIA, THE_LOAI, CHI_TIET_TRUYEN
                const res = await axios.get(`https://hkl-backend-v3uu.onrender.com/api/admin/truyen-detail/${id}`);
                if (res.data.success) {
                    setData(res.data.data);
                }
            } catch (err) {
                console.error("Lỗi lấy chi tiết truyện:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchDetail();
    }, [id]);

    const handleApprove = async () => {
        if (window.confirm("Xác nhận phê duyệt truyện này lên hệ thống?")) {
            try {
                const res = await axios.put(`https://hkl-backend-v3uu.onrender.com/api/admin/approve-truyen/${id}`);
                if (res.data.success) {
                    alert("Duyệt thành công!");
                    navigate('/admin/truyen');
                }
            } catch (err) {
                alert("Lỗi khi duyệt truyện: " + err.message);
            }
        }
    };

    if (loading) return <div className={styles['admin-glass-content']}>Đang tải dữ liệu...</div>;
    if (!data) return <div className={styles['admin-glass-content']}>Không tìm thấy thông tin truyện.</div>;

    return (
        <Layout>
        <div className={styles['admin-glass-content']}>
            <header className={styles['admin-header']}>
                <h1>CHI TIẾT TÁC PHẨM</h1>
                <button className={styles['btn-back']} onClick={() => navigate(-1)}>⬅ Quay lại</button>
            </header>

            <div className={styles['admin-detail-wrapper']}>
                {/* Phần bên trái: Ảnh bìa (Trường HINHANH) */}
                <div className={styles['detail-poster']}>
                    <img 
                        src={`https://hkl-backend-v3uu.onrender.com/images/${data.hinh_anh}`} 
                        alt="cover" 
                        onError={(e) => e.target.src = "https://via.placeholder.com/280x400"}
                    />
                </div>

                {/* Phần bên phải: Thông tin chi tiết */}
                <div className={styles['detail-info']}>
                    <h2 className={styles['story-title']}>{data.ten_truyen}</h2>
                    
                    <div className={styles['info-grid']}>
                        <p><strong>✍️ Tác giả:</strong> {data.ten_tac_gia || "Ẩn danh"}</p>
                        <p><strong>🏷️ Thể loại:</strong> {data.ten_the_loai || "Chưa phân loại"}</p>
                        <p><strong>🏢 Nhà xuất bản:</strong> {data.nha_xuat_ban || "Tự do"}</p>
                        <p><strong>📅 Ngày gửi:</strong> {new Date(data.ngay_dang).toLocaleDateString('vi-VN')}</p>
                        <p><strong>📡 Trạng thái:</strong> 
                            <span className={data.trang_thai === 'Đợi duyệt' ? styles['status-badge-pending'] : styles['status-badge-published']}>
                                {data.trang_thai}
                            </span>
                        </p>
                    </div>

                    <hr className={styles['detail-divider']} />

                    <div className={styles['description-box']}>
                        <h3>📖 Mô tả nội dung:</h3>
                        <p className={styles['description-content']}>
                            {data.mo_ta || "Không có mô tả chi tiết cho tác phẩm này."}
                        </p>
                    </div>

                    {/* PHẦN ĐIỀU KHIỂN NÚT PHÊ DUYỆT */}
                    <div className={styles['detail-actions-btn-group']}>
                        {/* CHỈ HIỆN NÚT NẾU TRẠNG THÁI LÀ 'Đợi duyệt' */}
                        {data.trang_thai === 'Đợi duyệt' && (
                            <button 
                                onClick={handleApprove} 
                                className={styles['btn-approve-now']}
                            >
                                ✅ PHÊ DUYỆT NGAY
                            </button>
                        )}
                        
                        <button 
                            onClick={() => navigate(-1)} 
                            className={styles['btn-close-window']}
                        >
                            Đóng cửa sổ
                        </button>
                    </div>
                </div>
            </div>
        </div>
        </Layout>
    );
};

export default ViewApprove;