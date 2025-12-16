import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Slider from "react-slick";
import { Zap } from 'lucide-react';
import { Link } from 'react-router-dom';
import "slick-carousel/slick/slick.css"; 
import "slick-carousel/slick/slick-theme.css";

const FlashSale = () => {
  const [products, setProducts] = useState([]);
  const [timeLeft, setTimeLeft] = useState({ h: 0, m: 0, s: 0 });
  const [endTime, setEndTime] = useState(null);

  useEffect(() => {
    const fetchFlashSale = async () => {
      try {
        const res = await axios.get('http://localhost:5000/api/products?flashSale=true&limit=20');
        const now = Date.now();
        
        // Chỉ lấy sản phẩm ĐANG diễn ra (Bắt đầu <= Hiện tại <= Kết thúc)
        const active = (res.data.items || []).filter(p => {
             const start = p.flashSaleStartDate ? new Date(p.flashSaleStartDate).getTime() : 0;
             const end = p.flashSaleEndTime ? new Date(p.flashSaleEndTime).getTime() : 0;
             return p.isFlashSale && now >= start && now <= end;
        });

        setProducts(active);

        // Tìm mốc kết thúc sớm nhất
        if (active.length > 0) {
             const times = active.map(p => new Date(p.flashSaleEndTime).getTime());
             setEndTime(Math.min(...times));
        }
      } catch (err) { console.error(err); }
    };
    fetchFlashSale();
  }, []);

  // Timer
  useEffect(() => {
    if (!endTime) return;
    const timer = setInterval(() => {
        const now = Date.now();
        const distance = endTime - now;
        if (distance <= 0) {
             clearInterval(timer);
             setProducts([]); 
        } else {
             setTimeLeft({
                 h: Math.floor((distance / (1000 * 60 * 60))),
                 m: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
                 s: Math.floor((distance % (1000 * 60)) / 1000)
             });
        }
    }, 1000);
    return () => clearInterval(timer);
  }, [endTime]);

  if (products.length === 0) return null;

  const settings = { dots: false, infinite: false, speed: 500, slidesToShow: 4, slidesToScroll: 1, responsive: [{ breakpoint: 768, settings: { slidesToShow: 2 } }] };
  const pad = n => n.toString().padStart(2, '0');

  return (
    <div className="container mx-auto px-4 my-12">
      <div className="bg-white rounded-xl shadow-lg border-2 border-orange-200 overflow-hidden">
        <div className="bg-gradient-to-r from-orange-500 to-red-600 p-4 flex justify-between items-center text-white">
          <div className="flex items-center gap-2">
            <Zap className="w-8 h-8 text-yellow-300 animate-pulse" />
            <h2 className="text-2xl font-black italic uppercase">Flash Sale</h2>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm font-bold uppercase opacity-90">Kết thúc sau:</span>
            <div className="flex gap-1 font-mono font-bold text-lg text-red-600">
               <span className="bg-white px-2 rounded">{pad(timeLeft.h)}</span>:
               <span className="bg-white px-2 rounded">{pad(timeLeft.m)}</span>:
               <span className="bg-white px-2 rounded">{pad(timeLeft.s)}</span>
            </div>
          </div>
        </div>
        <div className="p-6">
          <Slider {...settings}>
            {products.map(p => {
               const percent = Math.round(((p.price - p.flashSalePrice)/p.price)*100);
               const soldW = p.totalFlashSale > 0 ? (p.soldCount / p.totalFlashSale) * 100 : 0;
               return (
                <div key={p._id} className="px-2">
                   <div className="border rounded-xl p-3 hover:shadow-lg transition bg-white h-full group">
                      <div className="relative mb-3 h-48 rounded-lg overflow-hidden">
                         <Link to={`/san-pham/${p.slug}`}>
                            <img src={`http://localhost:5000${p.images?.[0]?.url}`} alt={p.name} className="w-full h-full object-cover"/>
                         </Link>
                         <div className="absolute top-0 right-0 bg-yellow-400 text-red-700 font-bold text-xs px-2 py-1 rounded-bl-lg">⚡ -{percent}%</div>
                      </div>
                      <h3 className="font-bold text-gray-800 text-sm truncate">{p.name}</h3>
                      <div className="flex items-end gap-2 my-2">
                         <span className="text-red-600 font-bold text-lg">{p.flashSalePrice.toLocaleString()}đ</span>
                         <span className="text-gray-400 text-xs line-through">{p.price.toLocaleString()}đ</span>
                      </div>
                      <div className="relative w-full h-4 bg-gray-200 rounded-full overflow-hidden">
                         <div className="absolute h-full bg-red-500" style={{width: `${soldW}%`}}></div>
                         <span className="absolute inset-0 flex items-center justify-center text-[9px] text-white font-bold uppercase">Đã bán {p.soldCount}</span>
                      </div>
                   </div>
                </div>
               )
            })}
          </Slider>
        </div>
      </div>
    </div>
  );
};
export default FlashSale;