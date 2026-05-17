import React, { useState, useEffect } from 'react';
import Layout from "../../layout/layout.jsx";
import axios from 'axios';
import styles from "../../../static/css/Goinapadmin.module.css"; 

const Lichsunap = () => {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState(""); // State lưu từ khóa tìm kiếm

    useEffect(() => {
        axios.get('https://hkl-backend-v3uu.onrender.com/api/admin/recharge-history')
            .then(res => {
                if(res.data.success) setData(res.data.data);
                setLoading(false);
            })
            .catch(err => console.error(err));
    }, []);

    // --- LOGIC TÌM KIẾM ---
    const filteredData = data.filter(item => {
        const search = searchTerm.trim().toLowerCase();
        if (!search) return true;

        // Kiểm tra Mã nạp (manap), Tên đăng nhập (tendn), hoặc Mã độc giả (madg)
        const maNap = item.manap ? String(item.manap).toLowerCase() : "";
        const tenDN = item.tendn ? String(item.tendn).toLowerCase() : "";
        const maDG = item.madg ? String(item.madg).toLowerCase() : ""; 

        return maNap.includes(search) || tenDN.includes(search) || maDG.includes(search);
    });

    return (
        <Layout>
            <div className={styles['admin-glass-content']}>
                <div className={styles['table-header']} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                    <h2 style={{ margin: 0 }}>💳 Lịch Sử Nạp Tiền Hệ Thống</h2>

                    {/* THANH TÌM KIẾM */}
                    <input 
                        type="text" 
                        placeholder="Tìm mã nạp, mã DG hoặc tên người nạp..." 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        style={{
                            padding: '10px 15px',
                            borderRadius: '20px',
                            border: '1px solid rgba(108, 126, 225, 0.5)',
                            background: 'rgba(255, 255, 255, 0.1)',
                            color: '#fff',
                            width: '320px',
                            outline: 'none',
                            backdropFilter: 'blur(5px)'
                        }}
                    />
                </div>

                <div className={styles['table-wrapper']}>
                    <table className={styles['admin-table']}>
                        <thead>
                            <tr>
                                <th>Mã Giao Dịch</th>
                                <th>Người Nạp</th>
                                <th>Gói Nạp</th>
                                <th>Số Tiền</th>
                                <th>Xu Nhận</th>
                                <th>Ngày Thực Hiện</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr><td colSpan="6" style={{ textAlign: 'center' }}>Đang truy xuất dữ liệu...</td></tr>
                            ) : filteredData.length > 0 ? (
                                filteredData.map((item) => (
                                    <tr key={item.manap}>
                                        <td><strong>#{item.manap}</strong></td>
                                        <td>
                                            <strong>{item.tendn}</strong>
                                            {item.madg && (
                                                <small style={{ display: 'block', color: '#94a3b8', fontWeight: 'normal' }}>
                                                    ID Độc giả: {item.madg}
                                                </small>
                                            )}
                                        </td>
                                        <td>{item.ten_goi}</td>
                                        <td className="text-success">{Number(item.so_tien_vnd).toLocaleString()} ₫</td>
                                        <td className="text-info">+{item.so_xu_nhan} Xu</td>
                                        <td>{new Date(item.ngay_nap).toLocaleString('vi-VN')}</td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="6" style={{ textAlign: 'center', padding: '30px', color: '#94a3b8' }}>
                                        Không tìm thấy lịch sử nạp tiền nào phù hợp.
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

export default Lichsunap;