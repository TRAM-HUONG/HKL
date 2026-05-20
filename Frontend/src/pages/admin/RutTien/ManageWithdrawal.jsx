import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Layout from "../../layout/layout.jsx"; 
import "../../../static/css/ruttienadmin.css"; 

const ManageWithdrawal = () => {
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filterStatus, setFilterStatus] = useState('All');
    const [searchTerm, setSearchTerm] = useState(""); // 1. Thêm state lưu từ khóa tìm kiếm

    const fetchRequests = async () => {
        setLoading(true);
        try {
            const response = await axios.get('https://hkl-backend-v3uu.onrender.com/api/user/withdraw/requests');
            setRequests(response.data);
        } catch (error) {
            console.error("Lỗi khi tải danh sách rút tiền:", error);
            alert("Không thể kết nối đến máy chủ.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchRequests();
    }, []);

    const handleApprove = async (yc) => {
        const confirmMsg = `Xác nhận đã chuyển ${new Intl.NumberFormat('vi-VN').format(yc.so_tien_vnd)}đ cho tác giả ${yc.tentg}?\n\nHành động này sẽ TRỪ ${yc.so_xu_rut} Xu trong ví của họ.`;
        
        if (window.confirm(confirmMsg)) {
            try {
                const res = await axios.put(`https://hkl-backend-v3uu.onrender.com/api/user/withdraw/approve`, {
                    mayc: yc.mayc,
                    matk: yc.matk,
                    so_xu: yc.so_xu_rut
                });
                
                if (res.data.success) {
                    alert("✅ Thành công! Yêu cầu đã được phê duyệt và trừ xu.");
                    fetchRequests(); 
                }
            } catch (error) {
                alert("❌ Lỗi: " + (error.response?.data?.message || "Không thể xử lý yêu cầu."));
            }
        }
    };

    const handleReject = async (mayc) => {
        const reason = window.prompt("Lý do từ chối (ví dụ: Tên chủ tài khoản không khớp):");
        if (reason === null) return; 

        try {
            const res = await axios.put(`https://hkl-backend-v3uu.onrender.com/api/user/withdraw/reject`, { mayc, reason });
            if (res.data.success) {
                alert("Đã từ chối yêu cầu.");
                fetchRequests();
            }
        } catch (error) {
            alert("Lỗi khi thực hiện thao tác.");
        }
    };

    // 2. LOGIC TÌM KIẾM VÀ LỌC TRẠNG THÁI
    const filteredRequests = requests.filter(r => {
        // Lọc theo trạng thái trước
        const matchStatus = filterStatus === 'All' ? true : r.trangthai === filterStatus;
        
        // Sau đó lọc theo từ khóa tìm kiếm (Mã YC hoặc Tên tác giả)
        const search = searchTerm.trim().toLowerCase();
        const matchSearch = search === "" || 
            String(r.mayc).toLowerCase().includes(search) || 
            String(r.tentg).toLowerCase().includes(search);

        return matchStatus && matchSearch;
    });

    return (
        <Layout>
                <div style={{ display: 'flex', justifyContent: 'center', width: '100%' }}>
            <div className="admin-glass-content">
                <header className="admin-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '20px' }}>
                    <div>
                        <h1>💸 QUẢN LÝ RÚT TIỀN</h1>
                        <p className="admin-subtitle">Phê duyệt yêu cầu quy đổi Xu sang tiền mặt cho Tác giả</p>
                    </div>

                    {/* 3. THANH TÌM KIẾM */}
                    <input 
                        type="text" 
                        placeholder="Tìm mã yêu cầu hoặc tên tác giả..." 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        style={{
                            padding: '10px 15px',
                            borderRadius: '20px',
                            border: '1px solid #ffcc00',
                            background: 'rgba(255, 255, 255, 0.1)',
                            color: '#fff',
                            width: '320px',
                            outline: 'none',
                            backdropFilter: 'blur(5px)',
                            marginBottom: '10px'
                        }}
                    />
                </header>

                <div className="filter-bar" style={{ marginBottom: '25px', display: 'flex', gap: '12px' }}>
                    {['All', 'Chờ duyệt', 'Đã chuyển tiền', 'Từ chối'].map(status => (
                        <button 
                            key={status}
                            className={`filter-btn ${filterStatus === status ? 'active' : ''}`}
                            onClick={() => setFilterStatus(status)}
                            style={{
                                padding: '10px 18px',
                                borderRadius: '25px',
                                border: '1px solid #ffcc00',
                                background: filterStatus === status ? '#ffcc00' : 'rgba(255, 204, 0, 0.1)',
                                color: filterStatus === status ? '#000' : '#ffcc00',
                                fontWeight: 'bold',
                                cursor: 'pointer'
                            }}
                        >
                            {status}
                        </button>
                    ))}
                </div>

                <div className="table-container shadow-card">
                    <table className="admin-table">
                        <thead>
                            <tr>
                                <th>Mã YC</th>
                                <th>Tên Tác Giả</th>
                                <th>Số Xu Rút</th>
                                <th>Tiền VNĐ</th>
                                <th>Thông Tin Chuyển Khoản</th>
                                <th>Ngày Gửi</th>
                                <th>Trạng Thái</th>
                                <th>Thao Tác</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr><td colSpan="8" className="text-center">🔄 Đang tải dữ liệu...</td></tr>
                            ) : filteredRequests.length > 0 ? (
                                filteredRequests.map((yc) => (
                                    <tr key={yc.mayc}>
                                        <td><strong>#{yc.mayc}</strong></td>
                                        <td><strong>{yc.tentg}</strong></td>
                                        <td style={{ color: '#ffcc00', fontWeight: 'bold' }}>{yc.so_xu_rut} Xu</td>
                                        <td style={{ color: '#28a745', fontWeight: 'bold' }}>
                                            {new Intl.NumberFormat('vi-VN').format(yc.so_tien_vnd)}đ
                                        </td>
                                        <td style={{ fontSize: '0.85rem', maxWidth: '300px', whiteSpace: 'pre-wrap', lineHeight: '1.4' }}>
                                            {yc.thong_tin_nhan_tien}
                                        </td>
                                        <td>{new Date(yc.ngay_yc).toLocaleDateString('vi-VN')}</td>
                                        <td>
                                            <span className={`status-badge ${yc.trangthai}`}>
                                                {yc.trangthai}
                                            </span>
                                        </td>
                                        <td>
                                            {yc.trangthai === 'Chờ duyệt' ? (
                                                <div style={{ display: 'flex', gap: '8px' }}>
                                                    <button 
                                                        className="btn-action approve"
                                                        onClick={() => handleApprove(yc)}
                                                    >
                                                        ✔ Duyệt
                                                    </button>
                                                    <button 
                                                        className="btn-action reject"
                                                        onClick={() => handleReject(yc.mayc)}
                                                    >
                                                        ✖
                                                    </button>
                                                </div>
                                            ) : (
                                                <span className="processed-date">
                                                    {yc.ngay_xu_ly ? new Date(yc.ngay_xu_ly).toLocaleDateString('vi-VN') : '---'}
                                                </span>
                                            )}
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="8" className="text-center">
                                        Không tìm thấy yêu cầu nào phù hợp.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
            </div>

            <style>{`
                /* Giữ nguyên các style cũ của bạn */
                .status-badge {
                    padding: 5px 10px;
                    border-radius: 6px;
                    font-size: 0.75rem;
                    font-weight: 700;
                    display: inline-block;
                }
                .status-badge.Chờ\\ duyệt { background: #ffcc00; color: #000; }
                .status-badge.Đã\\ chuyển\\ tiền { background: #28a745; color: #fff; }
                .status-badge.Từ\\ chối { background: #ff4444; color: #fff; }
                
                .btn-action {
                    padding: 6px 12px;
                    border: none;
                    border-radius: 4px;
                    cursor: pointer;
                    font-weight: bold;
                }
                .btn-action.approve { background: #28a745; color: white; }
                .btn-action.reject { background: #ff4444; color: white; }
                
                .processed-date { font-size: 0.8rem; color: #aaa; font-style: italic; }
                .text-center { text-align: center; padding: 30px; }
                .shadow-card { background: rgba(255,255,255,0.05); border-radius: 12px; overflow: hidden; }
            `}</style>
        </Layout>
    );
};

export default ManageWithdrawal;