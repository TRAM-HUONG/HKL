const pool = require('../config/db');
const transporter = require('../config/mailer');
const jwt = require('jsonwebtoken');

const SECRET_KEY = "hkl_secret_key_2026"; 

exports.login = async (req, res) => {
    const { tendn, mk } = req.body;

    try {
        // CẬP NHẬT QUERY: Join thêm để lấy TENTG hoặc TENDG
        const query = `
            SELECT tk.*, dg.MADG, dg.TENDG, tg.MATG, tg.TENTG 
            FROM TAI_KHOAN tk
            LEFT JOIN DOC_GIA dg ON tk.MATK = dg.MATK
            LEFT JOIN TAC_GIA tg ON tk.MATK = tg.MATK
            WHERE tk.TENDN = $1 AND tk.MK = $2`;

        const result = await pool.query(query, [tendn, mk]);

        if (result.rows.length > 0) {
            const user = result.rows[0];
            delete user.mk; 

            // Xác định vai trò và gán Tên thật vào một cột chung 'ten_that' để dễ hiển thị
            if (user.madg) {
                user.vai_tro = 'DocGia';
                user.ten_that = user.tendg; // Lấy từ bảng DOC_GIA
            } else if (user.matg) {
                user.vai_tro = 'TacGia';
                user.ten_that = user.tentg; // Lấy từ bảng TAC_GIA
            }

            res.status(200).json({ message: "Đăng nhập thành công!", user });
        } else {
            res.status(401).json({ error: "Tên đăng nhập hoặc mật khẩu không chính xác!" });
        }
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: "Lỗi máy chủ!" });
    }
};







