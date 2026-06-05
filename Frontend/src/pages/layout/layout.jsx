import React, { useState, useEffect } from 'react';
import '../../static/css/layout.css';
import { Link, useNavigate, useLocation } from 'react-router-dom';

import heroBackground from '../../static/images/banner.png';
import footerImg from '../../static/images/Footer.png';
import bodyBackground from '../../static/images/Br.png';

const Layout = ({ children }) => {
  const [bannerImgs, setBannerImgs] = useState([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [theLoaiList, setTheLoaiList] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false); 
  
  const [searchTerm, setSearchTerm] = useState("");
  
  const [user, setUser] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    const path = location.pathname;

    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
        const role = parsedUser.VAI_TRO || parsedUser.vai_tro;

        // 1. Kiểm tra quyền cho Tác giả
        if (role === 'TacGia') {
          const restrictedPaths = ['/admin', '/danh-muc', '/the-loai'];
          if (restrictedPaths.some(p => path.startsWith(p))) {
            navigate("/forbidden");
          }
        }
        // 2. Kiểm tra quyền cho Độc giả
        else if (role === 'DocGia' || !role) {
          const restrictedPaths = ['/admin', '/viet-bai', '/quan-ly-tac-pham', '/dang-ky-truyen'];
          if (restrictedPaths.some(p => path.startsWith(p))) {
            navigate("/forbidden");
          }
        }
        // 3. Kiểm tra quyền cho Admin: CHẶN KHÔNG CHO VÀO TRANG TÁC GIẢ
        else if (role === 'Admin') {
          const restrictedPaths = ['/viet-bai', '/dang-ky-truyen', '/quan-ly-tac-pham'];
          if (restrictedPaths.some(p => path.startsWith(p))) {
            navigate("/forbidden"); // Đẩy sang trang 403 khi Admin cố vào trang tác giả
          }
        }

        // Điều hướng khi ở trang chủ dựa trên vai trò
        if (path === "/") {
          if (role === 'Admin') {
            navigate("/admin");
          } else if (role === 'TacGia') {
            navigate("/quan-ly-tac-pham"); 
          }
        }

      } catch (err) {
        console.error("Lỗi xác thực người dùng:", err);
      }
    } else {
      const privatePaths = ['/admin', '/viet-bai', '/quan-ly-tac-pham', '/dang-ky-truyen', '/profile'];
      if (privatePaths.some(p => path.startsWith(p))) {
        alert("Vui lòng đăng nhập để truy cập tính năng này!");
        navigate("/login");
      }
    }
    setIsMobileMenuOpen(false);
  }, [location.pathname, navigate]);

  useEffect(() => {
    fetch("http://localhost:5000/api/truyen")
      .then((res) => res.json())
      .then((data) => {
        const shuffled = [...data].sort(() => 0.5 - Math.random());
        setBannerImgs(shuffled.slice(0, 10)); 
      })
      .catch((err) => console.error("Lỗi tải banner:", err));

    fetch("http://localhost:5000/api/danh-muc")
      .then((res) => res.json())
      .then((data) => setTheLoaiList(data))
      .catch((err) => console.error("Lỗi tải danh mục:", err));
  }, []);

  useEffect(() => {
    if (bannerImgs.length > 0) {
      const timer = setInterval(() => {
        setActiveIndex((prev) => (prev + 1) % bannerImgs.length);
      }, 3000);
      return () => clearInterval(timer);
    }
  }, [bannerImgs.length]);

  const handleLogout = () => {
    localStorage.removeItem("user");
    setUser(null);
    navigate("/login");
  };

  const handleSearch = () => {
    if (searchTerm.trim()) {
      navigate(`/truyen?search=${encodeURIComponent(searchTerm.trim())}`);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const getFirstLetter = (name) => (name ? name.charAt(0).toUpperCase() : "?");

  const getCardClass = (index) => {
    const total = bannerImgs.length;
    const diff = (index - activeIndex + total) % total;
    if (diff === 0) return "card-active"; 
    if (diff >= 1 && diff <= 4) return `card-next-${diff}`;
    if (diff >= total - 4) return `card-prev-${total - diff}`;
    return "card-hidden";
  };

  const role = user?.VAI_TRO || user?.vai_tro;

  return (
    <div 
      className={`home-container ${isMobileMenuOpen ? 'menu-open' : ''}`}
      style={{ 
        backgroundImage: `url(${bodyBackground})`,
        backgroundAttachment: 'fixed',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        minHeight: '100vh'
      }}
    >
      <header 
        className="hero-section" 
        style={{ 
          backgroundImage: `url(${heroBackground})`,
          backgroundRepeat: 'no-repeat',
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        }}
      >
        <nav className="navbar">
          <div className="mobile-menu-icon" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
            <span className="bar"></span>
            <span className="bar"></span>
            <span className="bar"></span>
          </div>

          <ul className={`nav-links ${isMobileMenuOpen ? 'active' : ''}`}>
            {role === 'TacGia' ? (
              <>
                <li><Link to="/dang-ky-truyen" className="nav-item-link highlight-btn">✨ Đăng Truyện</Link></li>
                <li><Link to="/viet-bai" className="nav-item-link">Sáng tác mới</Link></li>
                <li><Link to="/quan-ly-tac-pham" className="nav-item-link">Quản lý tác phẩm</Link></li>
              </>
            ) : (
              <>
                <li><Link to="/" className="nav-item-link">Trang Chủ</Link></li>
                <li><Link to="/truyen" className="nav-item-link">Truyện</Link></li>
                <li><Link to="/about" className="nav-item-link">Giới thiệu</Link></li>
                <li 
                  className="dropdown-wrapper"
                  onMouseEnter={() => setShowDropdown(true)} 
                  onMouseLeave={() => setShowDropdown(false)}
                  onClick={() => setShowDropdown(!showDropdown)} 
                >
                  Danh mục ▾
                  {showDropdown && (
                    <ul className="dropdown-menu">
                      {theLoaiList.map((tl) => (
                        <li key={tl.matl}><Link to={`/the-loai/${tl.matl}`}>{tl.tentl}</Link></li>
                      ))}
                    </ul>
                  )}
                </li>
                {role === 'Admin' && (
                  <li><Link to="/admin" className="nav-item-link admin-highlight">Quản trị hệ thống</Link></li>
                )}
              </>
            )}
          </ul>

          <div className="auth-buttons">
            {user && role === 'DocGia' && (
              <Link to="/nap-tien" className="deposit-btn">
                <span className="icon">💰</span> <span className="btn-text">Nạp tiền</span>
              </Link>
            )}

            {user ? (
              <div className="user-logged-in">
                <Link to="/profile" className="user-profile-link">
                  <div className="user-avatar-circle">
                    {getFirstLetter(user.TENDN || user.tendn)}
                  </div>
                </Link>
                <button onClick={handleLogout} className="auth-btn logout-style">Thoát</button>
              </div>
            ) : (
              <>
                <Link to="/register" className="auth-btn hide-mobile">Đăng ký</Link>
                <Link to="/login" className="auth-btn">Đăng nhập</Link>
              </>
            )}
          </div>
        </nav>
        
        <div className="carousel-3d-container">
          {bannerImgs.map((truyen, idx) => (
            <div key={idx} className={`carousel-card ${getCardClass(idx)}`}>
              <Link to={`/truyen/${truyen.matruyen || truyen.MAT || truyen.mat}`}>
                <img 
                  src={`http://localhost:5000/images/${truyen.hinhanh || truyen.HINHANH}`} 
                  alt={truyen.tentruyen || truyen.TENT} 
                  onError={(e) => { e.target.src = "https://via.placeholder.com/150"; }} 
                />
              </Link>
            </div>
          ))}
        </div>
      </header>

      {role !== 'TacGia' && role !== 'Admin' && (
        <div className="search-wrapper">
          <div className="search-box">
            <input 
              type="text" 
              placeholder="Bạn muốn tìm truyện gì hôm nay?" 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyDown={handleKeyDown}
            />
            <button className="search-icon" onClick={handleSearch}>🔍</button>
          </div>
        </div>
      )}

      <main className="main-content">{children}</main>

      <footer 
        className="footer-modern"
        style={{
          backgroundImage: `url(${footerImg})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          padding: '60px 0 30px 0',
          color: '#462bb3' 
        }}
      >
        <div className="footer-container">
          <div className="footer-column contact-info">
            <h2 className="footer-logo">HKL - Thế Giới Truyện</h2>
            <div className="footer-contact-details">
              <p>📍 Địa chỉ: ​Vườn Địa Đàng Tri Thức</p>
              <p>📧 Email: lalalasuki222@gmail.com</p>
              <p>📞 Hotline: 0972380225</p>
            </div>
            
            <div className="footer-social-networks" style={{ marginTop: '15px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <a 
                href="https://www.facebook.com/share/1SGKA1fU2w/" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="f-link"
                style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: '600' }}
              >
                🔵 Fanpage Facebook Quảng Bá
              </a>
              <a 
                href="https://zalo.me/g/x6t9ll3ux6mtkmw34nlu" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="f-link"
                style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: '600' }}
              >
                💬 Nhóm Diễn Đàn Web Truyện (Zalo)
              </a>
              <a 
                href="https://zalo.me/84972380225" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="f-link"
                style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: '600', color: '#e67e22' }}
              >
                📞 Liên Hệ Nhà Quản Trị Hệ Thống
              </a>
            </div>
            
            <nav className="footer-quick-links" style={{ marginTop: '20px' }}>
              <Link to="/" className="f-link">Trang Chủ</Link>
              {user && role !== 'DocGia' && (
                 <Link to="/nap-tien" className="f-link highlight-footer">Nạp tiền</Link>
              )}
            </nav>
          </div>

          <div className="footer-column slogan-area">
            <h3 className="slogan-title">Mở Sách Ngay - Thay Cảm Xúc</h3>
            <p className="slogan-text">
              "Nơi cảm xúc thăng hoa cùng từng trang truyện. Mở sách ngay, để trái tim bạn được chạm vào những câu chuyện tuyệt vời nhất!"
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Layout;