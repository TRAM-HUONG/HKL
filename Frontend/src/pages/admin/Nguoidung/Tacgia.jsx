import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Layout from "../../layout/layout.jsx";
import "../../../static/css/Nguoidungadmin.css"; 

const Tacgia = () => {
    const [authors, setAuthors] = useState([]);
    const [searchTerm, setSearchTerm] = useState(""); // State cho từ khóa tìm kiếm

    const fetchData = () => {
        axios.get('https://hkl-backend-v3uu.onrender.com/api/admin/authors')
            .then(res => setAuthors(res.data))
            .catch(err => console.error("Lỗi lấy dữ liệu:", err));
    };

    useEffect(() => {
        fetchData();
    }, []);

    const deleteAuthor = async (id, matk) => {
        if (window.confirm("Xóa tác giả này sẽ xóa tài khoản liên quan. Tiếp tục?")) {
            try {
                const res = await axios.delete(`https://hkl-backend-v3uu.onrender.com/api/admin/accounts/${matk}`);
                if (res.data.success) {
                    setAuthors(authors.filter(a => a.matk !== matk));
                    alert("Xóa thành công!");
                }
            } catch (err) { 
                alert("Lỗi xóa tác giả"); 
            }
        }
    };

    // --- LOGIC TÌM KIẾM ---
    const filteredAuthors = authors.filter(a => {
        const search = searchTerm.trim().toLowerCase();
        if (!search) return true;

        // Tìm theo Bút danh (tentg) hoặc Mã tác giả (matg)
        const nameMatch = a.tentg ? a.tentg.toLowerCase().includes(search) : false;
        const idMatch = a.matg ? String(a.matg).toLowerCase().includes(search) : false;

        return nameMatch || idMatch;
    });

    return (
        <Layout>
            <div style={{ padding: '20px' }} className="admin-glass-content">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                    <h2 className="text-2xl font-bold">Danh sách Tác giả</h2>

                    {/* THANH TÌM KIẾM */}
                    <input 
                        type="text" 
                        placeholder="Tìm bút danh hoặc mã tác giả..." 
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

                <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap' }}>
                    {filteredAuthors.length > 0 ? (
                        filteredAuthors.map(a => (
                            <div key={a.matg} style={{ border: '1px solid rgba(255,255,255,0.1)', padding: '15px', borderRadius: '8px', minWidth: '220px', background: 'rgba(255,255,255,0.05)' }}>
                                <p><strong>Mã TG:</strong> <span style={{color: '#ffcc00'}}>#{a.matg}</span></p>
                                <p><strong>Bút danh:</strong> {a.tentg}</p>
                                <p><strong>Mã TK:</strong> {a.matk}</p>
                                <p><strong>Email:</strong> {a.email}</p>
                                <p><strong>Ví:</strong> {a.so_du} xu</p>
                                <button 
                                    onClick={() => deleteAuthor(a.matg, a.matk)} 
                                    style={{ backgroundColor: '#ff4d4f', color: 'white', border: 'none', padding: '5px 10px', borderRadius: '4px', cursor: 'pointer', marginTop: '10px' }}
                                >
                                    Xóa Tác Giả
                                </button>
                            </div>
                        ))
                    ) : (
                        <div style={{ width: '100%', textAlign: 'center', padding: '40px', color: '#94a3b8' }}>
                            Không tìm thấy tác giả nào phù hợp.
                        </div>
                    )}
                </div>
            </div>
        </Layout>
    );
};

export default Tacgia;