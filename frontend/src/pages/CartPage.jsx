import React, { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { 
  Trash2, Minus, Plus, ShoppingBag, ArrowRight, CreditCard, Truck, CheckSquare, Square
} from 'lucide-react';

// --- HELPER ---
const getImageUrl = (path) => {
    if (!path) return 'https://via.placeholder.com/150?text=No+Image';
    if (path.startsWith('http')) return path;
    return `http://localhost:5000${path}`;
};

const CartPage = () => {
    const [cart, setCart] = useState(null);
    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState(false);
    
    // --- NEW: State lưu danh sách ID các sản phẩm được chọn ---
    const [selectedItems, setSelectedItems] = useState([]); 
    
    const navigate = useNavigate();
    const getToken = () => localStorage.getItem("ACCESS_TOKEN");

    const fetchCart = async () => {
        const token = getToken();
        if (!token) {
            navigate('/login');
            return;
        }
        try {
            const res = await axios.get('http://localhost:5000/api/cart', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setCart(res.data);
        } catch (err) {
            console.error("Lỗi tải giỏ hàng:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCart();
    }, []);

    // --- NEW: Tính toán tổng tiền dựa trên các món ĐÃ CHỌN ---
    const selectedTotal = useMemo(() => {
        if (!cart || !cart.items) return 0;
        return cart.items.reduce((total, item) => {
            // Kiểm tra xem sản phẩm này có nằm trong danh sách chọn không
            // Lưu ý: item.product._id là ID của sản phẩm
            if (selectedItems.includes(item.product._id || item.product)) { 
                return total + (item.price * item.qty);
            }
            return total;
        }, 0);
    }, [cart, selectedItems]);

    // --- NEW: Xử lý chọn 1 sản phẩm ---
    const handleSelectItem = (productId) => {
        if (selectedItems.includes(productId)) {
            // Nếu đã chọn thì bỏ chọn (xóa khỏi mảng)
            setSelectedItems(selectedItems.filter(id => id !== productId));
        } else {
            // Nếu chưa chọn thì thêm vào mảng
            setSelectedItems([...selectedItems, productId]);
        }
    };

    // --- NEW: Xử lý chọn tất cả ---
    const handleSelectAll = () => {
        if (!cart || !cart.items) return;
        
        if (selectedItems.length === cart.items.length) {
            // Nếu đang chọn hết thì bỏ chọn tất cả
            setSelectedItems([]);
        } else {
            // Nếu chưa chọn hết thì chọn tất cả
            const allIds = cart.items.map(item => item.product._id || item.product);
            setSelectedItems(allIds);
        }
    };

    // --- NEW: Xử lý khi bấm nút Thanh Toán ---
    const handleCheckout = () => {
        if (selectedItems.length === 0) {
            alert("Bạn chưa chọn sản phẩm nào để thanh toán!");
            return;
        }
        
        // Lọc ra các item object chi tiết để gửi sang trang thanh toán
        const itemsToCheckout = cart.items.filter(item => 
            selectedItems.includes(item.product._id || item.product)
        );

        // Chuyển hướng sang trang checkout và gửi kèm dữ liệu
        // (Bạn cần xây dựng trang /checkout để nhận state này)
        navigate('/checkout', { state: { items: itemsToCheckout, total: selectedTotal } });
    };

    // ... (Giữ nguyên logic updateQty và remove như cũ)
    const handleUpdateQty = async (index, newQty) => {
        if (newQty < 1 || updating) return;
        const token = getToken();
        setUpdating(true);
        try {
            const res = await axios.put('http://localhost:5000/api/cart/item', 
                { itemIndex: index, qty: newQty },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setCart(res.data);
        } catch (err) {
            console.error("Lỗi cập nhật:", err);
        } finally {
            setUpdating(false);
        }
    };

    const handleRemoveItem = async (productId) => {
        const token = getToken();
        if (!window.confirm("Bạn có chắc muốn xóa bánh này khỏi giỏ?")) return;
        try {
            const res = await axios.delete(`http://localhost:5000/api/cart/item/${productId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setCart(res.data);
            // Xóa luôn khỏi danh sách selected nếu đang chọn
            setSelectedItems(selectedItems.filter(id => id !== productId));
        } catch (err) {
            console.error("Lỗi xóa:", err);
        }
    };

    if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
    
    // Check giỏ rỗng (Code cũ)...
    if (!cart || cart.items.length === 0) { /* ... Code màn hình trống ... */ return <div>Giỏ hàng trống</div>; }

    return (
        <div className="bg-gray-50 min-h-screen py-10 font-sans">
            <div className="container mx-auto px-4">
                <h1 className="text-3xl font-bold text-gray-800 mb-8 font-serif flex items-center gap-3">
                    <ShoppingBag className="text-pink-600" /> Giỏ Hàng Của Bạn
                </h1>

                <div className="flex flex-col lg:flex-row gap-8">
                    {/* LIST ITEM */}
                    <div className="w-full lg:w-2/3 space-y-4">
                        
                        {/* --- NEW: Header chọn tất cả --- */}
                        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex items-center gap-3">
                             <button 
                                onClick={handleSelectAll}
                                className="flex items-center gap-2 text-gray-600 font-medium hover:text-pink-600"
                            >
                                {selectedItems.length === cart.items.length && cart.items.length > 0 ? (
                                    <CheckSquare className="text-pink-600" /> 
                                ) : (
                                    <Square className="text-gray-400" />
                                )}
                                Chọn tất cả ({cart.items.length} sản phẩm)
                            </button>
                        </div>

                        {cart.items.map((item, index) => {
                            const productId = item.product._id || item.product;
                            const isSelected = selectedItems.includes(productId);

                            return (
                                <div key={index} className={`bg-white p-4 rounded-2xl shadow-sm border transition-all flex gap-4 items-center ${isSelected ? 'border-pink-300 ring-1 ring-pink-100' : 'border-gray-100'}`}>
                                    
                                    {/* --- NEW: Checkbox từng món --- */}
                                    <button onClick={() => handleSelectItem(productId)}>
                                        {isSelected ? (
                                            <CheckSquare className="text-pink-600 flex-shrink-0" size={24} />
                                        ) : (
                                            <Square className="text-gray-300 flex-shrink-0 hover:text-pink-400" size={24} />
                                        )}
                                    </button>

                                    {/* Ảnh */}
                                    <div className="w-24 h-24 flex-shrink-0 bg-gray-100 rounded-xl overflow-hidden border border-gray-100">
                                        <img src={getImageUrl(item.image)} alt={item.name} className="w-full h-full object-cover" />
                                    </div>

                                    {/* Thông tin */}
                                    <div className="flex-grow">
                                        <h3 className="font-bold text-gray-800 text-lg mb-1">{item.name}</h3>
                                        <div className="text-pink-600 font-bold">{item.price?.toLocaleString()}đ</div>
                                    </div>

                                    {/* Bộ điều khiển số lượng (Giữ nguyên) */}
                                    <div className="flex flex-col items-end gap-4">
                                        <div className="flex items-center border border-gray-200 rounded-lg h-9">
                                            <button 
                                                disabled={updating}
                                                onClick={() => handleUpdateQty(index, item.qty - 1)}
                                                className="w-8 h-full flex items-center justify-center text-gray-500 hover:bg-gray-100 rounded-l-lg"
                                            >
                                                <Minus size={14} />
                                            </button>
                                            <span className="w-10 text-center text-sm font-semibold">{item.qty}</span>
                                            <button 
                                                disabled={updating}
                                                onClick={() => handleUpdateQty(index, item.qty + 1)}
                                                className="w-8 h-full flex items-center justify-center text-gray-500 hover:bg-gray-100 rounded-r-lg"
                                            >
                                                <Plus size={14} />
                                            </button>
                                        </div>
                                        <button onClick={() => handleRemoveItem(productId)} className="text-gray-400 hover:text-red-500">
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {/* TỔNG TIỀN (RIGHT) */}
                    <div className="w-full lg:w-1/3">
                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-pink-100 sticky top-24">
                            <h3 className="font-bold text-xl mb-6 text-gray-800">Thông tin đơn hàng</h3>
                            
                            <div className="space-y-3 mb-6 border-b border-gray-100 pb-6">
                                <div className="flex justify-between text-gray-600">
                                    <span>Đã chọn:</span>
                                    <span className="font-medium">{selectedItems.length} món</span>
                                </div>
                                {/* Có thể thêm phí ship động tại đây nếu cần */}
                            </div>

                            <div className="flex justify-between items-center mb-8">
                                <span className="font-bold text-gray-800 text-lg">Tổng thanh toán:</span>
                                {/* --- NEW: Hiển thị giá đã tính toán lại --- */}
                                <span className="font-bold text-2xl text-pink-600">{selectedTotal.toLocaleString()}đ</span>
                            </div>

                            {/* --- NEW: Nút thanh toán gọi hàm mới --- */}
                            <button 
                                onClick={handleCheckout}
                                disabled={selectedItems.length === 0}
                                className={`w-full font-bold py-4 rounded-xl shadow-lg flex items-center justify-center gap-2 transition transform active:scale-[0.98]
                                    ${selectedItems.length > 0 
                                        ? 'bg-pink-600 text-white hover:bg-pink-700 shadow-pink-200' 
                                        : 'bg-gray-300 text-gray-500 cursor-not-allowed shadow-none'
                                    }`}
                            >
                                <CreditCard size={20} />
                                Mua Hàng ({selectedItems.length})
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CartPage;