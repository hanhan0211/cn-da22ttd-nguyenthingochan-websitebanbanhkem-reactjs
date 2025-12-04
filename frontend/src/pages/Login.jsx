import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { Mail, Lock, Loader, ArrowLeft } from "lucide-react";

// Cấu hình Axios Client
const axiosClient = axios.create({
  baseURL: "http://localhost:5000/api",
  headers: {
    "Content-Type": "application/json",
  },
});

const Login = ({ setCurrentUser }) => {  // Nhận setCurrentUser từ props
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await axiosClient.post("/auth/login", formData);

      const data = res.data;
      console.log("Login Response:", data);

      // Lấy token
      const token = data.token || data.accessToken;

      // Lấy đúng thông tin user
      let user = data.user;

      // Fallback nếu backend trả về object không đúng định dạng
      if (!user && data.email) {
        user = {
          id: data.id || data._id,
          name: data.name,
          email: data.email,
          role: data.role,
          avatarUrl: data.avatarUrl,
        };
      }

      // Kiểm tra dữ liệu hợp lệ
      if (!token || !user) {
        throw new Error("Dữ liệu trả về không hợp lệ!");
      }

      localStorage.setItem("ACCESS_TOKEN", token);
      localStorage.setItem("USER_INFO", JSON.stringify(user));

      // Gọi setCurrentUser để cập nhật người dùng trong App
      setCurrentUser(user);

      // Điều hướng theo role
      if (user.role === "admin") {
        navigate("/admin");
      } else {
        navigate("/");
      }
    } catch (err) {
      console.error("Login Error:", err);
      const msg =
        err.response?.data?.message || err.message || "Đăng nhập thất bại";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-80px)] flex items-center justify-center bg-gradient-to-br from-pink-50 to-white p-4">
      <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md border border-pink-100">
        <Link
          to="/"
          className="inline-flex items-center text-gray-500 hover:text-pink-600 mb-6 transition"
        >
          <ArrowLeft size={16} className="mr-1" /> Trang chủ
        </Link>

        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-pink-600 mb-2">
            Chào mừng trở lại!
          </h2>
          <p className="text-gray-500">Vui lòng đăng nhập để tiếp tục</p>
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 p-4 rounded-lg mb-6 text-sm border border-red-100 flex items-center">
            <span className="mr-2">⚠️</span> {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-gray-700 font-medium mb-2">
              Email
            </label>
            <div className="relative group">
              <Mail
                className="absolute left-3 top-3 text-gray-400 group-focus-within:text-pink-500 transition"
                size={20}
              />
              <input
                type="email"
                name="email"
                required
                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-pink-500 focus:ring-2 focus:ring-pink-100 transition bg-gray-50 focus:bg-white"
                placeholder="name@example.com"
                onChange={handleChange}
                value={formData.email}
              />
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="block text-gray-700 font-medium">
                Mật khẩu
              </label>
              <a href="#" className="text-xs text-pink-600 hover:underline">
                Quên mật khẩu?
              </a>
            </div>
            <div className="relative group">
              <Lock
                className="absolute left-3 top-3 text-gray-400 group-focus-within:text-pink-500 transition"
                size={20}
              />
              <input
                type="password"
                name="password"
                required
                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-pink-500 focus:ring-2 focus:ring-pink-100 transition bg-gray-50 focus:bg-white"
                placeholder="••••••••"
                onChange={handleChange}
                value={formData.password}
              />
            </div>
          </div>

          <button
            disabled={loading}
            className="w-full bg-pink-600 hover:bg-pink-700 text-white font-bold py-3 rounded-xl shadow-lg shadow-pink-200 transition transform active:scale-95 flex justify-center items-center"
          >
            {loading ? <Loader className="animate-spin" /> : "Đăng Nhập"}
          </button>
        </form>

        <div className="mt-8 text-center pt-6 border-t border-gray-100">
          <p className="text-gray-600">
            Chưa có tài khoản?{" "}
            <Link
              to="/register"
              className="text-pink-600 font-bold hover:underline hover:text-pink-700"
            >
              Đăng ký ngay
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
