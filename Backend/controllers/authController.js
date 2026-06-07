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
  // Thay đổi cách tạo link ở phần register:
// TRONG HÀM REGISTER:
// Thay vì dùng encodeURIComponent đơn thuần
const token = jwt.sign({ tendn, mk, email, sdt, ngaysinh, role }, SECRET_KEY, { expiresIn: '10m' });

// Dùng cách này để thay thế các ký tự dễ gây lỗi trên URL
const safeToken = token.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
const confirmLink = `https://hkl-backend-v3uu.onrender.com/api/auth/confirm-registration?token=${safeToken}`;

    // ⛔ CHỈ SỬA ĐOẠN NÀY: Nếu chạy trên Render (production) thì chặn gửi email, trả link về Frontend luôn
    if (process.env.NODE_ENV === 'production') {
      return res.status(200).json({ 
        message: "Chạy trên Render: Đã chặn gửi email kích hoạt!", 
        confirmLink: confirmLink 
      });
    }
  
    // ✅ DƯỚI LOCALHOST: Giữ nguyên đoạn gửi Email thật với giao diện cũ của bạn
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
// Hàm confirmRegistration để chính thức lưu vào Database khi nhấn link
exports.confirmRegistration = async (req, res) => {
  const { token } = req.query;
  try {
    const data = jwt.verify(token, SECRET_KEY);

    // --- LOGIC TẠO MÃ RANDOM 8 SỐ ---
    const randomSuffix = Math.floor(10000000 + Math.random() * 90000000);
    const matk = `TK${randomSuffix}`;

    const dbRole = data.role === 'author' ? 'TacGia' : 'DocGia';

    // Lưu vào TAI_KHOAN
    await pool.query(
      "INSERT INTO TAI_KHOAN (MATK, TENDN, MK, VAI_TRO, NGAYSINH, EMAIL, SDT) VALUES ($1, $2, $3, $4, $5, $6, $7)",
      [matk, data.tendn, data.mk, dbRole, data.ngaysinh, data.email, data.sdt]
    );

    // Lưu vào bảng chi tiết để logic LOGIN (LEFT JOIN) chạy được
    if (data.role === 'author') {
        const countTG = await pool.query("SELECT COUNT(*) FROM TAC_GIA");
        const matg = `TG${(parseInt(countTG.rows[0].count) + 1).toString().padStart(3, '0')}`;
        await pool.query("INSERT INTO TAC_GIA (MATG, TENTG, MATK) VALUES ($1, $2, $3)", [matg, data.tendn, matk]);
    } else {
        const countDG = await pool.query("SELECT COUNT(*) FROM DOC_GIA");
        const madg = `DG${(parseInt(countDG.rows[0].count) + 1).toString().padStart(3, '0')}`;
        await pool.query("INSERT INTO DOC_GIA (MADG, TENDG, MATK) VALUES ($1, $2, $3)", [madg, data.tendn, matk]);
    }

    // 🎯 TỰ ĐỘNG NHẬN DIỆN MÔI TRƯỜNG ĐỂ REDIRECT
    // Nếu chạy trên Render (production) thì về link Render, ngược lại dưới máy local thì về localhost
    const frontendLoginUrl = process.env.NODE_ENV === 'production'
      ? 'https://hkl-frontend.onrender.com/login'
      : 'http://localhost:5173/login'; // Bạn nhớ check lại port của Frontend dưới máy bạn (5173 hoặc 3000) nhé!

    // Chuyển hướng trình duyệt chạy thẳng tới trang login luôn, không cần hiển thị giao diện ở backend nữa
    return res.redirect(frontendLoginUrl);

  } catch (err) {
    console.error("LỖI CHI TIẾT KÍCH HOẠT TÀI KHOẢN:", err);
    res.status(400).send("Lỗi kích hoạt: " + err.message);
  }
};

exports.forgotPassword = async (req, res) => {
  const { email } = req.body;
  try {
    const user = await pool.query("SELECT * FROM TAI_KHOAN WHERE EMAIL = $1", [email]);
    if (user.rows.length === 0) return res.status(404).json({ error: "Email không tồn tại!" });

    // Tạo token chứa email khôi phục, hết hạn sau 15 phút
    const token = jwt.sign({ email }, SECRET_KEY, { expiresIn: '15m' });

    // ⛔ TRÊN RENDER (NODE_ENV là production): KHÔNG gửi email, trả thẳng link về giao diện
    if (process.env.NODE_ENV === 'production') {
      const hostResetLink = `https://hkl-frontend.onrender.com/reset-password?token=${token}`;
      return res.json({ 
        message: "Chạy trên Render: Đã chặn gửi email!", 
        devLink: hostResetLink 
      });
    }

    // ✅ DƯỚI LOCALHOST: Tiến hành gửi Email thật để test luồng mail nhận được
    const localResetLink = `http://localhost:5173/reset-password?token=${token}`;

    await transporter.sendMail({
      from: '"HKL Story" <nguyentramhuong2k221@gmail.com>',
      to: email,
      subject: '🔑 [LOCAL TEST] Khôi Phục Mật Khẩu HKL Story',
      html: `
        <div style="font-family: serif; padding: 20px; border: 1px solid #5d4037;">
          <h3>Yêu cầu đặt lại mật khẩu (Localhost)</h3>
          <p>Bấm vào nút bên dưới để thực hiện đổi mật khẩu tại máy local của bạn:</p>
          <a href="${localResetLink}" style="background: #5d4037; color: white; padding: 10px 20px; text-decoration: none; display: inline-block;">ĐẶT LẠI MẬT KHẨU LOCAL</a>
        </div>`
    });

    res.json({ message: "Chế độ Local: Đã gửi email khôi phục thành công!" });
  } catch (err) {
    console.error(">>> LỖI FORGOT PASSWORD:", err); 
    res.status(500).json({ error: "Lỗi hệ thống tại Backend!" });
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