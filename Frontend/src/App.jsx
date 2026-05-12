import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
// ... các import cũ giữ nguyên
import Home from './pages/home/Home';
import About from './pages/about/About';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import GenreResults from './pages/genreresults/GenreResults';
import ChiTietTruyen from './pages/chitiettruyen/ChiTietTruyen';
import DocTruyen from './pages/chitiettruyen/DocTruyen';
import Profile from './pages/profile/Profile';
import ForgotPassword from './pages/auth/ForgotPassword'; 
import ResetPassword from './pages/auth/ResetPassword';  
import WritePost from './pages/writepost/WritePost';
import AdminDashboard from './pages/admin/AdminDashboard';
import DanhSachBanthao from './pages/admin/Banthao/DanhSachBanthao';
import ChiTietBanthao from './pages/admin/Banthao/ChiTietBanthao';
import AddTruyen from './pages/dangtruyen/AddTruyen';
import ApproveList from './pages/admin/Truyen/ApproveList';
import ViewApprove from './pages/admin/Truyen/ViewApprove'; 

import QuanLyTacPham from './pages/quanlytacpham/QuanLyTacPham'; 
import SuaBanThao from './pages/quanlytacpham/SuaBanThao';
import SuaTruyen from './pages/quanlytacpham/SuaTruyen';

import DanhMuc from './pages/danhmuc/truyen';

import NapTien from './pages/naptien/NapTien'; 
import Payment from './pages/naptien/Payment';
import ManageWithdrawal from './pages/admin/RutTien/ManageWithdrawal'; 
import DetailedRevenue from './pages/admin/Doanhthu/DetailedRevenue';

import GoiNapList from './pages/admin/Goinap/GoiNapList';
import GoiNapCreate from './pages/admin/Goinap/GoiNapCreate';
import GoiNapEdit from './pages/admin/Goinap/GoiNapEdit';

import Lichsunap from './pages/admin/Goinap/Lichsunap';
import Lichsumua from './pages/admin/Goinap/Lichsumua';

import Binhluan from './pages/admin/Tuongtac/Binhluan';
import Danhgia from './pages/admin/Tuongtac/Danhgia';
import Phanhoi from './pages/admin/Tuongtac/Phanhoi';

// --- IMPORT 3 FILE MỚI ---
import Taikhoan from './pages/admin/Nguoidung/Taikhoan'; 
import Docgia from './pages/admin/Nguoidung/Docgia';
import Tacgia from './pages/admin/Nguoidung/Tacgia';

function App() { 
  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/the-loai/:matl" element={<GenreResults />} />
        <Route path="/truyen/:mat" element={<ChiTietTruyen />} />
        <Route path="/doc-truyen/:mabt" element={<DocTruyen />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/viet-bai" element={<WritePost />} />
        <Route path="/nap-tien" element={<NapTien />} />
        <Route path="/thanh-toan" element={<Payment />} />
        {/* Admin Routes */}
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/admin/ban-thao" element={<DanhSachBanthao />} />
        <Route path="/admin/ban-thao/detail/:mabt" element={<ChiTietBanthao />} />
        <Route path="/admin/truyen" element={<ApproveList />} />
        <Route path="/admin/truyen/view/:id" element={<ViewApprove />} />
        <Route path="/admin/yeu-cau-rut-tien" element={<ManageWithdrawal />} />
        <Route path="/admin/doanh-thu" element={<DetailedRevenue />} />
        <Route path="/admin/goi-nap" element={<GoiNapList />} />
        <Route path="/admin/goi-nap/create" element={<GoiNapCreate />} />
        <Route path="/admin/goi-nap/edit/:magoi" element={<GoiNapEdit />} />
        <Route path="/admin/lich-su-nap" element={<Lichsunap />} />
        <Route path="/admin/lich-su-mua" element={<Lichsumua />} />
        <Route path="/admin/binh-luan" element={<Binhluan />} />
        <Route path="/admin/danh-gia" element={<Danhgia />} />
        <Route path="/admin/phan-hoi" element={<Phanhoi />} />

        {/* --- ROUTES MỚI CHO QUẢN LÝ NGƯỜI DÙNG --- */}
        <Route path="/admin/tai-khoan" element={<Taikhoan />} />
        <Route path="/admin/doc-gia" element={<Docgia />} />
        <Route path="/admin/tac-gia" element={<Tacgia />} />

        {/* Author Routes */}
        <Route path="/dang-ky-truyen" element={<AddTruyen />} />
        <Route path="/truyen" element={<DanhMuc />} />
        <Route path="/quan-ly-tac-pham" element={<QuanLyTacPham />} />
        <Route path="/author/edit-ban-thao/:id" element={<SuaBanThao />} />
        <Route path="/author/edit-truyen/:id" element={<SuaTruyen />} />
      </Routes>
    </Router>
  ); 
}

export default App;