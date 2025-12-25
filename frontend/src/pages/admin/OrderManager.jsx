import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { 
  Package, CheckCircle, XCircle, Clock, Eye, 
  Search, Calendar, Truck, Trash2 
} from 'lucide-react';
import { Link } from 'react-router-dom';

const OrderManager = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filterStatus, setFilterStatus] = useState('all');

    useEffect(() => {
        fetchOrders();
    }, []);

    const fetchOrders = async () => {
        try {
            const token = localStorage.getItem("ACCESS_TOKEN");
            const res = await axios.get('http://localhost:5000/api/orders', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setOrders(res.data);
        } catch (error) {
            console.error("Lỗi lấy danh sách đơn hàng:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleStatusChange = async (orderId, newStatus) => {
        try {
            const token = localStorage.getItem("ACCESS_TOKEN");
            await axios.put(`http://localhost:5000/api/orders/${orderId}`, 
                { status: newStatus },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            
            setOrders(orders.map(order => 
                order._id === orderId ? { ...order, status: newStatus } : order
            ));
            alert(`Đã cập nhật trạng thái đơn hàng thành: ${newStatus}`);
        } catch (error) {
            console.error(error);
            alert("Lỗi cập nhật trạng thái!");
        }
    };

    // --- HÀM XÓA ĐƠN HÀNG ---
    const handleDeleteOrder = async (orderId) => {
        if (window.confirm("CẢNH BÁO: Bạn có chắc chắn muốn xóa vĩnh viễn đơn hàng này? Hành động này không thể hoàn tác.")) {
            try {
                const token = localStorage.getItem("ACCESS_TOKEN");
                await axios.delete(`http://localhost:5000/api/orders/${orderId}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });

                // Cập nhật lại danh sách sau khi xóa
                setOrders(orders.filter(order => order._id !== orderId));
                alert("Đã xóa đơn hàng thành công!");
            } catch (error) {
                console.error("Lỗi xóa đơn hàng:", error);
                alert("Lỗi khi xóa đơn hàng. Vui lòng thử lại!");
            }
        }
    };

    const getStatusBadge = (status) => {
        switch (status) {
            case 'pending':
                return <span className="flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-yellow-100 text-yellow-700 border border-yellow-200"><Clock size={12}/> Chờ xử lý</span>;
            case 'delivered':
                return <span className="flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-700 border border-blue-200"><Truck size={12}/> Đang giao hàng</span>;
            case 'completed':
                return <span className="flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-green-100 text-green-700 border border-green-200"><CheckCircle size={12}/> Hoàn thành</span>;
            case 'cancelled':
                return <span className="flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-red-100 text-red-700 border border-red-200"><XCircle size={12}/> Đã hủy</span>;
            default:
                return <span className="px-3 py-1 rounded-full text-xs bg-gray-100 text-gray-600">{status}</span>;
        }
    };

    const filteredOrders = filterStatus === 'all' 
        ? orders 
        : orders.filter(o => o.status === filterStatus);

    if (loading) return <div className="p-8 text-center text-gray-500">Đang tải danh sách đơn hàng...</div>;

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                        <Package className="text-pink-600" /> Quản lý Đơn hàng
                    </h2>
                    <p className="text-sm text-gray-500 mt-1">Tổng cộng: {orders.length} đơn hàng</p>
                </div>
                
                <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-600">Lọc theo:</span>
                    <select 
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value)}
                        className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-pink-500"
                    >
                        <option value="all">Tất cả trạng thái</option>
                        <option value="pending">Chờ xử lý</option>
                        <option value="delivered">Đang giao hàng</option>
                        <option value="completed">Hoàn thành</option>
                        <option value="cancelled">Đã hủy</option>
                    </select>
                </div>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-gray-50 text-gray-600 text-sm border-b border-gray-200">
                            <th className="p-4 font-semibold">Mã đơn</th>
                            <th className="p-4 font-semibold">Khách hàng</th>
                            <th className="p-4 font-semibold">Ngày đặt</th>
                            <th className="p-4 font-semibold">Tổng tiền</th>
                            <th className="p-4 font-semibold">Trạng thái</th>
                            <th className="p-4 font-semibold text-center">Hành động</th>
                        </tr>
                    </thead>
                    <tbody className="text-sm text-gray-700 divide-y divide-gray-100">
                        {filteredOrders.map((order) => (
                            <tr key={order._id} className="hover:bg-pink-50/30 transition-colors">
                                <td className="p-4 font-mono font-medium text-pink-600">
                                    #{order._id.slice(-6).toUpperCase()}
                                </td>
                                <td className="p-4">
                                    <div className="font-bold text-gray-800">{order.shippingAddress?.fullName || 'N/A'}</div>
                                    <div className="text-xs text-gray-500">{order.shippingAddress?.phone}</div>
                                </td>
                                <td className="p-4">
                                    <div className="flex items-center gap-1">
                                        <Calendar size={14} className="text-gray-400"/>
                                        {new Date(order.createdAt).toLocaleDateString('vi-VN')}
                                    </div>
                                    <div className="text-xs text-gray-400 mt-1">
                                        {new Date(order.createdAt).toLocaleTimeString('vi-VN')}
                                    </div>
                                </td>
                                <td className="p-4 font-bold text-gray-800">
                                    {order.totalPrice?.toLocaleString()}đ
                                </td>
                                <td className="p-4">
                                    <div className="flex flex-col gap-2">
                                        {getStatusBadge(order.status)}
                                        <select 
                                            value={order.status}
                                            onChange={(e) => handleStatusChange(order._id, e.target.value)}
                                            className="text-xs border border-gray-200 rounded px-1 py-1 mt-1 cursor-pointer hover:border-pink-400 focus:outline-none"
                                        >
                                            <option value="pending">Chờ xử lý</option>
                                            <option value="delivered">Đang giao hàng</option>
                                            <option value="completed">Đã giao xong</option>
                                            <option value="cancelled">Hủy đơn</option>
                                        </select>
                                    </div>
                                </td>
                                <td className="p-4 text-center">
                                    <div className="flex items-center justify-center gap-2">
                                        <Link 
                                            to={`/order/${order._id}`} 
                                            className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-blue-50 text-blue-600 hover:bg-blue-100 transition"
                                            title="Xem chi tiết"
                                        >
                                            <Eye size={16} />
                                        </Link>

                                        {/* Nút Xóa */}
                                        <button 
                                            onClick={() => handleDeleteOrder(order._id)}
                                            className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-red-50 text-red-600 hover:bg-red-100 transition"
                                            title="Xóa đơn hàng"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {filteredOrders.length === 0 && (
                    <div className="text-center py-10 text-gray-400">Không tìm thấy đơn hàng nào.</div>
                )}
            </div>
        </div>
    );
};
export default OrderManager;