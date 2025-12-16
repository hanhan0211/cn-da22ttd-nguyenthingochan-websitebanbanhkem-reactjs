import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { 
    Loader, MapPin, CreditCard, ChevronLeft, Package, Calendar, 
    RefreshCw, Star, ExternalLink 
} from 'lucide-react';

const getImageUrl = (path) => {
    if (!path) return 'https://via.placeholder.com/150';
    if (path.startsWith('http')) return path;
    return `http://localhost:5000${path}`;
};

const OrderDetailPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [processingItem, setProcessingItem] = useState(null); 

    const currentUser = JSON.parse(localStorage.getItem("USER_INFO") || "{}");
    const isAdmin = currentUser?.role === 'admin';

    useEffect(() => {
        const fetchOrder = async () => {
            const token = localStorage.getItem("ACCESS_TOKEN");
            try {
                const res = await axios.get(`http://localhost:5000/api/orders/${id}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setOrder(res.data);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchOrder();
    }, [id]);

    // ✅ HÀM MUA LẠI: Thêm sản phẩm vào giỏ hàng và chuyển hướng
    const handleBuyAgain = async (item) => {
        const token = localStorage.getItem("ACCESS_TOKEN");
        if (!token) {
            alert("Bạn cần đăng nhập để mua hàng");
            return navigate("/login");
        }

        const productId = item.product._id || item.product; 

        setProcessingItem(item._id || productId); 

        try {
            await axios.post('http://localhost:5000/api/cart/add', {
                productId: productId,
                qty: 1, 
                attrs: {}
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            
            window.dispatchEvent(new Event("CART_UPDATED"));

            // 👇 [SỬA ĐOẠN NÀY]: Gửi kèm state chứa ID sản phẩm mới mua sang Cart
            navigate("/cart", { state: { newProductId: productId } }); 

        } catch (err) {
            console.error(err);
            alert("Sản phẩm này có thể đã hết hàng hoặc bị xóa.");
        } finally {
            setProcessingItem(null);
        }
    };

    if (loading) return <div className="flex justify-center py-20"><Loader className="animate-spin text-pink-500 w-10 h-10" /></div>;
    if (!order) return <div className="text-center py-20 text-gray-500">Không tìm thấy đơn hàng</div>;

    const statusConfig = {
        pending: { label: 'Đang xử lý', color: 'bg-yellow-100 text-yellow-800' },
        completed: { label: 'Giao thành công', color: 'bg-green-100 text-green-700' },
        cancelled: { label: 'Đã hủy', color: 'bg-red-100 text-red-700' },
    };
    const currentStatus = statusConfig[order.status] || { label: order.status, color: 'bg-gray-100' };
    const isCompleted = order.status === 'completed';

    return (
        <div className="container mx-auto px-4 py-8 bg-gray-50 min-h-screen font-sans">
            <Link 
                to={isAdmin ? "/admin/orders" : "/my-orders"} 
                className="inline-flex items-center gap-2 text-gray-500 hover:text-pink-600 mb-6 font-medium transition-colors"
            >
                <ChevronLeft size={20} /> 
                {isAdmin ? "Quay lại quản lý" : "Quay lại danh sách đơn hàng"}
            </Link>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden max-w-5xl mx-auto">
                <div className="bg-pink-50/50 p-6 border-b border-pink-100 flex flex-wrap justify-between items-center gap-4">
                    <div>
                        <h1 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                            <Package className="text-pink-600" size={24} /> 
                            Đơn hàng #{order._id.slice(-6).toUpperCase()}
                        </h1>
                        <p className="text-sm text-gray-500 mt-1 flex items-center gap-2">
                            <Calendar size={14}/> 
                            Ngày đặt: {new Date(order.createdAt).toLocaleString('vi-VN')}
                        </p>
                    </div>
                    <div className={`px-4 py-2 rounded-lg font-bold text-sm uppercase tracking-wide ${currentStatus.color}`}>
                        {currentStatus.label}
                    </div>
                </div>

                <div className="p-6 grid lg:grid-cols-3 gap-8">
                    {/* CỘT TRÁI */}
                    <div className="lg:col-span-1 space-y-6">
                        <div className="bg-gray-50 p-5 rounded-xl border border-gray-100">
                            <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2 border-b border-gray-200 pb-3">
                                <MapPin size={18} className="text-pink-600"/> Địa chỉ nhận hàng
                            </h3>
                            <div className="text-sm space-y-3">
                                <p><span className="font-bold">{order.shippingAddress.fullName}</span> - {order.shippingAddress.phone}</p>
                                <p className="text-gray-600">{order.shippingAddress.addressLine}, {order.shippingAddress.city}</p>
                            </div>
                        </div>
                         <div className="bg-gray-50 p-5 rounded-xl border border-gray-100">
                            <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2 border-b border-gray-200 pb-3">
                                <CreditCard size={18} className="text-pink-600"/> Thanh toán
                            </h3>
                             <p className="text-sm">
                                {order.paymentMethod === 'cod' ? 'Thanh toán khi nhận hàng (COD)' : 'Chuyển khoản / Thẻ'}
                             </p>
                             <p className="text-xs text-gray-500 mt-1">
                                Trạng thái: {order.status === 'completed' ? <span className="text-green-600 font-bold">Đã thanh toán</span> : <span className="text-yellow-600">Chưa thanh toán</span>}
                             </p>
                        </div>
                    </div>

                    {/* CỘT PHẢI: SẢN PHẨM */}
                    <div className="lg:col-span-2">
                        <h3 className="font-bold text-gray-800 mb-4 text-lg">Sản phẩm ({order.items.length})</h3>
                        <div className="bg-gray-50 rounded-xl border border-gray-100 overflow-hidden">
                            {order.items.map((item, idx) => {
                                const productSlug = item.product?.slug;
                                const productId = item.product?._id || item.product;
                                const productLink = productSlug 
                                    ? `/san-pham/${productSlug}` 
                                    : `/san-pham/${productId}`;

                                return (
                                    <div key={idx} className="flex flex-col sm:flex-row gap-4 p-4 border-b border-gray-200 last:border-0 bg-white items-start sm:items-center">
                                        
                                        <Link to={productLink} className="w-20 h-20 rounded-lg overflow-hidden border border-gray-100 flex-shrink-0 relative group">
                                            <img 
                                                src={getImageUrl(item.image)} 
                                                alt={item.name} 
                                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" 
                                                onError={(e) => {e.target.src = 'https://via.placeholder.com/150'}}
                                            />
                                            <div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 transition flex items-center justify-center"><ExternalLink size={16} className="text-white"/></div>
                                        </Link>

                                        <div className="flex-grow">
                                            <Link to={productLink} className="font-bold text-gray-800 mb-1 text-base hover:text-pink-600 transition-colors line-clamp-2">
                                                {item.name}
                                            </Link>
                                            <div className="text-sm text-gray-500">Số lượng: <span className="font-bold">{item.qty}</span></div>
                                        </div>

                                        <div className="text-right flex flex-col items-end gap-2 min-w-[120px]">
                                            <div className="font-bold text-pink-600 text-lg">{(item.price * item.qty).toLocaleString()}đ</div>
                                            
                                            <div className="flex gap-2 mt-1">
                                                {/* NÚT MUA LẠI */}
                                                <button 
                                                    onClick={() => handleBuyAgain(item)}
                                                    disabled={!!processingItem}
                                                    className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium border border-gray-300 rounded text-gray-700 hover:bg-gray-50 hover:text-pink-600 transition disabled:opacity-50"
                                                >
                                                    {processingItem === (item._id || item.product) ? (
                                                        <Loader size={14} className="animate-spin text-pink-600"/>
                                                    ) : (
                                                        <RefreshCw size={14} />
                                                    )} 
                                                    Mua lại
                                                </button>

                                                {/* NÚT ĐÁNH GIÁ */}
                                                {isCompleted && (
                                                    <Link 
                                                        to={`${productLink}#reviews`}
                                                        className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium bg-pink-50 text-pink-700 border border-pink-200 rounded hover:bg-pink-100 transition"
                                                    >
                                                        <Star size={14} /> Đánh giá
                                                    </Link>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                         {/* Tổng kết tiền */}
                         <div className="mt-6 bg-white p-6 rounded-xl border border-pink-100 space-y-3">
                            <div className="flex justify-between text-gray-600 text-sm">
                                <span>Tạm tính:</span>
                                <span>{order.itemsPrice?.toLocaleString()}đ</span>
                            </div>
                            <div className="flex justify-between text-gray-600 text-sm">
                                <span>Phí vận chuyển:</span>
                                <span>{order.shippingPrice === 0 ? 'Miễn phí' : order.shippingPrice?.toLocaleString() + 'đ'}</span>
                            </div>
                            <div className="border-t border-dashed border-gray-300 my-2 pt-3 flex justify-between items-end">
                                <span className="font-bold text-gray-800 text-lg">Tổng cộng:</span>
                                <span className="text-2xl font-bold text-pink-600">{order.totalPrice?.toLocaleString()}đ</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default OrderDetailPage;