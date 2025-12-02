import express from "express";

// 👇 ĐÃ SỬA: Thêm dấu chấm vào tên file cho đúng với project của bạn
import { 
  createOrderFromCart, 
  getOrder, 
  listOrders, 
  updateOrderStatus 
} from "../controllers/order.controller.js"; 

// 👇 ĐÃ SỬA: Thêm dấu chấm vào tên file middleware
import { protect, admin } from "../middleware/auth.middleware.js"; 

const router = express.Router();

// Tất cả các routes bên dưới đều cần đăng nhập
router.use(protect);

// 1. Route gốc: /api/orders
router.route("/")
  .post(createOrderFromCart) // Tạo đơn
  .get(listOrders);          // Xem danh sách

// 2. Route có ID: /api/orders/:id
router.route("/:id")
  .get(getOrder)                   // Xem chi tiết
  .put(admin, updateOrderStatus);  // Admin cập nhật trạng thái

export default router;