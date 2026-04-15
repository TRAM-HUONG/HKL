import React from 'react';
import './Home.css';

const Home = () => {
  const truyenMoi = [
    { id: 1, img: "https://i.pinimg.com/564x/93/2c/31/932c31751bc215039d6e499a2c26f04d.jpg" },
    { id: 2, img: "https://i.pinimg.com/564x/6c/f5/01/6cf5019d65942487920392f72a44d01b.jpg" },
    { id: 3, img: "https://i.pinimg.com/564x/0f/75/62/0f756247949354924c8651817c762503.jpg" },
    { id: 4, img: "https://i.pinimg.com/564x/4a/14/06/4a1406436f9821a7c64c6764495f548d.jpg" },
    { id: 5, img: "https://i.pinimg.com/564x/62/8c/69/628c69f06103636f86820556e974e402.jpg" },
    { id: 6, img: "https://i.pinimg.com/564x/94/37/10/943710778465697682976d333010b985.jpg" },
  ];

  return (
    <div className="home-container">
      {/* Hero Section */}
      <header className="hero-section">
        <nav className="navbar">
          <ul>
            <li>Trang Chủ</li>
            <li>Giới thiệu</li>
            <li>Danh mục</li>
            <li>BXH</li>
          </ul>
        </nav>
        
        <div className="banner-cards">
           <img src={truyenMoi[0].img} className="banner-item" alt="t1" />
           <img src={truyenMoi[1].img} className="banner-item main" alt="t2" />
           <img src={truyenMoi[2].img} className="banner-item" alt="t3" />
        </div>
      </header>

      {/* Search Bar */}
      <div className="search-wrapper">
        <div className="search-box">
          <input type="text" placeholder="Bạn muốn tìm truyện gì hôm nay?" />
          <button style={{border:'none', background:'none', cursor:'pointer'}}>🔍</button>
        </div>
      </div>

      {/* Truyện mới ra */}
      <section>
        <h2 className="section-title">⭐ Truyện mới ra</h2>
        <div className="story-grid">
          {truyenMoi.map(t => (
            <div key={t.id} className="story-card">
              <img src={t.img} alt="poster" />
            </div>
          ))}
        </div>
      </section>

      {/* Notice */}
      <div className="notice-bar">
        📖 Truyện được đăng và dịch lại HKL. Vui lòng không reup dưới mọi hình thức!
      </div>

      {/* Truyện nổi bật */}
      <section style={{paddingBottom: '50px'}}>
        <h2 className="section-title">🔥 Truyện nổi bật</h2>
        <div className="story-grid">
           <div className="story-card"><img src={truyenMoi[3].img} alt="hot" /></div>
        </div>
      </section>
    </div>
  );
};

// --- DÒNG CẦN THÊM VÀO ĐÂY ---
export default Home;