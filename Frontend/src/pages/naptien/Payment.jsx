import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Layout from "../layout/layout.jsx";

// Import các ảnh từ thư mục static/images
import momoQRCode from "../../static/images/MM.jpg";
import bankQRCode from "../../static/images/CKNH.jpg";

const Payment = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { goi, phuongThuc } = location.state || {}; // Nhận dữ liệu từ NapTien.jsx
  const user = JSON.parse(localStorage.getItem("user"));
  const [isProcessing, setIsProcessing] = useState(false);

  // Thông tin chuyển khoản giả định (Admin cung cấp)
  const bankInfo = {
    bankName: "MB BANK",
    stk: "0123456789999",
    owner: "NGUYEN VAN ADMIN",
    momoImg: momoQRCode, 
    bankQr: bankQRCode   
  };

  if (!goi) {
    return (
      <Layout>
        <div style={{ textAlign: "center", padding: "50px" }}>
          <h3>Dữ liệu thanh toán không hợp lệ!</h3>
          <button onClick={() => navigate("/nap-tien")}>Quay lại trang nạp tiền</button>
        </div>
      </Layout>
    );
  }

  const handleConfirmPayment = async () => {
    setIsProcessing(true);
    
    try {
      const response = await fetch("http://localhost:5000/api/user/nap-tien", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          matk: user.MATK || user.matk,
          magoi: goi.magoi,
          so_xu: goi.so_xu_nhan // Sửa từ goi.xu -> goi.so_xu_nhan
        }),
      });

      const result = await response.json();
      setIsProcessing(false);

      if (response.ok) {
        alert("Hệ thống đã nhận được yêu cầu. Giao dịch thành công!");
        // Cập nhật số dư ảo trong LocalStorage để hiển thị ngay
        const updatedUser = { ...user, SO_DU: (user.SO_DU || 0) + Number(goi.so_xu_nhan) };
        localStorage.setItem("user", JSON.stringify(updatedUser));
        navigate("/profile");
      } else {
        alert(result.message || "Giao dịch thất bại. Vui lòng thử lại sau!");
      }
    } catch (err) {
      alert("Lỗi kết nối server!");
      setIsProcessing(false);
    }
  };

  return (
    <Layout>
      <div style={{ maxWidth: "600px", margin: "40px auto", padding: "20px", border: "1px solid #ddd", borderRadius: "10px", backgroundColor: "#fff" }}>
        <h2 style={{ textAlign: "center", color: "#ff5a00" }}>Xác Nhận Thanh Toán</h2>
        
        <div style={{ backgroundColor: "#f9f9f9", padding: "15px", borderRadius: "8px", margin: "20px 0" }}>
          {/* Sửa tên các thuộc tính để khớp với Database */}
          <p>Gói nạp: <strong>{goi.ten_goi}</strong></p> 
          <p>Nhận: <strong style={{ color: "green" }}>{goi.so_xu_nhan} Xu</strong></p>
          <p>Số tiền cần trả: <strong style={{ color: "red" }}>{Number(goi.so_tien_vnd).toLocaleString() || 0} VNĐ</strong></p>
          <p>Phương thức: <strong>{phuongThuc === 'momo' ? "Ví MoMo" : "Chuyển khoản Ngân hàng"}</strong></p>
        </div>

        <div style={{ textAlign: "center", marginBottom: "20px" }}>
          <p>Quét mã QR dưới đây để thanh toán:</p>
          <img 
            src={phuongThuc === 'momo' ? bankInfo.momoImg : bankInfo.bankQr} 
            alt="QR Code" 
            style={{ width: "250px", border: "5px solid #eee", borderRadius: "10px" }} 
          />
          {phuongThuc === 'bank' && (
            <div style={{ marginTop: "10px", fontSize: "14px" }}>
              <p>STK: <strong>{bankInfo.stk}</strong></p>
              <p>Ngân hàng: <strong>{bankInfo.bankName}</strong></p>
              <p>Chủ TK: <strong>{bankInfo.owner}</strong></p>
            </div>
          )}
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          <button 
            onClick={handleConfirmPayment}
            disabled={isProcessing}
            style={{ padding: "15px", backgroundColor: "#28a745", color: "white", border: "none", borderRadius: "5px", fontWeight: "bold", cursor: "pointer" }}
          >
            {isProcessing ? "Đang xử lý..." : "Tôi đã chuyển tiền xong"}
          </button>
          <button 
            onClick={() => navigate("/nap-tien")}
            style={{ padding: "10px", backgroundColor: "#6c757d", color: "white", border: "none", borderRadius: "5px", cursor: "pointer" }}
          >
            Quay lại
          </button>
        </div>
      </div>
    </Layout>
  );
};

export default Payment;