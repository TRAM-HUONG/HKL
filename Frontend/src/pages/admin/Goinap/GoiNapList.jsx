import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Layout from "../../layout/layout.jsx";
import "../../../static/css/Goinapadmin.css"; 

const GoiNapList = () => {
    const [packages, setPackages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState(""); // Thêm state cho từ khóa tìm kiếm
    const navigate = useNavigate();

    const fetchPackages = async () => {
        try {
            const res = await axios.get('http://localhost:5000/api/admin/goi-nap/all');
            if (res.data.success) {
                setPackages(res.data.data);
            }
        } catch (error) {
            console.error("Lỗi khi tải danh sách:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPackages();
    }, []);

    const handleDelete = async (magoi) => {
        if (window.confirm(`Bạn có chắc muốn xóa gói ${magoi}?`)) {
            try {
                const res = await axios.delete(`http://localhost:5000/api/admin/goi-nap/delete/${magoi}`);
                if (res.data.success) {
                    alert("Xóa thành công!");
                    setPackages(packages.filter(p => p.magoi !== magoi));
                }
            } catch (error) {
                alert(error.response?.data?.message || "Lỗi khi xóa!");
            }
        }
    };

    // --- LOGIC TÌM KIẾM ---
    const filteredPackages = packages.filter(pkg => {
        const search = searchTerm.trim().toLowerCase();
        if (!search) return true;

        const maGoi = pkg.magoi ? String(pkg.magoi).toLowerCase() : "";
        const tenGoi = pkg.ten_goi ? String(pkg.ten_goi).toLowerCase() : "";

        return maGoi.includes(search) || tenGoi.includes(search);
    });

    return (
        <Layout>
            <div className="admin-glass-content">
                <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                    <div>
                        <h2 className="page-title">💎 DANH SÁCH GÓI NẠP</h2>
                        <p className="page-subtitle">Quản lý linh thạch hệ thống</p>
                    </div>

                    {/* THANH TÌM KIẾM */}
                    <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
                        <input 
                            type="text" 
                            placeholder="Tìm mã gói hoặc tên gói..." 
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            style={{
                                padding: '10px 15px',
                                borderRadius: '20px',
                                border: '1px solid rgba(108, 126, 225, 0.5)',
                                background: 'rgba(255, 255, 255, 0.1)',
                                color: '#fff',
                                width: '280px',
                                outline: 'none',
                                backdropFilter: 'blur(5px)'
                            }}
                        />
                        <button className="btn-submit" style={{width: 'auto', padding: '10px 20px', margin: 0}} onClick={() => navigate('/admin/goi-nap/create')}>
                            ➕ Thêm Gói Mới
                        </button>
                    </div>
                </div>

                <div className="table-container">
                    <table className="premium-table">
                        <thead>
                            <tr>
                                <th>Mã Gói</th>
                                <th>Tên Gói</th>
                                <th>Giá (VND)</th>
                                <th>Số Xu</th>
                                <th>Thao Tác</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr><td colSpan="5" style={{textAlign: 'center'}}>Đang tải...</td></tr>
                            ) : filteredPackages.length > 0 ? (
                                filteredPackages.map((pkg) => (
                                    <tr key={pkg.magoi}>
                                        <td><strong>#{pkg.magoi}</strong></td>
                                        <td>{pkg.ten_goi}</td>
                                        <td>{Number(pkg.so_tien_vnd).toLocaleString()} ₫</td>
                                        <td style={{color: '#f1c40f', fontWeight: 'bold'}}>{pkg.so_xu_nhan} Xu</td>
                                        <td>
                                            <button className="btn-edit" onClick={() => navigate(`/admin/goi-nap/edit/${pkg.magoi}`)}>Sửa</button>
                                            <button className="btn-delete" onClick={() => handleDelete(pkg.magoi)}>Xóa</button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="5" style={{textAlign: 'center', padding: '30px', color: '#94a3b8'}}>
                                        Không tìm thấy gói nạp nào phù hợp.
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

export default GoiNapList;