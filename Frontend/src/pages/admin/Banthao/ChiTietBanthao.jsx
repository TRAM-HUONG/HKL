import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Layout from "../../layout/layout.jsx";
import "../../../static/css/Banthaoadmin.css"; 

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
        if (window.confirm("Bạn có chắc chắn muốn duyệt chương này lên trang chủ?")) {
            try {
                const res = await axios.put(`http://localhost:5000/api/admin/ban-thao/approve/${mabt}`);
                if (res.data.success) {
                    alert("Duyệt bản thảo thành công!");
                    navigate('/admin/ban-thao');
                }
            } catch (error) {
                alert("Lỗi khi duyệt bản thảo!");
            }
        }
    };

    if (loading) {
        return (
            <Layout>
                <div className="loading-container">
                    <div className="spinner"></div>
                    <p>Đang giải mã nội dung...</p>
                </div>
            </Layout>
        );
    }

    if (!draft) {
        return (
            <Layout>
                <div className="error-container">
                    <h2>Bản thảo không tồn tại hoặc đã bị xóa.</h2>
                    <button onClick={() => navigate('/admin/ban-thao')} className="btn-back">Quay lại danh sách</button>
                </div>
            </Layout>
        );
    }

    return (
    <Layout>
        <div className="admin-glass-content detail-page">
            {/* Header mới: Đã bỏ Badge ID và làm rõ tiêu đề */}
            <header className="detail-header">
                <div className="title-wrapper">
                    <span className="title-icon">📜</span>
                    <h1>KIỂM DUYỆT NỘI DUNG</h1>
                </div>
                <div className="header-divider"></div>
                <p className="subtitle">Vui lòng rà soát kỹ nội dung trước khi xuất bản lên hệ thống</p>
            </header>

            <div className="detail-grid">
                {/* Sidebar */}
                <aside className="info-sidebar">
                    <div className="info-card">
                        <h3>Thông tin bản thảo</h3>
                        <div className="info-item">
                            <label>Tên chương:</label>
                            <span>{draft.tenbt}</span>
                        </div>
                        <div className="info-item">
                            <label>Thuộc tác phẩm:</label>
                            <span>{draft.ten_truyen}</span>
                        </div>
                        <div className="info-item">
                            <label>Trạng thái:</label>
                            <span className={`status-badge ${draft.trangthai === 'Đã Duyệt' ? 'active' : 'pending'}`}>
                                {draft.trangthai}
                            </span>
                        </div>
                        
                        <div className="action-buttons-vertical">
                            {draft.trangthai !== 'Đã Duyệt' && (
                                <button onClick={handleApprove} className="btn-approve-large">
                                    PHÊ DUYỆT NGAY
                                </button>
                            )}
                            <button onClick={() => navigate('/admin/ban-thao')} className="btn-back-outline">
                                Quay về danh sách
                            </button>
                        </div>
                    </div>
                </aside>

                {/* Nội dung đọc */}
                <main className="content-reader">
                    <div className="reader-paper">
                        <div className="reader-header">
                            <h2>{draft.tenbt}</h2>
                            <hr />
                        </div>
                        
<div className="reader-body">
    {draft.nd ? (
        <div 
            className="ql-editor" // Thêm class này để giữ định dạng nếu bạn dùng ReactQuill
            style={{ minHeight: '200px', wordBreak: 'break-word' }}
            dangerouslySetInnerHTML={{ __html: draft.nd }} 
        />
    ) : (
        "Chương này không có nội dung."
    )}
</div>
                    </div>
                </main>
            </div>
        </div>
    </Layout>
);
   
};

export default ChiTietBanthao;