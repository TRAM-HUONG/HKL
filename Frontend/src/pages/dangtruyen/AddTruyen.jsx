import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "../layout/layout.jsx";
import "../../static/css/AddTruyen.css";
import CreatableSelect from 'react-select/creatable';

const AddTruyen = () => {
    const navigate = useNavigate();
    const [theLoaiList, setTheLoaiList] = useState([]);
    const [selectedFile, setSelectedFile] = useState(null);
    const [loading, setLoading] = useState(false);
    const [selectedTheLoai, setSelectedTheLoai] = useState([]);
    const [user] = useState(JSON.parse(localStorage.getItem("user")));
    const [formData, setFormData] = useState({
        tent: "",
        nxb: "",
        mota: "",
        gia_tron_goi: 0
    });

    useEffect(() => {
        fetch("https://hkl-backend-v3uu.onrender.com/api/danh-muc")
            .then(res => res.json())
            .then(data => {
                const options = data.map(tl => ({
                    value: tl.MATL || tl.matl,
                    label: tl.TENTL || tl.tentl
                }));
                setTheLoaiList(options);
            })
            .catch(err => console.error("Lỗi tải thể loại:", err));
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!user) {
            alert("Vui lòng đăng nhập với vai trò Tác giả!");
            return;
        }
        if (selectedTheLoai.length === 0) {
            alert("Vui lòng chọn hoặc thêm ít nhất một thể loại!");
            return;
        }

        setLoading(true);
        const data = new FormData();
        data.append("tent", formData.tent);
        data.append("nxb", formData.nxb);
        data.append("mota", formData.mota);
        data.append("gia_tron_goi", formData.gia_tron_goi);
        data.append("matg", user.MATG || user.matg);
        
        const theLoaiData = selectedTheLoai.map(item => ({
            id: item.__isNew__ ? 'new' : item.value,
            name: item.label
        }));
        data.append("theloai", JSON.stringify(theLoaiData));

        if (selectedFile) {
            data.append("hinhanh", selectedFile);
        }

        try {
            const response = await fetch("https://hkl-backend-v3uu.onrender.com/api/truyen/register", {
                method: "POST",
                body: data 
            });
            const result = await response.json();
            if (response.ok) {
                alert(`Đăng ký thành công! yêu cầu của bạn đang đợi duyệt.`);
                navigate("/quan-ly-tac-pham");
            } else {
                alert(result.error || "Có lỗi xảy ra khi đăng ký.");
            }
        } catch (err) {
            console.error("Lỗi gửi form:", err);
            alert("Không thể kết nối đến server.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Layout>
            <div className="add-truyen-wrapper">
                <div className="add-truyen-container">
                    {/* Phần Header Mới */}
                    <div className="form-header-section">
                        <h2 className="form-title">Đăng ký tác phẩm</h2>
                        <p className="form-info">Tạo nên dấu ấn cá nhân của bạn trên hệ thống</p>
                    </div>

                    <form className="add-form" onSubmit={handleSubmit}>
                        {/* CỘT TRÁI */}
                        <div className="form-left-col">
                            <div className="form-group">
                                <label>💎 Tên tác phẩm:</label>
                                <input 
                                    type="text" 
                                    placeholder="Nhập tên truyện..." 
                                    required 
                                    value={formData.tent}
                                    onChange={e => setFormData({...formData, tent: e.target.value})} 
                                />
                            </div>

                            <div className="form-group">
                                <label>🏢 Nhà xuất bản:</label>
                                <input 
                                    type="text" 
                                    placeholder="Tên NXB (nếu có)..." 
                                    value={formData.nxb}
                                    onChange={e => setFormData({...formData, nxb: e.target.value})} 
                                />
                            </div>

                            <div className="form-group">
                                <label>💰 Giá bán trọn bộ (Xu):</label>
                                <input 
                                    type="number" 
                                    placeholder="Ví dụ: 300" 
                                    min="0"
                                    value={formData.gia_tron_goi}
                                    onChange={e => setFormData({...formData, gia_tron_goi: e.target.value})} 
                                />
                            </div>

                            <div className="form-group">
                                <label>🖼️ Ảnh bìa tác phẩm:</label>
                                <input 
                                    type="file" 
                                    accept="image/*" 
                                    onChange={e => setSelectedFile(e.target.files[0])} 
                                />
                            </div>
                        </div>

                        {/* CỘT PHẢI */}
                        <div className="form-right-col">
                            <div className="form-group">
                                <label>🏷️ Thể loại:</label>
                                <CreatableSelect
                                    isMulti
                                    name="theloai"
                                    placeholder="Chọn hoặc gõ thể loại..."
                                    options={theLoaiList}
                                    className="basic-multi-select"
                                    classNamePrefix="select"
                                    onChange={(newValue) => setSelectedTheLoai(newValue)}
                                    value={selectedTheLoai}
                                    formatCreateLabel={(inputValue) => `Thêm mới: "${inputValue}"`}
                                />
                            </div>

                            <div className="form-group">
                                <label>📝 Mô tả nội dung:</label>
                                <textarea 
                                    placeholder="Viết lời dẫn hấp dẫn cho tác phẩm của bạn..." 
                                    rows="10"
                                    required
                                    value={formData.mota}
                                    onChange={e => setFormData({...formData, mota: e.target.value})} 
                                />
                            </div>
                        </div>

                        {/* PHẦN NÚT BẤM (Nằm ngang ở dưới cùng) */}
                        <div className="form-actions-wrapper">
                            <button type="button" className="btn-cancel" onClick={() => navigate(-1)}>
                                Quay lại
                            </button>
                            <button type="submit" className="btn-submit" disabled={loading}>
                                {loading ? "Đang xử lý..." : "Gửi duyệt ngay 🚀"}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </Layout>
    );
};

export default AddTruyen;