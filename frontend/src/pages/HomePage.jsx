import React, { useState, useEffect } from 'react';
import { ShoppingCart, ChevronRight, Star, Heart, Clock, Truck, ShieldCheck, ChevronLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import Slider from "react-slick"; 
import "slick-carousel/slick/slick.css"; 
import "slick-carousel/slick/slick-theme.css";

// ✅ 1. THÊM DÒNG NÀY ĐỂ IMPORT COMPONENT FLASH SALE
import FlashSale from '../components/FlashSale';

// Hàm helper ảnh
const getImageUrl = (path) => {
    if (!path) return 'https://via.placeholder.com/500x500?text=No+Image';
    if (path.startsWith('http')) return path;
    const cleanPath = path.replace(/\\/g, "/");
    return `http://localhost:5000${cleanPath.startsWith('/') ? '' : '/'}${cleanPath}`;
};

const HomePage = () => {
  const [categories, setCategories] = useState([]);
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
        try {
            const [cateRes, prodRes, bannerRes] = await Promise.all([
                axios.get('http://localhost:5000/api/categories'),
                axios.get('http://localhost:5000/api/products?limit=8&featured=true'),
                axios.get('http://localhost:5000/api/banners')
            ]);

            setCategories(cateRes.data);
            setFeaturedProducts(prodRes.data.items || []);
            setBanners(bannerRes.data);
        } catch (error) {
            console.error("Lỗi khi tải dữ liệu:", error);
        } finally {
            setLoading(false);
        }
    };
    fetchData();
  }, []);

  const settings = {
    dots: true,
    infinite: true,
    speed: 800,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 5000,
    arrows: false,
  };

  if (loading) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-white">
            <div className="w-10 h-10 border-4 border-pink-200 border-t-pink-600 rounded-full animate-spin"></div>
        </div>
      );
  }

  return (
    <div className="min-h-screen bg-white font-sans text-gray-800 flex flex-col">
      
      {/* HERO BANNER SLIDER */}
      <section className="relative h-[600px] overflow-hidden">
        {banners.length > 0 ? (
            <Slider {...settings}>
                {banners.map((banner) => (
                    <div key={banner._id} className="relative h-[600px]">
                        <img 
                            src={getImageUrl(banner.image)} 
                            alt={banner.title} 
                            className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-r from-black/60 to-transparent"></div>
                        <div className="absolute inset-0 flex items-center">
                            <div className="container mx-auto px-6">
                                <div className="max-w-2xl text-white animate-fade-in-up">
                                    <span className="bg-pink-600 text-white px-3 py-1 rounded-full text-sm font-semibold mb-4 inline-block">
                                        Hot Deal 🔥
                                    </span>
                                    <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight drop-shadow-lg">
                                        {banner.title}
                                    </h1>
                                    <p className="text-lg md:text-xl mb-8 text-gray-100 drop-shadow-md">
                                        {banner.description}
                                    </p>
                                    <Link to="/san-pham" className="bg-pink-600 hover:bg-pink-700 text-white px-8 py-3 rounded-full font-bold transition flex items-center gap-2 w-fit">
                                        Mua Ngay <ChevronRight size={20}/>
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </Slider>
        ) : (
            <div className="relative h-full">
                <img src="/assets/img/banner2.jpg" alt="Default Banner" className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-r from-black/70 to-transparent"></div>
                <div className="absolute inset-0 flex items-center container mx-auto px-6">
                    <div className="max-w-2xl text-white">
                        <h1 className="text-5xl md:text-7xl font-bold mb-6">Vị Ngọt <br/> <span className="text-pink-400">Của Hạnh Phúc</span></h1>
                        <Link to="/san-pham" className="bg-pink-600 text-white px-8 py-3 rounded-full font-bold">Đặt Bánh Ngay</Link>
                    </div>
                </div>
            </div>
        )}
      </section>

      {/* ✅ 2. CHÈN FLASH SALE VÀO ĐÂY (Nằm giữa Banner và Features) */}
      <FlashSale />

      {/* FEATURES */}
      <section className="py-16 bg-pink-50">
        <div className="container mx-auto px-6">
          <div className="grid md:grid-cols-3 gap-8 text-center">
            <div className="p-6 bg-white rounded-2xl shadow-sm hover:shadow-md transition">
              <div className="w-16 h-16 bg-pink-100 rounded-full flex items-center justify-center mx-auto mb-4 text-pink-600">
                <ShieldCheck size={32} />
              </div>
              <h3 className="text-xl font-bold mb-2">100% Tự Nhiên</h3>
              <p className="text-gray-500">Không chất bảo quản, sử dụng trái cây tươi trong ngày.</p>
            </div>
            <div className="p-6 bg-white rounded-2xl shadow-sm hover:shadow-md transition">
              <div className="w-16 h-16 bg-pink-100 rounded-full flex items-center justify-center mx-auto mb-4 text-pink-600">
                <Clock size={32} />
              </div>
              <h3 className="text-xl font-bold mb-2">Tươi Mới Mỗi Ngày</h3>
              <p className="text-gray-500">Bánh được nướng mới vào 4:00 sáng mỗi ngày.</p>
            </div>
            <div className="p-6 bg-white rounded-2xl shadow-sm hover:shadow-md transition">
              <div className="w-16 h-16 bg-pink-100 rounded-full flex items-center justify-center mx-auto mb-4 text-pink-600">
                <Truck size={32} />
              </div>
              <h3 className="text-xl font-bold mb-2">Giao Hàng Hỏa Tốc</h3>
              <p className="text-gray-500">Giao nhanh trong 2h nội thành, đảm bảo nguyên vẹn.</p>
            </div>
          </div>
        </div>
      </section>

      {/* CATEGORIES */}
      <section className="py-20 container mx-auto px-6">
        <h2 className="text-3xl font-bold text-center mb-12">Khám Phá Danh Mục</h2>
        {categories.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {categories.map((cat) => (
              <Link to={`/san-pham?category=${cat._id}`} key={cat._id} className="group relative overflow-hidden rounded-2xl aspect-square cursor-pointer block shadow-md">
                <img 
                  src={getImageUrl(cat.image)} 
                  alt={cat.name} 
                  className="w-full h-full object-cover group-hover:scale-110 transition duration-500" 
                  onError={(e) => { e.target.onerror = null; e.target.src = 'https://via.placeholder.com/500x500?text=No+Image'; }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent flex items-end p-6">
                  <h3 className="text-white font-bold text-xl">{cat.name}</h3>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <p className="text-center text-gray-500">Chưa có danh mục nào.</p>
        )}
      </section>

      {/* BEST SELLERS */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-6">
          <div className="flex justify-between items-end mb-10">
            <div>
              <h2 className="text-3xl font-bold text-gray-800">Sản Phẩm Nổi Bật</h2>
              <p className="text-gray-500 mt-2">Những chiếc bánh được đánh giá cao nhất (4 sao trở lên)</p>
            </div>
            <Link to="/san-pham" className="text-pink-600 font-semibold hover:underline hidden md:block">Xem tất cả &rarr;</Link>
          </div>

          {featuredProducts.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {featuredProducts.map((product) => (
                <Link to={`/san-pham/${product.slug}`} key={product._id} className="group block">
                  <div className="relative overflow-hidden rounded-2xl mb-4 bg-gray-100 h-72 border border-gray-100">
                    <img 
                      src={getImageUrl(product.images?.[0]?.url)} 
                      alt={product.name} 
                      className="w-full h-full object-cover group-hover:scale-105 transition duration-500" 
                      onError={(e) => { e.target.onerror = null; e.target.src = 'https://via.placeholder.com/300x300?text=No+Image'; }}
                    />
                    
                  </div>
                  <h3 className="font-bold text-lg text-gray-800 mb-1 group-hover:text-pink-600 transition line-clamp-1">{product.name}</h3>
                  <p className="text-gray-500 text-sm mb-2">{product.category?.name || 'Bánh ngọt'}</p>
                  
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-pink-600 text-lg">{product.price.toLocaleString()}đ</span>
                    <div className="flex text-yellow-400 text-xs ml-auto items-center gap-1">
                        <span className="text-gray-400 font-medium text-[10px]">({product.reviewCount || 0})</span>
                        <div className="flex">
                            {[1, 2, 3, 4, 5].map(i => (
                                <Star 
                                    key={i} 
                                    size={12} 
                                    fill={i <= (product.avgRating || 0) ? "currentColor" : "none"} 
                                    className={i <= (product.avgRating || 0) ? "text-yellow-400" : "text-gray-300"}
                                />
                            ))}
                        </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-10 bg-gray-50 rounded-2xl">
                <p className="text-gray-500 mb-4 text-lg">Chưa có sản phẩm nào đạt đánh giá cao tuần này.</p>
                <Link to="/san-pham" className="bg-pink-100 text-pink-600 px-6 py-2 rounded-full font-bold hover:bg-pink-200 transition">
                    Xem tất cả bánh
                </Link>
            </div>
          )}
        </div>
      </section>

    </div>
  );
};

export default HomePage;