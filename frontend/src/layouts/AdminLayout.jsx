import React from 'react';
// ✅ 1. Thêm useNavigate vào import
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, ShoppingBag, Layers, LogOut, Home, Package, Mail } from 'lucide-react';

const AdminLayout = () => {
  const location = useLocation();
  const navigate = useNavigate(); // ✅ 2. Khai báo hook điều hướng

  const menuItems = [
    { path: '/admin', icon: <LayoutDashboard size={20} />, label: 'Thống kê' },
    { path: '/admin/contacts', icon: <Mail size={20} />, label: 'Liên hệ' },
    { path: '/admin/orders', icon: <Package size={20} />, label: 'Đơn hàng' },
    { path: '/admin/products', icon: <ShoppingBag size={20} />, label: 'Sản phẩm' },
    { path: '/admin/categories', icon: <Layers size={20} />, label: 'Danh mục' },
  ];

  // ✅ 3. Hàm xử lý đăng xuất
  const handleLogout = () => {
    if (window.confirm("Bạn có chắc chắn muốn đăng xuất không?")) {
      // Xóa thông tin lưu trong máy
      localStorage.removeItem("ACCESS_TOKEN");
      localStorage.removeItem("USER_INFO");
      
      // Chuyển hướng về trang đăng nhập
      navigate("/login");
    }
  };

  return (
    <div className="flex h-screen bg-gray-100 font-sans">
      {/* SIDEBAR */}
      <aside className="w-64 bg-slate-900 text-white flex flex-col shadow-xl">
        <div className="h-16 flex items-center justify-center font-bold text-2xl border-b border-slate-800 text-pink-500">
          HanHan Admin
        </div>
        
        <nav className="flex-1 p-4 space-y-2">
          {menuItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                (item.path === '/admin' && location.pathname === '/admin') || 
                (item.path !== '/admin' && location.pathname.startsWith(item.path))
                  ? 'bg-pink-600 text-white shadow-lg shadow-pink-500/30' 
                  : 'text-slate-400 hover:bg-slate-800 hover:text-white'
              }`}
            >
              {item.icon} {item.label}
            </Link>
          ))}
        </nav>

        <div className="p-4 border-t border-slate-800">
          <Link to="/" className="flex items-center gap-3 px-4 py-3 text-slate-400 hover:text-white transition">
            <Home size={20} /> Về Website
          </Link>
          
          {/* ✅ 4. Gắn sự kiện onClick vào nút này */}
          <button 
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-3 text-red-400 hover:text-red-300 transition w-full text-left"
          >
            <LogOut size={20} /> Đăng xuất
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 overflow-y-auto">
        

        {/* Nội dung thay đổi sẽ hiển thị ở đây */}
        <div className="p-6">
            <Outlet /> 
        </div>
      </main>
    </div>
  );
};

export default AdminLayout;