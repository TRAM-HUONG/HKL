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
        <div style={{ textAlign: "center", padding: "100px 20px", fontFamily: "'Segoe UI', Roboto, sans-serif" }}>
          <h3 style={{ fontSize: "1.8rem", color: "#cc0000", fontWeight: "800", marginBottom: "20px" }}>
            Dữ liệu thanh toán không hợp lệ!
          </h3>
          <button 
            onClick={() => navigate("/nap-tien")}
            style={{
              padding: "12px 25px",
              backgroundColor: "#6c757d",
              color: "#ffffff",
              border: "none",
              borderRadius: "6px",
              fontWeight: "700",
              fontSize: "1rem",
              cursor: "pointer",
              boxShadow: "0 4px 10px rgba(0,0,0,0.15)"
            }}
          >
            Quay lại trang nạp tiền
          </button>
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
          so_xu: goi.so_xu_nhan 
        }),
      });

      const result = await response.json();
      setIsProcessing(false);

      if (response.ok) {
        alert("Hệ thống đã nhận được yêu cầu. Giao dịch thành công!");
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
      <div style={{ 
        maxWidth: "650px", 
        margin: "60px auto", 
        padding: "35px 30px", 
        border: "3px solid #caa34b", 
        borderRadius: "16px", 
        backgroundColor: "#ffffff",
        boxShadow: "0 15px 45px rgba(0, 0, 0, 0.15)",
        fontFamily: "'Segoe UI', Roboto, sans-serif"
      }}>
        <h2 style={{ 
          textAlign: "center", 
          color: "#cc0000", 
          fontSize: "2.2rem", 
          fontWeight: "900", 
          textTransform: "uppercase",
          letterSpacing: "0.5px",
          margin: "0 0 25px 0"
        }}>
          Xác Nhận Thanh Toán
        </h2>
        
        <div style={{ 
          backgroundColor: "#fdfaf2", 
          padding: "20px 25px", 
          borderRadius: "10px", 
          margin: "25px 0",
          border: "1px solid #f3ebd4",
          fontSize: "1.1rem",
          color: "#1a0f0f",
          lineHeight: "1.8"
        }}>
          <p style={{ margin: "8px 0" }}>Gói nạp: <strong style={{ color: "#1a0f0f", fontWeight: "800" }}>{goi.ten_goi}</strong></p> 
          <p style={{ margin: "8px 0" }}>Nhận ngay: <strong style={{ color: "#008000", fontWeight: "900", fontSize: "1.2rem" }}>{goi.so_xu_nhan} Xu</strong></p>
          <p style={{ margin: "8px 0" }}>Số tiền cần trả: <strong style={{ color: "#cc0000", fontWeight: "900", fontSize: "1.2rem" }}>{Number(goi.so_tien_vnd).toLocaleString() || 0} VNĐ</strong></p>
          <p style={{ margin: "8px 0" }}>Phương thức: <strong style={{ color: "#1a0f0f", fontWeight: "800" }}>{phuongThuc === 'momo' ? "Ví MoMo" : "Chuyển khoản Ngân hàng"}</strong></p>
        </div>

        <div style={{ textAlign: "center", marginBottom: "30px" }}>
          <p style={{ fontSize: "1.1rem", fontWeight: "700", color: "#1a0f0f", marginBottom: "15px" }}>
            Quét mã QR dưới đây để thực hiện thanh toán:
          </p>
          <img 
            src={phuongThuc === 'momo' ? bankInfo.momoImg : bankInfo.bankQr} 
            alt="QR Code" 
            style={{ width: "260px", height: "260px", border: "4px solid #caa34b", borderRadius: "12px", boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }} 
          />
          
          {phuongThuc === 'bank' && (
            <div style={{ 
              marginTop: "20px", 
              fontSize: "1.05rem", 
              color: "#1a0f0f", 
              backgroundColor: "#f8f9fa", 
              padding: "15px", 
              borderRadius: "8px",
              border: "1px solid #e9ecef",
              textAlign: "left",
              lineHeight: "1.6"
            }}>
              <p style={{ margin: "5px 0" }}>Số tài khoản: <strong style={{ color: "#cc0000", fontSize: "1.1rem", fontWeight: "900" }}>{bankInfo.stk}</strong></p>
              <p style={{ margin: "5px 0" }}>Ngân hàng: <strong style={{ fontWeight: "800" }}>{bankInfo.bankName}</strong></p>
              <p style={{ margin: "5px 0" }}>Chủ tài khoản: <strong style={{ fontWeight: "800", textTransform: "uppercase" }}>{bankInfo.owner}</strong></p>
            </div>
          )}
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          <button 
            onClick={handleConfirmPayment}
            disabled={isProcessing}
            style={{ 
              padding: "16px", 
              backgroundColor: "#28a745", 
              color: "#ffffff", 
              border: "none", 
              borderRadius: "8px", 
              fontWeight: "900", 
              fontSize: "1.15rem",
              textTransform: "uppercase",
              letterSpacing: "0.5px",
              cursor: isProcessing ? "not-allowed" : "pointer", 
              boxShadow: "0 4px 15px rgba(40, 167, 69, 0.3)",
              transition: "all 0.2s ease"
            }}
          >
            {isProcessing ? "Đang kiểm tra dữ liệu..." : "Tôi đã chuyển tiền xong"}
          </button>
          <button 
            onClick={() => navigate("/nap-tien")}
            style={{ 
              padding: "12px", 
              backgroundColor: "#ffffff", 
              color: "#555555", 
              border: "2px solid #6c757d", 
              borderRadius: "8px", 
              fontWeight: "700",
              fontSize: "1rem",
              cursor: "pointer",
              transition: "all 0.2s ease"
            }}
          >
            Quay lại sửa thông tin
          </button>
        </div>
      </div>
    </Layout>
  );
};

export default Payment;