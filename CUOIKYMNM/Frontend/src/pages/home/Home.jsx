import React from "react";
import "../../static/css/Home.css";
import Layout from "../layout/layout.jsx";

// Import ảnh
import ANHNEN from '../../static/images/ANHNEN.jpeg';
import ANHTOUR from '../../static/images/ANHTOUR.jpeg';
import DANHGIA from '../../static/images/DANHGIA.jpg';
import DATVE from '../../static/images/DATVE.jpg';
import DICHVUKHAC from '../../static/images/DICHVUKHAC.jpg';

const Home = () => {
  // Chuyển mảng thành các Object để map dữ liệu chuẩn hơn
  const truyenMoi = [
    { id: 1, img: ANHNEN, title: "Truyện 1" },
    { id: 2, img: ANHTOUR, title: "Truyện 2" },
    { id: 3, img: DANHGIA, title: "Truyện 3" },
    { id: 4, img: DATVE, title: "Truyện 4" },
    { id: 5, img: DICHVUKHAC, title: "Truyện 5" },
  ];

  return (
    <Layout>
      <div className="home-body">
        
        {/* Mục Truyện mới ra */}
        <section className="story-section">
          <h2 className="section-title">
            <span className="icon">⭐</span> Truyện mới ra
          </h2>
          <div className="story-grid">
            {truyenMoi.map((item) => (
              <div key={item.id} className="story-card">
                <div className="image-wrapper">
                  <img src={item.img} alt={item.title} />
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Dòng thông báo bản quyền */}
        <div className="notice-text">
          <p>📖 Truyện được đăng và dịch tại <strong>HKL</strong>. Vui lòng không reup dưới mọi hình thức!</p>
        </div>

        {/* Mục Truyện nổi bật */}
        <section className="story-section hot-section">
          <h2 className="section-title">
            <span className="icon">🔥</span> Truyện nổi bật
          </h2>
          <div className="story-grid">
            {/* Render lại mảng hoặc một phần mảng */}
            {truyenMoi.slice(0, 4).map((item) => (
              <div key={`hot-${item.id}`} className="story-card">
                <div className="image-wrapper">
                  <img src={item.img} alt={item.title} />
                </div>
              </div>
            ))}
          </div>
        </section>

      </div>
    </Layout>
  );
};

export default Home;