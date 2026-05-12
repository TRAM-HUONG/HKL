const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'nguyentramhuong2k221@gmail.com', // Email thật của bạn
    pass: 'nehycwtaunijuhih'               // Mật khẩu ứng dụng 16 ký tự bạn vừa cung cấp
  }
});

module.exports = transporter;