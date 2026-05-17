// const nodemailer = require('nodemailer');

// const transporter = nodemailer.createTransport({
//   service: 'gmail',
//   auth: {
//     user: 'nguyentramhuong2k221@gmail.com', // Email thật của bạn
//     pass: 'nehycwtaunijuhih'               // Mật khẩu ứng dụng 16 ký tự bạn vừa cung cấp
//   }
// });

// module.exports = transporter;

const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 465,
  secure: true, // Sử dụng SSL cho cổng 465
  auth: {
    user: 'nguyentramhuong2k221@gmail.com', 
    pass: 'nehycwtaunijuhih' // Đảm bảo mật khẩu ứng dụng 16 ký tự này vẫn còn hiệu lực
  }
});

module.exports = transporter;