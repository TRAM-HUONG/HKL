import React, { useState, useEffect } from 'react';
import '../../static/css/layout.css';
import { Link, useNavigate, useLocation } from 'react-router-dom';

import heroBackground from '../../static/images/banner.png';

const Layout = ({ children }) => {
  const [bannerImgs, setBannerImgs] = useState([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [theLoaiList, setTheLoaiList] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false); // Trạng thái đóng mở menu mobile
  
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

        if (role === 'TacGia') {
          const restrictedPaths = ['/admin', '/danh-muc', '/the-loai'];
          if (restrictedPaths.some(p => path.startsWith(p))) {
            alert("Tác giả không có quyền truy cập khu vực này!");
            navigate("/quan-ly-tac-pham");
          }
        }
        else if (role === 'DocGia' || !role) {
          const restrictedPaths = ['/admin', '/viet-bai', '/quan-ly-tac-pham', '/dang-ky-truyen'];
          if (restrictedPaths.some(p => path.startsWith(p))) {
            alert("Bạn cần quyền Tác giả để vào đây!");
            navigate("/");
          }
        }
        else if (role === 'Admin') {
          const restrictedPaths = ['/viet-bai', '/dang-ky-truyen'];
          if (restrictedPaths.some(p => path.startsWith(p))) {
            alert("Vui lòng sử dụng đúng tài khoản!");
            navigate("/admin");
          }
        }

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
    // Đóng menu khi chuyển trang trên mobile
    setIsMobileMenuOpen(false);
  }, [location.pathname, navigate]);

  useEffect(() => {
    fetch("https://hkl-backend-v3uu.onrender.com/api/truyen")
      .then((res) => res.json())
      .then((data) => {
        const shuffled = [...data].sort(() => 0.5 - Math.random());
        setBannerImgs(shuffled.slice(0, 10)); 
      })
      .catch((err) => console.error("Lỗi tải banner:", err));

    fetch("https://hkl-backend-v3uu.onrender.com/api/danh-muc")
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
    <div className={`home-container ${isMobileMenuOpen ? 'menu-open' : ''}`}>
      <header className="hero-section" style={{ backgroundImage: `url(${heroBackground})` }}>
        <nav className="navbar">
          {/* Nút Hamburger cho Mobile */}
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
                  onClick={() => setShowDropdown(!showDropdown)} // Hỗ trợ click trên mobile
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
                  src={`https://hkl-backend-v3uu.onrender.com/images/${truyen.hinhanh || truyen.HINHANH}`} 
                  alt={truyen.tentruyen || truyen.TENT} 
                  onError={(e) => { e.target.src = "https://via.placeholder.com/150"; }} 
                />
              </Link>
            </div>
          ))}
        </div>
      </header>

     {/* Chỉ hiển thị thanh tìm kiếm nếu KHÔNG PHẢI là TacGia và KHÔNG PHẢI là Admin */}
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

      <footer className="footer-modern">
        <div className="footer-content">
          <div className="footer-brand">
            <h2 className="footer-logo">HKL<span>.</span></h2>
            <p className="footer-slogan">Hệ thống quản lý thư viện số hiện đại.</p>
          </div>
          <nav className="footer-nav">
            <Link to="/" className="f-link">Trang Chủ</Link>
            {role === 'Admin' && <Link to="/admin" className="f-link">Quản trị</Link>}
            {role === 'TacGia' && (
              <>
                <Link to="/dang-ky-truyen" className="f-link">Đăng truyện</Link>
                <Link to="/quan-ly-tac-pham" className="f-link">Tác phẩm</Link>
              </>
            )}
            {user && role !== 'Admin' && (
               <Link to="/nap-tien" className="f-link highlight">Nạp tiền ngay</Link>
            )}
          </nav>
        </div>
        <div className="footer-bottom">
          <p>© 2026 HKL Team. Trang quản trị bảo mật cao.</p>
        </div>
      </footer>
    </div>
  );
};

export default Layout;