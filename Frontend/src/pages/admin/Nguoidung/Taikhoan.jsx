import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Layout from "../../layout/layout.jsx";
import styles from "../../../static/css/Nguoidungadmin.module.css"; 

const Taikhoan = () => {
    const [data, setData] = useState([]);
    const [searchTerm, setSearchTerm] = useState(""); 
    
    // States cho chức năng thêm tài khoản
    const [showForm, setShowForm] = useState(false);
    const [formData, setFormData] = useState({ tendn: "", matkhau: "", email: "" });
    const [formError, setFormError] = useState("");

    const fetchData = async () => {
        try {
            const res = await axios.get('https://hkl-backend-v3uu.onrender.com/api/admin/accounts');
            setData(res.data);
        } catch (err) { console.error(err); }
    };

    const handleDelete = async (id) => {
        if (window.confirm("Xóa tài khoản này sẽ xóa mọi dữ liệu liên quan (Độc giả/Tác giả). Tiếp tục?")) {
            try {
                await axios.delete(`https://hkl-backend-v3uu.onrender.com/api/admin/accounts/${id}`);
                fetchData();
            } catch (err) { alert("Lỗi khi xóa tài khoản"); }
        }
    };

    // Logic xử lý gửi dữ liệu thêm Admin lên backend
    const handleCreateAdmin = async (e) => {
        e.preventDefault();
        setFormError("");
        try {
            // Gửi request POST tới API tạo admin
            const res = await axios.post('https://hkl-backend-v3uu.onrender.com/api/admin/accounts', formData);
            if (res.data.success) {
                alert(res.data.message);
                setShowForm(false); // Đóng form
                setFormData({ tendn: "", matkhau: "", email: "" }); // Reset form
                fetchData(); // Tải lại danh sách
            }
        } catch (err) {
            setFormError(err.response?.data?.message || "Có lỗi xảy ra khi tạo tài khoản.");
        }
    };

    useEffect(() => { fetchData(); }, []);

    const filteredData = data.filter(item => {
        const search = searchTerm.trim().toLowerCase();
        if (!search) return true;

        const maTK = item.matk ? String(item.matk).toLowerCase() : "";
        const tenDN = item.tendn ? String(item.tendn).toLowerCase() : "";

        return maTK.includes(search) || tenDN.includes(search);
    });

    return (
        <Layout>
            <div className={styles['admin-glass-content']}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                    <h2 className={styles['page-title']}>Quản lý Tài khoản</h2>

                    <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
                        {/* THANH TÌM KIẾM */}
                        <input 
                            type="text" 
                            placeholder="Tìm mã TK hoặc tên đăng nhập..." 
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className={styles['search-input']}
                            style={{ width: '250px' }}
                        />
                        {/* NÚT MỞ FORM THÊM ADMIN */}
                        <button 
                            onClick={() => setShowForm(!showForm)} 
                            className={styles['btn-delete']} 
                            style={{ marginTop: 0, backgroundColor: showForm ? '#64748b' : '#10b981' }}
                        >
                            {showForm ? "Hủy bỏ" : "+ Thêm Admin"}
                        </button>
                    </div>
                </div>

                {/* FORM THÊM TÀI KHOẢN ADMIN (Chỉ hiển thị khi bấm nút) */}
                {showForm && (
                    <div style={{
                        background: 'rgba(255, 255, 255, 0.05)',
                        backdropFilter: 'blur(10px)',
                        padding: '20px',
                        borderRadius: '12px',
                        marginBottom: '20px',
                        border: '1px solid rgba(255, 255, 255, 0.1)'
                    }}>
                        <h3 style={{ color: '#fff', marginBottom: '15px', fontSize: '1.1rem' }}>Tạo tài khoản Quản trị viên (ADMIN)</h3>
                        {formError && <p style={{ color: '#ef4444', marginBottom: '10px' }}>{formError}</p>}
                        
                        <form onSubmit={handleCreateAdmin} style={{ display: 'flex', flexWrap: 'wrap', gap: '15px', alignItems: 'flex-end' }}>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                                <label style={{ color: '#cbd5e1', fontSize: '0.85rem' }}>Tên đăng nhập</label>
                                <input 
                                    type="text" required
                                    value={formData.tendn}
                                    onChange={(e) => setFormData({...formData, tendn: e.target.value})}
                                    className={styles['search-input']} style={{ width: '200px' }}
                                />
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                                <label style={{ color: '#cbd5e1', fontSize: '0.85rem' }}>Mật khẩu</label>
                                <input 
                                    type="password" required
                                    value={formData.matkhau}
                                    onChange={(e) => setFormData({...formData, matkhau: e.target.value})}
                                    className={styles['search-input']} style={{ width: '200px' }}
                                />
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                                <label style={{ color: '#cbd5e1', fontSize: '0.85rem' }}>Email</label>
                                <input 
                                    type="email" required
                                    value={formData.email}
                                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                                    className={styles['search-input']} style={{ width: '250px' }}
                                />
                            </div>
                            <button type="submit" className={styles['btn-delete']} style={{ marginTop: 0, backgroundColor: '#3b82f6', height: '42px' }}>
                                Xác nhận thêm
                            </button>
                        </form>
                    </div>
                )}

                {/* BẢNG HIỂN THỊ */}
                <div className={styles['admin-table-wrapper']}>
                    <table className={styles['admin-table']}>
                        <thead>
                            <tr>
                                <th>Mã TK</th>
                                <th>Tên DN</th>
                                <th>Vai trò</th>
                                <th>Email</th>
                                <th>Số dư</th>
                                <th>Thao tác</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredData.length > 0 ? (
                                filteredData.map(item => (
                                    <tr key={item.matk}>
                                        <td><strong className={styles['id-badge']}>#{item.matk}</strong></td>
                                        <td>{item.tendn}</td>
                                        <td>
                                            <span className={`${styles['role-badge']} ${item.vai_tro === 'ADMIN' ? styles['role-admin'] : ''}`}>
                                                {item.vai_tro}
                                            </span>
                                        </td>
                                        <td>{item.email}</td>
                                        <td className={styles['balance-text']}>{item.so_du} xu</td>
                                        <td>
                                            <button 
                                                onClick={() => handleDelete(item.matk)}
                                                className={styles['btn-delete']}
                                                style={{ marginTop: 0 }}
                                            >
                                                Xóa
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="6" style={{ padding: '30px', color: '#94a3b8' }}>
                                        Không tìm thấy tài khoản nào phù hợp.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </Layout>
    );
};

export default Taikhoan;