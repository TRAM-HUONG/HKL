import React, { useState, useEffect } from 'react';
import Layout from '../layout/layout.jsx';
import "../../static/css/About.css";

const About = () => {
  const [currentPage, setCurrentPage] = useState(0);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);

  // Nội dung mới: Sâu sắc, chuyên nghiệp và đầy đủ hơn
  const defaultPages = [
    {
      id: 1,
      front: { title: "HKL STORY", content: "Kỷ nguyên mới của những người yêu chữ. Nơi tâm hồn tìm thấy sự đồng điệu qua từng trang sách số.", isCover: true, img: null },
      back: { title: "Sứ Mệnh Khởi Nguyên", content: "Chúng tôi tin rằng mỗi câu chuyện đều có một linh hồn riêng. HKL Story ra đời để bảo tồn và lan tỏa những giá trị văn học trong thời đại công nghệ số, biến những con chữ khô khan thành trải nghiệm sống động.", img: null }
    },
    {
      id: 2,
      front: { title: "Trải Nghiệm Độc Bản", content: "Dự án được xây dựng bởi những lập trình viên mang tâm hồn nghệ sĩ. Chúng tôi tối ưu hóa từng dòng code để mang lại cảm giác lật trang mượt mà, chân thực như đang cầm trên tay một cuốn sách giấy quý giá.", img: null },
      back: { title: "Công Nghệ Đột Phá", content: "Sử dụng ReactJS hiện đại kết hợp với hiệu ứng chuyển cảnh CSS3 tối tân. Hệ thống tự động thích nghi với mọi thiết bị, giúp bạn có thể đọc sách mọi lúc, mọi nơi.", img: null }
    },
    {
      id: 3,
      front: { title: "Cộng Đồng Sáng Tạo", content: "Hơn cả một trang web đọc truyện, đây là không gian tương tác đa chiều. Nơi tác giả có thể trực tiếp lắng nghe độc giả, và độc giả có thể trở thành một phần của tác phẩm thông qua những thảo luận sâu sắc.", img: null },
      back: { title: "Hệ Sinh Thái Thông Minh", content: "Tích hợp AI để gợi ý nội dung theo sở thích cá nhân, cùng chế độ đọc tùy chỉnh tối đa (Dark Mode, tùy chỉnh Font) để bảo vệ thị giác và tối ưu hóa sự tập trung của bạn.", img: null }
    },
    {
      id: 4,
      front: { title: "Cam Kết & Tầm Nhìn", content: "Mọi dữ liệu cá nhân được mã hóa tuyệt đối. HKL Story cam kết tôn trọng bản quyền và quyền lợi của cộng tác viên, hướng tới mục tiêu trở thành thư viện số hàng đầu khu vực vào năm 2030.", img: null },
      back: { title: "Kết Nối Với Chúng Tôi", content: "Email: support@hklstory.com\nĐịa chỉ: Khu Công nghệ phần mềm, ĐHQG HCM.\nHotline: 1900 xxxx\n\nCảm ơn bạn đã đồng hành cùng hành trình chinh phục tri thức số!", img: null }
    }
  ];

  const [pages, setPages] = useState(() => {
    const savedData = localStorage.getItem('hkl_about_content');
    return savedData ? JSON.parse(savedData) : defaultPages;
  });

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user'));
    if (user && user.vai_tro === 'Admin') setIsAdmin(true);
  }, []);

  useEffect(() => {
    localStorage.setItem('hkl_about_content', JSON.stringify(pages));
  }, [pages]);

  const handleUpdate = (index, side, field, value) => {
    const newPages = [...pages];
    newPages[index][side][field] = value;
    setPages(newPages);
  };

  const handleFileUpload = (e, index, side) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => handleUpdate(index, side, 'img', reader.result);
      reader.readAsDataURL(file);
    }
  };

  const addNewPage = () => {
    setPages([...pages, {
      id: Date.now(),
      front: { title: "Tiêu đề mới", content: "Nội dung...", img: null },
      back: { title: "Nội dung sau", content: "Nội dung...", img: null }
    }]);
  };

  return (
    <Layout>
      <div className="about-wrapper">
        {isAdmin && (
          <div className="admin-control-panel">
            <div className="admin-info">Admin: {JSON.parse(localStorage.getItem('user'))?.tendn}</div>
            <button className={`admin-btn ${isEditMode ? 'btn-active' : ''}`} onClick={() => setIsEditMode(!isEditMode)}>
              {isEditMode ? "💾 Thoát & Lưu" : "✏️ Sửa giới thiệu"}
            </button>
            {isEditMode && <button className="admin-btn btn-add" onClick={addNewPage}>➕ Thêm trang</button>}
          </div>
        )}

        <div className={`book-system ${currentPage > 0 ? "is-open" : ""}`}>
          {pages.map((page, index) => (
            <div 
              key={page.id}
              className={`paper ${currentPage > index ? "flipped" : ""}`} 
              style={{ zIndex: pages.length - index }}
              onClick={() => !isEditMode && currentPage <= index && setCurrentPage(index + 1)}
            >
              {/* MẶT TRƯỚC */}
              <div className={`front mesh-gradient-${(index % 3) + 1}`}>
                <div className={page.front.isCover ? "content" : "glass-content scrollable"}>
                  {isEditMode ? (
                    <div className="edit-box" onClick={(e) => e.stopPropagation()}>
                      <input className="admin-edit-input" value={page.front.title} onChange={(e) => handleUpdate(index, 'front', 'title', e.target.value)} />
                      <label className="img-upload-label">🖼️ Tải ảnh<input type="file" hidden onChange={(e) => handleFileUpload(e, index, 'front')} /></label>
                      
                      {/* Thêm phần hiển thị và xóa ảnh mặt trước */}
                      {page.front.img && (
                        <div className="admin-img-container">
                          <img src={page.front.img} className="admin-img-preview" alt="" />
                          <button className="delete-img-btn" onClick={() => handleUpdate(index, 'front', 'img', null)}>❌ Xóa ảnh</button>
                        </div>
                      )}
                      
                      <textarea className="admin-edit-textarea" value={page.front.content} onChange={(e) => handleUpdate(index, 'front', 'content', e.target.value)} />
                    </div>
                  ) : (
                    <>
                      <h1 className="book-title">{page.front.title}</h1>
                      <div className="divider"></div>
                      {page.front.img && <img src={page.front.img} className="illustration-img" alt="" />}
                      <p className="book-text">{page.front.content}</p>
                    </>
                  )}
                </div>
              </div>

              {/* MẶT SAU */}
              <div className={`back mesh-gradient-${((index + 1) % 3) + 1}`}>
                <div className="glass-content scrollable">
                  {isEditMode ? (
                    <div className="edit-box" onClick={(e) => e.stopPropagation()}>
                      <input className="admin-edit-input" value={page.back.title} onChange={(e) => handleUpdate(index, 'back', 'title', e.target.value)} />
                      <label className="img-upload-label">🖼️ Tải ảnh<input type="file" hidden onChange={(e) => handleFileUpload(e, index, 'back')} /></label>
                      
                      {/* Thêm phần hiển thị và xóa ảnh mặt sau */}
                      {page.back.img && (
                        <div className="admin-img-container">
                          <img src={page.back.img} className="admin-img-preview" alt="" />
                          <button className="delete-img-btn" onClick={() => handleUpdate(index, 'back', 'img', null)}>❌ Xóa ảnh</button>
                        </div>
                      )}
                      
                      <textarea className="admin-edit-textarea" value={page.back.content} onChange={(e) => handleUpdate(index, 'back', 'content', e.target.value)} />
                    </div>
                  ) : (
                    <>
                      <h3>{page.back.title}</h3>
                      {page.back.img && <img src={page.back.img} className="illustration-img" alt="" />}
                      <p className="book-text">{page.back.content}</p>
                    </>
                  )}
                  <button className="back-btn" onClick={(e) => { e.stopPropagation(); setCurrentPage(index); }}>Quay lại</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </Layout>
  );
};

export default About;