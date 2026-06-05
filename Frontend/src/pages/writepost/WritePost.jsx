import React, { useState, useEffect } from 'react';
import axios from 'axios';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import Layout from "../layout/layout.jsx";
import "../../static/css/WritePost.css";

const WritePost = () => {
    const [dsTruyen, setDsTruyen] = useState([]);
    const [formData, setFormData] = useState({ MAT: '', TENBT: '', ND: '', GIA_XU: 0 });
    const [loading, setLoading] = useState(true);

    // Lấy thông tin user từ localStorage
    const user = JSON.parse(localStorage.getItem("user"));
    const matk = user?.MATK || user?.matk;

    useEffect(() => {
        const fetchStories = async () => {
            if (!matk) return;
            try {
                // Gọi API lấy truyện dựa theo mã tài khoản (matk)
                const res = await axios.get(`http://localhost:5000/api/chuong/tacgia/${matk}`);
                setDsTruyen(res.data);
            } catch (err) {
                console.error("Lỗi tải danh sách truyện", err);
            } finally {
                setLoading(false);
            }
        };
        fetchStories();
    }, [matk]);

    const handleEditorChange = (content) => {
        setFormData({ ...formData, ND: content });
    };

    const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.MAT) {
        alert("Vui lòng chọn một tác phẩm trước khi gửi!");
        return;
    }

    try {
        const res = await axios.post('http://localhost:5000/api/chuong/viet-bai', {
            ...formData,
            MATK: matk // ĐỔI THÀNH GỬI MATK LÊN, Backend sẽ tự xử lý tìm MATG
        });
        
        alert(res.data.message);
        setFormData({ MAT: '', TENBT: '', ND: '', GIA_XU: 0 });
    } catch (err) {
        alert("Lỗi: " + (err.response?.data?.error || "Không thể gửi bài"));
    }
};

    const modules = {
        toolbar: [
            [{ 'header': [1, 2, 3, false] }],
            ['bold', 'italic', 'underline', 'strike'],
            [{ 'list': 'ordered'}, { 'list': 'bullet' }],
            [{ 'color': [] }, { 'background': [] }],
            [{ 'align': [] }],
            ['link'],
            ['clean']
        ],
    };

    if (loading) {
        return <div style={{ textAlign: 'center', padding: '50px' }}>Đang tải danh sách tác phẩm...</div>;
    }

    return (
        <Layout>
            <div className="write-post-wrapper">
                <div className="write-post-container">
                    <h2 className="write-post-title">✍️ Sáng tác chương mới</h2>
                    
                    <form onSubmit={handleSubmit} className="post-form">
                        
                        {/* CỘT TRÁI: Cấu hình thông tin */}
                        <div className="form-sidebar">
                            <div className="form-group">
                                <label>📚 Chọn tác phẩm:</label>
                                <select 
                                    className="form-select"
                                    value={formData.MAT} 
                                    onChange={e => setFormData({...formData, MAT: e.target.value})}
                                    required
                                >
                                    <option value="">-- Chọn truyện --</option>
                                    {dsTruyen.map(t => (
                                        <option key={t.mat || t.MAT} value={t.mat || t.MAT}>
                                            {t.tent || t.TENT}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="form-group">
                                <label>🔖 Tiêu đề chương:</label>
                                <input 
                                    className="form-input"
                                    type="text" 
                                    value={formData.TENBT}
                                    onChange={e => setFormData({...formData, TENBT: e.target.value})}
                                    required
                                    placeholder="Ví dụ: Chương 1:..."
                                />
                            </div>

                            <div className="form-group">
                                <label>🪙 Giá mở khóa (Xu):</label>
                                <input 
                                    className="form-input"
                                    type="number" 
                                    value={formData.GIA_XU}
                                    onChange={e => setFormData({...formData, GIA_XU: e.target.value})}
                                    min="0"
                                />
                                <p style={{ fontSize: '0.75rem', color: '#c80000', lineHeight: '1.4' }}>
                                    * Độc giả trả phí này để đọc lẻ chương.
                                </p>
                            </div>
                        </div>

                        {/* CỘT PHẢI: Trình soạn thảo */}
                        <div className="form-main-content">
                            <div className="form-group">
                                <label>🖋️ Nội dung chương truyện:</label>
                                <div className="editor-wrapper">
                                    <ReactQuill 
                                        theme="snow"
                                        value={formData.ND}
                                        onChange={handleEditorChange}
                                        modules={modules}
                                        placeholder="Bắt đầu viết những dòng đầu tiên của chương này..."
                                    />
                                </div>
                            </div>
                        </div>

                        {/* NÚT BẤM DƯỚI CÙNG */}
                        <button type="submit" className="submit-btn">
                            🚀 Gửi bản thảo chờ duyệt
                        </button>
                    </form>
                </div>
            </div>
        </Layout>
    );
};

export default WritePost;