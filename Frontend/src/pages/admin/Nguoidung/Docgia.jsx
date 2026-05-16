import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Layout from "../../layout/layout.jsx";
import "../../../static/css/Nguoidungadmin.css"; 

const Docgia = () => {
    const [readers, setReaders] = useState([]);
    const [searchTerm, setSearchTerm] = useState(""); // State lưu từ khóa tìm kiếm

    const fetchData = () => {
        axios.get('http://localhost:5000/api/admin/readers')
            .then(res => setReaders(res.data))
            .catch(err => console.error("Lỗi lấy dữ liệu:", err));
    };

    useEffect(() => {
        fetchData();
    }, []);

    const deleteReader = async (id) => {
        if (window.confirm("Xóa độc giả này?")) {
            try {
                const res = await axios.delete(`http://localhost:5000/api/admin/accounts/${id}`);
                if (res.data.success) {
                    setReaders(readers.filter(r => r.matk !== id));
                    alert("Xóa thành công!");
                }
            } catch (err) { 
                alert("Không thể xóa độc giả"); 
            }
        }
    };

    // --- LOGIC LỌC DỮ LIỆU ---
    const filteredReaders = readers.filter(r => {
        const search = searchTerm.trim().toLowerCase();
        if (!search) return true;

        // Tìm theo Tên độc giả (tendg) hoặc Mã độc giả (madg)
        const nameMatch = r.tendg ? r.tendg.toLowerCase().includes(search) : false;
        const idMatch = r.madg ? String(r.madg).toLowerCase().includes(search) : false;

        return nameMatch || idMatch;
    });

    return (
        <Layout>
            <div style={{ display: 'flex', justifyContent: 'center', width: '100%' }}>
                <div className="p-4 admin-glass-content">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                        <h2 className="text-2xl font-bold">Danh sách Độc giả</h2>

                    {/* THANH TÌM KIẾM */}
                    <input 
                        type="text" 
                        placeholder="Tìm theo tên hoặc mã độc giả..." 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        style={{
                            padding: '10px 15px',
                            borderRadius: '20px',
                            border: '1px solid rgba(255, 255, 255, 0.3)',
                            background: 'rgba(255, 255, 255, 0.1)',
                            color: '#fff',
                            width: '300px',
                            outline: 'none',
                            backdropFilter: 'blur(5px)'
                        }}
                    />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px' }}>
                    {filteredReaders.length > 0 ? (
                        filteredReaders.map(r => (
                            <div key={r.madg} className="border p-4 shadow rounded" style={{ border: '1px solid rgba(255,255,255,0.1)', padding: '15px', background: 'rgba(255,255,255,0.05)' }}>
                                <p><strong>Mã ĐG:</strong> <span style={{color: '#ffcc00'}}>#{r.madg}</span></p>
                                <p><strong>Tên:</strong> {r.tendg}</p>
                                <p><strong>Mã TK:</strong> {r.matk}</p>
                                <p><strong>Email:</strong> {r.email}</p>
                                <p><strong>Số dư:</strong> {r.so_du} xu</p>
                                <div className="mt-2">
                                    <button 
                                        onClick={() => deleteReader(r.matk)} 
                                        style={{ backgroundColor: '#ff4d4f', color: 'white', border: 'none', padding: '5px 10px', cursor: 'pointer', borderRadius: '4px' }}
                                    >
                                        Xóa
                                    </button>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div style={{ gridColumn: 'span 3', textAlign: 'center', padding: '40px', color: '#94a3b8' }}>
                            Không tìm thấy độc giả nào phù hợp.
                        </div>
                    )}
                </div>
            </div>
            </div>
        </Layout>
    );
};

export default Docgia;