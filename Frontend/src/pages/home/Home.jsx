import React, { useState, useEffect } from "react";
import "../../static/css/Home.css"; 
import Layout from "../layout/layout.jsx";
import { Link } from "react-router-dom";
// Thêm các import cho Swiper
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";

const Home = () => {
  const [truyenList, setTruyenList] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("http://localhost:5173//api/truyen")
      .then((res) => res.json())
      .then((data) => {
        setTruyenList(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Lỗi lấy dữ liệu:", err);
        setLoading(false);
      });
  }, []);

  // Logic phân loại (Giữ nguyên)
  const truyenDeXuat = [...truyenList].sort((a, b) => b.sao_trung_binh - a.sao_trung_binh).slice(0, 10);
  const truyenMoi = [...truyenList].sort((a, b) => new Date(b.ngaydang) - new Date(a.ngaydang)).slice(0, 15);
  const truyenFull = truyenList.filter((t) => t.trangthai?.toLowerCase() === "hoàn thành");

  const renderStars = (rating) => {
    const stars = [];
    const score = Number(rating).toFixed(1);
    for (let i = 1; i <= 5; i++) {
      if (i <= rating) stars.push(<span key={i} className="star-filled">★</span>);
      else if (i - 0.5 <= rating) stars.push(<span key={i} className="star-half" data-star="★">★</span>);
      else stars.push(<span key={i} className="star-empty">★</span>);
    }
    return (
      <div className="rating-badge-container">
        <div className="rating-score-circle">{score}</div>
        <div className="rating-stars-track">{stars}</div>
      </div>
    );
  };
  

  // --- CẬP NHẬT STORYGRID THÀNH SLIDER ---
  const StoryGrid = ({ list }) => (
    <div className="wao-slider-container">
      {list.length > 0 ? (
        <Swiper
          modules={[Navigation]}
          navigation={true}
          spaceBetween={20}
          slidesPerView={5} // Hiển thị 5 truyện
          slidesPerGroup={5} // BẤM MỘT PHÁT NHẢY LUÔN 5 TRUYỆN
          speed={600}        // Tốc độ chuyển động (ms)
          breakpoints={{
            320: { slidesPerView: 2, slidesPerGroup: 2, spaceBetween: 10 },
            768: { slidesPerView: 3, slidesPerGroup: 3, spaceBetween: 15 },
            1024: { slidesPerView: 5, slidesPerGroup: 5, spaceBetween: 20 },
          }}
          className="mySwiper"
        >
          {list.map((item) => (
            <SwiperSlide key={item.mat}>
              <Link to={`/truyen/${item.mat}`} className="wao-card">
                <div className="wao-badge">
                  {item.trangthai?.toLowerCase() === "hoàn thành" ? "FULL" : "HOT"}
                </div>

                <div className="wao-img-container">
                  <img 
                    src={`http://localhost:5173//images/${item.hinhanh}`} 
                    alt={item.tent} 
                    onError={(e) => { e.target.src = "https://via.placeholder.com/200x300"; }}
                  />
                  <div className="wao-overlay">
                    <button className="read-now">ĐỌC NGAY</button>
                  </div>
                </div>

                <div className="wao-info">
                  <h3 className="wao-title">{item.tent}</h3>
                  {renderStars(item.sao_trung_binh)}
                  <p className="wao-chapter-count">
                    📚 {item.so_chuong || 0} Chương
                  </p>
                </div>
              </Link>
            </SwiperSlide>
          ))}
        </Swiper>
      ) : (
        <p className="no-data">Đang cập nhật dữ liệu...</p>
      )}
    </div>
  );

  if (loading) {
    return (
      <Layout>
        <div className="loader">✨ Đang triệu hồi thế giới truyện...</div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="wao-home-container">
        <section className="wao-section">
          <h2 className="wao-header"><span className="icon">⭐</span> TRUYỆN ĐỀ XUẤT</h2>
          <StoryGrid list={truyenDeXuat} />
        </section>

        <section className="wao-section">
          <h2 className="wao-header"><span className="icon">🆕</span> MỚI CẬP NHẬT</h2>
          <StoryGrid list={truyenMoi} />
        </section>

        <section className="wao-section">
          <h2 className="wao-header"><span className="icon">🏆</span> TRUYỆN FULL</h2>
          <StoryGrid list={truyenFull} />
        </section>
      </div>
    </Layout>
  );
};

export default Home;