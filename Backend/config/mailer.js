const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    // Nếu có biến môi trường trên Render thì lấy, không thì lấy mail mặc định khi dev local
    user: process.env.EMAIL_USER || 'nguyentramhuong2k221@gmail.com', 
    pass: process.env.EMAIL_PASS || 'amczxqwazaoclfci'
  }
});

module.exports = transporter;
