import express from "express";
// 👇 Nhớ import hàm replyContact ở đây
import { createContact, listContacts, deleteContact, replyContact } from "../controllers/contact.controller.js";
import { protect, admin } from "../middleware/auth.middleware.js";

const router = express.Router();

router.post("/", createContact);
router.get("/", protect, admin, listContacts);
router.delete("/:id", protect, admin, deleteContact);

// 👇👇👇 BẠN ĐANG THIẾU DÒNG NÀY 👇👇👇
router.put("/:id/reply", protect, admin, replyContact); 

export default router;