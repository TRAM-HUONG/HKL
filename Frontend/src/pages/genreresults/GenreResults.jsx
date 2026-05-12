import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import Layout from '../layout/layout.jsx';
import "../../static/css/GenreResults.css";

const GenreResults = () => {
    const { matl } = useParams(); // Lấy TL001, TL002... từ URL[cite: 7]
    const [listTruyen, setListTruyen] = useState([]);
    const [loading, setLoading] = useState(true);
    const [tenTheLoai, setTenTheLoai] = useState("");

    useEffect(() => {
        setLoading(true);
        // Gọi API lọc truyện theo thể loại[cite: 5, 7]
        fetch(`http://localhost:5000/api/danh-muc/${matl}/truyen`)
            .then(res => res.json())
            .then(data => {
                setListTruyen(data);
                if (data.length > 0) {
                    setTenTheLoai(data[0].tentl || data[0].TENTL);
                }
                setLoading(false);
            })
            .catch(err => {
                console.error("Lỗi tải truyện theo thể loại:", err);
                setLoading(false);
            });
    }, [matl]); // Chạy lại khi người dùng chọn thể loại khác trên menu[cite: 7]

    if (loading) return <Layout><div className="loader-container"><div className="loader"></div></div></Layout>;

    return (
        <Layout>
            <div className="genre-results-container">
                <header className="genre-header">
                    <h2 className="genre-title">
                        Thể loại: <span>{tenTheLoai || "Đang cập nhật"}</span>
                    </h2>
                    <p className="results-count">Tìm thấy {listTruyen.length} tác phẩm</p>
                </header>

                <div className="genre-grid">
                    {listTruyen.length > 0 ? (
                        listTruyen.map((truyen) => (
                            <Link to={`/truyen/${truyen.mat || truyen.MAT}`} key={truyen.mat || truyen.MAT} className="book-card-link">
                                <div className="book-card-item">
                                    <div className="book-image-wrapper">
                                        <img 
                                            src={`http://localhost:5000/images/${truyen.hinhanh || truyen.HINHANH}`} 
                                            alt={truyen.tent || truyen.TENT} 
                                            onError={(e) => { e.target.src = "https://via.placeholder.com/200x300?text=No+Cover"; }}
                                        />
                                        <div className="book-badge">{truyen.trangthai || truyen.TRANGTHAI}</div>
                                    </div>
                                    <div className="book-info">
                                        <h4>{truyen.tent || truyen.TENT}</h4>
                                        <p className="book-author">🖋️ {truyen.tac_gia || "Đang cập nhật"}</p>
                                    </div>
                                </div>
                            </Link>
                        ))
                    ) : (
                        <div className="empty-results">
                            <p>🌵 Hiện chưa có truyện nào thuộc thể loại này.</p>
                        </div>
                    )}
                </div>
            </div>
        </Layout>
    );
};

export default GenreResults;