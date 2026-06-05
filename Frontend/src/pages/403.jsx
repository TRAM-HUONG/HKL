import React from 'react';
import Layout from "./layout/layout.jsx";

const Forbidden = () => {
  // Hệ thống siêu hiệu ứng: Đom đóm ma thuật và vòng tròn kết giới bảo vệ rực sáng
  const MagicalForestEffects = () => (
    <style>{`
      @keyframes forest-float {
        0%, 100% { transform: translateY(0px) rotate(0deg); }
        50% { transform: translateY(-10px) rotate(1deg); }
      }
      @keyframes magic-spin-forward {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }
      @keyframes magic-spin-backward {
        0% { transform: rotate(360deg); }
        100% { transform: rotate(0deg); }
      }
      @keyframes text-glow {
        0%, 100% { text-shadow: 0 0 10px rgba(255,255,255,0.8), 0 0 20px rgba(239, 68, 68, 0.4); }
        50% { text-shadow: 0 0 20px rgba(255,255,255,1), 0 0 30px rgba(245, 158, 11, 0.7); }
      }

      .forest-title {
        font-family: 'Arial Black', 'Impact', sans-serif;
        font-weight: 900;
        font-size: 2.8rem;
        text-transform: uppercase;
        color: #7f1d1d; /* Màu đỏ rượu sâu đậm để cảnh báo vùng cấm */
        animation: text-glow 4s ease-in-out infinite;
        letter-spacing: -1px;
      }

      .magic-badge {
        background: rgba(127, 29, 29, 0.85); /* Nền đỏ đậm cảnh báo */
        border: 1px solid rgba(245, 158, 11, 0.5);
        backdrop-filter: blur(5px);
        color: #fef08a; 
        font-weight: 700;
        padding: 6px 20px;
        border-radius: 30px;
        display: inline-block;
        text-transform: uppercase;
        font-size: 0.9rem;
      }

      .crystal-gold-number {
        font-size: 11rem;
        font-family: 'Arial Black', 'Impact', sans-serif;
        font-weight: 900;
        line-height: 1;
        background: linear-gradient(to bottom, #ffffff 20%, #fcd34d 60%, #d97706 100%);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        filter: drop-shadow(3px 3px 0px #7f1d1d) 
                drop-shadow(0 15px 25px rgba(0,0,0,0.15));
        animation: forest-float 5s ease-in-out infinite;
      }

      .portal-outer {
        position: relative;
        width: 170px;
        height: 170px;
        display: flex;
        align-items: center;
        justify-content: center;
        animation: forest-float 5s ease-in-out infinite;
        animation-delay: 0.25s;
      }

      .portal-ring-1 {
        position: absolute;
        width: 100%;
        height: 100%;
        border-radius: 50%;
        background: linear-gradient(45deg, #ef4444, #f59e0b, #dc2626, #fcd34d);
        animation: magic-spin-forward 6s linear infinite; /* Kết giới quay nhanh hơn để tạo cảm giác nguy hiểm */
        box-shadow: 0 0 25px rgba(239, 68, 68, 0.5);
      }

      .portal-ring-2 {
        position: absolute;
        width: 88%;
        height: 88%;
        border-radius: 50%;
        background: linear-gradient(-45deg, #fcd34d, #ef4444, #f59e0b);
        animation: magic-spin-backward 3s linear infinite;
      }

      .portal-core {
        position: absolute;
        width: 75%;
        height: 75%;
        border-radius: 50%;
        background: rgba(69, 10, 10, 0.95); /* Lõi đỏ đen huyền bí */
        display: flex;
        align-items: center;
        justify-content: center;
        border: 2px solid #fcd34d;
        box-shadow: inset 0 0 15px rgba(0,0,0,0.6);
      }

      .hyper-btn {
        position: relative;
        display: inline-flex;
        align-items: center;
        gap: 12px;
        color: #ffffff;
        text-decoration: none;
        font-family: 'Segoe UI', sans-serif;
        font-size: 1.1rem;
        font-weight: 700;
        padding: 14px 40px;
        border-radius: 50px;
        background: linear-gradient(135deg, #b91c1c 0%, #7f1d1d 100%);
        border: 2px solid #fcd34d;
        box-shadow: 0 4px 20px rgba(185, 28, 28, 0.4);
        overflow: hidden;
        transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
      }

      .hyper-btn:hover {
        transform: translateY(-4px) scale(1.03);
        border-color: #ffffff;
        box-shadow: 0 10px 25px rgba(245, 158, 11, 0.5);
      }

      .particle {
        position: absolute;
        border-radius: 50%;
        pointer-events: none;
      }
    `}</style>
  );

  return (
    <Layout>
      <MagicalForestEffects />
      
      {/* Container chính trong suốt để khoe trọn background rừng của bạn */}
      <div style={{
        background: 'transparent', 
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        padding: '40px 20px',
        overflow: 'hidden',
        position: 'relative',
        boxSizing: 'border-box'
      }}>
        
        {/* Tấm kính mờ bảo vệ chữ không bị hình nền nuốt chửng */}
        <div style={{
          background: 'rgba(255, 255, 255, 0.6)', 
          backdropFilter: 'blur(10px)',
          WebkitBackdropFilter: 'blur(10px)',
          border: '1px solid rgba(255, 255, 255, 0.6)',
          borderRadius: '32px',
          padding: '40px 30px',
          maxWidth: '850px',
          textAlign: 'center',
          boxShadow: '0 30px 60px rgba(127, 29, 29, 0.1)',
          zIndex: 2,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center'
        }}>

          {/* CONCEPT PHÉP THUẬT: Đã đổi chữ sang văn phong Tiên Hiệp cổ đại */}
          <div className="magic-badge" style={{ marginBottom: '15px' }}>
            🛑 Kết giới cổ xưa: Vùng đất cấm mật đạo
          </div>
          
          <h1 className="forest-title" style={{ margin: '0 0 15px 0' }}>
            Truy cập bị chặn bởi ma pháp!
          </h1>
          
          <p style={{
            color: '#451a03',
            fontFamily: 'system-ui, sans-serif',
            fontSize: '1.15rem',
            fontWeight: '600',
            maxWidth: '650px',
            margin: '0 auto 35px auto',
            lineHeight: '1.6',
          }}>
            Bạn đang cố tình bước vào <strong>lãnh địa bất khả xâm phạm</strong> của khu rừng cổ đại. Bạn không sở hữu Phù Hiệu Hộ Vệ hoặc Thần Chú để hóa giải phong ấn này.
          </p>

          {/* ĐỒ HỌA 403: Cố định hàng ngang không lo bị sập bố cục */}
          <div style={{
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '35px',
            marginBottom: '40px',
          }}>
            {/* Số 4 bên trái */}
            <span className="crystal-gold-number">4</span>

            {/* SỐ 0 - PHONG ẤN VÒNG TRÒN MA THUẬT NGUY HIỂM */}
            <div className="portal-outer">
              <div className="portal-ring-1" />
              <div className="portal-ring-2" />
              <div className="portal-core">
                <span style={{ 
                  color: '#fef08a', 
                  fontFamily: 'monospace', 
                  fontSize: '1.1rem',
                  fontWeight: 'bold',
                  letterSpacing: '2px',
                }}>CẤM</span>
              </div>
            </div>

            {/* Số 3 bên phải */}
            <span className="crystal-gold-number" style={{ animationDelay: '0.2s' }}>3</span>
          </div>

          {/* NÚT QUAY LẠI LỐI MÒN AN TOÀN */}
          <div>
            <a href="/" className="hyper-btn">
              <span>🍃</span> Rút lui an toàn về Trang chủ
            </a>
          </div>

        </div>

        {/* Đom đóm tinh linh bay xung quanh */}
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className="particle"
            style={{
              width: `${Math.random() * 6 + 6}px`,
              height: `${Math.random() * 6 + 6}px`,
              background: i % 2 === 0 ? '#ef4444' : '#fbbf24',
              top: `${Math.random() * 80 + 10}%`,
              left: `${Math.random() * 80 + 10}%`,
              animation: `forest-float ${Math.random() * 3 + 3}s infinite ease-in-out`,
              animationDelay: `${Math.random() * 2}s`,
              boxShadow: i % 2 === 0 ? '0 0 15px #ef4444' : '0 0 15px #fbbf24',
              zIndex: 1
            }}
          />
        ))}

      </div>
    </Layout>
  );
};

export default Forbidden;