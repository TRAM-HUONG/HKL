import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Layout from "../../layout/layout.jsx";

const DetailedRevenue = () => {
    const [salesData, setSalesData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState(""); // State lưu từ khóa tìm kiếm

    useEffect(() => {
        const fetchDetailedSales = async () => {
            try {
                const res = await axios.get('http://localhost:5000/api/admin/doanh-thu/sales');
                if (res.data.success) {
                    setSalesData(res.data.data);
                }
            } catch (error) {
                console.error("Lỗi khi tải chi tiết doanh thu:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchDetailedSales();
    }, []);

    // --- LOGIC LỌC DỮ LIỆU ---
    const filteredSales = salesData.filter(item => {
        const search = searchTerm.trim().toLowerCase();
        if (!search) return true;

        const maDT = item.madt ? String(item.madt).toLowerCase() : "";
        const tenTG = item.tentg ? String(item.tentg).toLowerCase() : "";
        const tenTruyen = item.ten_truyen ? String(item.ten_truyen).toLowerCase() : "";

        return maDT.includes(search) || tenTG.includes(search) || tenTruyen.includes(search);
    });

    return (
        <Layout>
            <div className="admin-glass-content">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                    <h2 className="page-title" style={{ margin: 0 }}>💰 CHI TIẾT CHIA SẺ DOANH THU</h2>
                    
                    {/* THANH TÌM KIẾM */}
                    <input 
                        type="text" 
                        placeholder="Tìm mã DT hoặc tên tác giả..." 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        style={{
                            padding: '10px 15px',
                            borderRadius: '20px',
                            border: '1px solid rgba(108, 126, 225, 0.5)',
                            background: 'rgba(255, 255, 255, 0.1)',
                            color: '#fff',
                            width: '300px',
                            outline: 'none',
                            backdropFilter: 'blur(5px)'
                        }}
                    />
                </div>

                <div className="table-container">
                    <div className="table-header">
                        <h3>Lịch sử giao dịch mua truyện (70/30)</h3>
                    </div>
                    <table className="premium-table">
                        <thead>
                            <tr>
                                <th>Mã DT</th>
                                <th>Tác giả nhận</th>
                                <th>Tên truyện</th>
                                <th>Tổng Xu</th>
                                <th>Tác giả (70%)</th>
                                <th>Admin (30%)</th>
                                <th>Ngày giao dịch</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredSales.length > 0 ? (
                                filteredSales.map((dt) => (
                                    <tr key={dt.madt}>
                                        <td><strong>#{dt.madt}</strong></td>
                                        <td style={{ color: '#C688EB' }}>{dt.tentg}</td>
                                        <td>{dt.ten_truyen}</td>
                                        <td className="text-bold">{dt.tong_xu}</td>
                                        <td className="text-profit-tg">+{dt.xu_tac_gia}</td>
                                        <td className="text-profit-ad">+{dt.xu_admin}</td>
                                        <td>{new Date(dt.ngay_giao_dich).toLocaleString('vi-VN')}</td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="7" style={{ textAlign: 'center', padding: '30px', color: '#94a3b8' }}>
                                        {loading ? "Đang tải dữ liệu..." : "Không tìm thấy giao dịch nào phù hợp."}
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </Layout>
    );
};

export default DetailedRevenue;