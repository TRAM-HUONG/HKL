import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Layout from "../../layout/layout.jsx";

const DetailedRevenue = () => {
    const [salesData, setSalesData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState(""); 

    useEffect(() => {
        const fetchDetailedSales = async () => {
            try {
                const res = await axios.get('https://hkl-backend-v3uu.onrender.com/api/admin/doanh-thu/sales');
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
            {/* THẺ STYLE CHỨA CSS CỔ ĐIỂN HOÀNG GIA */}
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@500;700;900&family=Playfair+Display:ital,wght@0,500;0,700;1,400&display=swap');

                /* Khung container chính phong cách hoàng gia */
                .admin-classic-container {
                    background: radial-gradient(circle, #1a0f00 0%, #0a0500 100%);
                    border: 3px double #d4af37;
                    outline: 1px solid #d4af37;
                    outline-offset: -8px;
                    border-radius: 4px;
                    padding: 35px;
                    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.8), inset 0 0 100px rgba(212, 175, 55, 0.15);
                    color: #f4eae1;
                    font-family: 'Playfair Display', serif;
                }

                /* Tiêu đề lồng lộn chữ cổ điển */
                .classic-title {
                    font-family: 'Cinzel', serif;
                    font-size: 28px;
                    font-weight: 900;
                    letter-spacing: 2px;
                    color: #d4af37;
                    text-shadow: 0px 2px 4px rgba(0, 0, 0, 0.8), 0 0 10px rgba(212, 175, 55, 0.4);
                    text-align: center;
                    position: relative;
                    padding-bottom: 10px;
                }

                /* Đường gạch dưới tiêu đề họa tiết đối xứng */
                .classic-title::after {
                    content: '❖ ═══════════ ❖';
                    display: block;
                    font-size: 12px;
                    color: #d4af37;
                    letter-spacing: 0px;
                    margin-top: 5px;
                    opacity: 0.8;
                }

                /* Thanh tìm kiếm Vintage */
                .classic-search {
                    font-family: 'Playfair Display', serif;
                    font-style: italic;
                    padding: 10px 20px;
                    border-radius: 0px;
                    border: 1px solid #d4af37;
                    background: rgba(20, 15, 10, 0.8);
                    color: #f4eae1;
                    width: 320px;
                    outline: none;
                    box-shadow: inset 0 2px 5px rgba(0,0,0,0.5);
                    transition: all 0.3s ease;
                }

                .classic-search:focus {
                    background: rgba(35, 25, 15, 0.9);
                    box-shadow: 0 0 12px rgba(212, 175, 55, 0.6), inset 0 2px 5px rgba(0,0,0,0.5);
                    border-color: #fff;
                }

                /* Bảng dữ liệu Thượng lưu */
                .table-container {
                    width: 100%;
                    overflow-x: auto;
                    margin-top: 30px;
                    border: 1px solid rgba(212, 175, 55, 0.3);
                }

                .table-header {
                    background: linear-gradient(90deg, #2c1a04, #4a2e06, #2c1a04);
                    padding: 15px 20px;
                    border-bottom: 2px solid #d4af37;
                    text-align: center;
                }

                .table-header h3 {
                    margin: 0;
                    font-family: 'Cinzel', serif;
                    font-size: 16px;
                    letter-spacing: 1px;
                    color: #fff;
                    text-shadow: 1px 1px 2px #000;
                }

                .premium-table {
                    width: 100%;
                    border-collapse: collapse;
                    text-align: left;
                    background: rgba(15, 10, 5, 0.7);
                }

                .premium-table th {
                    background: #1f1202;
                    padding: 16px;
                    color: #d4af37;
                    font-family: 'Cinzel', serif;
                    font-weight: 700;
                    font-size: 13px;
                    letter-spacing: 1px;
                    border-bottom: 2px solid #d4af37;
                    text-shadow: 1px 1px 1px #000;
                }

                .premium-table td {
                    padding: 16px;
                    border-bottom: 1px solid rgba(212, 175, 55, 0.15);
                    font-size: 16px;
                    color: #f4eae1;
                }

                /* Hiệu ứng hover hàng quý tộc */
                .premium-table tbody tr {
                    transition: all 0.2s ease;
                }

                .premium-table tbody tr:hover {
                    background: rgba(212, 175, 55, 0.1) !important;
                }

                /* Xen kẽ màu hàng tạo chiều sâu */
                .premium-table tbody tr:nth-child(even) {
                    background: rgba(25, 18, 10, 0.4);
                }

                /* Màu sắc doanh thu phong cách Luxury */
                .text-bold {
                    font-weight: 700;
                    color: #fff;
                }

                .text-profit-tg {
                    font-weight: 700;
                    color: #85e3b3; 
                    text-shadow: 0 0 5px rgba(133, 227, 179, 0.3);
                }

                .text-profit-ad {
                    font-weight: 700;
                    color: #d4af37; /* Admin nhận màu vàng Gold */
                    text-shadow: 0 0 5px rgba(212, 175, 55, 0.3);
                }

                .tag-author {
                    color: #f3a6ffa8;
                    font-weight: bold;
                    font-style: italic;
                }
            `}</style>

            <div className="admin-classic-container">
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px', marginBottom: '20px' }}>
                    <h2 className="classic-title" style={{ margin: 0 }}>💰 CHI TIẾT CHIA SẺ DOANH THU</h2>
                    
                    {/* THANH TÌM KIẾM CỔ ĐIỂN */}
                    <input 
                        type="text" 
                        className="classic-search"
                        placeholder="Tìm kiếm giao dịch thư tịch..." 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>

                <div className="table-container">
                    <div className="table-header">
                        <h3>Lịch Sử Giao Dịch Mua Truyện (Tỷ Lệ 70/30)</h3>
                    </div>
                    <table className="premium-table">
                        <thead>
                            <tr>
                                <th>Mã Bản Ghi</th>
                                <th>Tác Giả Sở Hữu</th>
                                <th>Tác Phẩm</th>
                                <th>Tổng Khấu Trừ</th>
                                <th>Tác Giả (70%)</th>
                                <th>Khắc Ấn Admin (30%)</th>
                                <th>Thời Gian Khởi Tạo</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredSales.length > 0 ? (
                                filteredSales.map((dt) => (
                                    <tr key={dt.madt}>
                                        <td><strong style={{ color: '#d4af37' }}>#{dt.madt}</strong></td>
                                        <td className="tag-author">{dt.tentg}</td>
                                        <td style={{ fontStyle: 'italic', fontWeight: '500' }}>« {dt.ten_truyen} »</td>
                                        <td className="text-bold">{dt.tong_xu} xu</td>
                                        <td className="text-profit-tg">+{dt.xu_tac_gia} xu</td>
                                        <td className="text-profit-ad">+{dt.xu_admin} xu</td>
                                        <td style={{ color: '#bfae9e', fontSize: '14px' }}>{new Date(dt.ngay_giao_dich).toLocaleString('vi-VN')}</td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="7" style={{ textAlign: 'center', padding: '40px', color: '#bfae9e', fontStyle: 'italic' }}>
                                        {loading ? "Đang truy xuất sổ sách cổ..." : "Không tìm thấy sử liệu giao dịch nào trùng khớp."}
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