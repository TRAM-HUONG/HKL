import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../layout/layout.jsx';
import styles from "../../static/css/Login.module.css";

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [localResetLink, setLocalResetLink] = useState(''); // State lưu link khi chạy trên host Render
  const navigate = useNavigate();

  const handleSendMail = async (e) => {
    e.preventDefault();
    try {
      // Gọi duy nhất link Render theo ý bạn, không cần qua localhost:5000 nữa
      const res = await fetch("http://localhost:5000/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      
      if (res.ok) {
        // Nếu backend đang chạy trên Render (production), nó trả về devLink để đổi luôn
        if (data.devLink) {
          setLocalResetLink(data.devLink);
          alert("Hệ thống đã chặn gửi Email! Bạn hãy click vào liên kết vừa xuất hiện bên dưới để cập nhật mật khẩu trực tiếp.");
        } else {
          // Nếu backend nhận biết bạn đang chạy local, nó báo đã gửi mail thật
          alert(data.message);
        }
      } else {
        alert(data.error || "Có lỗi xảy ra!");
      }
    } catch (err) {
      alert("Lỗi kết nối!");
    }
  };

  return (
    <Layout>
      <div className={styles['login-container']}>
        <div className={`${styles['book']} ${styles['single-page-wrapper']}`}>
          <div className={`${styles['book-page']} ${styles['single-page']}`}>
            <form onSubmit={handleSendMail} className={styles['login-form']}>
              <h2>Khôi phục mật khẩu</h2>
              <p style={{ fontSize: '15px', color: '#1a0f0f', textAlign: 'center', marginBottom: '25px', fontFamily: 'Playfair Display, serif', fontStyle: 'italic' }}>
                Nhập email bạn đã đăng ký để nhận link cập nhật mật khẩu.
              </p>
              <div className={styles['input-group']}>
                <label>Email</label>
                <input type="email" required onChange={(e) => setEmail(e.target.value)} placeholder="email@example.com" />
              </div>
              <button type="submit" className={styles['login-btn']}>Gửi yêu cầu</button>
            </form>

            {/* HIỂN THỊ KHUNG ĐỔI MẬT KHẨU NHANH TRÊN RENDER */}
            {localResetLink && (
              <div style={{ marginTop: '15px', textAlign: 'center', padding: '10px', background: '#fff3cd', border: '1px solid #ffeeba', borderRadius: '4px' }}>
                <p style={{ margin: 0, color: '#856404', fontSize: '14px' }}><b>Chế độ Host:</b> Đã chặn gửi mail để tránh lỗi.</p>
                <a 
                  href={localResetLink} 
                  style={{ color: '#0056b3', textDecoration: 'underline', fontWeight: 'bold', display: 'block', marginTop: '5px' }}
                >
                  👉 Đi đến trang Đặt lại mật khẩu ngay 👈
                </a>
              </div>
            )}

            <div className={styles['form-footer']}>
              <a href="/login">Quay lại Đăng nhập</a>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default ForgotPassword;
