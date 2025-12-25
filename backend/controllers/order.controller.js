import Order from "../models/Order.js";
import Cart from "../models/Cart.js";
import Product from "../models/Product.js";
import User from "../models/User.js";
import { sendOrderConfirmationEmail, sendOrderStatusEmail } from '../utils/email.service.js';

// --- 1. TẠO ĐƠN HÀNG (KHÔNG GỬI MAIL) ---
export const addOrderItems = async (req, res, next) => {
  try {
    const { orderItems, shippingAddress, paymentMethod, taxPrice } = req.body;

    if (!orderItems || orderItems.length === 0) {
      return res.status(400).json({ message: "Không có sản phẩm nào trong đơn hàng" });
    }

    const finalOrderItems = [];
    let calculatedItemsPrice = 0;
    const now = Date.now(); 
    const SHIPPING_FEE = 25000; 

    for (const item of orderItems) {
      const product = await Product.findById(item.product || item._id);
      if (!product) return res.status(404).json({ message: "Sản phẩm không tồn tại" });
      if (product.stock < item.qty) return res.status(400).json({ message: `Sản phẩm ${product.name} hết hàng` });

      // Tính giá (Flash sale / Sale)
      let realPrice = product.price; 
      const isFlashSaleOn = product.isFlashSale === true;
      const tStart = product.flashSaleStartDate ? new Date(product.flashSaleStartDate).getTime() : 0;
      const tEnd = product.flashSaleEndTime ? new Date(product.flashSaleEndTime).getTime() : 0;
      const isTimeValid = (now >= tStart) && (now <= tEnd);

      if (isFlashSaleOn && isTimeValid && product.flashSalePrice > 0) {
        realPrice = product.flashSalePrice;
        product.soldCount = (product.soldCount || 0) + item.qty;
      } else if (product.salePrice > 0 && product.salePrice < product.price) {
        realPrice = product.salePrice;
      }

      finalOrderItems.push({
        product: product._id,
        name: product.name,
        qty: item.qty,
        image: item.image || (product.images?.[0]?.url || ""),
        price: realPrice,
        attrs: item.attrs || {}
      });

      calculatedItemsPrice += realPrice * item.qty;
      product.stock -= item.qty;
      await product.save();
    }

    const order = new Order({
      user: req.user._id,
      items: finalOrderItems, // Lưu ý: Schema của bạn dùng 'items' hay 'orderItems' thì sửa cho khớp nhé (ở đây mình theo code bạn gửi là 'items')
      shippingAddress,
      paymentMethod,
      itemsPrice: calculatedItemsPrice,
      shippingPrice: SHIPPING_FEE, 
      taxPrice: taxPrice || 0,
      totalPrice: calculatedItemsPrice + SHIPPING_FEE + (taxPrice || 0),
      status: "pending",
    });

    const createdOrder = await order.save();
    
    // Xóa item đã mua khỏi giỏ hàng
    const cart = await Cart.findOne({ user: req.user._id });
    if (cart) {
        const purchasedIds = finalOrderItems.map(item => item.product.toString());
        const remainingItems = cart.items.filter(item => !purchasedIds.includes(item.product.toString()));
        cart.items = remainingItems;
        await cart.save();
    }

    // LƯU Ý: Đã XÓA đoạn gửi mail ở đây theo yêu cầu
    
    res.status(201).json(createdOrder);
  } catch (err) { next(err); }
};

// --- 2. ADMIN XÁC NHẬN ĐƠN (GỬI MAIL CHI TIẾT) ---
export const confirmOrder = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id).populate("user", "name email").populate("items.product");

    if (!order) {
        return res.status(404).json({ message: "Không tìm thấy đơn hàng" });
    }

    // Cập nhật trạng thái sang "Đã xác nhận" (hoặc "processing")
    order.status = "confirmed"; 
    const updatedOrder = await order.save();

    // 🔥 GỬI MAIL CHI TIẾT (CÓ ẢNH) 🔥
    // Hack nhẹ: Mapping lại dữ liệu cho khớp với template email nếu tên trường trong DB khác template
    const orderForEmail = {
        ...updatedOrder._doc,
        orderItems: updatedOrder.items, // Template dùng orderItems, DB dùng items
        user: updatedOrder.user
    };

    sendOrderConfirmationEmail(orderForEmail).catch(err => console.error("Lỗi gửi mail xác nhận:", err));

    res.json({ message: "Đã xác nhận đơn và gửi mail", order: updatedOrder });
  } catch (err) { next(err); }
};

// --- 3. LẤY CHI TIẾT 1 ĐƠN HÀNG ---
export const getOrder = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id).populate("user", "name email").populate("items.product");
    if (!order) return res.status(404).json({ message: "Không tìm thấy order" });
    
    if (req.user.role !== "admin" && !order.user._id.equals(req.user._id)) {
        return res.status(403).json({ message: "Không có quyền" });
    }
    
    res.json(order);
  } catch (err) { next(err); }
};

