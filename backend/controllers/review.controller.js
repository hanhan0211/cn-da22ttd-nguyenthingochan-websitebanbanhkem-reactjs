import Review from "../models/Review.js";
import Product from "../models/Product.js";

export const addReview = async (req, res, next) => {
  try {
    const userId = req.user.id;
    // ⚠️ SỬA: Đổi 'body' thành 'content' cho khớp Model
    const { productId, rating, title, content } = req.body; 

    const p = await Product.findById(productId);
    if(!p) return res.status(404).json({ message: "Product không tồn tại" });

    const existing = await Review.findOne({ user: userId, product: productId });
    if(existing) {
      // ⚠️ SỬA: update content
      existing.rating = rating; 
      existing.title = title; 
      existing.content = content; 
      await existing.save();
    } else {
      // ⚠️ SỬA: create content
      await Review.create({ user: userId, product: productId, rating, title, content });
    }

    // Tính toán lại rating trung bình cho Product
    const stats = await Review.aggregate([
      { $match: { product: p._id, approved: true } },
      { $group: { _id: "$product", avg: { $avg: "$rating" }, count: { $sum: 1 } } }
    ]);
    
    if(stats.length > 0) {
      p.avgRating = stats[0].avg; // Đảm bảo Model Product có trường này hoặc MongoDB sẽ tự thêm
      p.reviewCount = stats[0].count;
    } else {
      p.avgRating = 0; p.reviewCount = 0;
    }
    await p.save();

    res.json({ message: "Đã đánh giá thành công" });
  } catch(err){ next(err); }
};

// Hàm listReviews giữ nguyên
export const listReviews = async (req, res, next) => {
  try {
    const { productId } = req.query;
    const filter = {};
    if(productId) filter.product = productId;
    const reviews = await Review.find(filter).populate("user", "name email").sort("-createdAt");
    res.json(reviews);
  } catch(err){ next(err); }
};