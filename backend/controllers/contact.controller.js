import Contact from "../models/Contact.js";

// 1. Tạo liên hệ (Khách gửi)
export const createContact = async (req, res, next) => {
  try {
    const { name, email, phone, message } = req.body;
    const c = await Contact.create({ name, email, phone, message });
    res.status(201).json(c);
  } catch(err){ next(err); }
};

// 2. Xem danh sách (Admin)
export const listContacts = async (req, res, next) => {
  try {
    const items = await Contact.find()
      .populate("repliedBy", "name") // Lấy tên người trả lời
      .sort("-createdAt");
    res.json(items);
  } catch(err){ next(err); }
};

// 3. Xóa liên hệ (Admin)
export const deleteContact = async (req, res, next) => {
  try {
    await Contact.findByIdAndDelete(req.params.id);
    res.json({ message: "Đã xóa liên hệ" });
  } catch(err){ next(err); }
};

// 4. 👇 HÀM BẠN ĐANG THIẾU: Trả lời liên hệ (Admin) 👇
export const replyContact = async (req, res, next) => {
  try {
    const { replyMessage } = req.body;
    const contactId = req.params.id;

    const contact = await Contact.findById(contactId);
    if (!contact) {
      return res.status(404).json({ message: "Không tìm thấy tin nhắn" });
    }

    // Cập nhật thông tin trả lời
    contact.replyMessage = replyMessage;
    contact.repliedBy = req.user.id; // Lấy ID admin từ token
    contact.status = "read"; // Đổi trạng thái thành "Đã đọc/Đã xử lý"
    
    await contact.save();

    res.json(contact);
  } catch(err){ next(err); }
};