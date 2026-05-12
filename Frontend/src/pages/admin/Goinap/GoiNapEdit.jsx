import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Layout from "../../layout/layout.jsx";
import "../../../static/css/Goinapadmin.css"; 
const GoiNapEdit = () => {
    const { magoi } = useParams();
    const navigate = useNavigate();
    const [formData, setFormData] = useState({ ten_goi: '', so_tien_vnd: '', so_xu_nhan: '' });

    useEffect(() => {
        const fetchDetail = async () => {
            try {
                const res = await axios.get('https://hkl-backend.onrender.com/api/admin/goi-nap/all');
                const pkg = res.data.data.find(p => p.magoi === magoi);
                if (pkg) setFormData(pkg);
            } catch (error) { console.error(error); }
        };
        fetchDetail();
    }, [magoi]);

    const handleUpdate = async (e) => {
        e.preventDefault();
        try {
            await axios.put(`https://hkl-backend.onrender.com/api/admin/goi-nap/update/${magoi}`, formData);
            alert("Cập nhật thành công!");
            navigate('/admin/goi-nap');
        } catch (error) { alert("Lỗi cập nhật!"); }
    };

    return (
        <Layout>
            <div className="admin-glass-content">
                <h2 className="page-title">✏️ SỬA GÓI NẠP: {magoi}</h2>
                <form className="admin-form-glass" onSubmit={handleUpdate} style={{maxWidth: '600px', margin: '0 auto'}}>
                    <div className="form-group">
                        <label>Tên gói:</label>
                        <input type="text" value={formData.ten_goi} required 
                            onChange={e => setFormData({...formData, ten_goi: e.target.value})} />
                    </div>
                    <div className="form-group">
                        <label>Giá tiền (VND):</label>
                        <input type="number" value={formData.so_tien_vnd} required 
                            onChange={e => setFormData({...formData, so_tien_vnd: e.target.value})} />
                    </div>
                    <div className="form-group">
                        <label>Số Xu nhận:</label>
                        <input type="number" value={formData.so_xu_nhan} required 
                            onChange={e => setFormData({...formData, so_xu_nhan: e.target.value})} />
                    </div>
                    <div style={{marginTop: '20px', display: 'flex', gap: '10px'}}>
                        <button type="submit" className="btn-submit">Cập Nhật</button>
                        <button type="button" className="btn-cancel" onClick={() => navigate('/admin/goi-nap')}>Hủy</button>
                    </div>
                </form>
            </div>
        </Layout>
    );
};

export default GoiNapEdit;