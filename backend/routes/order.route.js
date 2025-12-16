import express from "express";
const router = express.Router();
import { protect, admin } from "../middleware/auth.middleware.js";

// 👇 SỬA DÒNG NÀY: Đổi createOrderFromCart thành addOrderItems
import { 
    addOrderItems, // <--- Tên mới
    getOrder, 
    listOrders, 
    updateOrderStatus,
    getDashboardStats 
} from "../controllers/order.controller.js"; 

// 👇 SỬA ROUTE TẠO ĐƠN:
router.route("/")
    .post(protect, addOrderItems) // <--- Thay tên cũ bằng addOrderItems
    .get(protect, listOrders);

router.route("/dashboard").get(protect, admin, getDashboardStats);

router.route("/:id")
    .get(protect, getOrder)
    .put(protect, admin, updateOrderStatus); // Nếu route update của bạn dùng put

export default router;