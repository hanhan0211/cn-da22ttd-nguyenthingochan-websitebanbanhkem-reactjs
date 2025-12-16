import mongoose from "mongoose";

const orderItemSchema = new mongoose.Schema({
  product: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
  name: String,
  price: Number,
  qty: { type: Number, default: 1 },
  attrs: { type: Object },
  image: String,
}, { _id: false });

const orderSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  items: [orderItemSchema],
  shippingAddress: {
    fullName: String,
    phone: String,
    addressLine: String,
    city: String
  },
  paymentMethod: { type: String, enum: ["cod","card"], default: "cod" },
  paymentResult: { id: String, status: String, update_time: String, email_address: String },
  itemsPrice: Number,
  shippingPrice: Number,
  taxPrice: Number,
  totalPrice: Number,
  
  // 🔥 SỬA DÒNG NÀY: Thêm "delivered" vào enum
  status: { 
      type: String, 
      enum: ["pending", "delivered", "completed", "cancelled"], 
      default: "pending" 
  },
  
  deliveredAt: Date,
  cancelledAt: Date
}, { 
    timestamps: true,
    collection: 'orders' 
});

export default mongoose.model("Order", orderSchema);