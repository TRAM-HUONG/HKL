import React, { useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import Layout from '../layout/layout.jsx';
import styles from "../../static/css/Login.module.css";

const ResetPassword = () => {
  const [searchParams] = useSearchParams();
  const [newPassword, setNewPassword] = useState('');
  const navigate = useNavigate();
  const token = searchParams.get("token");

  const handleUpdate = async (e) => {
    e.preventDefault();
    const res = await fetch("https://hkl-backend-v3uu.onrender.com/api/auth/reset-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, newPassword }),
    });
    const data = await res.json();
    if (res.ok) {
      alert("Thành công! Hãy đăng nhập lại.");
      navigate("/login");
    } else {
      alert(data.error);
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
              <div className={styles['input-group']}>
                <label>Mật khẩu mới</label>
                <input 
                  type="password" 
                  required 
                  onChange={(e) => setNewPassword(e.target.value)} 
                  placeholder="Nhập mật khẩu mới..." 
                />
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

export default ResetPassword;