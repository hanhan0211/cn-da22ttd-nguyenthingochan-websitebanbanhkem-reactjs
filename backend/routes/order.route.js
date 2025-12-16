import express from "express";
import { verifyToken, isAdmin } from "../middleware/auth.middleware.js"; 
import { 
    addOrderItems, 
    getOrder, 
    listOrders, 
    updateOrderStatus, 
    getDashboardStats,
    cancelOrder 
} from "../controllers/order.controller.js";

const router = express.Router();

// Tạo đơn hàng
router.post("/", verifyToken, addOrderItems);

// Lấy danh sách (Admin xem hết, User xem của mình)
router.get("/", verifyToken, listOrders);

// Thống kê Dashboard (Chỉ Admin)
router.get("/stats", verifyToken, isAdmin, getDashboardStats);

// Lấy chi tiết 1 đơn
router.get("/:id", verifyToken, getOrder);

// ✅ Cập nhật trạng thái đơn hàng (Admin) - Fix lỗi 404
router.put("/:id", verifyToken, isAdmin, updateOrderStatus); 

// Hủy đơn hàng (User)
router.put("/:id/cancel", verifyToken, cancelOrder);

// (Optional) Các route cũ nếu bạn còn dùng nút riêng lẻ ở đâu đó, nếu không thì bỏ cũng được
router.put("/:id/pay", verifyToken, updateOrderStatus); 
router.put("/:id/deliver", verifyToken, isAdmin, updateOrderStatus);

export default router;