import React, { useState, useEffect } from 'react';
import { useLocation, Link } from 'react-router-dom';
import axios from 'axios';
import Layout from '../layout/layout.jsx'; 
import "../../static/css/Home.css"; 

const DanhMuc = () => {
    const [dsTruyen, setDsTruyen] = useState([]);
    const [loading, setLoading] = useState(true);
    
    // Lấy query parameter "search" từ URL
    const location = useLocation();
    const queryParams = new URLSearchParams(location.search);
    const searchKeyword = queryParams.get('search') || "";

    useEffect(() => {
        const fetchTruyen = async () => {
            setLoading(true);
            try {
                // Gọi API lấy toàn bộ danh sách truyện
                const res = await axios.get("https://hkl-backend-v3uu.onrender.com/api/truyen");
                const allTruyen = res.data;

                // Lọc danh sách truyện dựa trên từ khóa tìm kiếm (không phân biệt hoa thường)[cite: 4]
                if (searchKeyword) {
                    const filtered = allTruyen.filter(t => 
                        t.tent.toLowerCase().includes(searchKeyword.toLowerCase())
                    );
                    setDsTruyen(filtered);
                } else {
                    setDsTruyen(allTruyen);
                }
            } catch (err) {
                console.error("Lỗi khi tải danh sách truyện:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchTruyen();
    }, [searchKeyword]); // Chạy lại mỗi khi từ khóa tìm kiếm thay đổi[cite: 4]

    return (
        <Layout>
            <div className="danhmuc-container" style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
                <h2 style={{ borderBottom: '2px solid #ff6b6b', paddingBottom: '10px' }}>
                    {searchKeyword ? `Kết quả tìm kiếm cho: "${searchKeyword}"` : "Tất cả truyện"}
                </h2>

                {loading ? (
                    <p>Đang tải dữ liệu...</p>
                ) : dsTruyen.length > 0 ? (
                    <div className="truyen-grid" style={{ 
                        display: 'grid', 
                        gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', 
                        gap: '20px', 
                        marginTop: '20px' 
                    }}>
                        {dsTruyen.map((truyen) => (
                            <div key={truyen.mat} className="truyen-item-card" style={{ textAlign: 'center' }}>
                                <Link to={`/truyen/${truyen.mat}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                                    <img 
                                        src={`https://hkl-backend-v3uu.onrender.com/images/${truyen.hinhanh}`} 
                                        alt={truyen.tent} 
                                        style={{ width: '100%', height: '280px', objectFit: 'cover', borderRadius: '8px' }}
                                        onError={(e) => { e.target.src = "https://via.placeholder.com/200x280"; }}
                                    />
                                    <h4 style={{ marginTop: '10px', fontSize: '16px' }}>{truyen.tent}</h4>
                                    <p style={{ color: '#888', fontSize: '14px' }}>{truyen.ten_tac_gia}</p>
                                </Link>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div style={{ textAlign: 'center', marginTop: '50px' }}>
                        <p>Không tìm thấy truyện nào phù hợp với từ khóa của bạn.</p>
                        <Link to="/" style={{ color: '#ff6b6b' }}>Quay lại trang chủ</Link>
                    </div>
                )}
            </div>
        </Layout>
    );
};

export default DanhMuc;