import React, { useState, useEffect } from 'react';
import { useLocation, Link } from 'react-router-dom';
import axios from 'axios';
import Layout from '../layout/layout.jsx'; 
import "../../static/css/Truyen.css"; 

const DanhMuc = () => {
    const [dsTruyen, setDsTruyen] = useState([]);
    const [loading, setLoading] = useState(true);
    
    const location = useLocation();
    const queryParams = new URLSearchParams(location.search);
    const searchKeyword = queryParams.get('search') || "";

    useEffect(() => {
        const fetchTruyen = async () => {
            setLoading(true);
            try {
                const res = await axios.get("https://hkl-backend-v3uu.onrender.com/api/truyen");
                const allTruyen = res.data;

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
    }, [searchKeyword]);

    return (
        <Layout>
            <div className="danhmuc-container" style={{ padding: '40px 20px', maxWidth: '1200px', margin: '0 auto' }}>
                <header style={{ marginBottom: '40px', textAlign: 'center' }}> {/* Căn giữa header */}
            <h2 style={{ 
                color: '#ff0505', 
                fontSize: '2.5rem', // Tăng nhẹ kích thước để nổi bật
                fontWeight: 'bold',
                textTransform: 'uppercase',
                display: 'inline-block', // Để border-bottom chỉ dài bằng chữ
                position: 'relative',
                paddingBottom: '10px'
            }}>
                {searchKeyword ? `Kết quả tìm kiếm: ${searchKeyword}` : "Tàng Thư Các"}
                
                {/* Tạo một đường gạch dưới trang trí thay cho border-left cũ */}
                <span style={{
                    content: '""',
                    position: 'absolute',
                    bottom: 0,
                    left: '50%',
                    transform: 'translateX(-50%)',
                    width: '60px',
                    height: '4px',
                    backgroundColor: '#ff6b6b',
                    borderRadius: '2px'
                }}></span>
            </h2>
        </header>

                {loading ? (
                    <div style={{ textAlign: 'center', padding: '100px' }}>
                        <div className="loader" style={{ color: '#ff6b6b', fontSize: '1.2rem' }}>
                            Đang tải truyện...
                        </div>
                    </div>
                ) : dsTruyen.length > 0 ? (
                    <div className="truyen-grid">
                        {dsTruyen.map((truyen) => (
                            <div key={truyen.mat} className="truyen-item-card">
                                <Link to={`/truyen/${truyen.mat}`} className="card-link">
                                    <div className="img-wrapper">
                                        <img 
                                            src={`https://hkl-backend-v3uu.onrender.com/images/${truyen.hinhanh}`} 
                                            alt={truyen.tent}
                                                onError={(e) => { e.target.src = "https://via.placeholder.com/200x280"; }}
                                        />
                                    </div>
                                    <div className="card-content">
                                        <h4 className="truyen-title">{truyen.tent}</h4>
                                        <p className="truyen-author">{truyen.ten_tac_gia}</p>
                                    </div>
                                </Link>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div style={{ textAlign: 'center', marginTop: '80px', color: '#fff' }}>
                            <Link to="/" style={{ 
                            display: 'inline-block',
                            marginTop: '20px',
                            color: '#ff6b6b', 
                            textDecoration: 'none',
                            fontWeight: 'bold',
                            border: '1px solid #ff6b6b',
                            padding: '10px 25px',
                            borderRadius: '30px'
                        }}>
                            Quay lại trang chủ
                        </Link>
                    </div>
                )}
            </div>
        </Layout>
    );
};

export default DanhMuc;
