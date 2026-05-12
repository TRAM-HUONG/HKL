const express = require('express');
const path = require('path');
const cors = require('cors');
const truyenRoutes = require('./routes/truyenRoutes');
const authRoutes = require('./routes/authRoutes');
const danhMucRoutes = require('./routes/danhMucRoutes');
const chuongRoutes = require('./routes/chuongRoutes');
const lichSuRoutes = require('./routes/lichSuRoutes');
const userRoutes = require('./routes/userRoutes');
const adminRoutes = require('./routes/adminRoutes');
const binhLuanRoutes = require('./routes/binhLuanRoutes');
// backend/server.js (hoặc app.js)
const tuSachRoutes = require('./routes/tuSachRoutes'); // Đường dẫn đến file router mới
const app = express();
app.use(cors());
app.use(express.json());
app.use('/api', binhLuanRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/user', userRoutes);
app.use('/images', express.static(path.join(__dirname, '../Frontend/src/static/images/truyen')))
app.use('/api/auth', authRoutes); 
app.use('/api/truyen', truyenRoutes);
app.use('/api/danh-muc', danhMucRoutes);
app.use('/api/chuong', chuongRoutes);
app.use('/api/lich-su', lichSuRoutes);
app.use('/api/admin/truyen-manage', adminRoutes);
app.use('/api/author', tuSachRoutes); 
app.use('/uploads', express.static('uploads'));


app.use('/api/binh-luan', binhLuanRoutes);
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => { console.log(`Server running on port ${PORT}`); });


