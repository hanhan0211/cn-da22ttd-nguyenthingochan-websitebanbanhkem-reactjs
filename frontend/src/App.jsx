import React, { useState, useEffect } from "react";
import {
  Routes,
  Route,
  Link,
  Navigate,
  useNavigate,
  useLocation,
} from "react-router-dom";
import {
  ShoppingCart,
  User,
  LogIn,
  UserPlus,
  LogOut,
  LayoutDashboard,
  Package // ✅ Thêm icon Package
} from "lucide-react";

import HomePage from "./pages/HomePage";
import ProductPage from "./pages/ProductPage";
import ContactPage from "./pages/ContactPage";
import ProductDetailPage from "./pages/ProductDetailPage";
import CartPage from "./pages/CartPage"; 
import CheckoutPage from "./pages/CheckoutPage";

// ✅ THÊM 2 TRANG NÀY
import MyOrdersPage from "./pages/MyOrdersPage";
import OrderDetailPage from "./pages/OrderDetailPage";

import Login from "./pages/Login";
import Register from "./pages/Register";

import AdminLayout from "./layouts/AdminLayout";
import Dashboard from "./pages/admin/Dashboard";
import ProductManager from "./pages/admin/ProductManager";
import CategoryManager from "./pages/admin/CategoryManager";
import OrderManager from "./pages/admin/OrderManager";
import ContactManager from "./pages/admin/ContactManager";

function App() {
  const [currentUser, setCurrentUser] = useState(() => {
    const stored = localStorage.getItem("USER_INFO");
    if (stored && stored !== "undefined") {
      try {
        const user = JSON.parse(stored);
        return user;
      } catch {
        return null;
      }
    }
    return null;
  });

  const [checkingAuth, setCheckingAuth] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const stored = localStorage.getItem("USER_INFO");
    if (stored && stored !== "undefined") {
      try {
        const user = JSON.parse(stored);
        setCurrentUser(user);

        // Nếu là admin và đang ở /login hoặc /register, redirect sang /admin
        if (user.role === "admin" && (location.pathname === "/login" || location.pathname === "/register")) {
          navigate("/admin", { replace: true });
        }

      } catch {
        setCurrentUser(null);
      }
    } else {
      setCurrentUser(null);
    }
    setCheckingAuth(false);
  }, [location, navigate]);

  const AdminRoute = ({ children }) => {
    if (checkingAuth) return <div className="text-center py-20">Đang kiểm tra quyền...</div>;
    if (!currentUser || currentUser.role !== "admin") return <Navigate to="/" replace />;
    return children;
  };

  const handleLogout = () => {
    localStorage.removeItem("ACCESS_TOKEN");
    localStorage.removeItem("USER_INFO");
    setCurrentUser(null);
    navigate("/login");
  };

  return (
    <div className="font-sans text-gray-800 bg-gray-50 min-h-screen">
      {/* Navbar */}
      <nav className="bg-white/90 backdrop-blur-md sticky top-0 z-50 shadow-sm border-b border-pink-100">
        <div className="container mx-auto px-4 py-3 flex justify-between items-center">
          <Link to="/" className="text-2xl font-bold text-pink-600 flex items-center gap-2">
            🍰 HanHan Bakery
          </Link>

          <div className="hidden md:flex space-x-8 font-medium text-gray-600">
            <Link to="/" className="hover:text-pink-600 transition">Trang chủ</Link>
            <Link to="/san-pham" className="hover:text-pink-600 transition">Sản phẩm</Link>
            <Link to="/lien-he" className="hover:text-pink-600 transition">Liên hệ</Link>
          </div>

          <div className="flex items-center space-x-6">
            <Link to="/cart" className="relative hover:text-pink-600 transition">
              <ShoppingCart className="w-6 h-6" />
              <span className="absolute -top-1 -right-1 bg-pink-500 text-white text-xs w-4 h-4 rounded-full flex items-center justify-center">
                0
              </span>
            </Link>

            <div className="relative group py-2">
              <button className="hover:text-pink-600 transition flex items-center gap-2">
                {currentUser ? (
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold max-w-[100px] truncate hidden md:block">
                      {currentUser.name}
                    </span>
                    <div className="w-8 h-8 rounded-full bg-pink-100 flex items-center justify-center text-pink-600 border border-pink-200">
                      <User size={18} />
                    </div>
                  </div>
                ) : (
                  <User className="w-6 h-6" />
                )}
              </button>

              <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-xl shadow-xl border border-pink-100 overflow-hidden invisible opacity-0 group-hover:visible group-hover:opacity-100 transition-all duration-300 transform origin-top-right z-50">
                <div className="p-2 bg-white flex flex-col gap-1">
                  {currentUser ? (
                    <>
                      <div className="px-4 py-2 text-xs text-gray-400 border-b border-gray-100 mb-1">
                        Tài khoản: <br />
                        <span className="text-gray-600 font-medium truncate block">{currentUser.email}</span>
                      </div>

                      {currentUser.role === "admin" && (
                        <Link to="/admin" className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-pink-50 hover:text-pink-600 rounded-lg transition">
                          <LayoutDashboard size={18} />
                          <span>Trang quản trị</span>
                        </Link>
                      )}

                      {currentUser.role !== "admin" &&(
                      <Link to="/my-orders" className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-pink-50 hover:text-pink-600 rounded-lg transition">
                        <Package size={18} />
                        <span>Đơn hàng của tôi</span>
                      </Link>
                      )}

                      <button onClick={handleLogout} className="w-full flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition">
                        <LogOut size={18} />
                        <span>Đăng xuất</span>
                      </button>
                    </>
                  ) : (
                    <>
                      <Link to="/login" className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-pink-50 hover:text-pink-600 rounded-lg transition">
                        <LogIn size={18} />
                        <span>Đăng nhập</span>
                      </Link>
                      <Link to="/register" className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-pink-50 hover:text-pink-600 rounded-lg transition">
                        <UserPlus size={18} />
                        <span>Đăng ký</span>
                      </Link>
                    </>
                  )}
                </div>
              </div>

            </div>
          </div>
        </div>
      </nav>

      {/* Routes */}
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/san-pham" element={<ProductPage />} />
        <Route path="/lien-he" element={<ContactPage />} />
        <Route path="/san-pham/:slug" element={<ProductDetailPage />} />
        
        {/* ✅ ROUTE THANH TOÁN & ĐƠN HÀNG */}
        <Route path="/checkout" element={<CheckoutPage />} />
        <Route path="/my-orders" element={<MyOrdersPage />} />
        <Route path="/order/:id" element={<OrderDetailPage />} />
        
        {/* Route Giỏ hàng */}
        <Route path="/cart" element={<CartPage />} />

        <Route path="/login" element={<Login setCurrentUser={setCurrentUser} />} />
        <Route path="/register" element={<Register />} />

        <Route path="/admin" element={<AdminRoute><AdminLayout /></AdminRoute>}>
          <Route index element={<Dashboard />} />
          <Route path="products" element={<ProductManager />} />
          <Route path="categories" element={<CategoryManager />} />
          <Route path="orders" element={<OrderManager />} />
          <Route path="contacts" element={<ContactManager />} />
        </Route>

        <Route path="*" element={<div className="text-center py-20">404 - Không tìm thấy trang</div>} />
      </Routes>
    </div>
  );
}

export default App;