import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Layout from '../layout/layout.jsx';
import styles from "../../static/css/Login.module.css";

const Login = () => {
  const [tendn, setTendn] = useState('');
  const [mk, setMk] = useState('');
  const [showPassword, setShowPassword] = useState(false); // Thêm trạng thái ẩn/hiện mật khẩu
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from || "/";

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch("http://localhost:5173//api/auth/login", {
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
      <div className={styles['login-container']}>
        <div className={styles['book']}>
          {/* Trang trái: Giới thiệu */}
          <div className={`${styles['book-page']} ${styles['left-page']}`}>
            <div className={styles['intro-content']}>
              <h1>HKL Story</h1>
              <div className={styles['divider']}></div>
              <p>Chào mừng bạn đến với thế giới của những con chữ.</p>
              <p className={styles['description']}>
                Nơi hội tụ những bộ truyện chữ đặc sắc, từ tiên hiệp, kiếm hiệp đến ngôn tình hiện đại. 
                Hãy đăng nhập để lưu lại lịch sử đọc và theo dõi những chương mới nhất.
              </p>
              <div className={styles['book-footer']}>© 2026 HKL Project</div>
            </div>
          </div>

          {/* Trang phải: Form đăng nhập */}
          <div className={`${styles['book-page']} ${styles['right-page']}`}>
            <form onSubmit={handleLogin} className={styles['login-form']}>
              <h2>Đăng Nhập</h2>
              <div className={styles['input-group']}>
                <label>Tên đăng nhập</label>
                <input 
                  type="text" 
                  placeholder="Nhập tên của bạn..." 
                  onChange={(e) => setTendn(e.target.value)}
                  required 
                />
              </div>
              
              {/* CẬP NHẬT: Ô nhập mật khẩu có icon bật tắt */}
              <div className={styles['input-group']} style={{ position: 'relative' }}>
                <label>Mật khẩu</label>
                <input 
                  type={showPassword ? "text" : "password"} 
                  placeholder="••••••••" 
                  onChange={(e) => setMk(e.target.value)}
                  required 
                />
                <span 
                  onClick={() => setShowPassword(!showPassword)}
                  style={eyeIconStyle}
                >
                  {showPassword ? "👁️" : "🙈"}
                </span>
              </div>

              <button type="submit" className={styles['login-btn']}>
                Mở Trang Sách
              </button>
            </form>
            <div className={styles['form-footer']}>
              <div style={{ marginBottom: '10px' }}>
                <a href="/forgot-password" style={{ fontSize: '14px', color: '#800000' }}>Quên mật khẩu?</a>
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

// Style inline bổ trợ căn chỉnh icon con mắt cho ô mật khẩu đăng nhập
const eyeIconStyle = {
  position: 'absolute',
  right: '15px',
  top: '36px', 
  cursor: 'pointer',
  fontSize: '1.2rem',
  opacity: 0.7,
  zIndex: 10 
};

export default Login;