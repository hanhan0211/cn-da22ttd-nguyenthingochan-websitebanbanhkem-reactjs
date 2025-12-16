import Product from "../models/Product.js";
import Category from "../models/Category.js";
import slugify from "slugify";

// --- HELPER: Xử lý logic Flash Sale trước khi trả về Frontend ---
const processProductData = (product) => {
  if (!product) return null;
  
  // Chuyển Mongoose Document sang Object thường để chỉnh sửa
  const p = product.toObject ? product.toObject() : product;
  
  const now = Date.now();
  const start = p.flashSaleStartDate ? new Date(p.flashSaleStartDate).getTime() : 0;
  const end = p.flashSaleEndTime ? new Date(p.flashSaleEndTime).getTime() : 0;

  // Kiểm tra: Nếu ĐANG bật FlashSale NHƯNG thời gian không thỏa mãn
  if (p.isFlashSale && (now < start || now > end)) {
      // => Tắt Flash Sale ảo (chỉ trong response trả về, ko sửa DB)
      p.isFlashSale = false; 
      // Giá hiển thị sẽ quay về ưu tiên Sale thường hoặc Giá gốc
  }
  
  return p;
};

// --- Create Product ---
export const createProduct = async (req, res, next) => {
  try {
    const payload = req.body;
    if (payload.category) {
      const cat = await Category.findById(payload.category);
      if (!cat) return res.status(400).json({ message: "Category không tồn tại" });
    }
    if (payload.name) payload.slug = slugify(payload.name, { lower: true });
    
    if (req.files && req.files.length > 0) {
      payload.images = req.files.map(file => ({
        url: `/uploads/${file.filename}`,
        alt: file.originalname,
      }));
    }
    
    const product = await Product.create(payload);
    res.status(201).json(product);
  } catch (err) { next(err); }
};

// --- Update Product ---
export const updateProduct = async (req, res, next) => {
  try {
    const payload = req.body;
    
    if (payload.category) {
      const cat = await Category.findById(payload.category);
      if (!cat) return res.status(400).json({ message: "Category không tồn tại" });
    }
    if (payload.name) payload.slug = slugify(payload.name, { lower: true });
    
    if (req.files && req.files.length > 0) {
      const product = await Product.findById(req.params.id);
      if (!product) return res.status(404).json({ message: "Không tìm thấy product" });
      
      const newImages = req.files.map(file => ({
        url: `/uploads/${file.filename}`,
        alt: file.originalname,
      }));
      payload.images = [ ...(product.images || []), ...newImages ];
    }

    const updatedProduct = await Product.findByIdAndUpdate(req.params.id, payload, { new: true }).populate("category");
    if (!updatedProduct) return res.status(404).json({ message: "Không tìm thấy product" });
    
    res.json(updatedProduct);
  } catch (err) { next(err); }
};

// --- Delete Product ---
export const deleteProduct = async (req, res, next) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) return res.status(404).json({ message: "Không tìm thấy product" });
    res.json({ message: "Đã xóa" });
  } catch (err) { next(err); }
};

// --- Get Product by ID (Chi tiết sản phẩm) ---
export const getProduct = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id).populate("category");
    if (!product) return res.status(404).json({ message: "Không tìm thấy" });
    
    // ✅ Xử lý thời gian trước khi trả về
    res.json(processProductData(product));
  } catch (err) { next(err); }
};

// --- Get Product by Slug (Chi tiết sản phẩm theo slug) ---
export const getProductBySlug = async (req, res) => {
  try {
    const product = await Product.findOne({ slug: req.params.slug }).populate("category");
    if (!product) return res.status(404).json({ message: "Không tìm thấy sản phẩm" });
    
    // ✅ Xử lý thời gian trước khi trả về
    res.json(processProductData(product));
  } catch (err) { res.status(500).json({ message: "Lỗi server" }); }
};

// --- List Products (Trang danh sách / Shop / Search) ---
export const listProducts = async (req, res, next) => {
  try {
    const { page = 1, limit = 12, q, category, minPrice, maxPrice, sort, featured, flavor, flashSale } = req.query;

    const filter = {};
    if (q) filter.name = { $regex: q, $options: "i" };
    if (category) filter.category = category;
    if (minPrice) filter.price = { ...filter.price, $gte: Number(minPrice) };
    if (maxPrice) filter.price = { ...filter.price, $lte: Number(maxPrice) };
    if (flavor) filter.flavor = flavor;
    if (featured === 'true') filter.avgRating = { $gte: 4 }; 
    
    // Nếu client lọc flashSale=true, ta vẫn tìm trong DB trước
    if (flashSale === 'true') filter.isFlashSale = true;

    let sortCondition = { createdAt: -1 }; 
    if (sort === 'oldest') sortCondition = { createdAt: 1 };
    if (featured === 'true' && !sort) sortCondition = { avgRating: -1 };

    const skip = (page - 1) * limit;
    const total = await Product.countDocuments(filter);
    
    const items = await Product.find(filter)
      .populate("category")
      .sort(sortCondition)
      .skip(skip)
      .limit(Number(limit));

    // ✅ Map qua từng sản phẩm để kiểm tra hạn sử dụng Flash Sale
    // Nếu hết hạn -> Tự động chuyển isFlashSale = false
    const processedItems = items.map(item => processProductData(item));

    // (Tùy chọn) Nếu đang lọc flashSale=true, ta cần lọc lại lần nữa những cái vừa bị tắt active
    let finalItems = processedItems;
    if (flashSale === 'true') {
        finalItems = processedItems.filter(p => p.isFlashSale === true);
    }

    res.json({ 
        items: finalItems, 
        total, 
        page: Number(page), 
        pages: Math.ceil(total / limit) 
    });
  } catch (err) { next(err); }
};