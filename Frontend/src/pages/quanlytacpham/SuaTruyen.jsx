import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Layout from "../layout/layout.jsx";
import "../../static/css/SuaTruyen.css";

const SuaTruyen = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [formData, setFormData] = useState({ 
        tent: '', 
        nxb: '', 
        matl: [], // Chuyển thành mảng để chọn nhiều
        mota: '', 
        hinhanh: '',
        gia_tron_goi: 0 
    });
    const [theLoaiList, setTheLoaiList] = useState([]);
    const [selectedFile, setSelectedFile] = useState(null);
    const [previewImage, setPreviewImage] = useState(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [tlRes, trRes] = await Promise.all([
                    axios.get('https://hkl-backend-v3uu.onrender.com/api/author/the-loai'),
                    axios.get(`https://hkl-backend-v3uu.onrender.com/api/author/truyen/${id}`)
                ]);
                setTheLoaiList(tlRes.data);
                
                if (trRes.data.success) {
                    const d = trRes.data.data;
                    // Logic: Nếu Backend trả về 1 chuỗi, ta biến nó thành mảng
                    let initialMatl = [];
                    if (d.matl || d.MATL) {
                        initialMatl = Array.isArray(d.matl || d.MATL) ? (d.matl || d.MATL) : [d.matl || d.MATL];
                    }

                    setFormData({
                        tent: d.tent || d.TENT || '',
                        nxb: d.nxb || d.NXB || '',
                        matl: initialMatl,
                        mota: d.mota || d.MOTA || '',
                        hinhanh: d.hinhanh || d.HINHANH || '',
                        gia_tron_goi: d.gia_tron_goi || d.GIA_TRON_GOI || 0 
                    });
                    setPreviewImage(`https://hkl-backend-v3uu.onrender.com/images/${d.hinhanh || d.HINHANH}`);
                }
            } catch (err) { 
                console.error("Lỗi tải dữ liệu:", err); 
            }
        };
        fetchData();
    }, [id]);

    // Hàm xử lý khi tick/untick thể loại
    const handleGenreChange = (maTL) => {
        setFormData(prev => {
            const isSelected = prev.matl.includes(maTL);
            if (isSelected) {
                return { ...prev, matl: prev.matl.filter(item => item !== maTL) };
            } else {
                return { ...prev, matl: [...prev.matl, maTL] };
            }
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (formData.matl.length === 0) {
            alert("Vui lòng chọn ít nhất một thể loại!");
            return;
        }
        setLoading(true);

        const data = new FormData();
        data.append('tent', formData.tent);
        data.append('nxb', formData.nxb || '');
        // Chuyển mảng thành JSON string để Backend dễ bóc tách
        data.append('matl', JSON.stringify(formData.matl));
        data.append('mota', formData.mota || '');
        data.append('hinhanh', formData.hinhanh);
        data.append('gia_tron_goi', formData.gia_tron_goi);

        if (selectedFile) {
            data.append('image', selectedFile); 
        }

        try {
            const res = await axios.put(`https://hkl-backend-v3uu.onrender.com/api/author/update-truyen/${id}`, data, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            if (res.data.success) {
                alert("✅ Cập nhật thành công! Truyện đã được chuyển về trạng thái 'Đợi duyệt'.");
                navigate('/quan-ly-tac-pham');
            }
        } catch (err) {
            alert("❌ Lỗi: " + (err.response?.data?.error || "Server Error"));
        } finally { setLoading(false); }
    };

    return (
        <Layout>
            <div className="admin-glass-content">
                <h1>⚙️ CHỈNH SỬA TÁC PHẨM</h1>
                <p style={{ color: '#ff9aa2', textAlign: 'center', fontWeight: '600' }}>
                    * Lưu ý: Mọi thay đổi sẽ khiến truyện cần được Admin duyệt lại.
                </p>

                <form onSubmit={handleSubmit} className="edit-form">
                    <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '30px' }}>
                        <div className="left-col">
                            <label>Tên Truyện:</label>
                            <input 
                                className="admin-input" 
                                value={formData.tent} 
                                onChange={e => setFormData({...formData, tent: e.target.value})} 
                                required 
                            />
                            
                            <label>Thể loại (Chọn nhiều):</label>
                            <div className="genre-checkbox-group" style={{ 
                                display: 'grid', 
                                gridTemplateColumns: 'repeat(2, 1fr)', 
                                gap: '10px', 
                                padding: '10px',
                                background: 'rgba(255,255,255,0.1)',
                                borderRadius: '8px',
                                marginBottom: '15px'
                            }}>
                                {theLoaiList.map(tl => {
                                    const ma = tl.MATL || tl.matl;
                                    const ten = tl.TENTL || tl.tentl;
                                    return (
                                        <label key={ma} style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                                            <input 
                                                type="checkbox" 
                                                checked={formData.matl.includes(ma)}
                                                onChange={() => handleGenreChange(ma)}
                                            />
                                            {ten}
                                        </label>
                                    );
                                })}
                            </div>
                            <label style={{ marginTop: '10px', display: 'block' }}>Ghi thêm thể loại mới (Cách nhau bằng dấu phẩy):</label>
                            <input 
                                className="admin-input" 
                                placeholder="VD: Tu tiên, Đô thị, Hệ thống..." 
                                value={formData.newGenres}
                                onChange={e => setFormData({...formData, newGenres: e.target.value})}
                            />

                            <label>Nhà xuất bản:</label>
                            <input 
                                className="admin-input" 
                                value={formData.nxb} 
                                onChange={e => setFormData({...formData, nxb: e.target.value})} 
                            />

                            <label>Giá bán trọn bộ (Xu):</label>
                            <input 
                                type="number"
                                className="admin-input" 
                                min="0"
                                value={formData.gia_tron_goi} 
                                onChange={e => setFormData({...formData, gia_tron_goi: e.target.value})} 
                            />
                        </div>

                        <div className="right-col">
                            <label>Ảnh bìa hiện tại:</label>
                            {previewImage && (
                                <img src={previewImage} alt="Preview" className="preview-img" />
                            )}
                            <input 
                                type="file" 
                                className="admin-input" 
                                onChange={e => {
                                    if (e.target.files[0]) {
                                        setSelectedFile(e.target.files[0]);
                                        setPreviewImage(URL.createObjectURL(e.target.files[0]));
                                    }
                                }} 
                            />
                        </div>
                    </div>

                    <div style={{ marginTop: '20px' }}>
                        <label>Mô tả chi tiết:</label>
                        <textarea 
                            className="admin-input" 
                            style={{ minHeight: '180px', lineHeight: '1.8' }}
                            value={formData.mota} 
                            onChange={e => setFormData({...formData, mota: e.target.value})}
                        />
                    </div>

                    <div className="btn-group">
                        <button type="submit" disabled={loading} className="btn-confirm">
                            {loading ? "⌛ Đang xử lý..." : "✅ Xác nhận cập nhật"}
                        </button>
                        <button type="button" onClick={() => navigate(-1)} className="btn-back">
                            Quay lại
                        </button>
                    </div>
                </form>
            </div>
        </Layout>
    );
};

export default SuaTruyen;