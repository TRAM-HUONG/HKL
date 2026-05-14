import React, { useState, useEffect } from "react";
import Layout from "../layout/layout.jsx";
import "../../static/css/Profile.css";

const Profile = () => {
  // --- STATE QUẢN LÝ ---
  const [user, setUser] = useState(null);
  const [lichSu, setLichSu] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({ ten_that: "", email: "", sdt: "" });
  const [loading, setLoading] = useState(true);
  const [finance, setFinance] = useState({ so_du: 0, tong_nap: 0, da_mua: [] });
  
  // State lưu doanh thu cho Tác giả
  const [doanhThu, setDoanhThu] = useState({ tong_nhan: 0, chi_tiet: [] });

  // State mới: Quản lý rút tiền
  const [showWithdrawForm, setShowWithdrawForm] = useState(false);
  // Cập nhật cấu trúc withdrawData để chia nhỏ thông tin ngân hàng
  const [withdrawData, setWithdrawData] = useState({ 
    xu: 0, 
    soTK: "", 
    nganHang: "", 
    tenChuTK: "", 
    ghiChu: "" 
  });

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
        const role = parsedUser.VAI_TRO || parsedUser.vai_tro;

        setFormData({
          ten_that: parsedUser.ten_that || parsedUser.TENTG || parsedUser.TENDG || parsedUser.TENDN || parsedUser.tendn || "",
          email: parsedUser.EMAIL || parsedUser.email || "",
          sdt: parsedUser.SDT || parsedUser.sdt || "",
        });

        // Lấy lịch sử đọc
        fetchLichSu(parsedUser.MADG || parsedUser.madg);
        
        // Nếu là Độc giả thì lấy thông tin nạp/mua
        if (role === 'DocGia') {
            fetchFinance(parsedUser.MATK || parsedUser.matk);
        }
        
        // Nếu là Tác giả thì lấy thông tin doanh thu
        if (role === 'TacGia') {
            fetchDoanhThu(parsedUser.MATG || parsedUser.matg);
        }

      } catch (err) {
        console.error("Lỗi đọc dữ liệu user:", err);
      }
    }
    setLoading(false);
  }, []);

  // --- 1. API: LẤY DOANH THU TÁC GIẢ ---
  const fetchDoanhThu = async (matg) => {
    if (!matg) return;
    try {
      const response = await fetch(`http://localhost:5000/api/user/tac-gia/doanh-thu/${matg}`);
      if (response.ok) {
        const data = await response.json();
        setDoanhThu(data);
      }
    } catch (err) {
      console.error("Lỗi lấy doanh thu:", err);
    }
  };

  // --- API MỚI: GỬI YÊU CẦU RÚT TIỀN ---
  const handleWithdrawRequest = async () => {
    if (withdrawData.xu < 100) return alert("Mỗi lần rút tối thiểu 100 xu!");
    if (!withdrawData.soTK || !withdrawData.nganHang || !withdrawData.tenChuTK) {
        return alert("Vui lòng nhập đầy đủ thông tin chuyển khoản!");
    }

    // Gộp thông tin thành chuỗi để gửi lên backend theo cấu trúc cũ
    const fullBankInfo = `STK: ${withdrawData.soTK} - Ngân hàng: ${withdrawData.nganHang} - Chủ TK: ${withdrawData.tenChuTK} ${withdrawData.ghiChu ? '(Ghi chú: ' + withdrawData.ghiChu + ')' : ''}`;

    try {
      const res = await fetch(`http://localhost:5000/api/user/withdraw/request`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          matg: user.MATG || user.matg,
          matk: user.MATK || user.matk,
          so_xu: withdrawData.xu,
          thong_tin_the: fullBankInfo
        })
      });
      const data = await res.json();
      if (res.ok) {
        alert(data.message);
        setShowWithdrawForm(false);
      } else {
        alert(data.message);
      }
    } catch (err) {
      console.error("Lỗi gửi yêu cầu rút tiền:", err);
    }
  };

  // --- 2. API: LẤY LỊCH SỬ ĐỌC ---
  const fetchLichSu = async (madg) => {
    if (!madg) return;
    try {
      const response = await fetch(`http://localhost:5000/api/lich-su/${madg}`);
      if (response.ok) {
        const data = await response.json();
        setLichSu(Array.isArray(data) ? data : []);
      }
    } catch (err) {
      console.error("Lỗi lấy lịch sử:", err);
    }
  };

  // --- 3. API: LẤY THÔNG TIN TÀI CHÍNH ---
  const fetchFinance = async (matk) => {
    if (!matk) return;
    try {
      const response = await fetch(`http://localhost:5000/api/user/financial-info/${matk}`);
      if (response.ok) {
        const data = await response.json();
        setFinance(data);
      }
    } catch (err) {
      console.error("Lỗi lấy thông tin tài chính:", err);
    }
  };

  // --- 4. API: CẬP NHẬT THÔNG TIN CÁ NHÂN ---
  const handleUpdateInfo = async (e) => {
    e.preventDefault();
    const updateData = {
      matk: user.MATK || user.matk,
      vai_tro: user.VAI_TRO || user.vai_tro,
      ...formData
    };

    try {
      const response = await fetch(`http://localhost:5000/api/user/update`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updateData),
      });

      const result = await response.json();

      if (response.ok) {
        alert("Cập nhật thông tin thành công!");
        const updatedUser = { ...user, ...formData };
        localStorage.setItem("user", JSON.stringify(updatedUser));
        setUser(updatedUser);
        setIsEditing(false);
      } else {
        alert("Lỗi: " + (result.error || "Không thể cập nhật"));
      }
    } catch (err) {
      alert("Lỗi kết nối server khi cập nhật.");
    }
  };

  // --- 5. API: XÓA LỊCH SỬ ĐỌC ---
  const handleDeleteLichSu = async (mat) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa truyện này khỏi lịch sử đọc?")) {
      try {
        const response = await fetch(`http://localhost:5000/api/lich-su/delete`, {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ 
            madg: user.MADG || user.madg, 
            mat: mat 
          }),
        });

        if (response.ok) {
          setLichSu(lichSu.filter((item) => item.mat !== mat));
        } else {
          alert("Không thể xóa lịch sử lúc này.");
        }
      } catch (err) {
        console.error("Lỗi xóa lịch sử:", err);
      }
    }
  };

  if (loading) return <Layout><div className="profile-container">Đang tải...</div></Layout>;
  if (!user) return <Layout><div className="profile-container">Vui lòng đăng nhập.</div></Layout>;
  
  const role = user?.VAI_TRO || user?.vai_tro;

  return (
    <Layout>
      <div className="profile-container">
        <h2>Hồ sơ cá nhân</h2>

        {/* PHẦN THÔNG TIN TÀI KHOẢN */}
        <div className="profile-card">
          <h3><span className="icon">👤</span> Thông tin tài khoản</h3>
          {!isEditing ? (
            <div className="info-display">
              <p><strong>Họ và tên:</strong> {formData.ten_that}</p>
              <p><strong>Email:</strong> {formData.email || "Chưa cập nhật"}</p>
              <p><strong>Số điện thoại:</strong> {formData.sdt || "Chưa cập nhật"}</p>
              <p><strong>Vai trò:</strong> {role}</p>
              <button className="edit-btn" onClick={() => setIsEditing(true)}>Chỉnh sửa</button>
            </div>
          ) : (
            <form onSubmit={handleUpdateInfo} className="info-form">
              <div className="form-group">
                <label>Họ và tên</label>
                <input 
                  type="text" 
                  value={formData.ten_that} 
                  onChange={(e) => setFormData({...formData, ten_that: e.target.value})} 
                  required 
                />
              </div>
              <div className="form-group">
                <label>Email</label>
                <input 
                  type="email" 
                  value={formData.email} 
                  onChange={(e) => setFormData({...formData, email: e.target.value})} 
                />
              </div>
              <div className="form-group">
                <label>Số điện thoại</label>
                <input 
                  type="text" 
                  value={formData.sdt} 
                  onChange={(e) => setFormData({...formData, sdt: e.target.value})} 
                />
              </div>
              <div className="form-btns">
                <button type="submit" className="save-btn">Lưu thay đổi</button>
                <button type="button" className="cancel-btn" onClick={() => setIsEditing(false)}>Hủy</button>
              </div>
            </form>
          )}
        </div>

        {/* HIỂN THỊ THÔNG TIN TÀI CHÍNH CHO ĐỘC GIẢ */}
        {role === 'DocGia' && (
          <>
            <div className="profile-card finance-card">
              <h3><span className="icon">💰</span> Quản lý tài chính</h3>
              <div className="finance-grid">
                <div className="finance-item">
                  <p>Số xu hiện có</p>
                  <span className="coin-value">{finance.so_du} Xu</span>
                </div>
                <div className="finance-item">
                  <p>Tổng tiền đã nạp</p>
                  <span className="money-value">
                    {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(finance.tong_nap)}
                  </span>
                </div>
              </div>
            </div>

            <div className="history-section">
              <h3><span className="icon">💳</span> Chương đã mua</h3>
              <div className="bought-list">
                {finance.da_mua.length > 0 ? (
                  <div className="bought-table-container">
                    <table className="bought-table">
                      <thead>
                        <tr>
                          <th>Truyện</th>
                          <th>Nội dung mua</th>
                          <th>Giá</th>
                          <th>Ngày mua</th>
                        </tr>
                      </thead>
                      <tbody>
                        {finance.da_mua.map((item, index) => (
                          <tr key={index}>
                            <td><strong>{item.tent}</strong></td>
                            <td>{item.loai_mua === 'TRON_GOI' ? 'Trọn bộ truyện' : (item.tenbt || 'Chương lẻ')}</td>
                            <td>{item.so_xu_ra} xu</td>
                            <td>{new Date(item.ngay_mua).toLocaleDateString('vi-VN')}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p className="empty-msg">Bạn chưa thực hiện giao dịch mua chương nào.</p>
                )}
              </div>
            </div>
          </>
        )}

        {/* HIỂN THỊ DOANH THU CHO TÁC GIẢ */}
        {role === 'TacGia' && (
          <>
            <div className="profile-card finance-card">
              <h3><span className="icon">📈</span> Thống kê doanh thu</h3>
              <div className="finance-grid">
                <div className="finance-item">
                  <p>Tổng xu thực nhận (70%):</p>
                  <span className="coin-value" style={{color: "#28a745"}}>{doanhThu.tong_nhan} Xu</span>
                  <button 
                    className="edit-btn" 
                    onClick={() => setShowWithdrawForm(true)} 
                    style={{marginTop: '15px', width: '100%'}}
                  >
                    Yêu cầu rút tiền
                  </button>
                </div>
              </div>

              {showWithdrawForm && (
                <div className="withdraw-form-overlay" style={{marginTop: '20px', padding: '15px', border: '1px solid #ddd', borderRadius: '8px', background: '#f9f9f9'}}>
                  <h4 style={{marginBottom: '15px', color: '#ff6b6b'}}>Gửi yêu cầu rút tiền</h4>
                  
                  <div className="form-group">
                    <label>Số xu muốn rút (Min: 100)</label>
                    <input 
                      type="number" 
                      placeholder="VD: 500"
                      onChange={(e) => setWithdrawData({...withdrawData, xu: parseInt(e.target.value)})}
                    />
                  </div>

                  <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px'}}>
                    <div className="form-group">
                      <label>Số tài khoản</label>
                      <input 
                        type="text" 
                        placeholder="Nhập số tài khoản"
                        onChange={(e) => setWithdrawData({...withdrawData, soTK: e.target.value})}
                      />
                    </div>
                    <div className="form-group">
                      <label>Ngân hàng</label>
                      <input 
                        type="text" 
                        placeholder="VD: Vietcombank, MB..."
                        onChange={(e) => setWithdrawData({...withdrawData, nganHang: e.target.value})}
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label>Tên chủ tài khoản</label>
                    <input 
                      type="text" 
                      placeholder="Nhập tên không dấu"
                      onChange={(e) => setWithdrawData({...withdrawData, tenChuTK: e.target.value})}
                    />
                    <small style={{color: '#d9534f', fontWeight: 'bold'}}>* Lưu ý: Tên chủ tài khoản phải trùng khớp với tên Tác giả.</small>
                  </div>

                  <div className="form-group">
                    <label>Ghi chú yêu cầu (nếu có)</label>
                    <textarea 
                      placeholder="Lưu ý thêm cho quản trị viên..."
                      onChange={(e) => setWithdrawData({...withdrawData, ghiChu: e.target.value})}
                    ></textarea>
                  </div>

                  <div className="form-btns" style={{marginTop: '15px'}}>
                    <button className="save-btn" onClick={handleWithdrawRequest}>Xác nhận gửi</button>
                    <button className="cancel-btn" onClick={() => setShowWithdrawForm(false)}>Hủy</button>
                  </div>
                </div>
              )}
            </div>

            <div className="history-section">
              <h3><span className="icon">📊</span> Chi tiết tác phẩm đã bán</h3>
              <div className="bought-list">
                {doanhThu.chi_tiet.length > 0 ? (
                  <div className="bought-table-container">
                    <table className="bought-table">
                      <thead>
                        <tr>
                          <th>Truyện</th>
                          <th>Nội dung</th>
                          <th>Giá bán</th>
                          <th>Doanh thu (70%)</th>
                          <th>Ngày giao dịch</th>
                        </tr>
                      </thead>
                      <tbody>
                        {doanhThu.chi_tiet.map((item, index) => (
                          <tr key={index}>
                            <td><strong>{item.tent}</strong></td>
                            <td>{item.tenbt || 'Trọn bộ'}</td>
                            <td>{item.tong_xu} xu</td>
                            <td style={{fontWeight: "bold", color: "#28a745"}}>+{item.xu_tac_gia} xu</td>
                            <td>{new Date(item.ngay_giao_dich).toLocaleDateString('vi-VN')}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p className="empty-msg">Chưa có dữ liệu bán tác phẩm.</p>
                )}
              </div>
            </div>
          </>
        )}

        {/* PHẦN LỊCH SỬ ĐỌC */}
        {role !== 'Admin' && (
          <div className="history-section">
            <h3><span className="icon">📖</span> Lịch sử đọc gần đây</h3>
            <div className="history-list">
              {lichSu.length > 0 ? (
                lichSu.map((item, index) => (
                  <div key={index} className="history-item">
                    <img 
                      src={`http://localhost:5000/images/${item.hinhanh}`} 
                      alt={item.tent} 
                      onError={(e) => e.target.src = "https://via.placeholder.com/100x150?text=No+Image"}
                    />
                    <div className="history-info">
                      <h4>{item.tent}</h4>
                      <p className="reading-chapter">Chương: {item.ten_chuong || item.lsd}</p>
                      <small>Ngày đọc: {new Date(item.ngay_cap_nhat).toLocaleString('vi-VN')}</small>
                    </div>
                    <button 
                      className="del-hist-btn" 
                      onClick={() => handleDeleteLichSu(item.mat)}
                      title="Xóa lịch sử"
                    >
                      Xóa
                    </button>
                  </div>
                ))
              ) : (
                <div className="empty-history">
                  <p>Danh sách lịch sử trống.</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Profile;