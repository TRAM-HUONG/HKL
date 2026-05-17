import React, { useState, useEffect } from 'react';
import Layout from "../../layout/layout.jsx";
import axios from 'axios';
import styles from "../../../static/css/Goinapadmin.module.css"; 

const Lichsumua = () => {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState(""); // State lưu từ khóa tìm kiếm

    useEffect(() => {
        axios.get('https://hkl-backend-v3uu.onrender.com/api/admin/purchase-history')
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

        // Kiểm tra Mã mua, Tên độc giả, hoặc Mã độc giả (nếu có trong data)
        const maMua = item.mamua ? String(item.mamua).toLowerCase() : "";
        const tenDocGia = item.ten_doc_gia ? String(item.ten_doc_gia).toLowerCase() : "";
        const maDG = item.madg ? String(item.madg).toLowerCase() : ""; 

        return maMua.includes(search) || tenDocGia.includes(search) || maDG.includes(search);
    });

    return (
        <Layout>
            <div className={styles['admin-glass-content']}>
                <div className={styles['table-header']} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                    <h2 style={{ margin: 0 }}>🛒 Lịch Sử Giao Dịch Nội Dung</h2>

                    {/* THANH TÌM KIẾM */}
                    <input 
                        type="text" 
                        placeholder="Tìm mã mua, mã DG hoặc tên người mua..." 
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
                                <th>Mã Mua</th>
                                <th>Độc Giả</th>
                                <th>Tên Truyện</th>
                                <th>Loại Mua</th>
                                <th>Chi Tiết</th>
                                <th>Giá (Xu)</th>
                                <th>Thời Gian</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr><td colSpan="7" style={{ textAlign: 'center' }}>Đang truy xuất dữ liệu...</td></tr>
                            ) : filteredData.length > 0 ? (
                                filteredData.map((item) => (
                                    <tr key={item.mamua}>
                                        <td><strong>#{item.mamua}</strong></td>
                                        <td>
                                            {item.ten_doc_gia}
                                            {item.madg && <small style={{ display: 'block', color: '#94a3b8' }}>ID: {item.madg}</small>}
                                        </td>
                                        <td>{item.ten_truyen}</td>
                                        <td>
                                            <span className={`status-pill ${item.loai_mua}`}>
                                                {item.loai_mua === 'TRON_GOI' ? 'Mua trọn bộ' : 'Mua chương lẻ'}
                                            </span>
                                        </td>
                                        <td>{item.chi_tiet_mua}</td>
                                        <td className="text-danger" style={{ fontWeight: 'bold' }}>-{item.so_xu_ra}</td>
                                        <td>{new Date(item.ngay_mua).toLocaleString('vi-VN')}</td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="7" style={{ textAlign: 'center', padding: '30px', color: '#94a3b8' }}>
                                        Không tìm thấy lịch sử giao dịch nào phù hợp.
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

export default Lichsumua;