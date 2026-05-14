import React, { useState, useEffect } from 'react';
import Layout from '../layout/layout.jsx';
import "../../static/css/About.css";

// 1. Import các file ảnh
import biaGioiThieu from '../../static/images/biagt.jpg';
import nenTrangTrong from '../../static/images/backgroundgt.jpg'; 
import biaKet from '../../static/images/biaket.jpg'; 

const About = () => {
  const [currentPage, setCurrentPage] = useState(0);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);

  // Dữ liệu mẫu ban đầu
  const defaultPages = [
    {
      id: 1,
      front: { title: "", content: "", isCover: true, img: biaGioiThieu }, // Đã bỏ chữ trang bìa
      back: { title: "Sứ Mệnh Khởi Nguyên", content: "Chúng tôi tin rằng mỗi câu chuyện đều có một linh hồn riêng. HKL Story ra đời để bảo tồn và lan tỏa những giá trị văn học trong thời đại công nghệ số.", img: nenTrangTrong }
    },
    {
      id: 2,
      front: { title: "Trải Nghiệm Độc Bản", content: "Dự án được xây dựng bởi những lập trình viên mang tâm hồn nghệ sĩ. Chúng tôi tối ưu hóa từng dòng code để mang lại trải nghiệm tốt nhất.", img: nenTrangTrong },
      back: { title: "Công Nghệ Đột Phá", content: "Sử dụng ReactJS hiện đại kết hợp với hiệu ứng chuyển cảnh CSS3 tối tân.", img: nenTrangTrong }
    },
    {
      id: 3,
      front: { title: "Cộng Đồng Sáng Tạo", content: "Nơi tác giả có thể trực tiếp lắng nghe độc giả qua những thảo luận sâu sắc.", img: nenTrangTrong },
      back: { title: "Hệ Sinh Thái Thông Minh", content: "Tích hợp AI để gợi ý nội dung theo sở thích cá nhân và bảo vệ thị giác.", img: nenTrangTrong }
    },
    {
      id: 4,
      front: { title: "Cam Kết & Tầm Nhìn", content: "Mọi dữ liệu cá nhân được mã hóa tuyệt đối. HKL Story hướng tới thư viện số hàng đầu.", img: nenTrangTrong },
      back: { title: "Hành Trình Mới", content: "Cảm ơn bạn đã đồng hành cùng HKL Story trên con đường chinh phục những con chữ.", img: nenTrangTrong }
    },
    {
      id: 5, // TRANG CUỐI CÙNG
      front: { title: "Thông Tin Liên Hệ", content: "Email: support@hklstory.com\nĐịa chỉ: Khu Công nghệ phần mềm, ĐHQG HCM.", img: nenTrangTrong },
      back: { title: "", content: "", isCover: true, img: biaKet } 
    }
  ];

  const [pages, setPages] = useState(() => {
    const savedData = localStorage.getItem('hkl_about_content');
    if (savedData) {
      const parsed = JSON.parse(savedData);
      return parsed.map((page, index) => {
        // Cập nhật lại đường dẫn ảnh từ hệ thống
        if (index === 0) {
          page.front.img = biaGioiThieu;
          page.front.title = ""; // Ép bìa đầu không chữ
        }
        if (index === parsed.length - 1) {
          page.back.img = biaKet;
          page.back.isCover = true;
          page.back.title = ""; 
          page.back.content = ""; 
        }
        
        if (!page.front.isCover) page.front.img = nenTrangTrong;
        if (!page.back.isCover) page.back.img = nenTrangTrong;
        return page;
      });
    }
    return defaultPages;
  });

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user'));
    if (user && (user.VAI_TRO === 'Admin' || user.vai_tro === 'Admin')) {
      setIsAdmin(true);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('hkl_about_content', JSON.stringify(pages));
  }, [pages]);

  const handleUpdate = (index, side, field, value) => {
    const newPages = [...pages];
    newPages[index][side][field] = value;
    setPages(newPages);
  };

  return (
    <Layout>
      <div className="about-wrapper">
        {isAdmin && (
          <div className="admin-control-panel">
            <div className="admin-info">Admin: {JSON.parse(localStorage.getItem('user'))?.tendn}</div>
            <button className={`admin-btn ${isEditMode ? 'btn-active' : ''}`} onClick={() => setIsEditMode(!isEditMode)}>
              {isEditMode ? "💾 Lưu nội dung" : "✏️ Chỉnh sửa trang"}
            </button>
          </div>
        )}

        {!isEditMode && (
          <div className="navigation-controls">
            <div className="arrow-slot left">
              {currentPage > 0 && <button className="nav-arrow" onClick={() => setCurrentPage(currentPage - 1)}><span>❮</span></button>}
            </div>
            <div className="arrow-slot right">
              {currentPage < pages.length && <button className="nav-arrow" onClick={() => setCurrentPage(currentPage + 1)}><span>❯</span></button>}
            </div>
          </div>
        )}

        {/* Cập nhật logic is-open: chỉ khi currentPage > 0 thì mới dịch chuyển sách sang phải */}
        <div className={`book-system ${currentPage > 0 ? "is-open" : ""}`}>
          {pages.map((page, index) => (
            <div 
              key={page.id}
              className={`paper ${currentPage > index ? "flipped" : ""}`} 
              style={{ zIndex: currentPage > index ? index + 1 : pages.length - index }}
              onClick={() => !isEditMode && currentPage === index && setCurrentPage(index + 1)}
            >
              {/* MẶT TRƯỚC (FRONT) */}
              <div 
                className={`front ${page.front.isCover ? "cover-only-img" : "inner-page-bg"}`}
                style={{ backgroundImage: !page.front.isCover ? `url(${page.front.img})` : 'none' }}
              >
                {page.front.isCover && !isEditMode ? (
                  <div className="full-cover-container">
                    <img src={page.front.img} className="cover-bg-image" alt="Cover" />
                    {/* Chỉ hiện overlay khi có chữ */}
                    {page.front.title && (
                       <div className="cover-overlay"><h1 className="book-title">{page.front.title}</h1></div>
                    )}
                  </div>
                ) : (
                  <div className={page.front.isCover ? "content" : "glass-content scrollable blur-effect"}>
                    {isEditMode ? (
                      <div className="edit-box" onClick={(e) => e.stopPropagation()}>
                        <label>Tiêu đề:</label>
                        <input className="admin-edit-input" value={page.front.title} onChange={(e) => handleUpdate(index, 'front', 'title', e.target.value)} />
                        <label>Nội dung:</label>
                        <textarea className="admin-edit-textarea" value={page.front.content} onChange={(e) => handleUpdate(index, 'front', 'content', e.target.value)} />
                      </div>
                    ) : (
                      <><h1 className="book-title">{page.front.title}</h1><div className="divider"></div><p className="book-text">{page.front.content}</p></>
                    )}
                  </div>
                )}
              </div>

              {/* MẶT SAU (BACK) */}
              <div 
                className={`back ${page.back.isCover ? "cover-only-img" : "inner-page-bg"}`}
                style={{ backgroundImage: !page.back.isCover ? `url(${page.back.img})` : 'none' }}
              >
                {page.back.isCover && !isEditMode ? (
                  <div className="full-cover-container">
                    <img src={page.back.img} className="cover-bg-image" alt="Back Cover" />
                    {page.back.title && (
                      <div className="cover-overlay"><h1 className="book-title">{page.back.title}</h1></div>
                    )}
                  </div>
                ) : (
                  <div className="glass-content scrollable blur-effect">
                    {isEditMode ? (
                      <div className="edit-box" onClick={(e) => e.stopPropagation()}>
                        <label>Tiêu đề:</label>
                        <input className="admin-edit-input" value={page.back.title} onChange={(e) => handleUpdate(index, 'back', 'title', e.target.value)} />
                        <label>Nội dung:</label>
                        <textarea className="admin-edit-textarea" value={page.back.content} onChange={(e) => handleUpdate(index, 'back', 'content', e.target.value)} />
                      </div>
                    ) : (
                      <><h3 className="book-title-small">{page.back.title}</h3><div className="divider-small"></div><p className="book-text">{page.back.content}</p></>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </Layout>
  );
};

export default About;