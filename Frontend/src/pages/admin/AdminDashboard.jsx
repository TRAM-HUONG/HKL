import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from "../layout/layout.jsx";
import "../../static/css/AdminDashboard.css";
import axios from 'axios';

const AdminDashboard = () => {
    const navigate = useNavigate();
    
    const [stats, setStats] = useState({ 
        totalStories: 0, 
        totalSubscribers: 0, 
        pendingDrafts: 0, 
        pendingStories: 0,
        totalVND: 0,
        adminProfit: 0 
    });
    
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchAllStats = async () => {
            try {
                setLoading(true);
                const [resQuickStats, resRevenue] = await Promise.all([
                    axios.get('http://localhost:5000/api/admin/quick-stats'),
                    axios.get('http://localhost:5000/api/admin/doanh-thu/stats')
                ]);

                setStats({
                    ...(resQuickStats.data.success ? resQuickStats.data.data : {}),
                    totalVND: resRevenue.data.success ? resRevenue.data.data.tong_tien_nap : 0,
                    adminProfit: resRevenue.data.success ? resRevenue.data.data.loi_nhuan_admin : 0
                });
            } catch (error) {
                console.error("Lỗi kết nối hệ thống:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchAllStats();
    }, []);

    // CHIA NHÓM DANH MỤC QUẢN LÝ
    const menuGroups = [
        {
            name: "Nội Dung & Duyệt",
            items: [
                { title: 'Duyệt Bản Thảo', icon: '📝', path: '/admin/ban-thao', desc: 'Phê duyệt chương mới' },
                { title: 'Quản Lý Truyện', icon: '📚', path: '/admin/truyen', desc: 'Chi tiết truyện & chương' },
            ]
        },
        {
            name: "Tài Chính & Doanh Thu",
            items: [
                { title: 'Doanh Thu', icon: '📊', path: '/admin/doanh-thu', desc: 'Thống kê thu nhập' },
                { title: 'Gói Nạp', icon: '💎', path: '/admin/goi-nap', desc: 'Thiết lập gói linh thạch' },
                { title: 'Lịch Sử Nạp', icon: '💳', path: '/admin/lich-su-nap', desc: 'Theo dõi dòng tiền nạp' },
                { title: 'Lịch Sử Mua', icon: '🛒', path: '/admin/lich-su-mua', desc: 'Giao dịch mua chương' },
                { title: 'Yêu Cầu Rút Tiền', icon: '💰', path: '/admin/yeu-cau-rut-tien', desc: 'Duyệt tiền cho tác giả' },
            ]
        },
        {
            name: "Cộng Đồng & Phản Hồi",
            items: [
                { title: 'Bình Luận', icon: '💬', path: '/admin/binh-luan', desc: 'Kiểm soát thảo luận' },
                { title: 'Đánh Giá', icon: '⭐', path: '/admin/danh-gia', desc: 'Quản lý review/star' },
                { title: 'Phản Hồi', icon: '📩', path: '/admin/phan-hoi', desc: 'Tin nhắn hỗ trợ' },
            ]
        },
        {
            name: "Hệ Thống & User",
            items: [
                { title: 'Tác Giả', icon: '✍️', path: '/admin/tac-gia', desc: 'Quản lý người sáng tác' },
                { title: 'Độc Giả', icon: '📖', path: '/admin/doc-gia', desc: 'Thông tin khách hàng' },
                { title: 'Tài Khoản', icon: '🔐', path: '/admin/tai-khoan', desc: 'Phân quyền & Bảo mật' },
            ]
        }
    ];

    return (
        <Layout>
            <div className="admin-wow-dashboard">
                {/* 1. THỐNG KÊ Ô VUÔNG PHÍA TRÊN */}
                <section className="wow-stats-grid">
                    <div className="wow-stat-card bg-blue">
                        <span className="wow-icon">💰</span>
                        <div className="wow-info">
                            <p>Doanh Thu</p>
                            <h3>{loading ? "..." : Number(stats.totalVND).toLocaleString()} ₫</h3>
                        </div>
                    </div>
                    <div className="wow-stat-card bg-sky">
                        <span className="wow-icon">📚</span>
                        <div className="wow-info">
                            <p>Tổng Truyện</p>
                            <h3>{loading ? "..." : stats.totalStories}</h3>
                        </div>
                    </div>
                    <div className="wow-stat-card bg-orange">
                        <span className="wow-icon">⏳</span>
                        <div className="wow-info">
                            <p>Truyện Chờ</p>
                            <h3>{loading ? "..." : stats.pendingStories}</h3>
                        </div>
                    </div>
                    <div className="wow-stat-card bg-pink">
                        <span className="wow-icon">📝</span>
                        <div className="wow-info">
                            <p>Chương Chờ</p>
                            <h3>{loading ? "..." : stats.pendingDrafts}</h3>
                        </div>
                    </div>
                </section>

                <div className="wow-body-layout">
                    {/* 2. SIDEBAR CHIA NHÓM BÊN TRÁI */}
                    <aside className="wow-sidebar">
                        <div className="wow-sidebar-inner">
                            <h2 className="wow-sidebar-title">DANH MỤC QUẢN LÝ</h2>
                            <nav className="wow-menu-groups-container">
                                {menuGroups.map((group, idx) => (
                                    <div key={idx} className="wow-menu-group">
                                        <h4 className="wow-group-name">{group.name}</h4>
                                        {group.items.map((item, i) => (
                                            <div key={i} className="wow-menu-link" onClick={() => navigate(item.path)}>
                                                <span className="wow-link-icon">{item.icon}</span>
                                                <span className="wow-link-text">{item.title}</span>
                                            </div>
                                        ))}
                                    </div>
                                ))}
                            </nav>
                        </div>
                    </aside>

                    {/* 3. NỘI DUNG CHÍNH: QUY TẮC VÀ GRID CARD TỔNG HỢP */}
                    <main className="wow-main-content">
                        <div className="wow-rules-table-container">
                            <div className="wow-table-header">
                                <h3>📜 QUY TẮC THỰC HIỆN DÀNH CHO ADMIN</h3>
                            </div>
                            <table className="wow-table">
                                <thead>
                                    <tr>
                                        <th>Hạng Mục</th>
                                        <th>Quy Tắc Thực Hiện</th>
                                        <th>Phản Hồi</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr>
                                        <td><b>Duyệt nội dung</b></td>
                                        <td>Kiểm tra từ ngữ nhạy cảm, chất lượng hình ảnh & bản quyền.</td>
                                        <td><span className="wow-tag">Dưới 12h</span></td>
                                    </tr>
                                    <tr>
                                        <td><b>Rút tiền</b></td>
                                        <td>Xác minh số dư khả dụng và lịch sử giao dịch sạch.</td>
                                        <td><span className="wow-tag orange">24h - 48h</span></td>
                                    </tr>
                                    <tr>
                                        <td><b>Hỗ trợ User</b></td>
                                        <td>Trả lời lịch sự, đúng trọng tâm vấn đề của độc giả.</td>
                                        <td><span className="wow-tag pink">Tức thì</span></td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </main>
                </div>
            </div>
        </Layout>
    );
};

export default AdminDashboard;