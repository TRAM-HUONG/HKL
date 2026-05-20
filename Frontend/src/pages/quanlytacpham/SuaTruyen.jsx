import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Layout from "../layout/layout.jsx";

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
                    axios.get('http://localhost:5000/api/author/the-loai'),
                    axios.get(`http://localhost:5000/api/author/truyen/${id}`)
                ]);
                setTheLoaiList(tlRes.data);
                
                if (trRes.data.success) {
                    const d = trRes.data.data;
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
                    setPreviewImage(`http://localhost:5000/images/${d.hinhanh || d.HINHANH}`);
                }
            } catch (err) { 
                console.error("Lỗi tải dữ liệu:", err); 
            }
        };
        fetchData();
    }, [id]);

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
        data.append('matl', JSON.stringify(formData.matl));
        data.append('mota', formData.mota || '');
        data.append('hinhanh', formData.hinhanh);
        data.append('gia_tron_goi', formData.gia_tron_goi);

        if (selectedFile) {
            data.append('image', selectedFile); 
        }

        try {
            const res = await axios.put(`http://localhost:5000/api/author/update-truyen/${id}`, data, {
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
            {/* NHÚNG THẲNG STYLE PASTEL VÀ FIX LỖI SỔ DÀI */}
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Be+Vietnam+Pro:wght@400;500;700;800&display=swap');

                .admin-glass-content {
                    font-family: 'Be Vietnam Pro', sans-serif !important;
                    padding: 40px 20px;
                    background: radial-gradient(circle at top left, #fff5f5, #f0f4ff);
                    min-height: 100vh;
                    box-sizing: border-box;
                }

                .admin-glass-content h1 {
                    text-align: center;
                    font-weight: 800;
                    font-size: 2.2rem;
                    background: linear-gradient(to right, #ff9aa2, #b5ead7, #c7ceea);
                    -webkit-background-clip: text;
                    background-clip: text;
                    -webkit-text-fill-color: transparent;
                    margin-bottom: 10px;
                }

                .edit-form {
                    max-width: 1000px;
                    margin: 0 auto;
                    background: rgba(255, 255, 255, 0.95);
                    padding: 40px;
                    border-radius: 25px;
                    box-shadow: 0 15px 35px rgba(255, 154, 162, 0.1);
                    border: 1px solid rgba(255, 255, 255, 0.6);
                    box-sizing: border-box;
                }

                .edit-form label {
                    display: block;
                    font-weight: 700;
                    color: #555;
                    margin-bottom: 8px;
                    margin-top: 15px;
                    font-size: 0.95rem;
                }

                .admin-input {
                    width: 100%;
                    padding: 12px 15px;
                    border-radius: 12px;
                    border: 2px solid #f0f0f0;
                    background: #fafafa;
                    font-family: 'Be Vietnam Pro', sans-serif !important;
                    transition: all 0.3s ease;
                    outline: none;
                    font-size: 1rem;
                    box-sizing: border-box;
                }

                .admin-input:focus {
                    border-color: #ffb7b2;
                    background: #fff;
                    box-shadow: 0 0 0 4px rgba(255, 183, 178, 0.2);
                }

                /* HỘP THỂ LOẠI: Chia 3 cột song song & Giới hạn chiều cao chống sổ dài */
                .genre-checkbox-grid-box {
                    display: grid;
                    grid-template-columns: repeat(3, 1fr);
                    gap: 12px;
                    padding: 15px;
                    background: #fafafa;
                    border-radius: 12px;
                    border: 2px solid #f0f0f0;
                    max-height: 180px; 
                    overflow-y: auto; 
                }

                /* Tùy chỉnh thanh cuộn cho gọn gàng */
                .genre-checkbox-grid-box::-webkit-scrollbar {
                    width: 6px;
                }
                .genre-checkbox-grid-box::-webkit-scrollbar-thumb {
                    background: #c7ceea;
                    border-radius: 4px;
                }

                .genre-item-label {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    cursor: pointer;
                    font-size: 0.95rem;
                    color: #444;
                    user-select: none;
                }

                .genre-item-label input[type="checkbox"] {
                    accent-color: #ff9aa2; /* Đồng bộ màu pastel cho ô tick */
                    width: 16px;
                    height: 16px;
                }

                .right-col {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: flex-start;
                    background: #fafafa;
                    border-radius: 15px;
                    border: 2px dashed #c7ceea;
                    padding: 20px;
                    box-sizing: border-box;
                }

                .preview-img {
                    width: 160px;
                    height: 220px;
                    object-fit: cover;
                    border-radius: 12px;
                    box-shadow: 0 5px 15px rgba(0,0,0,0.08);
                    margin-bottom: 15px;
                }

                .btn-group {
                    display: flex;
                    gap: 15px;
                    margin-top: 30px;
                }

                .btn-confirm {
                    background: linear-gradient(135deg, #b5ead7, #e2f0cb) !important;
                    color: #448b72 !important;
                    font-weight: 700 !important;
                    font-family: 'Be Vietnam Pro', sans-serif !important;
                    padding: 15px !important;
                    border-radius: 12px !important;
                    border: none !important;
                    flex: 2;
                    cursor: pointer;
                    font-size: 1rem;
                    transition: all 0.3s ease;
                }

                .btn-confirm:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 8px 20px rgba(181, 234, 215, 0.4);
                }

                .btn-back {
                    background: #f5f5f5 !important;
                    color: #888 !important;
                    font-weight: 600 !important;
                    font-family: 'Be Vietnam Pro', sans-serif !important;
                    padding: 15px !important;
                    border-radius: 12px !important;
                    border: none !important;
                    flex: 1;
                    cursor: pointer;
                    font-size: 1rem;
                    transition: all 0.3s ease;
                }

                .btn-back:hover {
                    background: #ebebeb !important;
                    color: #666 !important;
                }
            `}</style>

            <div className="admin-glass-content">
                <h1>⚙️ CHỈNH SỬA TÁC PHẨM</h1>
                <p style={{ color: '#ff9aa2', textAlign: 'center', fontWeight: '600' }}>
                    * Lưu ý: Mọi thay đổi sẽ khiến truyện cần được Admin duyệt lại.
                </p>

                <form onSubmit={handleSubmit} className="edit-form">
                    <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '30px' }}>
                        <div className="left-col">
                            <label style={{ marginTop: '0' }}>Tên Truyện:</label>
                            <input 
                                className="admin-input" 
                                value={formData.tent} 
                                onChange={e => setFormData({...formData, tent: e.target.value})} 
                                required 
                            />
                            
                            <label>Thể loại (Chọn nhiều):</label>
                            {/* Chuyển sang Grid 3 cột song song có cuộn dòng */}
                            <div className="genre-checkbox-grid-box">
                                {theLoaiList.map(tl => {
                                    const ma = tl.MATL || tl.matl;
                                    const ten = tl.TENTL || tl.tentl;
                                    return (
                                        <label key={ma} className="genre-item-label">
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

                            <label>Ghi thêm thể loại mới (Cách nhau bằng dấu phẩy):</label>
                            <input 
                                className="admin-input" 
                                placeholder="VD: Tu tiên, Đô thị, Hệ thống..." 
                                value={formData.newGenres || ''}
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
                            <label style={{ marginTop: '0' }}>Ảnh bìa hiện tại:</label>
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

                    <div>
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