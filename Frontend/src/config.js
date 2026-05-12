// Nếu đang chạy ở máy (development) thì dùng localhost, 
// Nếu đã lên Render thì dùng link backend của Render
export const API_URL = import.meta.env.PROD 
  ? 'https://hkl-backend.onrender.com' 
  : 'http://localhost:5000';