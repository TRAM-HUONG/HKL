import React, { useState } from 'react';
import Layout from '../layout/layout.jsx';
import styles from "../../static/css/Login.module.css";

const ForgotPassword = () => {
  const [email, setEmail] = useState('');

  const handleSendMail = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch("https://hkl-backend-v3uu.onrender.com/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      alert(data.message || data.error);
    } catch (err) {
      alert("Lỗi kết nối!");
    }
  };

  return (
    <Layout>
      <div className={styles['login-container']}>
        {/* Thêm styles['single-page-wrapper'] để loại bỏ thanh gáy đè chữ */}
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