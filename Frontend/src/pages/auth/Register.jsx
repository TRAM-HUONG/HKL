import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../layout/layout.jsx';
import styles from "../../static/css/Login.module.css"; 

const Register = () => {
  const [formData, setFormData] = useState({
    tendn: '',
    mk: '',
    confirmMk: '', 
    email: '',
    sdt: '',
    ngaysinh: '',
    role: 'reader'
  });

  const [showPassword, setShowPassword] = useState(false); 
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();

    if (formData.mk.length < 6) {
      alert("Mật khẩu phải có ít nhất 6 chữ cái trở lên!");
      return;
    }

    if (formData.mk !== formData.confirmMk) {
      alert("Mật khẩu xác nhận không khớp!");
      return;
    }

    try {
      // Tự động chuyển đổi link API giữa localhost và Render theo môi trường chạy của giao diện
      const API_BASE = window.location.hostname === 'localhost' 
        ? "https://hkl-backend-v3uu.onrender.com" 
        : "https://hkl-backend-v3uu.onrender.com";

      const response = await fetch(`${API_BASE}/api/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tendn: formData.tendn,
          mk: formData.mk,
          email: formData.email,
          sdt: formData.sdt,
          ngaysinh: formData.ngaysinh,
          role: formData.role
        }),
      });

      const data = await response.json();

      if (response.ok) {
        // Sử dụng data.message linh hoạt từ server trả về (Hiện thông báo check mail ở local hoặc Đăng ký thành công ở Render)
        alert(data.message || "Đăng ký thành công!");
        navigate("/login");
      } else {
        alert(data.error);
      }
    } catch (err) {
      alert("Lỗi kết nối server!");
    }
  };

  return (
    <Layout>
      <div className={styles['login-container']}>
        <div className={styles['book']}>
          {/* Trang trái: Giới thiệu */}
          <div className={`${styles['book-page']} ${styles['left-page']}`}>
            <div className={styles['intro-content']}>
              <h1>Gia Nhập HKL</h1>
              <div className={styles['divider']}></div>
              <p>Hành trình mới đang chờ bạn.</p>
              <p className={styles['description']}>Mở ra cánh cửa thế giới truyện chữ đầy màu sắc.</p>
              <div className={styles['book-footer']}>© 2026 HKL Project</div>
            </div>
          </div>

          {/* Trang phải: Form đăng ký */}
          <div className={`${styles['book-page']} ${styles['right-page']}`} style={{ padding: '25px 50px' }}>
            <form onSubmit={handleRegister} className={styles['login-form']}>
              <h2>Đăng Ký</h2>
              
              <div className={styles['input-group']}>
                <label>Tên đăng nhập *</label>
                <input 
                  type="text" 
                  value={formData.tendn}
                  placeholder="Bạn muốn được gọi là gì?"
                  required 
                  onChange={(e) => setFormData({...formData, tendn: e.target.value})} 
                />
              </div>

              <div className={styles['input-group']} style={{ position: 'relative' }}>
                <label>Mật khẩu * (&gt;= 6 ký tự)</label>
                <input 
                  type={showPassword ? "text" : "password"} 
                  value={formData.mk}
                  placeholder="••••••••"
                  required 
                  onChange={(e) => setFormData({...formData, mk: e.target.value})} 
                />
                <span 
                  onClick={() => setShowPassword(!showPassword)}
                  style={eyeIconStyle}
                >
                  {showPassword ? "👁️" : "🙈"}
                </span>
              </div>

              <div className={styles['input-group']}>
                <label>Xác nhận mật khẩu *</label>
                <input 
                  type={showPassword ? "text" : "password"} 
                  value={formData.confirmMk}
                  placeholder="Nhập lại mật khẩu..."
                  required 
                  onChange={(e) => setFormData({...formData, confirmMk: e.target.value})} 
                />
              </div>

              <div className={styles['input-group']}>
                <label>Email *</label>
                <input 
                  type="email" 
                  value={formData.email}
                  placeholder="email@example.com"
                  required 
                  onChange={(e) => setFormData({...formData, email: e.target.value})} 
                />
              </div>

              <div style={{ display: 'flex', gap: '10px' }}>
                <div className={styles['input-group']} style={{ flex: 1 }}>
                  <label>Số điện thoại</label>
                  <input 
                    type="text" 
                    value={formData.sdt}
                    placeholder="0987..."
                    onChange={(e) => setFormData({...formData, sdt: e.target.value})} 
                  />
                </div>
                <div className={styles['input-group']} style={{ flex: 1 }}>
                  <label>Ngày sinh</label>
                  <input 
                    type="date" 
                    value={formData.ngaysinh}
                    onChange={(e) => setFormData({...formData, ngaysinh: e.target.value})} 
                  />
                </div>
              </div>

              <div className={styles['input-group']}>
                <label>Bạn tham gia với vai trò?</label>
                <select 
                  style={selectStyle}
                  value={formData.role}
                  onChange={(e) => setFormData({...formData, role: e.target.value})}
                >
                  <option value="reader">Độc giả (Người đọc truyện)</option>
                  <option value="author">Tác giả (Người đăng truyện)</option>
                </select>
              </div>

              <button type="submit" className={styles['login-btn']}>
                Tạo Tài Khoản
              </button>

              <div className={styles['form-footer']}>
                <span>Đã có tài khoản?</span>
                <a href="/login">Đăng nhập</a>
              </div>
            </form>
          </div>
        </div>
      </div>
    </Layout>
  );
};

const eyeIconStyle = {
  position: 'absolute',
  right: '15px',
  top: '36px', 
  cursor: 'pointer',
  fontSize: '1.2rem',
  opacity: 0.7,
  zIndex: 10 
};

const selectStyle = {
  width: '100%',
  padding: '12px',
  borderRadius: '4px',
  background: '#ffffff',
  border: '2px solid #caa34b',
  color: '#1a0f0f',
  fontFamily: 'Playfair Display, serif',
  fontWeight: '700',
  fontSize: '1rem'
};

export default Register;