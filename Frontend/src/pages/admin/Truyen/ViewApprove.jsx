import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import "../../../static/css/Truyenadmin.css"; 
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

    if (loading) return <div className="admin-glass-content">Đang tải dữ liệu...</div>;
    if (!data) return <div className="admin-glass-content">Không tìm thấy thông tin truyện.</div>;

    return (
        <Layout>
        <div className="admin-glass-content">
            <header className="admin-header">
                <h1>CHI TIẾT TÁC PHẨM</h1>
                <button className="btn-back" onClick={() => navigate(-1)}>⬅ Quay lại</button>
            </header>

            <div className="admin-main-wrapper" style={{ display: 'flex', gap: '40px', marginTop: '20px' }}>
                {/* Phần bên trái: Ảnh bìa (Trường HINHANH) */}
                <div className="detail-poster">
                    <img 
                        src={`https://hkl-backend-v3uu.onrender.com/images/${data.hinh_anh}`} 
                        alt="cover" 
                        style={{ width: '280px', borderRadius: '12px', boxShadow: '0 10px 30px rgba(0,0,0,0.5)' }}
                        onError={(e) => e.target.src = "https://via.placeholder.com/280x400"}
                    />
                </div>

                {/* Phần bên phải: Thông tin chi tiết */}
                <div className="detail-info" style={{ flex: 1, color: '#fff' }}>
                    <h2 style={{ fontSize: '2.2rem', color: '#ffcc00', marginBottom: '15px' }}>{data.ten_truyen}</h2>
                    
                    <div className="info-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', fontSize: '1.1rem' }}>
                        <p><strong>✍️ Tác giả:</strong> {data.ten_tac_gia || "Ẩn danh"}</p>
                        <p><strong>🏷️ Thể loại:</strong> {data.ten_the_loai || "Chưa phân loại"}</p>
                        <p><strong>🏢 Nhà xuất bản:</strong> {data.nha_xuat_ban || "Tự do"}</p>
                        <p><strong>📅 Ngày gửi:</strong> {new Date(data.ngay_dang).toLocaleDateString('vi-VN')}</p>
                        <p><strong>📡 Trạng thái:</strong> 
                            <span style={{ 
                                marginLeft: '8px', 
                                color: data.trang_thai === 'Đợi duyệt' ? '#ffcc00' : '#28a745',
                                fontWeight: 'bold'
                            }}>
                                {data.trang_thai}
                            </span>
                        </p>
                    </div>

                    <hr style={{ border: '0.5px solid rgba(255,255,255,0.1)', margin: '25px 0' }} />

                    <div className="description-box">
                        <h3 style={{ color: '#ffcc00', marginBottom: '10px' }}>📖 Mô tả nội dung:</h3>
                        <p style={{ 
                            lineHeight: '1.7', 
                            backgroundColor: 'rgba(0,0,0,0.2)', 
                            padding: '20px', 
                            borderRadius: '10px',
                            whiteSpace: 'pre-wrap' 
                        }}>
                            {data.mo_ta || "Không có mô tả chi tiết cho tác phẩm này."}
                        </p>
                    </div>

                    {/* PHẦN ĐIỀU KHIỂN NÚT PHÊ DUYỆT[cite: 4] */}
                    <div style={{ marginTop: '30px', display: 'flex', gap: '15px' }}>
                        {/* CHỈ HIỆN NÚT NẾU TRẠNG THÁI LÀ 'Đợi duyệt'[cite: 4] */}
                        {data.trang_thai === 'Đợi duyệt' && (
                            <button 
                                onClick={handleApprove} 
                                className="btn-view" 
                                style={{ padding: '12px 30px', backgroundColor: '#28a745', fontSize: '1rem' }}
                            >
                                ✅ PHÊ DUYỆT NGAY
                            </button>
                        )}
                        
                        <button 
                            onClick={() => navigate(-1)} 
                            className="btn-delete" 
                            style={{ padding: '12px 30px', backgroundColor: '#6c757d', fontSize: '1rem' }}
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