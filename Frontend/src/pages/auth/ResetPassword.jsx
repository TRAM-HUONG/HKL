import React, { useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import "../../static/css/ResetPassword.css"; // 1. Import CSS ở đây
import Layout from '../layout/layout.jsx';
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
    <div className="reset-password-container"> {/* 2. Cập nhật class này */}
      <div className="reset-password-card">     {/* Thêm bọc ngoài để tạo hình trang sách */}
        <form onSubmit={handleUpdate} className="reset-password-form">
          <h2>Mật khẩu mới</h2>
          <input 
            type="password" 
            required 
            onChange={(e) => setNewPassword(e.target.value)} 
            placeholder="Nhập mật khẩu mới..." 
          />
          <button type="submit" className="reset-password-btn">
            Cập nhật mật khẩu
          </button>
        </form>
      </div>
    </div>
    </Layout>
  );
};

export default ResetPassword;