import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "../layout/layout.jsx";
import "../../static/css/Profile.css";
import axios from "axios"; // Đảm bảo đã import axios

const NapTien = () => {
  const [selectedGoi, setSelectedGoi] = useState(null);
  const [user, setUser] = useState(null);
  const [danhSachGoi, setDanhSachGoi] = useState([]); // Chuyển thành state để lưu data từ DB
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // 1. Lấy thông tin user và Tải danh sách gói từ API
  useEffect(() => {
    // Lấy user
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }

    // Tải danh sách gói nạp từ Backend
    const fetchGoiNap = async () => {
      try {
        const res = await axios.get('https://hkl-backend-v3uu.onrender.com/api/admin/goi-nap/all');
        if (res.data.success) {
          setDanhSachGoi(res.data.data);
        }
      } catch (error) {
        console.error("Lỗi khi tải gói nạp:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchGoiNap();
  }, []);

  // 3. Hàm chuyển sang trang thanh toán
  const handleGoToPayment = (pt) => {
    if (!selectedGoi) {
      alert("Vui lòng chọn một gói nạp trước khi tiếp tục!");
      return;
    }
    navigate("/thanh-toan", { 
      state: { 
        goi: selectedGoi, 
        phuongThuc: pt 
      } 
    });
  };

  if (!user) {
    return (
      <Layout>
        <div className="profile-container">Vui lòng đăng nhập để nạp tiền.</div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="profile-container">
        <h2 style={{ textAlign: "center", marginBottom: "30px" }}>Nạp Xu Vào Tài Khoản</h2>
        
        <div className="profile-card">
          <h3><span className="icon">💎</span> Bước 1: Chọn gói nạp</h3>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "15px", marginTop: "20px" }}>
            {loading ? (
                <p>Đang tải danh sách gói nạp...</p>
            ) : danhSachGoi.map((item) => (
              <div 
                key={item.magoi} 
                onClick={() => setSelectedGoi(item)}
                style={{
                  border: selectedGoi?.magoi === item.magoi ? "2px solid #ff5a00" : "1px solid #ddd",
                  padding: "20px",
                  borderRadius: "10px",
                  cursor: "pointer",
                  textAlign: "center",
                  backgroundColor: selectedGoi?.magoi === item.magoi ? "#fff5f0" : "#fff",
                  transition: "all 0.3s ease"
                }}
              >
                <h4 style={{ margin: "0 0 10px 0" }}>{item.ten_goi}</h4>
                <p style={{ fontSize: "20px", color: "#ff5a00", fontWeight: "bold" }}>{item.so_xu_nhan} Xu</p>
                <small style={{ color: "#666" }}>Giá: {Number(item.so_tien_vnd).toLocaleString()} VNĐ</small>
              </div>
            ))}
          </div>
        </div>

        <div className="profile-card" style={{ marginTop: "20px" }}>
          <h3><span className="icon">💳</span> Bước 2: Chọn phương thức thanh toán</h3>
          <div style={{ display: "flex", gap: "20px", marginTop: "20px" }}>
            {/* Nút thanh toán MoMo */}
            <button 
              className="save-btn" 
              style={{ flex: 1, padding: "15px", backgroundColor: "#ae2070" }}
              onClick={() => handleGoToPayment('momo')}
            >
              Thanh toán qua Ví MoMo
            </button>

            {/* Nút thanh toán Chuyển khoản */}
            <button 
              className="save-btn" 
              style={{ flex: 1, padding: "15px", backgroundColor: "#0056b3" }}
              onClick={() => handleGoToPayment('bank')}
            >
              Chuyển khoản Ngân hàng
            </button>
          </div>
        </div>

        <p style={{ textAlign: "center", marginTop: "20px", color: "#888", fontStyle: "italic" }}>
          Lưu ý: Xu sẽ được cộng tự động ngay sau khi hệ thống xác nhận giao dịch thành công.
        </p>
      </div>
    </Layout>
  );
};

export default NapTien;