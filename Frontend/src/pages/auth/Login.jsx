import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Layout from '../layout/layout.jsx';
import "../../static/css/Login.css";


const Login = () => {
  const [tendn, setTendn] = useState('');
  const [mk, setMk] = useState('');
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from || "/";

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch("http://localhost:5000/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tendn, mk }),
      });

      const data = await response.json();

      if (response.ok) {
        alert("Đăng nhập thành công!");
        localStorage.setItem("user", JSON.stringify(data.user));
        navigate(from, { replace: true });
      } else {
        alert(data.error);
      }
    } catch (err) {
      alert("Không thể kết nối đến máy chủ!");
    }
  };

  return (
    <Layout>
      <div className="login-container">
        <div className="book">
          {/* Trang trái: Giới thiệu */}
          <div className="book-page left-page">
            <div className="intro-content">
              <h1>HKL Story</h1>
              <div className="divider"></div>
              <p>Chào mừng bạn đến với thế giới của những con chữ.</p>
              <p className="description">
                Nơi hội tụ những bộ truyện chữ đặc sắc, từ tiên hiệp, kiếm hiệp đến ngôn tình hiện đại. 
                Hãy đăng nhập để lưu lại lịch sử đọc và theo dõi những chương mới nhất.
              </p>
              <div className="book-footer">© 2026 HKL Project</div>
            </div>
          </div>

          {/* Trang phải: Form đăng nhập */}
          <div className="book-page right-page">
            <form onSubmit={handleLogin} className="login-form">
              <h2>Đăng Nhập</h2>
              <div className="input-group">
                <label>Tên đăng nhập</label>
                <input 
                  type="text" 
                  placeholder="Nhập tên của bạn..." 
                  onChange={(e) => setTendn(e.target.value)}
                  required 
                />
              </div>
              <div className="input-group">
                <label>Mật khẩu</label>
                <input 
                  type="password" 
                  placeholder="••••••••" 
                  onChange={(e) => setMk(e.target.value)}
                  required 
                />
              </div>
              <button type="submit" className="login-btn">
                Mở Trang Sách
              </button>
              
            </form>
            <div className="form-footer">
  <div style={{ marginBottom: '10px' }}>
    <a href="/forgot-password" style={{ fontSize: '14px', color: '#5d4037' }}>Quên mật khẩu?</a>
  </div>
  <span>Chưa có tài khoản?</span>
  <a href="/register">Đăng ký ngay</a>
</div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Login;