import mongoose from "mongoose";

const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  slug: { type: String, unique: true, lowercase: true },
  description: { type: String },
  price: { type: Number, required: true },
  salePrice: { type: Number, default: 0 },
  stock: { type: Number, default: 0 },
  flavor: { 
      type: String, 
      enum: ['Vani', 'Socola', 'Dâu', 'Matcha', 'Phô mai', 'Trái cây', 'Cà phê', 'Khác'], 
      default: 'Khác' 
  },
  category: { type: mongoose.Schema.Types.ObjectId, ref: "Category" },
  images: [{ url: String, alt: String }],
  avgRating: { type: Number, default: 0 }, 
  reviewCount: { type: Number, default: 0 },

  // --- FLASH SALE FIELDS (Cấu trúc chuẩn) ---
  isFlashSale: { type: Boolean, default: false },
  flashSalePrice: { type: Number, default: 0 },
  totalFlashSale: { type: Number, default: 0 },   // Tổng suất bán
  soldCount: { type: Number, default: 0 },        // Đã bán trong đợt sale
  flashSaleStartDate: { type: Date },             // Ngày bắt đầu
  flashSaleEndTime: { type: Date },               // Ngày kết thúc

}, { timestamps: true });

export default mongoose.model("Product", productSchema);