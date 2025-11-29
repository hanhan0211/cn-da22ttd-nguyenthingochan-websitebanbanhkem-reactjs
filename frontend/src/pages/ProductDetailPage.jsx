import React, { useState, useEffect } from 'react';
import { 
  Star, Minus, Plus, ShoppingCart, Heart, Truck, ShieldCheck, 
  Check, ChevronRight, Share2, Search, Loader
} from 'lucide-react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

// --- HELPER: Xử lý link ảnh ---
const getImageUrl = (path) => {
    if (!path) return 'https://via.placeholder.com/500x500?text=No+Image';
    if (path.startsWith('http')) return path;
    return `http://localhost:5000${path}`;
};

// --- FOOTER COMPONENT ---
const Footer = () => (
  <footer className="bg-gray-900 text-white pt-12 pb-6 mt-auto">
      <div className="container mx-auto px-4 grid md:grid-cols-4 gap-8 mb-8">
          <div>
              <h3 className="text-2xl font-bold text-pink-500 mb-4">HanHan Bakery</h3>
              <p className="text-gray-400 text-sm leading-relaxed">
                  Nơi gửi gắm yêu thương qua từng chiếc bánh ngọt ngào.
              </p>
          </div>
          <div>
              <h4 className="font-bold text-lg mb-4">Liên Kết</h4>
              <ul className="space-y-2 text-gray-400 text-sm">
                  <li><Link to="/" className="hover:text-pink-500">Trang chủ</Link></li>
                  <li><Link to="/san-pham" className="hover:text-pink-500">Thực đơn</Link></li>
                  <li><Link to="#" className="hover:text-pink-500">Chính sách</Link></li>
              </ul>
          </div>
          <div>
              <h4 className="font-bold text-lg mb-4">Liên Hệ</h4>
              <ul className="space-y-2 text-gray-400 text-sm">
                  <li>📍 123 Đường ABC, Quận 1, TP.HCM</li>
                  <li>📞 090 123 4567</li>
                  <li>✉️ contact@hanhanbakery.com</li>
              </ul>
          </div>
          <div>
               <h4 className="font-bold text-lg mb-4">Đăng Ký Nhận Tin</h4>
               <div className="flex">
                  <input type="email" placeholder="Email của bạn" className="bg-gray-800 text-white px-4 py-2 rounded-l-md w-full focus:outline-none" />
                  <button className="bg-pink-600 px-4 py-2 rounded-r-md hover:bg-pink-700">Gửi</button>
               </div>
          </div>
      </div>
      <div className="border-t border-gray-800 text-center pt-6 text-gray-500 text-sm">
          © 2025 HanHan Bakery. All rights reserved.
      </div>
  </footer>
);

// --- MAIN COMPONENT ---

