import React, { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation, Link } from "react-router-dom"; // Thêm Link từ thư viện
import Layout from "../layout/layout.jsx";
import "../../static/css/ChiTietTruyen.css";

const ChiTietTruyen = () => {
  const { mat } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const [truyen, setTruyen] = useState(null);
  const [loading, setLoading] = useState(true);
  const [danhSachChuong, setDanhSachChuong] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [loadingChuong, setLoadingChuong] = useState(false);

  const [danhGia, setDanhGia] = useState([]);
  const [showReviews, setShowReviews] = useState(false);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [newReview, setNewReview] = useState({ nd: "", sosao: 5 });
  const [user, setUser] = useState(null);

  const [replyTarget, setReplyTarget] = useState(null);
  const [noiDungPH, setNoiDungPH] = useState("");

  // --- 1. STATE LƯU TRỮ TRUYỆN GỢI Ý ---
  const [danhSachGoiY, setDanhSachGoiY] = useState([]);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }

    setLoading(true); // Bật loading mỗi khi đổi sang xem một truyện khác
    
    // Tải chi tiết truyện chính
    fetch(`http://localhost:5000/api/truyen/${mat}`)
      .then((res) => res.json())
      .then((data) => {
        setTruyen(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Lỗi tải chi tiết:", err);
        setLoading(false);
      });

    // --- 2. GỌI API LẤY TRUYỆN CÙNG THỂ LOẠI ---
    fetch(`http://localhost:5000/api/truyen/${mat}/cung-the-loai`)
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setDanhSachGoiY(data);
        }
      })
      .catch((err) => console.error("Lỗi tải truyện gợi ý:", err));

    loadDanhGia();
  }, [mat]); // Khi click truyện gợi ý, 'mat' thay đổi, useEffect sẽ chạy lại toàn bộ

  const loadDanhGia = () => {
    fetch(`http://localhost:5000/api/truyen/${mat}/danh-gia`)
      .then((res) => res.json())
      .then((data) => setDanhGia(data))
      .catch((err) => console.error("Lỗi tải đánh giá:", err));
  };

  // --- LOGIC XỬ LÝ MUA CHƯƠNG LẺ ---
  const handleChapterClick = async (chuong) => {
    const giaChuong = chuong.gia_xu || chuong.GIA_XU || 0;
    if (giaChuong === 0) {
        navigate(`/doc-truyen/${chuong.mabt || chuong.MABT}`);
        return;
    }

    if (!user) {
        alert("Vui lòng đăng nhập!");
        navigate("/login");
        return;
    }

    const role = user.VAI_TRO || user.vai_tro;

    if (role === 'Admin' || role === 'TacGia') {
        navigate(`/doc-truyen/${chuong.mabt || chuong.MABT}`);
        return;
    }

    try {
      const madg = user.MADG || user.madg;
      const checkRes = await fetch(`http://localhost:5000/api/chuong/check-quyen?mabt=${chuong.mabt}&madg=${madg}`);
      const checkData = await checkRes.json();

      if (checkData.purchased) {
        navigate(`/doc-truyen/${chuong.mabt}`);
      } else {
        if (window.confirm(`Chương này có giá ${giaChuong} Xu. Bạn có đồng ý dùng Xu để mở khóa không?`)) {
          thucHienMuaChuongLe(chuong);
        }
      }
    } catch (err) {
      console.error("Lỗi kiểm tra quyền:", err);
    }
  };

  const thucHienMuaChuongLe = async (chuong) => {
    try {
      const res = await fetch("http://localhost:5000/api/chuong/mua-le", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          madg: user.MADG || user.madg,
          mabt: chuong.mabt,
          so_xu: chuong.gia_xu || chuong.GIA_XU,
          mat: mat
        })
      });
      const data = await res.json();
      if (res.ok) {
        alert("Mở khóa chương thành công!");
        navigate(`/doc-truyen/${chuong.mabt}`);
      } else {
        if (window.confirm(`${data.message} Bạn có muốn nạp thêm Xu ngay không?`)) {
          navigate("/nap-tien");
        }
      }
    } catch (err) {
      alert("Lỗi kết nối thanh toán!");
    }
  };

  // --- LOGIC XỬ LÝ MUA TRỌN BỘ ---
  const handleBuyFullStory = async () => {
    if (!user) return alert("Vui lòng đăng nhập để mua truyện!");
    
    const giaFull = truyen.gia_tron_goi || truyen.GIA_TRON_GOI;
    
    if (window.confirm(`Xác nhận dùng ${giaFull} Xu để mua trọn bộ truyện này?`)) {
      try {
        const res = await fetch("http://localhost:5000/api/truyen/mua-tron-goi", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            madg: user.MADG || user.madg,
            mat: mat,
            so_xu: giaFull
          })
        });
        const data = await res.json();
        if (res.ok) {
          alert(data.message);
          window.location.reload(); 
        } else {
          alert(data.message);
        }
      } catch (err) {
        alert("Lỗi kết nối hệ thống thanh toán!");
      }
    }
  };

  const handleToggleReviewForm = () => {
    const storedUser = localStorage.getItem("user");
    if (!storedUser) {
      alert("Vui lòng đăng nhập để thực hiện đánh giá!");
      navigate("/login", { state: { from: location.pathname } });
      return;
    }

    const userObj = JSON.parse(storedUser);
    const vaiTro = userObj.VAI_TRO || userObj.vai_tro;
    
    if (vaiTro !== "DocGia") {
      alert("Chỉ tài khoản Độc giả mới có quyền thực hiện đánh giá!");
      return;
    }

    setShowReviews(true);
    setShowReviewForm(!showReviewForm);
  };

  const handleSendReview = async () => {
    if (!newReview.nd.trim()) {
      alert("Vui lòng nhập nội dung!");
      return;
    }

    try {
      const response = await fetch(`http://localhost:5000/api/truyen/danh-gia`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mat: mat,
          madg: user.MADG || user.madg, 
          nd: newReview.nd,
          sosao: newReview.sosao,
        }),
      });

      if (response.ok) {
        alert("Đánh giá thành công!");
        setNewReview({ nd: "", sosao: 5 });
        setShowReviewForm(false);
        loadDanhGia();
      } else {
        const errorData = await response.json();
        alert(errorData.message || "Bạn đã đánh giá truyện này rồi!");
      }
    } catch (err) {
      alert("Lỗi kết nối đến Server!");
    }
  };

  const handleSendPhanHoi = async () => {
    if (!noiDungPH.trim()) return alert("Vui lòng nhập nội dung trả lời!");
    
    const isTG = user?.VAI_TRO === 'TacGia' || user?.vai_tro === 'TacGia';

    try {
      const response = await fetch(`http://localhost:5000/api/binh-luan`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          matg: isTG ? (user.MATG || user.matg) : null,
          madg: !isTG ? (user.MADG || user.madg) : null,
          mabl_cha: null, 
          madgia: replyTarget.madgia || replyTarget.MADGIA,
          noi_dung: noiDungPH
        }),
      });

      if (response.ok) {
        alert("Đã gửi phản hồi!");
        setNoiDungPH("");
        setReplyTarget(null);
        loadDanhGia();
      }
    } catch (err) {
      alert("Lỗi khi gửi phản hồi!");
    }
  };

  const handleDeletePH_DG = async (id) => {
    if (!window.confirm("Bạn có chắc muốn xóa phản hồi này?")) return;
    const userId = user?.MADG || user?.madg || user?.MATG || user?.matg;
    try {
      const res = await fetch(`http://localhost:5000/api/binh-luan/phan-hoi/${id}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId })
      });
      if (res.ok) {
        loadDanhGia(); 
      } else {
        const errorData = await res.json();
        alert(errorData.error || "Lỗi khi xóa phản hồi!");
      }
    } catch (err) {
      console.error("Lỗi xóa phản hồi:", err);
    }
  };

  const handleDeleteDanhGia = async (madgia) => {
    if (!window.confirm("Bạn có chắc muốn xóa đánh giá này?")) return;
    const currentMadg = user?.MADG || user?.madg;
    try {
      const response = await fetch(`http://localhost:5000/api/truyen/danh-gia/${madgia}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ madg: currentMadg }),
      });
      if (response.ok) {
        loadDanhGia();
      } else {
        const errorData = await response.json();
        alert(errorData.error || "Lỗi khi xóa đánh giá!");
      }
    } catch (err) {
      console.error("Lỗi xóa đánh giá:", err);
    }
  };

  const handleStartReading = () => {
    setLoadingChuong(true);
    setShowModal(true);
    fetch(`http://localhost:5000/api/chuong/truyen/${mat}`)
      .then((res) => res.json())
      .then((data) => {
        setDanhSachChuong(data);
        setLoadingChuong(false);
      })
      .catch((err) => {
        console.error("Lỗi tải chương:", err);
        setLoadingChuong(false);
      });
  };

  if (loading) return <div className="loader">✨ Đang mở kho sách...</div>;
  if (!truyen) return <Layout><div>Không tìm thấy truyện!</div></Layout>;

  return (
    <Layout>
      <div className="chitiet-container">
        <div className="chitiet-content">
          <div className="chitiet-left">
            <img
              className="chitiet-img"
              src={`http://localhost:5000/images/${truyen.hinhanh || truyen.HINHANH || ""}`}
              alt={truyen.tent || truyen.TENT}
              onError={(e) => {
                e.target.src = "https://via.placeholder.com/300x450?text=No+Image";
              }}
            />
          </div>

          <div className="chitiet-info">
            <h1 className="chitiet-title">{truyen.tent || truyen.TENT}</h1>
            <div className="chitiet-stats-wrapper">
              <div className="rating-bar">
                <div className="rating-circle">
                  {Number(truyen.sao_trung_binh || 0).toFixed(1)}
                </div>
                <div className="rating-stars">
                  {"★★★★★".split("").map((star, index) => (
                    <span
                      key={index}
                      className={
                        index < Math.floor(truyen.sao_trung_binh || 0)
                          ? "star-active"
                          : "star-inactive"
                      }
                    >
                      {star}
                    </span>
                  ))}
                </div>
              </div>
              <div className="chapter-badge">📚 {truyen.so_chuong || 0} Chương</div>
              <div className="category-badge">
                🏷️ {truyen.ten_the_loai || "Chưa phân loại"}
              </div>
              <div className="price-badge" style={{ color: '#ffcc00', border: '1px solid #ffcc00', padding: '2px 10px', borderRadius: '15px', fontWeight: 'bold' }}>
                💰 {(truyen.gia_tron_goi || truyen.GIA_TRON_GOI) > 0 ? `${truyen.gia_tron_goi || truyen.GIA_TRON_GOI} Xu (Full)` : "Miễn phí"}
              </div>
            </div>
            
            <div className="chitiet-meta">
                <p>✍️ <strong>Người Đăng Tải:</strong> {truyen.ten_tac_gia || truyen.TENTG || "Đang cập nhật"}</p> 
                <p>🚩 <strong>Trạng thái:</strong> {truyen.TRANGTHAI || truyen.trangthai}</p>
                <p>🏢 <strong>Nhà xuất bản:</strong> {truyen.NXB || truyen.nxb}</p>
                <p>📅 <strong>Cập nhật:</strong> {new Date(truyen.ngay_cap_nhat || truyen.NGAYDANG || Date.now()).toLocaleDateString("vi-VN")}</p>
            </div>
            <div className="chitiet-description">
              <h3>GIỚI THIỆU TÁC PHẨM</h3>
              <p>{truyen.MOTA || truyen.mota || "Chưa có mô tả cho truyện này."}</p>
            </div>
           
            <div className="chitiet-actions" style={{ display: 'flex', gap: '15px' }}>
              <button className="read-now-btn" onClick={handleStartReading}>
                BẮT ĐẦU ĐỌC
              </button>

              {user && (user.VAI_TRO === 'DocGia' || user.vai_tro === 'DocGia') && (truyen.gia_tron_goi || truyen.GIA_TRON_GOI) > 0 && (
                <button 
                  className="read-now-btn" 
                  onClick={handleBuyFullStory}
                  style={{ backgroundColor: '#ff5a00', border: 'none' }}
                >
                  MUA TRỌN BỘ
                </button>
              )}
            </div>
          </div>
        </div>

        {/* --- KHỐI ĐÁNH GIÁ TỪ ĐỘC GIẢ --- */}
        <div className="chitiet-reviews-section">
          <div className="reviews-header-flex" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <h3 onClick={() => setShowReviews(!showReviews)} style={{ cursor: "pointer" }}>
              ĐÁNH GIÁ TỪ ĐỘC GIẢ {showReviews ? "▲" : "▼"}
            </h3>
            <button
              className="write-review-btn"
              onClick={handleToggleReviewForm}
              style={{ padding: "8px 15px", borderRadius: "20px", border: "1px solid #ffcc00", background: "transparent", color: "#ffcc00", cursor: "pointer" }}
            >
              {showReviewForm ? "Hủy đánh giá" : "✎ Viết đánh giá"}
            </button>
          </div>

          {showReviews && (
            <div className="reviews-expand-area">
              {showReviewForm && user && (user.VAI_TRO === "DocGia" || user.vai_tro === "DocGia") && (
                <div className="review-form-box" style={{ border: "1px solid #444", padding: "15px", borderRadius: "10px", marginBottom: "20px" }}>
                  <h4>Chia sẻ cảm nghĩ của bạn</h4>
                  <div className="star-selector">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <span
                        key={s}
                        className={s <= newReview.sosao ? "star-active" : "star-inactive"}
                        onClick={() => setNewReview({ ...newReview, sosao: s })}
                        style={{ fontSize: "25px", cursor: "pointer" }}
                      >
                        ★
                      </span>
                    ))}
                  </div>
                  <textarea
                    value={newReview.nd}
                    onChange={(e) => setNewReview({ ...newReview, nd: e.target.value })}
                    placeholder="Truyện có hay không? Bạn thích điều gì nhất?"
                    style={{ width: "100%", height: "80px", marginTop: "10px", background: "#333", color: "#fff", padding: "10px" }}
                  />
                  <button
                    className="submit-review-btn"
                    onClick={handleSendReview}
                    style={{ marginTop: "10px", background: "#ffcc00", color: "#000", padding: "8px 20px", fontWeight: "bold", border: "none", cursor: "pointer" }}
                  >
                    Đăng đánh giá
                  </button>
                </div>
              )}

              <div className="reviews-list">
                {danhGia.length > 0 ? (
                  danhGia.map((item, index) => (
                    <div key={index} className="review-item" style={{ marginBottom: '15px', borderBottom: '1px solid #333', paddingBottom: '10px' }}>
                      <div className="review-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                          <span className="reviewer-name">{item.ten_doc_gia || item.TENDG}</span>
                          <span className="reviewer-stars">
                            {"★".repeat(item.so_sao || item.SOSAO || 0)}
                          </span>
                        </div>
                        {user?.MADG === (item.MADG || item.madg) && (
                          <button 
                            onClick={() => handleDeleteDanhGia(item.MADGIA || item.madgia)}
                            style={{ background: 'none', border: 'none', color: '#ff4444', cursor: 'pointer', fontSize: '1.1rem' }}
                          >
                            🗑️
                          </button>
                        )}
                      </div>
                      <p className="review-content">{item.noi_dung || item.ND}</p>

                      {item.MAPH || item.maph ? (
                        <div className="author-reply" style={{ marginLeft: '20px', background: '#333', padding: '10px', borderRadius: '5px', borderLeft: item.ma_tac_gia_tl ? '3px solid #ffcc00' : '3px solid #555' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span className={item.ma_tac_gia_tl ? "author-highlight" : "reader-highlight"}>
                              {item.ma_tac_gia_tl ? (
                                <strong style={{ color: '#ffcc00' }}>✍️ Tác giả: {item.ten_tac_gia_tl} <span style={{color: '#1d9bf0'}}>✔️</span></strong>
                              ) : (
                                <strong>{item.ten_doc_gia_tl || "Người dùng"}</strong>
                              )}
                            </span>
                            {(() => {
                              const currentUserId = user?.MADG || user?.madg || user?.MATG || user?.matg;
                              const responderId = item.ma_doc_gia_tl || item.ma_tac_gia_tl || item.MADG_PH || item.MATG_PH;
                              if (currentUserId && responderId && String(currentUserId) === String(responderId)) {
                                return (
                                  <button 
                                    onClick={() => handleDeletePH_DG(item.MAPH || item.maph)} 
                                    style={{ background: 'none', border: 'none', color: '#ff4444', cursor: 'pointer', fontSize: '1.1rem' }}
                                    title="Xóa phản hồi"
                                  >
                                    🗑️
                                  </button>
                                );
                              }
                              return null;
                            })()}
                          </div>
                          <p style={{ margin: '5px 0 0 0', color: '#ff0000' }}>{item.noi_dung_tl || item.NOI_DUNG_TL}</p>
                        </div>
                      ) : (
                        user && (
                          <div style={{ marginTop: '5px' }}>
                            {replyTarget?.madgia === (item.madgia || item.MADGIA) ? (
                              <div className="reply-box">
                                <textarea
                                  value={noiDungPH}
                                  onChange={(e) => setNoiDungPH(e.target.value)}
                                  placeholder="Nhập nội dung phản hồi..."
                                  style={{ width: "100%", height: "60px", background: "#222", color: "#fff", padding: "5px", marginTop: "5px" }}
                                />
                                <div style={{ marginTop: '5px' }}>
                                  <button onClick={handleSendPhanHoi} style={{ background: "#ffcc00", border: "none", padding: "3px 10px", cursor: "pointer", marginRight: "5px" }}>Gửi</button>
                                  <button onClick={() => setReplyTarget(null)} style={{ background: "#666", color: "#fff", border: "none", padding: "3px 10px", cursor: "pointer" }}>Hủy</button>
                                </div>
                              </div>
                            ) : (
                              <button 
                                className="reply-btn"
                                style={{ background: 'none', border: 'none', color: '#ffcc00', cursor: 'pointer', fontSize: '0.9rem' }}
                                onClick={() => {
                                  setReplyTarget(item);
                                  setNoiDungPH("");
                                }}
                              >
                                ↳ Trả lời
                              </button>
                            )}
                          </div>
                        )
                      )}
                    </div>
                  ))
                ) : (
                  <p className="no-chapter" style={{ color: "#333", textAlign: "center", padding: "20px" }}>
                    Truyện hiện chưa có đánh giá nào
                  </p>
                )}
              </div>
            </div>
          )}
        </div>

        {/* --- 3. KHỐI HIỂN THỊ DANH SÁCH TRUYỆN GỢI Ý (THỂ LOẠI) --- */}
    {danhSachGoiY.length > 0 && (
  <div className="chitiet-suggested-section" style={{ marginTop: "50px", borderTop: "2px solid #222", paddingTop: "30px" }}>
    <h3 style={{ color: "#fff", marginBottom: "25px", textTransform: "uppercase", letterSpacing: "1px", borderLeft: "4px solid #ffcc00", paddingLeft: "15px" }}>
      📚 Truyện cùng thể loại
    </h3>
    
    <div className="suggested-grid">
      {danhSachGoiY.map((item) => {
        const maTruyenGoiY = item.mat || item.MAT;
        return (
          <Link 
            to={`/truyen/${maTruyenGoiY}`} 
            key={maTruyenGoiY} 
            className="suggested-card-link"
          >
            <div className="suggested-card">
              <div className="img-container">
                <img
                  src={`http://localhost:5000/images/${item.hinhanh || item.HINHANH || ""}`}
                  alt={item.tent || item.TENT}
                  onError={(e) => { e.target.src = "https://via.placeholder.com/300x450?text=No+Image"; }}
                />
              </div>
              <div className="card-info">
                <h4>{item.tent || item.TENT}</h4>
                <div className="card-meta">
                  <span className="meta-item">📚 {item.so_chuong || 0} chương</span>
                  <span className="meta-rate">⭐ {Number(item.sao_trung_binh || 0).toFixed(1)}</span>
                </div>
              </div>
            </div>
          </Link>
        );
      })}
    </div>
  </div>
)}
      </div>

      {/* --- MODAL DANH SÁCH CHƯƠNG --- */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Danh sách chương</h2>
              <button className="close-btn" onClick={() => setShowModal(false)}>&times;</button>
            </div>
            <div className="modal-body">
              {loadingChuong ? (
                <div className="loading-text">Đang tải danh sách chương...</div>
              ) : danhSachChuong.length > 0 ? (
                <div className="chuong-grid">
                  {danhSachChuong.map((chuong, index) => {
                    const giaChuong = chuong.gia_xu || chuong.GIA_XU || 0;
                    return (
                      <div
                        key={chuong.mabt || index}
                        className="chuong-item-card"
                        onClick={() => handleChapterClick(chuong)}
                      >
                        <div className="chuong-item-left">
                          <span className="chuong-number">Chương {index + 1}:</span>
                          <span className="chuong-name" title={chuong.tenbt || chuong.TENBT}>
                            {chuong.tenbt || chuong.TENBT}
                          </span>
                        </div>
                        <span className={`chuong-price-badge ${giaChuong > 0 ? "has-price" : "is-free"}`}>
                          {giaChuong > 0 ? `${giaChuong} Xu` : "Miễn phí"}
                        </span>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="no-chapter" style={{ color: "#333", textAlign: "center", padding: "20px" }}>
                  Truyện hiện chưa có chương nào được duyệt.
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default ChiTietTruyen;