// --- 4. LẤY DANH SÁCH ĐƠN HÀNG ---
export const listOrders = async (req, res, next) => {
  try {
    const filter = {};
    if (req.user.role !== "admin") filter.user = req.user._id;
    
    const orders = await Order.find(filter).sort("-createdAt").limit(100);
    res.json(orders);
  } catch (err) { next(err); }
};

// --- 5. CẬP NHẬT TRẠNG THÁI (GIAO HÀNG / HOÀN THÀNH) ---
export const updateOrderStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    
    const order = await Order.findById(req.params.id).populate("user", "email name");

    if (!order) {
        return res.status(404).json({ message: "Không tìm thấy đơn hàng" });
    }

    order.status = status;

    if (status === "completed") {
      order.deliveredAt = Date.now();
      if (order.paymentMethod === 'cod') {
          order.paymentResult = { 
              status: 'completed', 
              update_time: Date.now(), 
              email_address: order.user?.email || "guest@example.com" 
          };
      }
    }

    const updatedOrder = await order.save();

    // 🔥 GỬI MAIL TRẠNG THÁI (Mail ngắn gọn) 🔥
    if (["delivered", "completed", "cancelled"].includes(status)) {
        sendOrderStatusEmail(updatedOrder).catch(err => console.error("Lỗi gửi mail trạng thái:", err));
    }

    res.json(updatedOrder);
  } catch (err) { 
      console.error("Lỗi update status:", err);
      next(err); 
  }
};

// --- 6. HỦY ĐƠN HÀNG (USER) ---
export const cancelOrder = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id).populate("user", "email name");

    if (!order) {
      return res.status(404).json({ message: "Không tìm thấy đơn hàng" });
    }

    if (req.user.role !== "admin" && !order.user._id.equals(req.user._id)) {
      return res.status(403).json({ message: "Bạn không có quyền hủy đơn hàng này" });
    }

    if (order.status !== "pending") {
      return res.status(400).json({ message: "Không thể hủy đơn hàng đã xử lý" });
    }

    order.status = "cancelled";
    order.cancelledAt = Date.now();
    
    const updatedOrder = await order.save();

    // Gửi mail báo hủy
    sendOrderStatusEmail(updatedOrder).catch(err => console.error("Lỗi gửi mail hủy:", err));

    res.json({ message: "Đã hủy đơn hàng thành công", order: updatedOrder });

  } catch (err) { next(err); }
};

// --- 7. THỐNG KÊ DASHBOARD ---
export const getDashboardStats = async (req, res, next) => {
  try {
    const totalUsers = await User.countDocuments({ role: "user" });
    const totalProducts = await Product.countDocuments();
    const totalOrders = await Order.countDocuments();
    
    const revenueAgg = await Order.aggregate([{ $match: { status: "completed" } }, { $group: { _id: null, total: { $sum: "$totalPrice" } } }]);
    const totalRevenue = revenueAgg.length > 0 ? revenueAgg[0].total : 0;
    
    const sevenDaysAgo = new Date(); sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const dailyRevenue = await Order.aggregate([
      { $match: { status: "completed", updatedAt: { $gte: sevenDaysAgo } } },
      { $group: { _id: { $dateToString: { format: "%Y-%m-%d", date: "$updatedAt" } }, revenue: { $sum: "$totalPrice" } } },
      { $sort: { _id: 1 } },
    ]);

    const recentOrders = await Order.find().select("user totalPrice status createdAt").populate("user", "name email").sort({ createdAt: -1 }).limit(5);
    
    const topProducts = await Order.aggregate([
      { $match: { status: "completed" } }, { $unwind: "$items" },
      { $group: { _id: "$items.product", totalSold: { $sum: "$items.qty" } } },
      { $sort: { totalSold: -1 } }, { $limit: 4 },
      { $lookup: { from: "products", localField: "_id", foreignField: "_id", as: "productInfo" } },
      { $unwind: "$productInfo" },
      { $project: { _id: 1, totalSold: 1, name: "$productInfo.name", price: "$productInfo.price", image: { $arrayElemAt: ["$productInfo.images.url", 0] } } },
    ]);

    res.json({ counts: { users: totalUsers, products: totalProducts, orders: totalOrders, revenue: totalRevenue }, chartData: dailyRevenue, recentOrders, topProducts });
  } catch (err) { next(err); }
};
// --- 8. XÓA ĐƠN HÀNG (ADMIN) ---
export const deleteOrder = async (req, res, next) => {
  try {
    const order = await Order.findByIdAndDelete(req.params.id);

    if (!order) {
      return res.status(404).json({ message: "Không tìm thấy đơn hàng để xóa" });
    }

    res.json({ message: "Đã xóa đơn hàng thành công" });
  } catch (err) {
    next(err);
  }
};