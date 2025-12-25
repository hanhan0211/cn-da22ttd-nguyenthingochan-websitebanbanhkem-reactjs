import express from "express";
import { verifyToken, isAdmin } from "../middleware/auth.middleware.js"; 
import { 
    addOrderItems, 
    getOrder, 
    listOrders, 
    updateOrderStatus, 
    getDashboardStats,
    cancelOrder,
    confirmOrder,
    deleteOrder
} from "../controllers/order.controller.js";

const router = express.Router();

// 1. Tạo đơn hàng (User)
router.post("/", verifyToken, addOrderItems);

// 2. Lấy danh sách (Admin xem hết, User xem của mình)
router.get("/", verifyToken, listOrders);

// 3. Thống kê Dashboard (Chỉ Admin)
router.get("/stats", verifyToken, isAdmin, getDashboardStats);

// 4. Lấy chi tiết 1 đơn
router.get("/:id", verifyToken, getOrder);

// 5. Admin xác nhận đơn hàng & Gửi mail chi tiết (MỚI)
router.put("/:id/confirm", verifyToken, isAdmin, confirmOrder);

// 6. Cập nhật trạng thái khác (Giao hàng/Hoàn thành) (Admin)
router.put("/:id", verifyToken, isAdmin, updateOrderStatus); 

// 7. Hủy đơn hàng (User)
router.put("/:id/cancel", verifyToken, cancelOrder);
router.delete("/:id", verifyToken, isAdmin, deleteOrder);

export default router;