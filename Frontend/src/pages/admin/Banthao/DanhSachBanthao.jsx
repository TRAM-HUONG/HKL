import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Layout from "../../layout/layout.jsx";
import "../../../static/css/Banthaoadmin.css"; 

const DanhSachBanthao = () => {
    const [drafts, setDrafts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState(""); // Lưu từ khóa tìm kiếm
    const navigate = useNavigate();

    const [pagePending, setPagePending] = useState(1);
    const [pageApproved, setPageApproved] = useState(1);
    const itemsPerPage = 6; 

    const fetchDrafts = async () => {
        try {
            const res = await axios.get('http://localhost:5000/api/admin/ban-thao/all');
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
                const res = await axios.delete(`http://localhost:5000/api/admin/ban-thao/delete/${id}`);
                if (res.data.success) {
                    alert("Đã xóa bản thảo thành công!");
                    fetchDrafts();
                }
            } catch (error) {
                alert("Lỗi: Không thể xóa bản thảo.");
            }
        }
    };

    // --- LOGIC TÌM KIẾM ---
    // --- LOGIC TÌM KIẾM CHUẨN ---
const filteredDrafts = drafts.filter(item => {
    // Chuyển từ khóa tìm kiếm về chữ thường và xóa khoảng trắng thừa
    const searchLower = searchTerm.trim().toLowerCase();
    
    // Nếu không nhập gì thì hiện tất cả
    if (!searchLower) return true;

    // Ép kiểu các trường dữ liệu về String để so sánh
    const maBT = item.mabt ? String(item.mabt).toLowerCase() : "";
    const tenTruyen = item.ten_truyen ? String(item.ten_truyen).toLowerCase() : "";
    const tenChuong = item.ten_chuong ? String(item.ten_chuong).toLowerCase() : "";

    // Kiểm tra xem từ khóa có nằm trong bất kỳ trường nào không
    return maBT.includes(searchLower) || 
           tenTruyen.includes(searchLower) || 
           tenChuong.includes(searchLower);
});
    // Lọc theo trạng thái từ danh sách đã search
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
            <div className="pagination-controls" style={{ display: 'flex', gap: '10px', justifyContent: 'center', marginTop: '20px' }}>
                <button disabled={currentPage === 1} onClick={() => setPage(p => p - 1)} className="btn-page"> ← </button>
                <span style={{ alignSelf: 'center', color: '#94a3b8', fontSize: '0.8rem' }}> {currentPage} / {totalPages} </span>
                <button disabled={currentPage === totalPages} onClick={() => setPage(p => p + 1)} className="btn-page"> → </button>
            </div>
        );
    };

    const renderTableContent = (data, currentPage) => {
        const currentItems = getPaginatedData(data, currentPage);
        if (data.length === 0) {
            return (<tr><td colSpan="5" style={{ textAlign: 'center', color: '#94a3b8', padding: '20px' }}> Không tìm thấy bản thảo nào </td></tr>);
        }

        return currentItems.map((item) => (
            <tr key={item.mabt}>
                <td style={{ fontWeight: '600', color: '#fff' }}>
                    <small style={{ display: 'block', color: '#64748b', fontSize: '0.7rem' }}>#{item.mabt}</small>
                    {item.ten_truyen}
                </td>
                <td>{item.ten_chuong}</td>
                <td style={{ color: '#C688EB' }}>{item.ten_tac_gia}</td>
                <td>
                    <span className={`status-badge ${item.trangthai === 'Đã Duyệt' ? 'active' : 'pending'}`}>
                        {item.trangthai}
                    </span>
                </td>
                <td className="actions">
                    <button className="btn-approve" onClick={() => navigate(`/admin/ban-thao/detail/${item.mabt}`)}> Xem </button>
                    <button className="btn-delete" onClick={() => handleDelete(item.mabt)}> Xóa </button>
                </td>
            </tr>
        ));
    };

    return (
        <Layout>
            <div className="admin-glass-content">
                <header className="admin-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
                    <h1 style={{ color: '#6C7EE1', margin: 0 }}>WORKSPACE <span style={{ fontWeight: '300', color: '#fff' }}>| QUẢN LÝ BẢN THẢO</span></h1>
                    
                    {/* THANH TÌM KIẾM */}
                    <div className="search-box" style={{ position: 'relative' }}>
                        <input 
                            type="text" 
                            placeholder="Tìm tên truyện, chương hoặc mã số..." 
                            className="search-input"
                            value={searchTerm}
                            onChange={(e) => {
                                setSearchTerm(e.target.value);
                                setPagePending(1); // Reset trang khi tìm kiếm
                                setPageApproved(1);
                            }}
                            style={{
                                padding: '10px 15px',
                                borderRadius: '12px',
                                border: '1px solid rgba(255,255,255,0.1)',
                                background: 'rgba(255,255,255,0.05)',
                                color: '#f20000',
                                width: '300px',
                                outline: 'none'
                            }}
                        />
                    </div>
                </header>

                {loading ? (
                    <div style={{ textAlign: 'center', color: '#fff' }}>Đang tải...</div>
                ) : (
                    <div className="bento-grid-split">
                        {/* BÊN TRÁI: CHỜ DUYỆT */}
                        <div className="table-container">
                            <h2 style={{ color: '#FFC4A4' }}>
                                <span style={{ width: '12px', height: '12px', background: '#FFC4A4', borderRadius: '50%', display: 'inline-block', marginRight: '8px' }}></span>
                                Chờ Duyệt ({pendingDrafts.length})
                            </h2>
                            <table className="custom-admin-table">
                                <thead>
                                    <tr>
                                        <th>Truyện</th>
                                        <th>Chương</th>
                                        <th>Tác giả</th>
                                        <th>STT</th>
                                        <th></th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {renderTableContent(pendingDrafts, pagePending)}
                                </tbody>
                            </table>
                            {renderPagination(pendingDrafts.length, pagePending, setPagePending)}
                        </div>

                        {/* BÊN PHẢI: ĐÃ DUYỆT */}
                        <div className="table-container">
                            <h2 style={{ color: '#92B9E3' }}>
                                <span style={{ width: '12px', height: '12px', background: '#92B9E3', borderRadius: '50%', display: 'inline-block', marginRight: '8px' }}></span>
                                Đã Duyệt ({approvedDrafts.length})
                            </h2>
                            <table className="custom-admin-table">
                                <thead>
                                    <tr>
                                        <th>Truyện</th>
                                        <th>Chương</th>
                                        <th>Tác giả</th>
                                        <th>STT</th>
                                        <th></th>
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
        </Layout>
    );
};

export default DanhSachBanthao;