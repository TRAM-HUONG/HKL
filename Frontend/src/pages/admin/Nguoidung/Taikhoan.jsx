import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Layout from "../../layout/layout.jsx";
import "../../../static/css/Nguoidungadmin.css"; 

const Taikhoan = () => {
    const [data, setData] = useState([]);
    const [searchTerm, setSearchTerm] = useState(""); // 1. State cho từ khóa tìm kiếm

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
            <div className="p-4 admin-glass-content">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                    <h2 className="text-2xl font-bold">Quản lý Tài khoản</h2>

                    {/* 3. THANH TÌM KIẾM */}
                    <input 
                        type="text" 
                        placeholder="Tìm mã TK hoặc tên đăng nhập..." 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        style={{
                            padding: '10px 15px',
                            borderRadius: '20px',
                            border: '1px solid rgba(255, 255, 255, 0.3)',
                            background: 'rgba(255, 255, 255, 0.1)',
                            color: '#fff',
                            width: '320px',
                            outline: 'none',
                            backdropFilter: 'blur(5px)'
                        }}
                    />
                </div>

                <div className="table-wrapper">
                    <table className="admin-table" border="1" width="100%" style={{ borderCollapse: 'collapse', textAlign: 'center', color: '#fff' }}>
                        <thead>
                            <tr style={{ background: 'rgba(255, 255, 255, 0.1)' }}>
                                <th style={{ padding: '12px' }}>Mã TK</th>
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
                                    <tr key={item.matk} style={{ borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                                        <td style={{ padding: '12px' }}><strong>#{item.matk}</strong></td>
                                        <td>{item.tendn}</td>
                                        <td>
                                            <span style={{ 
                                                padding: '4px 8px', 
                                                borderRadius: '4px', 
                                                fontSize: '0.8rem',
                                                background: item.vai_tro === 'ADMIN' ? '#ff4d4f' : 'rgba(255,255,255,0.1)' 
                                            }}>
                                                {item.vai_tro}
                                            </span>
                                        </td>
                                        <td>{item.email}</td>
                                        <td style={{ color: '#ffcc00' }}>{item.so_du} xu</td>
                                        <td>
                                            <button 
                                                onClick={() => handleDelete(item.matk)}
                                                style={{ 
                                                    backgroundColor: '#ff4d4f', 
                                                    color: 'white', 
                                                    border: 'none', 
                                                    padding: '6px 12px', 
                                                    cursor: 'pointer', 
                                                    borderRadius: '4px',
                                                    fontSize: '0.85rem'
                                                }}
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