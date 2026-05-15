import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import "../../../static/css/Truyenadmin.css"; 
import Layout from "../../layout/layout.jsx";

const ApproveList = () => {
    const [pendingStories, setPendingStories] = useState([]);
    const [publishedStories, setPublishedStories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const navigate = useNavigate();

    const [pagePending, setPagePending] = useState(1);
    const [pagePublished, setPagePublished] = useState(1);
    const itemsPerPage = 6;

    const fetchAllStories = async () => {
        setLoading(true);
        try {
            const res = await axios.get('http://localhost:5000/api/admin/truyen-manage/all');
            if (res.data.success) {
                setPendingStories(res.data.choDuyet);
                setPublishedStories(res.data.daDuyet);
            }
        } catch (err) {
            console.error("Lỗi lấy dữ liệu:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAllStories();
    }, []);

    const filterData = (data) => {
        const search = searchTerm.trim().toLowerCase();
        if (!search) return data;
        return data.filter(s => 
            String(s.mat).toLowerCase().includes(search) || 
            String(s.tent).toLowerCase().includes(search)
        );
    };

    const handleReject = async (id) => {
        if (window.confirm("Bạn có chắc chắn muốn TỪ CHỐI duyệt truyện này?")) {
            try {
                await axios.put(`http://localhost:5000/api/admin/truyen/reject/${id}`);
                alert("Đã từ chối truyện!");
                fetchAllStories();
            } catch (err) {
                alert("Lỗi khi từ chối");
            }
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm("Bạn có chắc chắn muốn GỠ BỎ truyện này vĩnh viễn không?")) {
            try {
                await axios.delete(`http://localhost:5000/api/admin/truyen/delete/${id}`);
                alert("Đã gỡ bỏ truyện thành công!");
                fetchAllStories();
            } catch (err) {
                alert("Lỗi khi gỡ bỏ truyện");
            }
        }
    };

    const paginateData = (data, page) => {
        const startIndex = (page - 1) * itemsPerPage;
        return data.slice(startIndex, startIndex + itemsPerPage);
    };

    const renderPagination = (totalItems, currentPage, setPage) => {
        const totalPages = Math.ceil(totalItems / itemsPerPage);
        if (totalPages <= 1) return null;
        return (
            <div className="pagination-wrapper">
                <button disabled={currentPage === 1} onClick={() => setPage(p => p - 1)} className="btn-page"> Trước </button>
                <span className="pagination-info">Trang {currentPage} / {totalPages}</span>
                <button disabled={currentPage === totalPages} onClick={() => setPage(p => p + 1)} className="btn-page"> Sau </button>
            </div>
        );
    };

    const renderTable = (data, isPending, currentPage, setPage) => {
        const filteredData = filterData(data);
        const currentData = paginateData(filteredData, currentPage);
        
        return (
            <>
                <table className="admin-table">
                    <thead>
                        <tr>
                            <th>Mã</th>
                            <th>Ảnh</th>
                            <th>Tên Truyện</th>
                            <th>Tác Giả</th>
                            <th>{isPending ? "Ngày Gửi" : "Ngày Đăng"}</th>
                            <th>Thao Tác</th>
                        </tr>
                    </thead>
                    <tbody>
                        {currentData.length > 0 ? currentData.map(s => (
                            <tr key={s.mat}>
                                <td><span className="id-badge">#{s.mat}</span></td>
                                <td>
                                    <img 
                                        src={`http://localhost:5000/images/${s.hinhanh}`} 
                                        className="table-poster"
                                        alt="cover" 
                                        onError={(e) => { e.target.src = "https://via.placeholder.com/50x70?text=No+Cover"; }}
                                    />
                                </td>
                                <td><strong className="text-highlight">{s.tent}</strong></td>
                                <td>{s.ten_tac_gia}</td>
                                <td>{new Date(s.ngaydang).toLocaleDateString('vi-VN')}</td>
                                <td>
                                    <div className="action-btns">
                                        {isPending ? (
                                            <>
                                                <button className="btn-view" onClick={() => navigate(`/admin/truyen/view/${s.mat}`)}>👁 Duyệt</button>
                                                <button className="btn-reject-custom" onClick={() => handleReject(s.mat)}>🚫 Từ chối</button>
                                            </>
                                        ) : (
                                            <>
                                                <button className="btn-view-blue" onClick={() => navigate(`/admin/truyen/view/${s.mat}`)}>👁 Chi tiết</button>
                                                <button className="btn-delete" onClick={() => handleDelete(s.mat)}>🗑 Gỡ bỏ</button>
                                            </>
                                        )}
                                    </div>
                                </td>
                            </tr>
                        )) : (
                            <tr>
                                <td colSpan="6" className="no-data">Không tìm thấy kết quả phù hợp</td>
                            </tr>
                        )}
                    </tbody>
                </table>
                {renderPagination(filteredData.length, currentPage, setPage)}
            </>
        );
    };

    return (
        <Layout>
            <div className="admin-glass-content">
                <header className="admin-header-flex">
                    <h1 className="main-title">QUẢN LÝ KHO TRUYỆN</h1>
                    
                    <div className="search-box">
                        <input 
                            type="text" 
                            className="search-input-custom"
                            placeholder="Nhập mã hoặc tên truyện cần tìm..." 
                            value={searchTerm}
                            onChange={(e) => {
                                setSearchTerm(e.target.value);
                                setPagePending(1);
                                setPagePublished(1);
                            }}
                        />
                        <span className="search-icon">🔍</span>
                    </div>
                </header>

                <div className="admin-main-wrapper">
                    {loading ? (
                        <div className="loading-container">
                            <div className="spinner"></div>
                            <p>Đang tải dữ liệu hệ thống...</p>
                        </div>
                    ) : (
                        <>
                            <section className="section-manage">
                                <h2 className="section-title-pending">⏳ TRUYỆN ĐANG CHỜ DUYỆT ({filterData(pendingStories).length})</h2>
                                {renderTable(pendingStories, true, pagePending, setPagePending)}
                            </section>

                            <div className="divider-glass"></div>

                            <section className="section-manage">
                                <h2 className="section-title-published">✅ TRUYỆN ĐÃ XUẤT BẢN ({filterData(publishedStories).length})</h2>
                                {renderTable(publishedStories, false, pagePublished, setPagePublished)}
                            </section>
                        </>
                    )}
                </div>

                {/* NÚT QUAY LẠI NẰM DƯỚI CÙNG, NHỎ GỌN */}
                <footer className="admin-footer-actions">
                    <button className="btn-back-minimal" onClick={() => navigate('/admin')}>
                        ⬅ Quay lại Dashboard
                    </button>
                </footer>
            </div>
        </Layout>
    );
};

export default ApproveList;