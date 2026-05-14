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

// const { Pool } = require('pg');

// // Render sẽ tự động cung cấp biến DATABASE_URL khi bạn cấu hình trong Dashboard
// const pool = new Pool({
//   connectionString: process.env.DATABASE_URL,
//   ssl: {
//     rejectUnauthorized: false // Bắt buộc phải có cái này để kết nối được với SSL của Render
//   }
// });

// pool.on('connect', () => {
//   console.log('Đã kết nối thành công tới Database trên Render!');
// });

// pool.on('error', (err) => {
//   console.error('Lỗi kết nối PostgreSQL bất ngờ:', err);
// });

// module.exports = pool;