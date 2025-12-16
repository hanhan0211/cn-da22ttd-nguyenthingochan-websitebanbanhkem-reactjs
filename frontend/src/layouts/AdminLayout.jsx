import React from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
// ✅ 1. Thêm icon 'Zap' vào đây
import { LayoutDashboard, ShoppingBag, Layers, LogOut, Home, Package, Mail, Users, Star, Image, Zap } from 'lucide-react';

const AdminLayout = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const menuItems = [
    { path: '/admin', icon: <LayoutDashboard size={20} />, label: 'Thống kê' },
    { path: '/admin/orders', icon: <Package size={20} />, label: 'Đơn hàng' },
    { path: '/admin/products', icon: <ShoppingBag size={20} />, label: 'Sản phẩm' },
    
    // ✅ 2. THÊM MỤC FLASH SALE VÀO ĐÂY
    { path: '/admin/flash-sale', icon: <Zap size={20} />, label: 'Flash Sale' },

    { path: '/admin/categories', icon: <Layers size={20} />, label: 'Danh mục' },
    { path: '/admin/users', icon: <Users size={20} />, label: 'Khách hàng' }, 
    { path: '/admin/reviews', icon: <Star size={20} />, label: 'Đánh giá' },
    { path: '/admin/banners', icon: <Image size={20} />, label: 'Banner' },
    { path: '/admin/contacts', icon: <Mail size={20} />, label: 'Liên hệ' },
  ];

  const handleLogout = () => {
    if (window.confirm("Bạn có chắc chắn muốn đăng xuất không?")) {
      localStorage.removeItem("ACCESS_TOKEN");
      localStorage.removeItem("USER_INFO");
      navigate("/login");
    }
  };

  return (
    <div className="flex h-screen bg-gray-100 font-sans">
      {/* --- CSS TÙY CHỈNH THANH CUỘN (SCROLLBAR) --- */}
      <style>{`
        /* Thanh cuộn chung */
        .custom-scroll::-webkit-scrollbar {
          width: 5px; /* Độ rộng nhỏ gọn */
          height: 5px;
        }
        .custom-scroll::-webkit-scrollbar-track {
          background: transparent;
        }
        
        /* Thanh cuộn cho nội dung chính (Màu sáng) */
        .main-scroll::-webkit-scrollbar-thumb {
          background: #cbd5e1; /* Màu xám nhạt */
          border-radius: 10px;
        }
        .main-scroll::-webkit-scrollbar-thumb:hover {
          background: #94a3b8;
        }

        /* Thanh cuộn cho Sidebar (Màu tối) */
        .sidebar-scroll::-webkit-scrollbar-thumb {
          background: #475569; /* Màu xám đậm */
          border-radius: 10px;
        }
        .sidebar-scroll::-webkit-scrollbar-thumb:hover {
          background: #64748b;
        }
      `}</style>

      {/* SIDEBAR */}
      <aside className="w-64 bg-slate-900 text-white flex flex-col shadow-xl">
        <div className="h-16 flex items-center justify-center font-bold text-2xl border-b border-slate-800 text-pink-500">
          HanHan Admin
        </div>
        
        {/* ✅ Thêm class 'custom-scroll sidebar-scroll' vào đây */}
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto custom-scroll sidebar-scroll">
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
          
          <button 
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-3 text-red-400 hover:text-red-300 transition w-full text-left"
          >
            <LogOut size={20} /> Đăng xuất
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      {/* ✅ Thêm class 'custom-scroll main-scroll' vào đây */}
      <main className="flex-1 overflow-y-auto custom-scroll main-scroll">
        <div className="p-6">
            <Outlet /> 
        </div>
      </main>
    </div>
  );
};

export default AdminLayout;