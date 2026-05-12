import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import ReactQuill from 'react-quill'; 
import 'react-quill/dist/quill.snow.css'; 
import "../../static/css/SuaBanThao.css";
import Layout from "../layout/layout.jsx";

const SuaBanThao = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [formData, setFormData] = useState({ 
        tenbt: '', 
        nd: '',
        gia_xu: 0 // Thêm trường giá xu
    });

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

    useEffect(() => {
        const fetchDetail = async () => {
            try {
                const res = await axios.get(`https://hkl-backend.onrender.com/api/author/ban-thao/${id}`);
                if (res.data.success) {
                    const data = res.data.data;
                    setFormData({ 
                        tenbt: data.tenbt || data.TENBT || '', 
                        nd: data.nd || data.ND || '',
                        gia_xu: data.gia_xu || data.GIA_XU || 0 // Lấy giá xu hiện tại từ DB
                    });
                }
            } catch (err) {
                console.error("Lỗi lấy chi tiết bản thảo:", err);
                alert("Không thể tải dữ liệu bản thảo.");
            } finally {
                setLoading(false);
            }
        };
        fetchDetail();
    }, [id]);

    const handleUpdate = async (e) => {
        e.preventDefault();
        try {
            // Gửi formData bao gồm cả gia_xu lên API
            const res = await axios.put(`https://hkl-backend.onrender.com/api/author/update-ban-thao/${id}`, formData);
            if (res.data.success) {
                alert("✅ Đã cập nhật! Nội dung sẽ được chuyển về trạng thái 'Chờ duyệt'.");
                navigate('/quan-ly-tac-pham'); 
            }
        } catch (err) {
            alert("Lỗi khi lưu bản thảo!");
        }
    };

    if (loading) return <div className="admin-glass-content">Đang tải dữ liệu...</div>;

    return (
        <Layout>
            <div className="admin-glass-content">
                <h1>📝 CHỈNH SỬA BẢN THẢO</h1>
                <p style={{ color: '#ff9aa2', textAlign: 'center', fontWeight: 'bold' }}>
                    * Trạng thái sẽ thay đổi thành "Chờ duyệt" sau khi bạn nhấn Lưu.
                </p>
                
                <form onSubmit={handleUpdate} className="edit-form">
                    <div className="form-group" style={{ marginBottom: '20px' }}>
                        <label style={{ display: 'block', marginBottom: '8px', color: '#666', fontWeight: 'bold' }}>
                            Tiêu đề chương:
                        </label>
                        <input 
    type="text" 
    className="admin-input"
    style={{ color: '#333', backgroundColor: '#fafafa' }} // Thêm dòng này để ghi đè mọi CSS lạ
    value={formData.tenbt} 
    onChange={(e) => setFormData({...formData, tenbt: e.target.value})}
    required
/>
                    </div>

                    {/* Thêm ô nhập Giá Xu cho chương */}
                    <div className="form-group" style={{ marginBottom: '20px' }}>
                        <label style={{ display: 'block', marginBottom: '8px', color: '#666', fontWeight: 'bold' }}>
                            Giá mở khóa chương (Xu):
                        </label>
                        <input 
                            type="number" 
                            className="admin-input"
                            min="0"
                            value={formData.gia_xu} 
                            onChange={(e) => setFormData({...formData, gia_xu: e.target.value})}
                        />
                    </div>
<div className="form-group">
    <label style={{ display: 'block', marginBottom: '8px', color: '#666', fontWeight: 'bold' }}>
        Nội dung chương:
    </label>
    <div className="quill-wrapper"> {/* Thay vì style inline phức tạp, hãy dùng class */}
        <ReactQuill 
            theme="snow"
            value={formData.nd}
            onChange={(content) => setFormData({ ...formData, nd: content })}
            modules={modules}
        />
    </div>
</div>

                    <div className="form-actions-edit" style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
                        <button type="submit" className="btn-save">💾 Lưu thay đổi</button>
                        <button type="button" className="btn-cancel-edit" onClick={() => navigate(-1)}>Hủy</button>
                    </div>
                </form>
            </div>
        </Layout>
    );
};

export default SuaBanThao;