import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../layout/layout.jsx';
import "../../static/css/Login.css"; 

const Register = () => {
  // Đảm bảo ban đầu các giá trị là chuỗi rỗng để không hiện thông tin sẵn[cite: 1]
  const [formData, setFormData] = useState({
    tendn: '',
    mk: '',
    confirmMk: '', // Trường xác nhận mật khẩu
    email: '',
    sdt: '',
    ngaysinh: '',
    role: 'reader'
  });

  const [showPassword, setShowPassword] = useState(false); // Trạng thái ẩn/hiện mật khẩu[cite: 2]
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();

    // Kiểm tra độ dài mật khẩu >= 6 ký tự[cite: 1]
    if (formData.mk.length < 6) {
      alert("Mật khẩu phải có ít nhất 6 chữ cái trở lên!");
      return;
    }

    // Kiểm tra mật khẩu nhập lại có khớp không[cite: 1]
    if (formData.mk !== formData.confirmMk) {
      alert("Mật khẩu xác nhận không khớp!");
      return;
    }

    try {
      const response = await fetch("https://hkl-backend.onrender.com/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        // Chỉ gửi những trường mà server cần (bỏ confirmMk)
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
        // Thông báo yêu cầu check Mailtrap thay vì đăng nhập ngay[cite: 2]
        alert(" Một email xác nhận đã được gửi. Vui lòng kiểm tra hộp thư của bạn để kích hoạt tài khoản.");
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
      <div className="login-container">
        <div className="book">
          {/* Trang trái: Giới thiệu giống Login.jsx[cite: 2] */}
          <div className="book-page left-page">
            <div className="intro-content">
              <h1>Gia Nhập HKL</h1>
              <div className="divider"></div>
              <p>Hành trình mới đang chờ bạn.</p>
              <p className="description">Mở ra cánh cửa thế giới truyện chữ đầy màu sắc.</p>
              <div className="book-footer">© 2026 HKL Project</div>
            </div>
          </div>

          {/* Trang phải: Form đăng ký[cite: 2, 3] */}
          <div className="book-page right-page">
            <form onSubmit={handleRegister} className="login-form">
              <h2>Đăng Ký</h2>
              
              <div className="input-group">
                <label>Tên đăng nhập *</label>
                <input 
                  type="text" 
                  value={formData.tendn}
                  placeholder="Bạn muốn được gọi là gì?"
                  required 
                  onChange={(e) => setFormData({...formData, tendn: e.target.value})} 
                />
              </div>

              <div className="input-group password-field" style={{ position: 'relative' }}>
                <label>Mật khẩu * ({'>'}= 6 ký tự)</label>
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

              <div className="input-group">
                <label>Xác nhận mật khẩu *</label>
                <input 
                  type={showPassword ? "text" : "password"} 
                  value={formData.confirmMk}
                  placeholder="Nhập lại mật khẩu..."
                  required 
                  onChange={(e) => setFormData({...formData, confirmMk: e.target.value})} 
                />
              </div>

              <div className="input-group">
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
                <div className="input-group" style={{ flex: 1 }}>
                  <label>Số điện thoại</label>
                  <input 
                    type="text" 
                    value={formData.sdt}
                    placeholder="0987..."
                    onChange={(e) => setFormData({...formData, sdt: e.target.value})} 
                  />
                </div>
                <div className="input-group" style={{ flex: 1 }}>
                  <label>Ngày sinh</label>
                  <input 
                    type="date" 
                    value={formData.ngaysinh}
                    onChange={(e) => setFormData({...formData, ngaysinh: e.target.value})} 
                  />
                </div>
              </div>

              <div className="input-group">
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

              <button type="submit" className="login-btn">
                TẠO TÀI KHOẢN
              </button>

              <div className="form-footer">
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

// Styles bổ trợ cho icon con mắt và select[cite: 3]
const eyeIconStyle = {
  position: 'absolute',
  right: '15px',
  top: '42px',
  cursor: 'pointer',
  fontSize: '1.2rem',
  opacity: 0.7
};

const selectStyle = {
  width: '100%',
  padding: '12px',
  borderRadius: '12px',
  background: 'rgba(255, 255, 255, 0.5)',
  border: '1px solid rgba(255,255,255,0.5)',
  color: '#5d4037',
  fontSize: '1rem'
};

export default Register;