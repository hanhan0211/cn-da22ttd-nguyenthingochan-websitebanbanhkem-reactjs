import Cart from "../models/Cart.js";
import Product from "../models/Product.js";

// --- HELPER: Xử lý logic Flash Sale (Giống bên ProductController) ---
const processCartProduct = (product) => {
  if (!product) return null;
  
  // Chuyển Mongoose Document sang Object để chỉnh sửa
  const p = product.toObject ? product.toObject() : product;
  
  const now = Date.now();
  const start = p.flashSaleStartDate ? new Date(p.flashSaleStartDate).getTime() : 0;
  const end = p.flashSaleEndTime ? new Date(p.flashSaleEndTime).getTime() : 0;

  // Nếu đang bật FlashSale NHƯNG hết giờ (hoặc chưa đến giờ)
  if (p.isFlashSale && (now < start || now > end)) {
      p.isFlashSale = false; // Tắt sale ảo
      // Lúc này Frontend sẽ tự động lấy giá gốc hoặc giá sale thường
  }
  return p;
};

// --- 1. LẤY GIỎ HÀNG ---
export const getCart = async (req, res, next) => {
  try {
    const userId = req.user._id;
    let cart = await Cart.findOne({ user: userId }).populate("items.product");

    if (!cart) {
      return res.json({ items: [] });
    }

    // ✅ QUAN TRỌNG: Duyệt qua từng món trong giỏ để kiểm tra Flash Sale
    // Vì Mongoose populate trả về document, ta cần convert sang JSON để chỉnh sửa
    const cartObj = cart.toObject();

    cartObj.items = cartObj.items.map(item => {
        if (item.product) {
            item.product = processCartProduct(item.product);
        }
        return item;
    });

    res.json(cartObj);
  } catch (err) {
    next(err);
  }
};

// --- 2. THÊM VÀO GIỎ HÀNG (Logic cũ giữ nguyên) ---
export const addToCart = async (req, res, next) => {
  try {
    const { productId, qty, attrs } = req.body;
    const userId = req.user._id;

    let cart = await Cart.findOne({ user: userId });
    if (!cart) {
      cart = new Cart({ user: userId, items: [] });
    }

    // Kiểm tra sản phẩm có tồn tại không (để tránh lỗi rác)
    const product = await Product.findById(productId);
    if (!product) return res.status(404).json({ message: "Sản phẩm không tồn tại" });

    const itemIndex = cart.items.findIndex(p => p.product.toString() === productId);

    if (itemIndex > -1) {
      // Nếu đã có -> Cộng dồn số lượng
      cart.items[itemIndex].qty += qty;
    } else {
      // Nếu chưa có -> Thêm mới
      cart.items.push({ product: productId, qty, attrs });
    }

    await cart.save();
    
    // Populate để trả về data đầy đủ luôn (tiện cho Frontend cập nhật ngay)
    const populatedCart = await Cart.findById(cart._id).populate("items.product");
    
    // Cũng phải xử lý Flash Sale cho kết quả trả về này
    const cartObj = populatedCart.toObject();
    cartObj.items = cartObj.items.map(item => {
         if (item.product) item.product = processCartProduct(item.product);
         return item;
    });

    res.json(cartObj);
  } catch (err) {
    next(err);
  }
};

// --- 3. CẬP NHẬT SỐ LƯỢNG (Logic cũ + Fix Flash Sale return) ---
export const updateCartItem = async (req, res, next) => {
  try {
    const { itemIndex, qty } = req.body;
    const userId = req.user._id;

    const cart = await Cart.findOne({ user: userId });
    if (!cart) return res.status(404).json({ message: "Giỏ hàng trống" });

    if (cart.items[itemIndex]) {
      cart.items[itemIndex].qty = qty;
    }

    await cart.save();
    
    const populatedCart = await Cart.findById(cart._id).populate("items.product");
    
    // Fix Flash Sale output
    const cartObj = populatedCart.toObject();
    cartObj.items = cartObj.items.map(item => {
         if (item.product) item.product = processCartProduct(item.product);
         return item;
    });

    res.json(cartObj);
  } catch (err) {
    next(err);
  }
};

// --- 4. XÓA SẢN PHẨM KHỎI GIỎ (Logic cũ + Fix Flash Sale return) ---
export const removeCartItem = async (req, res, next) => {
  try {
    const { id } = req.params; // ID của product
    const userId = req.user._id;

    const cart = await Cart.findOne({ user: userId });
    if (!cart) return res.status(404).json({ message: "Giỏ hàng trống" });

    cart.items = cart.items.filter(item => item.product.toString() !== id);

    await cart.save();
    
    const populatedCart = await Cart.findById(cart._id).populate("items.product");

    // Fix Flash Sale output
    const cartObj = populatedCart.toObject();
    cartObj.items = cartObj.items.map(item => {
         if (item.product) item.product = processCartProduct(item.product);
         return item;
    });

    res.json(cartObj);
  } catch (err) {
    next(err);
  }
};