import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Layout from "../../layout/layout.jsx";
import styles from "../../../static/css/Nguoidungadmin.module.css"; 

const Taikhoan = () => {
    const [data, setData] = useState([]);
    const [searchTerm, setSearchTerm] = useState(""); // 1. State cho từ khóa tìm kiếm

    const fetchData = async () => {
        try {
            const res = await axios.get('http://localhost:5000/api/admin/accounts');
            setData(res.data);
        } catch (err) { console.error(err); }
    };

    const handleDelete = async (id) => {
        if (window.confirm("Xóa tài khoản này sẽ xóa mọi dữ liệu liên quan (Độc giả/Tác giả). Tiếp tục?")) {
            try {
                await axios.delete(`http://localhost:5000/api/admin/accounts/${id}`);
                fetchData();
            } catch (err) { alert("Lỗi khi xóa tài khoản"); }
        }
    };

    useEffect(() => { fetchData(); }, []);

    // 2. LOGIC TÌM KIẾM
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

                    {/* 3. THANH TÌM KIẾM */}
                    <input 
                        type="text" 
                        placeholder="Tìm mã TK hoặc tên đăng nhập..." 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className={styles['search-input']}
                        style={{ width: '320px' }}
                    />
                </div>

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