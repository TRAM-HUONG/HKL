import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Layout from "../../layout/layout.jsx";
import "../../../static/css/Tuongtacadmin.css"; 

const Phanhoi = () => {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState(""); // State lưu từ khóa tìm kiếm

    const fetchData = async () => {
        try {
            setLoading(true);
            const res = await axios.get('http://localhost:5000/api/admin/phan-hoi/all');
            if (res.data.success) {
                setData(res.data.data);
            }
        } catch (error) {
            console.error("Lỗi tải phản hồi:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchData(); }, []);

    const handleDelete = async (id) => {
        if (window.confirm("Bạn có chắc muốn xóa phản hồi này?")) {
            try {
                const res = await axios.delete(`http://localhost:5000/api/admin/phan-hoi/delete/${id}`);
                if (res.data.success) {
                    alert("Xóa phản hồi thành công!");
                    setData(data.filter(item => (item.maph || item.MAPH) !== id));
                }
            } catch (error) {
                alert("Lỗi hệ thống khi xóa phản hồi.");
            }
        }
    };

    // --- LOGIC TÌM KIẾM TỔNG HỢP (PH, TG, DG) ---
    const filteredData = data.filter(item => {
        const search = searchTerm.trim().toLowerCase();
        if (!search) return true;

        // Chuyển đổi tất cả các mã định danh về chuỗi để so sánh
        const maPH = item.maph ? String(item.maph).toLowerCase() : "";
        const maTG = item.matg ? String(item.matg).toLowerCase() : "";
        const maDG = item.madg ? String(item.madg).toLowerCase() : "";
        const tenNguoiPH = item.nguoi_ph ? item.nguoi_ph.toLowerCase() : "";

        return maPH.includes(search) || 
               maTG.includes(search) || 
               maDG.includes(search) || 
               tenNguoiPH.includes(search);
    });

    return (
        <Layout>
            <div style={{ display: 'flex', justifyContent: 'center', width: '100%' }}>
            <div className="admin-glass-content">
                <header className="admin-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                    <h1 style={{ margin: 0 }}>QUẢN LÝ PHẢN HỒI</h1>

                    {/* THANH TÌM KIẾM ĐA NĂNG */}
                    <input 
                        type="text" 
                        placeholder="Tìm mã PH, TG, DG hoặc tên người dùng..." 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        style={{
                            padding: '10px 15px',
                            borderRadius: '20px',
                            border: '1px solid rgba(255, 255, 255, 0.2)',
                            background: 'rgba(255, 255, 255, 0.1)',
                            color: '#fff',
                            width: '380px',
                            outline: 'none',
                            backdropFilter: 'blur(5px)'
                        }}
                    />
                </header>

                <div className="admin-main-wrapper">
                    <table className="admin-table">
                        <thead>
                            <tr>
                                <th>Thông tin định danh</th>
                                <th>Nội dung gốc</th>
                                <th>Nội dung phản hồi</th>
                                <th>Ngày phản hồi</th>
                                <th>Hành động</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr><td colSpan="5" style={{textAlign: 'center'}}>Đang tải...</td></tr>
                            ) : filteredData.length > 0 ? (
                                filteredData.map(item => (
                                    <tr key={item.maph}>
                                        <td>
                                            {/* Hiển thị phân cấp các loại mã để admin dễ kiểm soát */}
                                            <div style={{fontSize: '0.8rem', color: '#ffcc00'}}>PH: #{item.maph}</div>
                                            <div style={{display: 'flex', gap: '10px', fontSize: '0.7rem', color: '#94a3b8'}}>
                                                {item.matg && <span>TG: #{item.matg}</span>}
                                                {item.madg && <span>DG: #{item.madg}</span>}
                                            </div>
                                            <strong style={{display: 'block', marginTop: '4px'}}>{item.nguoi_ph}</strong>
                                        </td>
                                        <td className="text-muted">
                                            <small><em>"{item.noidung_goc}"</em></small>
                                        </td>
                                        <td>{item.noi_dung}</td>
                                        <td>{item.ngay_ph ? new Date(item.ngay_ph).toLocaleString('vi-VN') : "N/A"}</td>
                                        <td>
                                            <button 
                                                onClick={() => handleDelete(item.maph)} 
                                                className="btn-delete"
                                            >
                                                Xóa
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="5" style={{textAlign: 'center', padding: '30px', color: '#94a3b8'}}>
                                        Không tìm thấy phản hồi nào khớp với mã hoặc tên đã nhập.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
            </div>
        </Layout>
    );
};

export default Phanhoi;