import React from 'react';
import Layout from './layout/layout.jsx'; // Đường dẫn import layout của bạn

const NotFound = () => {
  // Hệ thống siêu hiệu ứng: Đom đóm lấp lánh và hiệu ứng vòng tròn ma thuật rực sáng phù hợp với khu rừng
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
        0%, 100% { text-shadow: 0 0 10px rgba(255,255,255,0.8), 0 0 20px rgba(52, 211, 153, 0.4); }
        50% { text-shadow: 0 0 20px rgba(255,255,255,1), 0 0 30px rgba(251, 191, 36, 0.7); }
      }
      @keyframes particle-drift {
        0% { transform: translate(0, 0) scale(1); opacity: 0; }
        50% { opacity: 0.8; }
        100% { transform: translate(30px, -60px) scale(0.5); opacity: 0; }
      }

      .forest-title {
        font-family: 'Arial Black', 'Impact', sans-serif;
        font-weight: 900;
        font-size: 2.8rem;
        text-transform: uppercase;
        color: #064e3b; /* Xanh rừng sâu đậm để nổi bật trên nền sáng */
        animation: text-glow 4s ease-in-out infinite;
        letter-spacing: -1px;
      }

      .magic-badge {
        background: rgba(6, 78, 59, 0.8);
        border: 1px solid rgba(251, 191, 36, 0.5);
        backdrop-filter: blur(5px);
        color: #fef08a; /* Vàng sáng rực rỡ */
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
        filter: drop-shadow(3px 3px 0px #065f46) 
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
        background: linear-gradient(45deg, #34d399, #fbbf24, #6ee7b7, #fb7185);
        animation: magic-spin-forward 8s linear infinite;
        box-shadow: 0 0 25px rgba(52, 211, 153, 0.5);
      }

      .portal-ring-2 {
        position: absolute;
        width: 88%;
        height: 88%;
        border-radius: 50%;
        background: linear-gradient(-45deg, #fcd34d, #34d399, #a7f3d0);
        animation: magic-spin-backward 4s linear infinite;
      }

      .portal-core {
        position: absolute;
        width: 75%;
        height: 75%;
        border-radius: 50%;
        background: rgba(6, 78, 59, 0.9); /* Màu xanh ngọc lục bảo huyền bí */
        display: flex;
        align-items: center;
        justify-content: center;
        border: 2px solid #fcd34d;
        box-shadow: inset 0 0 15px rgba(0,0,0,0.5);
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
        background: linear-gradient(135deg, #047857 0%, #064e3b 100%);
        border: 2px solid #fcd34d;
        box-shadow: 0 4px 20px rgba(4, 120, 87, 0.4);
        overflow: hidden;
        transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
      }

      .hyper-btn:hover {
        transform: translateY(-4px) scale(1.03);
        border-color: #ffffff;
        box-shadow: 0 10px 25px rgba(251, 191, 36, 0.5);
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
      
      {/* Container chính: Để background trong suốt nhằm hiển thị trọn vẹn ảnh nền rừng của bạn */}
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
        
        {/* Tấm kính mờ tinh tế bao quanh nội dung để giải quyết vấn đề nuốt chữ, tăng tối đa độ tương phản */}
        <div style={{
          background: 'rgba(255, 255, 255, 0.55)', 
          backdropFilter: 'blur(10px)',
          WebkitBackdropFilter: 'blur(10px)',
          border: '1px solid rgba(255, 255, 255, 0.6)',
          borderRadius: '32px',
          padding: '40px 30px',
          maxWidth: '850px',
          textAlign: 'center',
          boxShadow: '0 30px 60px rgba(6, 78, 59, 0.15)',
          zIndex: 2,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center'
        }}>

          {/* KHU VỰC TIÊU ĐỀ: Đã đổi sang từ ngữ style Tiên Hiệp / Phép Thuật */}
          <div className="magic-badge" style={{ marginBottom: '15px' }}>
            🔮 Ảo ảnh khu rừng: Đường mòn bị che giấu
          </div>
          
          <h1 className="forest-title" style={{ margin: '0 0 15px 0' }}>
            Bạn đã lạc sâu vào rừng phép!
          </h1>
          
          <p style={{
            color: '#064e3b',
            fontFamily: 'system-ui, sans-serif',
            fontSize: '1.15rem',
            fontWeight: '600',
            maxWidth: '650px',
            margin: '0 auto 35px auto',
            lineHeight: '1.6',
          }}>
            Lối đi bạn đang tìm kiếm đã bị những <strong>nhánh cây ma thuật</strong> che mờ hoặc lối rẽ này chưa từng được khai phá. Hãy cẩn thận với những tinh thể phát sáng!
          </p>

          {/* ĐỒ HỌA 404: Ép chuẩn hàng ngang (Row) không sợ lỗi dọc */}
          <div style={{
            display: 'flex',
            flexDirection: 'row', // Ép buộc nằm ngang cố định
            alignItems: 'center',
            justifyContent: 'center',
            gap: '35px',
            marginBottom: '40px',
          }}>
            {/* Số 4 bên trái */}
            <span className="crystal-gold-number">4</span>

            {/* SỐ 0 - VÒNG TRÒN PHÉP THUẬT */}
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
                }}>LẠC</span>
              </div>
            </div>

            {/* Số 4 bên phải */}
            <span className="crystal-gold-number" style={{ animationDelay: '0.2s' }}>4</span>
          </div>

          {/* NÚT ĐIỀU HƯỚNG STYLE HOÀNG GIA / KHU RỪNG */}
          <div>
            <a href="/" className="hyper-btn">
              <span>🍃</span> Theo hướng gió quay về Trang chủ
            </a>
          </div>

        </div>

        {/* Các hạt sáng đom đóm bay lượn thêm phần sinh động */}
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className="particle"
            style={{
              width: `${Math.random() * 6 + 6}px`,
              height: `${Math.random() * 6 + 6}px`,
              background: i % 2 === 0 ? '#fbbf24' : '#34d399',
              top: `${Math.random() * 80 + 10}%`,
              left: `${Math.random() * 80 + 10}%`,
              animation: `forest-float ${Math.random() * 3 + 3}s infinite ease-in-out`,
              animationDelay: `${Math.random() * 2}s`,
              boxShadow: i % 2 === 0 ? '0 0 15px #fbbf24' : '0 0 15px #34d399',
              zIndex: 1
            }}
          />
        ))}

      </div>
    </Layout>
  );
};

export default NotFound;