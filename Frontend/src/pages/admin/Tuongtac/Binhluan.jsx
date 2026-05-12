import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Layout from "../../layout/layout.jsx";
import "../../../static/css/Tuongtacadmin.css"; 

const Binhluan = () => {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState(""); // 1. Thêm state cho từ khóa tìm kiếm

    const fetchData = async () => {
        try {
            setLoading(true);
            const res = await axios.get('http://localhost:5000/api/admin/binh-luan/all');
            if (res.data.success) setData(res.data.data);
        } catch (err) { 
            console.error("Lỗi:", err); 
        } finally { 
            setLoading(false); 
        }
    };

    useEffect(() => { fetchData(); }, []);

    const handleDelete = async (id) => {
        if (window.confirm("Bạn có chắc muốn xóa bình luận này?")) {
            try {
                const res = await axios.delete(`http://localhost:5000/api/admin/binh-luan/delete/${id}`);
                if (res.data.success) {
                    setData(prevData => prevData.filter(item => (item.mabl || item.MABL) !== id));
                    alert("Xóa thành công!");
                } else {
                    alert("Xóa thất bại: " + res.data.message);
                }
            } catch (err) {
                console.error("Lỗi khi xóa:", err);
                alert("Lỗi hệ thống: Không thể xóa bình luận này.");
            }
        }
    };

    // 2. LOGIC TÌM KIẾM
    const filteredData = data.filter(item => {
        const search = searchTerm.trim().toLowerCase();
        if (!search) return true;

        // Tìm theo mã bình luận (mabl) hoặc mã độc giả (madg)
        const maBL = item.mabl ? String(item.mabl).toLowerCase() : "";
        const maDG = item.madg ? String(item.madg).toLowerCase() : "";
        const tenND = item.ten_nguoi_binh_luan ? item.ten_nguoi_binh_luan.toLowerCase() : "";

        return maBL.includes(search) || maDG.includes(search) || tenND.includes(search);
    });

    return (
        <Layout>
            <div className="admin-glass-content">
                <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                    <h1 style={{ margin: 0 }}>QUẢN LÝ BÌNH LUẬN</h1>
                    
                    {/* 3. THANH TÌM KIẾM */}
                    <input 
                        type="text" 
                        placeholder="Tìm mã BL, mã DG hoặc người dùng..." 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        style={{
                            padding: '10px 15px',
                            borderRadius: '20px',
                            border: '1px solid rgba(255, 255, 255, 0.2)',
                            background: 'rgba(255, 255, 255, 0.1)',
                            color: '#fff',
                            width: '350px',
                            outline: 'none',
                            backdropFilter: 'blur(5px)'
                        }}
                    />
                </header>

                <table className="admin-table">
                    <thead>
                        <tr>
                            <th>MÃ / NGƯỜI DÙNG</th>
                            <th>TRUYỆN / CHƯƠNG</th>
                            <th>NỘI DUNG</th>
                            <th>HÀNH ĐỘNG</th>
                        </tr>
                    </thead>

                    <tbody>
                        {loading ? (
                            <tr><td colSpan="4" style={{textAlign: 'center'}}>Đang tải...</td></tr>
                        ) : filteredData.length > 0 ? (
                            filteredData.map((item) => (
                                <tr key={item.mabl}>
                                    <td>
                                        <div style={{fontSize: '0.8rem', color: '#ffcc00'}}>BL: #{item.mabl}</div>
                                        {item.madg && <div style={{fontSize: '0.7rem', color: '#94a3b8'}}>DG: #{item.madg}</div>}
                                        <strong>{item.ten_nguoi_binh_luan}</strong>
                                    </td>
                                    <td>
                                        <div style={{color: '#2980b9', fontWeight: 'bold'}}>{item.ten_truyen}</div>
                                        <small style={{color: '#7f8c8d'}}>{item.ten_ban_thao}</small>
                                    </td>
                                    <td>{item.noi_dung}</td>
                                    <td>
                                        <button 
                                            onClick={() => handleDelete(item.mabl)} 
                                            className="btn-delete"
                                        >
                                            Xóa
                                        </button>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr><td colSpan="4" style={{textAlign: 'center', padding: '30px'}}>Không có dữ liệu phù hợp.</td></tr>
                        )}
                    </tbody>
                </table>
            </div>
        </Layout>
    );
};

export default Binhluan;