const ProductDetailPage = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  
  const [product, setProduct] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [quantity, setQuantity] = useState(1);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [addingToCart, setAddingToCart] = useState(false);

  // Scroll lên đầu trang khi đổi sản phẩm
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [slug]);

  // Fetch dữ liệu
  useEffect(() => {
    const fetchProductData = async () => {
        if (!slug || slug === "undefined") {
            setLoading(false);
            return;
        }

        setLoading(true);
        setError(false);
        try {
            const res = await axios.get(`http://localhost:5000/api/products/slug/${slug}`);
            const productData = res.data;
            setProduct(productData);

            if (productData && productData.category) {
                const catId = productData.category._id || productData.category;
                const relatedRes = await axios.get(`http://localhost:5000/api/products`, {
                    params: { category: catId, limit: 4 }
                });
                const relatedItems = relatedRes.data.items || [];
                setRelatedProducts(relatedItems.filter(p => p._id !== productData._id));
            }
        } catch (err) {
            console.error("Lỗi tải sản phẩm:", err);
            setError(true);
        } finally {
            setLoading(false);
        }
    };

    fetchProductData();
  }, [slug]);

  // HÀM XỬ LÝ THÊM VÀO GIỎ HÀNG
  const handleAddToCart = async () => {
    const token = localStorage.getItem("ACCESS_TOKEN");
    if (!token) {
        if(window.confirm("Bạn cần đăng nhập để mua bánh. Đi đến trang đăng nhập ngay?")) {
            navigate("/login");
        }
        return;
    }

    setAddingToCart(true);
    try {
        await axios.post('http://localhost:5000/api/cart/add', {
            productId: product._id,
            qty: quantity,
            attrs: {}
        }, {
            headers: { Authorization: `Bearer ${token}` }
        });
        
        alert(`Đã thêm thành công ${quantity} chiếc "${product.name}" vào giỏ hàng!`);
    } catch (err) {
        console.error(err);
        alert("Lỗi: Không thể thêm vào giỏ hàng. Vui lòng thử lại.");
    } finally {
        setAddingToCart(false);
    }
  };

  if (loading) {
      return (
          <div className="min-h-screen flex items-center justify-center bg-gray-50">
              <div className="flex flex-col items-center gap-3">
                  <div className="w-10 h-10 border-4 border-pink-200 border-t-pink-600 rounded-full animate-spin"></div>
                  <div className="text-pink-500 font-medium animate-pulse">Đang tải chi tiết bánh...</div>
              </div>
          </div>
      );
  }

  if (error || !product) {
      return (
        <div className="min-h-[70vh] flex flex-col items-center justify-center text-center p-4 bg-gray-50">
            <div className="bg-white p-8 rounded-2xl shadow-sm max-w-md">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-400">
                    <Search size={32} />
                </div>
                <h2 className="text-2xl font-bold text-gray-800 mb-2">Không tìm thấy sản phẩm</h2>
                <p className="text-gray-500 mb-6">Sản phẩm này có thể đã bị xóa hoặc đường dẫn không chính xác.</p>
                <Link to="/san-pham" className="bg-pink-600 text-white px-6 py-3 rounded-full hover:bg-pink-700 transition font-medium">
                    Quay lại thực đơn
                </Link>
            </div>
        </div>
      );
  }

  const images = product.images && product.images.length > 0 ? product.images : [{ url: '' }];
  const mainImage = getImageUrl(images[selectedImageIndex]?.url);

  return (
    <div className="bg-gray-50 min-h-screen font-sans text-gray-800 flex flex-col">
      {/* Breadcrumb */}
      <div className="bg-white border-b border-gray-100 sticky top-16 z-10 shadow-sm">
          <div className="container mx-auto px-4 py-3 text-sm text-gray-500 flex items-center gap-2 overflow-x-auto whitespace-nowrap">
              <Link to="/" className="hover:text-pink-600">Trang chủ</Link>
              <ChevronRight size={14} />
              <Link to="/san-pham" className="hover:text-pink-600">Thực đơn</Link>
              <ChevronRight size={14} />
              {product.category && (
                  <>
                    <Link to={`/san-pham?category=${product.category._id}`} className="hover:text-pink-600">
                        {product.category.name}
                    </Link>
                    <ChevronRight size={14} />
                  </>
              )}
              <span className="text-gray-900 font-medium truncate">{product.name}</span>
          </div>
      </div>

      <main className="container mx-auto px-4 py-8 flex-grow">
        <div className="bg-white rounded-2xl p-6 lg:p-8 shadow-sm border border-pink-50">
            <div className="flex flex-col lg:flex-row gap-10">
                {/* LEFT: Images */}
                <div className="w-full lg:w-1/2 space-y-4">
                    <div className="aspect-square rounded-2xl overflow-hidden bg-gray-100 relative group border border-gray-100">
                        <img 
                            src={mainImage} 
                            alt={product.name} 
                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                            onError={(e) => {e.target.src = 'https://via.placeholder.com/500x500?text=No+Image'}}
                        />
                        {/* SALE BADGE */}
                        {product.salePrice > 0 && product.salePrice < product.price && (
                             <div className="absolute top-4 left-4 bg-red-500 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-sm">
                                -{Math.round(((product.price - product.salePrice) / product.price) * 100)}%
                             </div>
                        )}
                    </div>
                    {images.length > 1 && (
                        <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-pink-200">
                            {images.map((img, idx) => (
                                <button 
                                    key={idx}
                                    onClick={() => setSelectedImageIndex(idx)}
                                    className={`w-20 h-20 rounded-xl overflow-hidden border-2 flex-shrink-0 transition-all ${selectedImageIndex === idx ? 'border-pink-500 opacity-100 ring-2 ring-pink-200' : 'border-transparent opacity-70 hover:opacity-100'}`}
                                >
                                    <img 
                                        src={getImageUrl(img.url)} 
                                        alt="" 
                                        className="w-full h-full object-cover" 
                                        onError={(e) => {e.target.src = 'https://via.placeholder.com/100?text=Error'}}
                                    />
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {/* RIGHT: Info */}
                <div className="w-full lg:w-1/2 flex flex-col">
                    <div className="mb-3 flex items-center gap-2 flex-wrap">
                        {product.category && (
                            <span className="bg-pink-100 text-pink-700 text-xs px-3 py-1 rounded-full font-bold uppercase tracking-wide hover:bg-pink-200 transition cursor-pointer">
                                <Link to={`/san-pham?category=${product.category._id}`}>{product.category.name}</Link>
                            </span>
                        )}
                        {/* ✅ LUÔN HIỂN THỊ CÒN HÀNG (BỎ CHECK STOCK) */}
                      
                    </div>

                    <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2 font-serif leading-tight">{product.name}</h1>
                    
                    <div className="mb-8 bg-pink-50/50 p-5 rounded-2xl border border-pink-100 inline-block w-full mt-4">
                         <div className="flex items-end gap-3">
                            {product.salePrice > 0 && product.salePrice < product.price ? (
                                <>
                                    <span className="text-4xl font-bold text-pink-600">{product.salePrice.toLocaleString()}đ</span>
                                    <span className="text-xl text-gray-400 line-through mb-1.5 font-medium">{product.price.toLocaleString()}đ</span>
                                </>
                            ) : (
                                <span className="text-4xl font-bold text-pink-600">{product.price.toLocaleString()}đ</span>
                            )}
                         </div>
                    </div>

                    <p className="text-gray-600 leading-relaxed mb-8 whitespace-pre-line text-base">
                        {product.description || "Đang cập nhật mô tả cho chiếc bánh thơm ngon này..."}
                    </p>

                    <div className="flex flex-col sm:flex-row gap-4 mb-8 pt-8 border-t border-gray-100">
                        <div className="flex items-center border border-gray-300 rounded-xl w-fit bg-white h-12 shadow-sm">
                            <button 
                                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                className="px-4 h-full hover:bg-gray-100 text-gray-600 transition-colors flex items-center justify-center rounded-l-xl"
                            >
                                <Minus size={16} />
                            </button>
                            <span className="w-12 text-center font-bold text-lg">{quantity}</span>
                            <button 
                                onClick={() => setQuantity(quantity + 1)}
                                className="px-4 h-full hover:bg-gray-100 text-gray-600 transition-colors flex items-center justify-center rounded-r-xl"
                            >
                                <Plus size={16} />
                            </button>
                        </div>
                        
                        {/* ✅ NÚT THÊM VÀO GIỎ HÀNG (LUÔN SÁNG, KHÔNG CHECK HẾT HÀNG) */}
                        <button 
                            onClick={handleAddToCart}
                            disabled={addingToCart} // Chỉ disable khi đang gọi API
                            className={`flex-1 font-bold py-3 px-8 rounded-xl shadow-lg shadow-pink-200 flex items-center justify-center gap-2 transition-all transform active:scale-[0.98] h-12 
                                ${addingToCart 
                                    ? 'bg-gray-400 text-white cursor-not-allowed' 
                                    : 'bg-pink-600 text-white hover:bg-pink-700'
                                }`}
                        >
                            {addingToCart ? (
                                <>
                                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                    Đang xử lý...
                                </>
                            ) : (
                                <>
                                    <ShoppingCart size={20} />
                                    Thêm vào giỏ hàng
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </div>

            {/* Related Products */}
            {relatedProducts.length > 0 && (
                <div className="mt-16 border-t border-gray-100 pt-10">
                    <div className="flex justify-between items-end mb-8">
                        <h3 className="text-2xl font-bold text-gray-900 font-serif">Có thể bạn sẽ thích</h3>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
                        {relatedProducts.map(rel => (
                            <Link to={`/san-pham/${rel.slug}`} key={rel._id} className="group cursor-pointer block bg-white rounded-2xl border border-gray-100 hover:shadow-xl hover:border-pink-100 transition-all duration-300 overflow-hidden h-full flex flex-col">
                                <div className="overflow-hidden bg-gray-100 aspect-square relative">
                                    <img 
                                        src={getImageUrl(rel.images?.[0]?.url)} 
                                        alt={rel.name} 
                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                                        onError={(e) => {e.target.src = 'https://via.placeholder.com/300x300?text=No+Image'}} 
                                    />
                                </div>
                                <div className="p-4 flex flex-col flex-grow">
                                    <h4 className="font-bold text-gray-800 group-hover:text-pink-600 transition-colors text-base mb-1 line-clamp-2">{rel.name}</h4>
                                    <div className="mt-auto pt-2">
                                        <span className="text-pink-600 font-bold">{rel.price.toLocaleString()}đ</span>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>
            )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default ProductDetailPage;