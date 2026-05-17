import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Layout from "../../layout/layout.jsx";
import styles from "../../../static/css/Goinapadmin.module.css"; 
// GoiNapCreate.jsx
const GoiNapCreate = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        ten_goi: '', 
        so_tien_vnd: '', 
        so_xu_nhan: '' 
    });

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const res = await axios.post('https://hkl-backend-v3uu.onrender.com/api/admin/goi-nap/create', formData);
            if (res.data.success) {
                alert(res.data.message);
                navigate('/admin/goi-nap');
            }
        } catch (error) {
            alert("Lỗi khi thêm gói nạp!");
        }
    };

    return (
        <Layout>
            <div className={styles['admin-glass-content']}>
                <h2 className={styles['page-title']}>➕ TẠO GÓI NẠP MỚI</h2>
                <form className={styles['admin-form-glass']} onSubmit={handleSubmit} style={{maxWidth: '600px', margin: '0 auto'}}>
                    {/* Bỏ ô nhập mã gói, chỉ giữ lại các thông tin còn lại */}
                    <div className={styles['form-group']}>
                        <label>Tên gói:</label>
                        <input type="text" placeholder="VD: Gói Siêu Cấp" required 
                            onChange={e => setFormData({...formData, ten_goi: e.target.value})} />
                    </div>
                    <div className={styles['form-group']}>
                        <label>Giá tiền (VND):</label>
                        <input type="number" placeholder="50000" required 
                            onChange={e => setFormData({...formData, so_tien_vnd: e.target.value})} />
                    </div>
                    <div className={styles['form-group']}>
                        <label>Số Xu nhận:</label>
                        <input type="number" placeholder="500" required 
                            onChange={e => setFormData({...formData, so_xu_nhan: e.target.value})} />
                    </div>
                    <div style={{marginTop: '20px', display: 'flex', gap: '10px'}}>
                        <button type="submit" className={styles['btn-submit']}>Lưu Gói Nạp</button>
                        <button type="button" className={styles['btn-cancel']} onClick={() => navigate('/admin/goi-nap')}>Hủy</button>
                    </div>
                </form>
            </div>
        </Layout>
    );
};


export default GoiNapCreate;