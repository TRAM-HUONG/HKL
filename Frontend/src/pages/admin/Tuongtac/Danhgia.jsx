import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Layout from "../../layout/layout.jsx";
import "../../../static/css/Tuongtacadmin.css"; 

const Danhgia = () => {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState(""); 

    const fetchData = async () => {
        try {
            setLoading(true);
            const res = await axios.get('http://localhost:5000/api/admin/danh-gia/all');
            if (res.data.success) {
                setData(res.data.data);
            }
        } catch (error) {
            console.error("Lỗi tải đánh giá:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchData(); }, []);

    const handleDelete = async (id) => {
        if (window.confirm("Bạn có chắc chắn muốn xóa đánh giá này không?")) {
            try {
                const res = await axios.delete(`http://localhost:5000/api/admin/danh-gia/delete/${id}`);
                if (res.data.success) {
                    alert("Đã xóa đánh giá thành công!");
                    setData(data.filter(item => (item.madgia || item.MADGIA) !== id));
                }
            } catch (error) {
                alert("Không thể xóa đánh giá này.");
            }
        }
    };

    // --- LOGIC TÌM KIẾM THEO MÃ DGIA, MÃ DG, VÀ TÊN TRUYỆN ---
    const filteredData = data.filter(item => {
        const search = searchTerm.trim().toLowerCase();
        if (!search) return true;

        // Chuyển đổi dữ liệu về chuỗi để so sánh
        const maDanhGia = item.madgia ? String(item.madgia).toLowerCase() : "";
        const maDocGia = item.madg ? String(item.madg).toLowerCase() : "";
        const tenTruyen = item.tent ? String(item.tent).toLowerCase() : "";
        const tenDocGia = item.tendn ? String(item.tendn).toLowerCase() : "";

        return maDanhGia.includes(search) || 
               maDocGia.includes(search) || 
               tenTruyen.includes(search) ||
               tenDocGia.includes(search);
    });

    return (
        <Layout>
            <div className="admin-glass-content">
                <header className="admin-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                    <h1 style={{ margin: 0 }}>QUẢN LÝ ĐÁNH GIÁ</h1>

                    {/* THANH TÌM KIẾM ĐA NĂNG */}
                    <input 
                        type="text" 
                        placeholder="Tìm mã DG, mã đánh giá, tên truyện..." 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        style={{
                            padding: '10px 15px',
                            borderRadius: '20px',
                            border: '1px solid rgba(255, 255, 255, 0.2)',
                            background: 'rgba(255, 255, 255, 0.1)',
                            color: '#fff',
                            width: '400px', // Tăng độ rộng để dễ nhập
                            outline: 'none',
                            backdropFilter: 'blur(5px)'
                        }}
                    />
                </header>

                <div className="admin-main-wrapper">
                    <table className="admin-table">
                        <thead>
                            <tr>
                                <th>Mã / Độc giả</th>
                                <th>Tên truyện</th>
                                <th>Số sao</th>
                                <th>Nội dung</th>
                                <th>Hành động</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr><td colSpan="5" style={{textAlign: 'center'}}>Đang tải...</td></tr>
                            ) : filteredData.length > 0 ? (
                                filteredData.map(item => (
                                    <tr key={item.madgia}>
                                        <td>
                                            <div style={{fontSize: '0.8rem', color: '#ffcc00'}}>ĐG: #{item.madg}</div>
                                            <div style={{fontSize: '0.7rem', color: '#94a3b8'}}>Mã ĐGia: {item.madgia}</div>
                                            <strong>{item.tendn}</strong>
                                        </td>
                                        <td>
                                            <strong style={{color: '#6C7EE1'}}>{item.tent}</strong>
                                        </td>
                                        <td>
                                            <span style={{color: '#f1c40f', fontWeight: 'bold'}}>
                                                {item.sosao} ⭐
                                            </span>
                                        </td>
                                        <td>{item.nd}</td>
                                        <td>
                                            <button 
                                                onClick={() => handleDelete(item.madgia)} 
                                                className="btn-delete"
                                            >
                                                Xóa
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="5" style={{textAlign: 'center', padding: '30px', color: '#94a3b8'}}>
                                        Không tìm thấy đánh giá hoặc truyện phù hợp.
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

export default Danhgia;