exports.register = async (req, res) => {
  const { tendn, mk, email, sdt, ngaysinh, role } = req.body;

  try {
    // 1. Kiểm tra trùng lặp trong Database
    const check = await pool.query("SELECT * FROM TAI_KHOAN WHERE TENDN=$1 OR EMAIL=$2", [tendn, email]);
    if (check.rows.length > 0) return res.status(400).json({ error: "Tên hoặc Email đã tồn tại!" });

    // 2. Gói dữ liệu vào Token
    const token = jwt.sign({ tendn, mk, email, sdt, ngaysinh, role }, SECRET_KEY, { expiresIn: '10m' });
    const confirmLink = `http://localhost:5000/api/auth/confirm-registration?token=${token}`;

  
    await transporter.sendMail({
      from: '"HKL Story" <nguyentramhuong2k221@gmail.com>',
      to: email, 
      subject: '📜 Xác Nhận Đăng Ký Tài Khoản HKL Story',
      html: `
        <div style="background-color: #f4f1ea; padding: 30px; font-family: 'Times New Roman', serif; line-height: 1.6;">
          <div style="max-width: 600px; margin: auto; background: white; padding: 30px; border: 1px solid #5d4037; border-radius: 8px;">
            <h2 style="color: #5d4037; text-align: center; border-bottom: 2px solid #5d4037; padding-bottom: 10px;">ĐIỀU KHOẢN SỬ DỤNG</h2>
            
            <div style="background: #fafafa; border: 1px inset #ddd; padding: 15px; margin: 20px 0; font-size: 14px; color: #3e2723; max-height: 200px; overflow-y: auto;">
              <p>Chào mừng bạn đến với <b>HKL Story</b>. Khi tham gia cộng đồng của chúng tôi, bạn cần tuân thủ các điều khoản sau:</p>
              <ul>
                <li><b>1. Nội dung:</b> Không đăng tải truyện hoặc bình luận có nội dung đồi trụy, vi phạm pháp luật hoặc xúc phạm cá nhân/tổ chức khác.</li>
                <li><b>2. Bản quyền:</b> Tôn trọng quyền tác giả. Không sao chép truyện từ nền tảng khác khi chưa được phép và khi sao chép cần mô tả chi tiết nguồn hoặc tên cua tác giả khác.</li>
                <li><b>3. Bảo mật:</b> Bạn có trách nhiệm tự bảo quản mật khẩu cá nhân. Hệ thống không chịu trách nhiệm nếu bạn làm lộ thông tin.</li>
                <li><b>4. Xử lý vi phạm:</b> Ban quản trị có quyền khóa hoặc xóa tài khoản vĩnh viễn nếu phát hiện hành vi gian lận hoặc phá hoại hệ thống.</li>
              </ul>
              <p style="color: #d32f2f;"><i>* Quan trọng: Bằng việc nhấn vào nút "XÁC NHẬN ĐĂNG KÝ" bên dưới, bạn chính thức xác nhận đã đọc, hiểu và đồng ý với tất cả các điều khoản trên.</i></p>
            </div>

            <div style="text-align: center; margin-top: 30px;">
              <a href="${confirmLink}" 
                 style="background: #5d4037; color: #f4f1ea; padding: 15px 35px; text-decoration: none; font-weight: bold; border-radius: 4px; display: inline-block;">
                 XÁC NHẬN ĐĂNG KÝ
              </a>
            </div>

            <p style="font-size: 12px; color: #888; text-align: center; margin-top: 30px;">
              Nếu bạn không thực hiện đăng ký này, vui lòng bỏ qua email. Link sẽ hết hiệu lực sau 10 phút.
            </p>
          </div>
        </div>`
    });

    res.status(200).json({ message: "Vui lòng kiểm tra Email để xác nhận đăng ký!" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Lỗi hệ thống khi gửi mail!" });
  }
};

// Hàm confirmRegistration để chính thức lưu vào Database khi nhấn link
exports.confirmRegistration = async (req, res) => {
  const { token } = req.query;
  try {
    const data = jwt.verify(token, SECRET_KEY);
    
    // 1. Tạo mã MATK tự động
    const count = await pool.query("SELECT COUNT(*) FROM TAI_KHOAN");
    const matk = `TK${(parseInt(count.rows[0].count) + 1).toString().padStart(3, '0')}`;

    // 2. Chuẩn hóa tên vai trò để lưu vào database
    const dbRole = data.role === 'author' ? 'TacGia' : 'DocGia';

    // 3. LƯU VÀO BẢNG TAI_KHOAN
    await pool.query(
      "INSERT INTO TAI_KHOAN (MATK, TENDN, MK, VAI_TRO, NGAYSINH, EMAIL, SDT) VALUES ($1, $2, $3, $4, $5, $6, $7)",
      [matk, data.tendn, data.mk, dbRole, data.ngaysinh, data.email, data.sdt]
    );

    // 4. QUAN TRỌNG: Lưu vào bảng chi tiết để logic LOGIN (LEFT JOIN) chạy được
    if (data.role === 'author') {
        const countTG = await pool.query("SELECT COUNT(*) FROM TAC_GIA");
        const matg = `TG${(parseInt(countTG.rows[0].count) + 1).toString().padStart(3, '0')}`;
        await pool.query("INSERT INTO TAC_GIA (MATG, TENTG, MATK) VALUES ($1, $2, $3)", [matg, data.tendn, matk]);
    } else {
        const countDG = await pool.query("SELECT COUNT(*) FROM DOC_GIA");
        const madg = `DG${(parseInt(countDG.rows[0].count) + 1).toString().padStart(3, '0')}`;
        await pool.query("INSERT INTO DOC_GIA (MADG, TENDG, MATK) VALUES ($1, $2, $3)", [madg, data.tendn, matk]);
    }

    res.send(`
      <div style="text-align: center; padding-top: 50px; font-family: sans-serif;">
        <h1 style="color: #5d4037;">🎉 Thành công!</h1>
        <p>Tài khoản <b>${data.tendn}</b> đã được kích hoạt với vai trò <b>${dbRole}</b>.</p>
        <a href="http://localhost:5000/login">Quay lại trang Đăng nhập</a>
      </div>
    `);
  } catch (err) {
    console.error(err);
    res.status(400).send("Link xác nhận không hợp lệ hoặc đã hết hạn!");
  }
};
exports.forgotPassword = async (req, res) => {
  const { email } = req.body;
  try {
    const user = await pool.query("SELECT * FROM TAI_KHOAN WHERE EMAIL = $1", [email]);
    if (user.rows.length === 0) return res.status(404).json({ error: "Email không tồn tại!" });

    // Tạo token chứa email, hết hạn sau 15 phút
    const token = jwt.sign({ email }, SECRET_KEY, { expiresIn: '15m' });
    
    // --- SỬA DÒNG NÀY ---
  
    const resetLink = `http://localhost:5173/reset-password?token=${token}`;

    await transporter.sendMail({
      from: '"HKL Story" <nguyentramhuong2k221@gmail.com>',
      to: email,
      subject: '🔑 Khôi Phục Mật Khẩu HKL Story',
      html: `
        <div style="font-family: serif; padding: 20px; border: 1px solid #5d4037;">
          <h3>Yêu cầu đặt lại mật khẩu</h3>
          <p>Chào bạn, chúng tôi nhận được yêu cầu thay đổi mật khẩu từ bạn. Nhấn vào nút bên dưới để thực hiện:</p>
          <a href="${resetLink}" style="background: #5d4037; color: white; padding: 10px 20px; text-decoration: none; display: inline-block;">ĐẶT LẠI MẬT KHẨU</a>
          <p>Link này sẽ hết hạn sau 15 phút.</p>
        </div>`
    });

    res.json({ message: "Vui lòng kiểm tra email của bạn!" });
  } catch (err) {
    console.error(">>> LỖI FORGOT PASSWORD:", err); 
    res.status(500).json({ error: "Lỗi hệ thống!" });
  }
};

// 2. Cập nhật mật khẩu mới vào Database
exports.resetPassword = async (req, res) => {
  const { token, newPassword } = req.body;
  try {
    const decoded = jwt.verify(token, SECRET_KEY);
    await pool.query("UPDATE TAI_KHOAN SET MK = $1 WHERE EMAIL = $2", [newPassword, decoded.email]);
    res.json({ message: "Cập nhật mật khẩu thành công!" });
  } catch (err) {
    res.status(400).json({ error: "Link đã hết hạn hoặc không hợp lệ!" });
  }
};