import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Layout from "../layout/layout.jsx";
import "../../static/css/QuanLyTacPham.css";

const QuanLyTacPham = () => {
    const [library, setLibrary] = useState({ banThaoChoDuyet: [], banThaoDaDuyet: [], daXuatBan: [] });
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    const user = JSON.parse(localStorage.getItem("user"));
    const matk = user?.MATK || user?.matk;

    const handleDelete = async (id, type) => {
        const confirmMsg = type === 'truyen' 
            ? "Bạn có chắc chắn muốn xóa vĩnh viễn TRUYỆN này? Dữ liệu liên quan sẽ bị mất!" 
            : "Bạn muốn xóa bản thảo này?";
            
        if (window.confirm(confirmMsg)) {
            try {
                const endpoint = type === 'truyen' 
                    ? `https://hkl-backend.onrender.com/api/author/delete-truyen/${id}`
                    : `https://hkl-backend.onrender.com/api/author/delete-ban-thao/${id}`;
                    
                const res = await axios.delete(endpoint);
                if (res.data.success) {
                    alert(res.data.message);
                    fetchLibrary();
                }
            } catch (err) {
                alert(err.response?.data?.message || "Lỗi khi thực hiện xóa tác phẩm.");
            }
        }
    };

    const handleHoanThanh = async (id) => {
        if (window.confirm("Xác nhận tác phẩm này đã kết thúc và chuyển sang trạng thái 'Hoàn thành'?")) {
            try {
                const res = await axios.put(`https://hkl-backend.onrender.com/api/author/hoan-thanh-truyen/${id}`);
                if (res.data.success) {
                    alert("Cập nhật trạng thái Hoàn thành thành công!");
                    fetchLibrary();
                }
            } catch (err) {
                alert(err.response?.data?.message || "Không thể cập nhật trạng thái.");
            }
        }
    };

    const fetchLibrary = async () => {
        setLoading(true);
        try {
            const res = await axios.get(`https://hkl-backend.onrender.com/api/author/my-library/${matk}`);
            if (res.data.success) {
                setLibrary(res.data.data);
            }
        } catch (err) {
            console.error("Lỗi khi tải tủ sách:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (!matk) {
            navigate('/login');
            return;
        }
        fetchLibrary();
    }, [matk, navigate]);

    const renderTable = (stories, title, emptyMsg, type) => (
        <div className="manage-section">
            <h3 className="section-subtitle">{title}</h3>
            <div className="table-responsive">
                <table className="admin-table">
                    <thead>
                        <tr>
                            <th>Ảnh/Mã</th>
                            <th>Tên Tác Phẩm</th>
                            <th>Thể Loại</th>
                            <th>Ngày Cập Nhật</th>
                            <th>Trạng Thái</th>
                            <th>Thao Tác</th>
                        </tr>
                    </thead>
                    <tbody>
                        {stories.length > 0 ? stories.map((s) => (
                            <tr key={s.ma_so}>
                                <td data-label="Ảnh/Mã" className="col-image">
                                    {type === 'truyen' ? (
                                        <img 
                                            src={`https://hkl-backend.onrender.com/images/${s.hinh_anh}`} 
                                            alt="cover" 
                                            className="table-img-preview"
                                            onError={(e) => e.target.src = "https://via.placeholder.com/45x60"}
                                        />
                                    ) : (
                                        <span className="ma-so-badge">{s.ma_so}</span>
                                    )}
                                </td>
                                <td data-label="Tên" className="col-name">
                                    <strong>{s.ten_truyen}</strong>
                                    {/* Hiển thị thêm tên truyện gốc cho bản thảo nếu có */}
                                    {type !== 'truyen' && s.ten_truyen_goc && (
                                        <div style={{ fontSize: '0.75rem', color: '#888', fontStyle: 'italic', marginTop: '2px' }}>
                                            (Gốc: {s.ten_truyen_goc})
                                        </div>
                                    )}
                                </td>
                                <td data-label="Thể loại">
                                    {type === 'truyen' 
                                        ? (s.the_loai || "Chưa rõ") 
                                        : (s.ten_truyen_goc ? "Sửa từ truyện" : "Bản thảo mới")
                                    }
                                </td>
                                <td data-label="Ngày">{new Date(s.ngay_tao).toLocaleDateString('vi-VN')}</td>
                                <td data-label="Trạng thái" className="col-status">
                                    <span className={`status-badge ${s.trang_thai === 'Đã Duyệt' || s.trang_thai === 'Hoàn thành' ? 'status-green' : 'status-yellow'}`}>
                                        {s.trang_thai}
                                    </span>
                                </td>
                                <td data-label="Thao tác" className="col-action">
                                    <div className="action-buttons">
                                        <button 
                                            className="btn-action btn-view"
                                            onClick={() => type === 'truyen' ? navigate(`/truyen/${s.ma_so}`) : navigate(`/doc-truyen/${s.ma_so}`)}
                                        >
                                            👁 Xem
                                        </button>

                                        {type === 'truyen' ? (
                                            <>
                                                <button className="btn-action btn-edit" onClick={() => navigate(`/author/edit-truyen/${s.ma_so}`)}>
                                                    🛠 Sửa
                                                </button>
                                                {(s.trang_thai === 'Đã Duyệt' || s.trang_thai === 'Đang ra') && (
                                                    <button className="btn-action btn-complete" onClick={() => handleHoanThanh(s.ma_so)}>
                                                        🏁 Xong
                                                    </button>
                                                )}
                                            </>
                                        ) : (
                                            <button className="btn-action btn-edit-bt" onClick={() => navigate(`/author/edit-ban-thao/${s.ma_so}`)}>
                                                ✏️ Sửa
                                            </button>
                                        )}

                                        <button className="btn-action btn-delete" onClick={() => handleDelete(s.ma_so, type)}>
                                            🗑 Xóa
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        )) : (
                            <tr>
                                <td colSpan="6" className="empty-row">{emptyMsg}</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );

    if (loading) return (
        <div className="loading-container">
            <div className="spinner"></div>
            <p>Đang tải dữ liệu...</p>
        </div>
    );

    const truyenChoDuyet = library.daXuatBan.filter(s => s.trang_thai === 'Đợi duyệt');
    const truyenDaXuatBanXong = library.daXuatBan.filter(s => s.trang_thai !== 'Đợi duyệt');

    return (
        <Layout>
            <div className="admin-page-wrapper">
                <header className="main-header-gradient">
                    <div className="header-content">
                        <h1>QUẢN LÝ TỦ SÁCH CÁ NHÂN</h1>
                        <div className="author-card">
                            <span className="label">Tác giả hiện tại</span>
                            <span className="author-name">{user?.TENDN || user?.tendn}</span>
                        </div>
                    </div>
                </header>
                
                <div className="dashboard-grid">
                    {/* CỘT BẢN THẢO */}
                    <section className="dashboard-column column-manuscript">
                        <div className="column-header">
                            <div className="icon-box">✍️</div>
                            <h2 className="column-title">Hệ Thống Bản Thảo</h2>
                        </div>
                        {renderTable(library.banThaoChoDuyet, "📌 Bản thảo chờ duyệt", "Không có bản thảo chờ duyệt", "banthao")}
                        {renderTable(library.banThaoDaDuyet, "✅ Bản thảo đã duyệt", "Không có bản thảo đã duyệt", "banthao")}
                    </section>

                    {/* CỘT TRUYỆN */}
                    <section className="dashboard-column column-published">
                        <div className="column-header">
                            <div className="icon-box">📚</div>
                            <h2 className="column-title">Ấn Phẩm Xuất Bản</h2>
                        </div>
                        {renderTable(truyenChoDuyet, "⏳ Đợi duyệt xuất bản", "Không có truyện đợi duyệt", "truyen")}
                        {renderTable(truyenDaXuatBanXong, "🚀 Đã xuất bản", "Chưa có truyện nào được xuất bản", "truyen")}
                    </section>
                </div>
            </div>
        </Layout>
    );
};

export default QuanLyTacPham;