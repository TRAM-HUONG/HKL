import React, { useState, useEffect } from 'react';
import '../../static/css/layout.css';


import ANHNEN from '../../static/images/ANHNEN.jpeg';
import ANHTOUR from '../../static/images/ANHTOUR.jpeg';
import DANHGIA from '../../static/images/DANHGIA.jpg';
import DATVE from '../../static/images/DATVE.jpg';
import DICHVUKHAC from '../../static/images/DICHVUKHAC.jpg';
import NGUOIDUNG from '../../static/images/NGUOIDUNG.jpg';
// Nếu bạn có thêm ảnh, hãy import tiếp ở đây...

const Layout = ({ children }) => {
  // Chèn lại mảng banner theo tên file bạn đã upload
  const bannerImgs = [
    ANHNEN,
    ANHTOUR,
    DANHGIA,
    DATVE,
    DICHVUKHAC,
    NGUOIDUNG,
    ANHNEN,    // Lặp lại hoặc chèn ảnh khác để đủ 10 ảnh như cũ
    ANHTOUR,
    DANHGIA,
    DATVE
  ];

  // ... các phần logic giữ nguyên ...

  const [activeIndex, setActiveIndex] = useState(0);

  // Tự động chuyển truyện sau mỗi 3 giây
  useEffect(() => {
    const timer = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % bannerImgs.length);
    }, 3000);
    return () => clearInterval(timer);
  }, [bannerImgs.length]);

  // Hàm xác định vị trí để áp dụng CSS 3D
  const getCardClass = (index) => {
    const total = bannerImgs.length;
    const diff = (index - activeIndex + total) % total;

    if (diff === 0) return "card-active";
    if (diff === 1) return "card-next-1";
    if (diff === 2) return "card-next-2";
    if (diff === 3) return "card-next-3";
    if (diff === 4) return "card-next-4";
    if (diff === total - 1) return "card-prev-1";
    if (diff === total - 2) return "card-prev-2";
    if (diff === total - 3) return "card-prev-3";
    if (diff === total - 4) return "card-prev-4";
    
    return "card-hidden";
  };

  return (
    <div className="home-container">
      {/* HEADER: Navbar mờ và Nút đăng nhập bên phải */}
      <header className="hero-section">
        <nav className="navbar">
          <ul className="nav-links">
            <li>Trang Chủ</li>
            <li>Giới thiệu</li>
            <li>Danh mục</li>
            <li>BXH</li>
          </ul>
          <div className="auth-buttons">
             <span className="auth-btn">Đăng ký</span>
             <span className="auth-btn">Đăng nhập</span>
          </div>
        </nav>
        
        {/* Banner 10 truyện nhỏ dần */}
        <div className="carousel-3d-container">
           {bannerImgs.map((img, idx) => (
             <div key={idx} className={`carousel-card ${getCardClass(idx)}`}>
               <img src={img} alt={`banner-${idx}`} />
             </div>
           ))}
        </div>
      </header>

      {/* SEARCH BAR */}
      <div className="search-wrapper">
        <div className="search-box">
          <input type="text" placeholder="Bạn muốn tìm truyện gì hôm nay?" />
          <button className="search-icon">🔍</button>
        </div>
      </div>

      <main className="main-content">{children}</main>


      {/* FOOTER 4 CỘT */}
      <footer className="footer-container">
        <div className="footer-column">
          <h2 className="footer-logo">HKL</h2>
          <p>Chào mừng bạn đến với nền tảng đọc truyện online miễn phí với hàng ngàn đầu sách phong phú.</p>
        </div>
        <div className="footer-column">
          <h3>KHÁM PHÁ</h3>
          <ul>
            <li>Truyện Mới Cập Nhật</li>
            <li>Truyện Hot Trong Tuần</li>
            <li>Truyện Đã Hoàn Thành</li>
            <li>Bảng Xếp Hạng Top 100</li>
          </ul>
        </div>
        <div className="footer-column">
          <h3>CHÍNH SÁCH</h3>
          <ul>
            <li>Điều Khoản Sử Dụng</li>
            <li>Chính Sách Bảo Mật</li>
            <li>Quy Định Bản Quyền</li>
          </ul>
        </div>
        <div className="footer-column">
          <h3>LIÊN HỆ</h3>
          <p>Email: support@hkl.com</p>
          <p>Fanpage: Facebook.com/hkl</p>
          <p>Zalo: 0988*******</p>
        </div>
      </footer>
    </div>
  );
};

export default Layout;