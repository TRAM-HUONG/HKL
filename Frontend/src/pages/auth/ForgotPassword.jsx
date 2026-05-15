import React, { useState } from 'react';
import Layout from '../layout/layout.jsx';

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
      <div className="login-container"> {/* Dùng chung CSS với trang Login */}
        <div className="book">
          <div className="book-page right-page" style={{ margin: 'auto' }}>
            <form onSubmit={handleSendMail} className="login-form">
              <h2>Khôi phục mật khẩu</h2>
              <p style={{ fontSize: '14px', color: '#666' }}>Nhập email bạn đã đăng ký để nhận link cập nhật mật khẩu.</p>
              <div className="input-group">
                <label>Email</label>
                <input type="email" required onChange={(e) => setEmail(e.target.value)} />
              </div>
              <button type="submit" className="login-btn">Gửi yêu cầu</button>
            </form>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default ForgotPassword;