import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Layout from "../layout/layout.jsx";
import "../../static/css/DocTruyen.css";

const DocTruyen = () => {
  const { mabt } = useParams();
  const navigate = useNavigate();

  const [chuong, setChuong] = useState(null);
  const [danhSachChuong, setDanhSachChuong] = useState([]);
  const [loading, setLoading] = useState(true);

  const [binhLuan, setBinhLuan] = useState([]);
  const [noiDungBL, setNoiDungBL] = useState("");
  const [replyTarget, setReplyTarget] = useState(null);
  const [user, setUser] = useState(JSON.parse(localStorage.getItem("user")));
  
  // Logic mới: Trạng thái quyền truy cập
  const [hasAccess, setHasAccess] = useState(false);

  useEffect(() => {
    const fetchContent = async () => {
      setLoading(true);
      try {
        const res = await fetch(`https://hkl-backend.onrender.com/api/chuong/noidung/${mabt}`);
        const data = await res.json();
        setChuong(data);

        const maTruyen = data.mat || data.MAT;
        const tenBanThao = data.tenbt || data.TENBT;
        const giaChuong = data.gia_xu || data.GIA_XU || 0;

        // 1. Kiểm tra quyền truy cập nếu chương có phí
        if (giaChuong > 0) {
          const madg = user?.MADG || user?.madg;
          if (!madg) {
            setHasAccess(false);
          } else {
            const checkRes = await fetch(`https://hkl-backend.onrender.com/api/chuong/check-quyen?mabt=${mabt}&madg=${madg}`);
            const checkData = await checkRes.json();
            setHasAccess(checkData.purchased);
          }
        } else {
          setHasAccess(true); // Miễn phí thì cho đọc
        }

        // 2. Lưu lịch sử đọc
        const storedUser = localStorage.getItem("user");
        if (storedUser && maTruyen && tenBanThao) {
          const userObj = JSON.parse(storedUser);
          saveReadingHistory(userObj.MADG || userObj.madg, maTruyen, tenBanThao);
        }

        // 3. Tải các dữ liệu phụ trợ
        if (maTruyen) fetchDanhSachChuong(maTruyen);
        loadBinhLuan();
        
        setLoading(false);
        window.scrollTo(0, 0);
      } catch (err) {
        console.error("Lỗi tải nội dung:", err);
        setLoading(false);
      }
    };

    fetchContent();
  }, [mabt]);

  // Logic mới: Hàm xử lý mua chương
  const handleBuyChapter = async () => {
    if (!user) {
        alert("Vui lòng đăng nhập để thực hiện giao dịch!");
        return;
    }
    
    const gia = chuong.gia_xu || chuong.GIA_XU;
    if (window.confirm(`Xác nhận dùng ${gia} Xu để mở khóa chương này?`)) {
      try {
        const res = await fetch("https://hkl-backend.onrender.com/api/chuong/mua-le", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            madg: user.MADG || user.madg,
            mabt: mabt,
            so_xu: gia,
            mat: chuong.MAT || chuong.mat
          })
        });
        const data = await res.json();
        if (res.ok) {
          alert(data.message);
          setHasAccess(true); // Mở khóa ngay
        } else {
          alert(data.message);
        }
      } catch (err) {
        alert("Lỗi kết nối thanh toán!");
      }
    }
  };

  const loadBinhLuan = () => {
    fetch(`https://hkl-backend.onrender.com/api/binh-luan/chuong/${mabt}`)
      .then(res => res.ok ? res.json() : [])
      .then(data => setBinhLuan(data))
      .catch(err => {
        console.error("Lỗi tải bình luận:", err);
        setBinhLuan([]);
      });
  };

  const groupedBinhLuan = binhLuan.reduce((acc, current) => {
    const mablId = current.MABL || current.mabl;
    const maphId = current.MAPH || current.maph;

    let existing = acc.find(item => (item.MABL || item.mabl) === mablId);

    if (existing) {
      if (maphId) {
        if (!existing.replies) existing.replies = [];
        if (!existing.replies.find(r => (r.MAPH || r.maph) === maphId)) {
          existing.replies.push({
            MAPH: maphId,
            noi_dung_ph: current.noi_dung_ph || current.NOI_DUNG_PH,
            ma_tac_gia_ph: current.ma_tac_gia_ph || current.MATG_PH,
            ma_doc_gia_ph: current.ma_doc_gia_ph || current.MADG_PH,
            ten_tac_gia_ph: current.ten_tac_gia_ph || current.TENTG_PH,
            ten_doc_gia_ph: current.ten_doc_gia_ph || current.TENDG_PH
          });
        }
      }
    } else {
      acc.push({
        ...current,
        replies: maphId ? [{
          MAPH: maphId,
          noi_dung_ph: current.noi_dung_ph || current.NOI_DUNG_PH,
          ma_tac_gia_ph: current.ma_tac_gia_ph || current.MATG_PH,
          ma_doc_gia_ph: current.ma_doc_gia_ph || current.MADG_PH,
          ten_tac_gia_ph: current.ten_tac_gia_ph || current.TENTG_PH,
          ten_doc_gia_ph: current.ten_doc_gia_ph || current.TENDG_PH
        }] : []
      });
    }
    return acc;
  }, []);

  const handleSendBinhLuan = async () => {
    if (!noiDungBL.trim()) return;

    const isDocGia = user?.VAI_TRO === 'DocGia' || user?.vai_tro === 'DocGia';
    const isTacGia = user?.VAI_TRO === 'TacGia' || user?.vai_tro === 'TacGia';

    const body = {
        mabt: mabt,
        noi_dung: noiDungBL,
        mabl_cha: replyTarget ? (replyTarget.MABL || replyTarget.mabl) : null,
        madg: isDocGia ? (user.MADG || user.madg) : null,
        matg: isTacGia ? (user.MATG || user.matg) : null
    };

    try {
        const res = await fetch(`https://hkl-backend.onrender.com/api/binh-luan`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body)
        });
        if (res.ok) {
            setNoiDungBL("");
            setReplyTarget(null);
            loadBinhLuan(); 
        }
    } catch (err) {
        console.error("Lỗi gửi bình luận:", err);
    }
  };

  const handleDeleteBL = async (id) => {
    if (!window.confirm("Bạn có chắc muốn xóa bình luận này?")) return;
    const userId = user?.MADG || user?.madg || user?.MATG || user?.matg;
    try {
      const res = await fetch(`https://hkl-backend.onrender.com/api/binh-luan/${id}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId })
      });
      if (res.ok) {
        loadBinhLuan();
      } else {
        const errorData = await res.json();
        alert(errorData.error || "Lỗi khi xóa bình luận!");
      }
    } catch (err) {
      console.error("Lỗi xóa bình luận:", err);
    }
  };

  const handleDeletePH = async (id) => {
    if (!window.confirm("Bạn có chắc muốn xóa phản hồi này?")) return;
    const userId = user?.MADG || user?.madg || user?.MATG || user?.matg;
    try {
      const res = await fetch(`https://hkl-backend.onrender.com/api/binh-luan/phan-hoi/${id}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId })
      });
      if (res.ok) {
        loadBinhLuan();
      } else {
        const errorData = await res.json();
        alert(errorData.error || "Lỗi khi xóa phản hồi!");
      }
    } catch (err) {
      console.error("Lỗi xóa phản hồi:", err);
    }
  };

  const saveReadingHistory = (madg, mat, tenbt) => {
    fetch(`https://hkl-backend.onrender.com/api/lich-su/update`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ madg, mat, tenbt })
    })
      .then(res => res.json())
      .catch(err => console.error("Lỗi lưu lịch sử:", err));
  };

  const fetchDanhSachChuong = (maTruyen) => {
    fetch(`https://hkl-backend.onrender.com/api/chuong/truyen/${maTruyen}`)
      .then((res) => res.json())
      .then((data) => {
        setDanhSachChuong(data);
      })
      .catch((err) => console.error("Lỗi tải danh sách chương:", err));
  };

  const currentIndex = danhSachChuong.findIndex(c => String(c.mabt || c.MABT) === String(mabt));
  const prevChapter = currentIndex > 0 ? danhSachChuong[currentIndex - 1] : null;
  const nextChapter = currentIndex >= 0 && currentIndex < danhSachChuong.length - 1
    ? danhSachChuong[currentIndex + 1] : null;

  const goToChapter = (id) => {
    if (id) navigate(`/doc-truyen/${id}`);
  };

  if (loading) return (
    <Layout>
      <div className="loader-container">
        <div className="loader"></div>
        <p>Đang tải nội dung...</p>
      </div>
    </Layout>
  );

  if (!chuong) return (
    <Layout>
      <div className="error-msg">Không tìm thấy nội dung chương.</div>
    </Layout>
  );

  const currentUserId = user?.MADG || user?.madg || user?.MATG || user?.matg;

  return (
    <Layout>
      <div className="doc-truyen-container">
        <div className="nav-top">
          <button className="back-btn" onClick={() => navigate(-1)}>⬅ Quay lại</button>
        </div>

        <header className="doc-header">
          <h1 className="chuong-title">{chuong.tenbt || chuong.TENBT}</h1>
          <p className="story-name-sub">Truyện: {chuong.tent || chuong.TENT || "---"}</p>
        </header>

        <div className="chapter-navigation">
          <button
            disabled={!prevChapter}
            onClick={() => goToChapter(prevChapter.mabt || prevChapter.MABT)}
            className="nav-btn"
          >
            ⬅ Chương trước
          </button>
          <button
            disabled={!nextChapter}
            onClick={() => goToChapter(nextChapter.mabt || nextChapter.MABT)}
            className="nav-btn highlight"
          >
            Chương sau ➡
          </button>
        </div>

        <hr className="divider" />

  

<article className="doc-content">
  {hasAccess ? (
    // HIỂN THỊ NỘI DUNG NẾU CÓ QUYỀN
    <div 
      className="ql-editor" // Thêm class này để đồng nhất định dạng với lúc soạn thảo
      style={{ color: '#ff0202', lineHeight: '1.8', fontSize: '1.2rem' }}
      dangerouslySetInnerHTML={{ 
        __html: chuong.nd || chuong.ND || "Nội dung đang được cập nhật..." 
      }} 
    />
  ) : (
    // HIỂN THỊ PAYWALL NẾU CHƯA MUA (Giữ nguyên logic của bạn)
    <div className="paywall-container" style={{ textAlign: "center", padding: "40px", border: "1px dashed #ffcc00", borderRadius: "10px", margin: "20px 0" }}>
        <h2 style={{ color: "#ffcc00" }}>🔒 Chương này có phí</h2>
        <p>Bạn cần <strong>{chuong.gia_xu || chuong.GIA_XU} Xu</strong> để đọc nội dung này.</p>
        <div style={{ marginTop: "20px", display: "flex", justifyContent: "center", gap: "10px" }}>
            <button onClick={handleBuyChapter} className="nav-btn highlight">Mua Chương</button>
            <button onClick={() => navigate("/nap-xu")} className="nav-btn">Nạp thêm Xu</button>
        </div>
    </div>
  )}
</article>
        <hr className="divider" />

        <section className="comment-section">
          <h3 className="comment-title">Bình luận chương</h3>
          
          {user ? (
            <div className="comment-input-box">
              {replyTarget && (
                <div className="reply-info">
                  Đang trả lời <strong>{replyTarget.ten_nguoi_binh_luan || replyTarget.ten_tac_gia_ph || "người dùng"}</strong>
                  <button className="cancel-reply" onClick={() => setReplyTarget(null)}>Hủy</button>
                </div>
              )}
              <textarea 
                value={noiDungBL} 
                onChange={(e) => setNoiDungBL(e.target.value)}
                placeholder="Viết cảm nghĩ của bạn..."
              />
              <div className="comment-actions">
                <button className="send-comment-btn" onClick={handleSendBinhLuan}>Gửi bình luận</button>
              </div>
            </div>
          ) : (
            <p className="login-prompt">Vui lòng đăng nhập để bình luận.</p>
          )}

          <div className="comment-list">
            {groupedBinhLuan.map((item) => (
              <div key={item.MABL || item.mabl} className="comment-item">
                <div className="comment-main">
                  <div className="comment-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span className="comment-author">{item.ten_nguoi_binh_luan}</span>
                    {currentUserId === (item.madg_chu_bl || item.MADG_CHU_BL) && (
                      <button 
                        className="delete-btn-comment" 
                        onClick={() => handleDeleteBL(item.MABL || item.mabl)}
                      >
                        🗑️
                      </button>
                    )}
                  </div>
                  <p className="comment-text">{item.NOI_DUNG || item.noi_dung}</p>
                  
                  {user && (
                    <button 
                      className="reply-trigger-btn"
                      onClick={() => setReplyTarget(item)}
                      style={{ color: '#ffcc00', background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.85rem' }}
                    >
                      ↳ Trả lời
                    </button>
                  )}
                </div>

                {item.replies && item.replies.map((reply) => (
                  <div key={reply.MAPH} className="comment-reply" style={{ marginLeft: '30px', borderLeft: '2px solid #555', paddingLeft: '10px', marginTop: '10px' }}>
                    <div className="reply-header" style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span className={`comment-author ${reply.ma_tac_gia_ph ? 'author-highlight' : ''}`}>
                        {reply.ma_tac_gia_ph ? (
                          <><strong style={{color: '#ffcc00'}}>✍️ Tác giả: {reply.ten_tac_gia_ph}</strong> <span style={{color: '#1d9bf0'}}>✔️</span></>
                        ) : (
                          <strong>{reply.ten_doc_gia_ph}</strong>
                        )}
                      </span>
                      {(currentUserId === (reply.ma_doc_gia_ph || reply.MADG_PH) || currentUserId === (reply.ma_tac_gia_ph || reply.MATG_PH)) && (
                        <button className="delete-btn-comment" onClick={() => handleDeletePH(reply.MAPH)}>🗑️</button>
                      )}
                    </div>
                    <p className="comment-text">{reply.noi_dung_ph}</p>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </section>

        <div className="chapter-navigation bottom-final">
          <button
            disabled={!prevChapter}
            onClick={() => goToChapter(prevChapter.mabt || prevChapter.MABT)}
            className="nav-btn"
          >
            ⬅ Chương trước
          </button>
          <button
            disabled={!nextChapter}
            onClick={() => goToChapter(nextChapter.mabt || nextChapter.MABT)}
            className="nav-btn highlight"
          >
            Chương sau ➡
          </button>
        </div>
      </div>
    </Layout>
  );
};

export default DocTruyen;