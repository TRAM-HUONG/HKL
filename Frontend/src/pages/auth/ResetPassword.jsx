import React, { useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import Layout from '../layout/layout.jsx';
import styles from "../../static/css/Login.module.css";

const ResetPassword = () => {
  const [searchParams] = useSearchParams();
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState(''); // Thêm state cho mật khẩu xác nhận
  const [showPassword, setShowPassword] = useState(false); // Thêm state ẩn/hiện mật khẩu mới
  const [showConfirmPassword, setShowConfirmPassword] = useState(false); // Thêm state ẩn/hiện mật khẩu xác nhận
  
  const navigate = useNavigate();
  const token = searchParams.get("token");

  const handleUpdate = async (e) => {
    e.preventDefault();

    // Kiểm tra độ dài mật khẩu tối thiểu (nếu cần đồng bộ với bên đăng ký)
    if (newPassword.length < 6) {
      alert("Mật khẩu mới phải có ít nhất 6 chữ cái trở lên!");
      return;
    }

    // Kiểm tra mật khẩu nhập lại có trùng khớp không
    if (newPassword !== confirmPassword) {
      alert("Mật khẩu xác nhận không khớp!");
      return;
    }

    try {
      const res = await fetch("https://hkl-backend-v3uu.onrender.com/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, newPassword }), // Gửi kèm mã mã hóa và mật khẩu mới
      });
      const data = await res.json();
      
      if (res.ok) {
        alert("Thành công! Hãy đăng nhập lại.");
        navigate("/login");
      } else {
        // Hiển thị chính xác thông báo lỗi từ phía Backend trả về (Ví dụ: "Link đã hết hạn hoặc không hợp lệ!")
        alert(data.error || "Cập nhật mật khẩu thất bại!"); 
      }
    } catch (err) {
      alert("Lỗi kết nối đến máy chủ Backend!");
    }
  };

  return (
    <Layout>
      <div className={styles['reset-password-container']}>
        {/* Thêm styles['single-page-wrapper'] để tạo khung trang đơn gọn gàng không bị lằn gáy */}
        <div className={`${styles['reset-password-card']} ${styles['single-page-wrapper']}`}>
          <div className={`${styles['book-page']} ${styles['single-page']}`}>
            <form onSubmit={handleUpdate} className={styles['reset-password-form']}>
              <h2>Mật khẩu mới</h2>
              
              {/* Ô nhập mật khẩu mới có con mắt */}
              <div className={styles['input-group']} style={{ position: 'relative' }}>
                <label>Mật khẩu mới</label>
                <input 
                  type={showPassword ? "text" : "password"} 
                  value={newPassword}
                  required 
                  onChange={(e) => setNewPassword(e.target.value)} 
                  placeholder="Nhập mật khẩu mới..." 
                />
                <span 
                  onClick={() => setShowPassword(!showPassword)}
                  style={eyeIconStyle}
                >
                  {showPassword ? "👁️" : "🙈"}
                </span>
              </div>

              {/* Ô xác nhận mật khẩu mới có con mắt */}
              <div className={styles['input-group']} style={{ position: 'relative' }}>
                <label>Xác nhận mật khẩu mới</label>
                <input 
                  type={showConfirmPassword ? "text" : "password"} 
                  value={confirmPassword}
                  required 
                  onChange={(e) => setConfirmPassword(e.target.value)} 
                  placeholder="Nhập lại mật khẩu mới..." 
                />
                <span 
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  style={eyeIconStyle}
                >
                  {showConfirmPassword ? "👁️" : "🙈"}
                </span>
              </div>

              <button type="submit" className={styles['reset-password-btn']}>
                Cập nhật mật khẩu
              </button>
            </form>
          </div>
        </div>
      </div>
    </Layout>
  );
};

// Style cho icon con mắt (đồng bộ với file Register của bạn)
const eyeIconStyle = {
  position: 'absolute',
  right: '15px',
  top: '36px', 
  cursor: 'pointer',
  fontSize: '1.2rem',
  opacity: 0.7,
  zIndex: 10 
};

export default ResetPassword;
