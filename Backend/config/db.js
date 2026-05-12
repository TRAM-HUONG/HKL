const { Pool } = require('pg');

const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'HKL_MNM',
  password: 'Huong@', // Thay bằng mật khẩu chính xác bạn dùng vào pgAdmin
  port: 5432,
});

pool.on('error', (err) => {
  console.error('Lỗi kết nối PostgreSQL bất ngờ:', err);
});

module.exports = pool;