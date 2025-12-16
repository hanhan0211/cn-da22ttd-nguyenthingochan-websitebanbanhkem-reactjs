import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Zap, Save, Search, Loader, Image as ImageIcon, AlertTriangle } from 'lucide-react';

const FlashSaleManager = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [updatingId, setUpdatingId] = useState(null);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/products?limit=100");
      setProducts(res.data.items || []);
    } catch (err) { console.error(err); } 
    finally { setLoading(false); }
  };

  const handleChange = (id, field, value) => {
    if (['flashSalePrice', 'totalFlashSale', 'soldCount'].includes(field)) {
        if (Number(value) < 0) return; 
    }
    setProducts(prev => prev.map(p => p._id === id ? { ...p, [field]: value } : p));
  };

  const getImageUrl = (path) => {
      if (!path) return null;
      if (path.startsWith("http")) return path;
      return `http://localhost:5000${path}`;
  };

  const formatForInput = (isoString) => {
    if (!isoString) return "";
    const date = new Date(isoString);
    const offset = date.getTimezoneOffset() * 60000;
    return (new Date(date - offset)).toISOString().slice(0, 16);
  };

  const handleSave = async (p) => {
    if (p.isFlashSale) {
       if (!p.flashSaleStartDate || !p.flashSaleEndTime) return alert("Thiếu ngày Bắt đầu/Kết thúc!");
       if (new Date(p.flashSaleStartDate) >= new Date(p.flashSaleEndTime)) return alert("Ngày kết thúc phải sau ngày bắt đầu!");
       if (Number(p.soldCount) > Number(p.totalFlashSale)) return alert("Số lượng 'Đã bán' ảo không thể lớn hơn Tổng suất!");
       if (Number(p.totalFlashSale) > Number(p.stock)) return alert(`Lỗi: Tổng suất (${p.totalFlashSale}) > Tồn kho (${p.stock})!`);
    }

    setUpdatingId(p._id);
    try {
      const token = localStorage.getItem("ACCESS_TOKEN");
      await axios.put(`http://localhost:5000/api/products/${p._id}`, {
        isFlashSale: p.isFlashSale,
        flashSalePrice: Number(p.flashSalePrice),
        totalFlashSale: Number(p.totalFlashSale),
        soldCount: Number(p.soldCount),
        flashSaleStartDate: p.flashSaleStartDate,
        flashSaleEndTime: p.flashSaleEndTime
      }, { headers: { Authorization: `Bearer ${token}` } });
      alert(`Đã lưu ${p.name}!`);
    } catch (err) { alert("Lỗi lưu!"); } 
    finally { setUpdatingId(null); }
  };

  const filtered = products.filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()));
  if (loading) return <div className="p-10 text-center text-sm text-gray-500">Đang tải dữ liệu...</div>;

  return (
    <div className="p-6 bg-gray-50 min-h-screen font-sans text-gray-700">
      {/* Header gọn gàng */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold flex items-center gap-2 text-gray-800"><Zap className="text-yellow-500 fill-yellow-500" size={24}/> Quản Lý Flash Sale</h1>
        <div className="relative">
            <input type="text" placeholder="Tìm tên bánh..." className="pl-9 pr-4 py-2 border rounded-lg w-64 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-pink-500" value={searchTerm} onChange={e=>setSearchTerm(e.target.value)}/>
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden relative">
        {/* CSS Ẩn thanh cuộn */}
        <div className="overflow-x-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
            <table className="w-full text-left border-collapse min-w-[1300px]">
            <thead className="bg-gray-50 border-b border-gray-200 text-xs font-semibold uppercase text-gray-500 tracking-wider">
                <tr>
                <th className="p-4 w-16 text-center">Ảnh</th>
                <th className="p-4 w-56">Sản Phẩm</th>
                <th className="p-4 w-20 text-center text-blue-600 bg-blue-50/30">Kho</th>
                <th className="p-4 text-center w-20">Trạng Thái</th>
                <th className="p-4 w-32">Giá Sale</th>
                <th className="p-4 w-24">Tổng Suất</th>
                <th className="p-4 w-24 text-pink-600 bg-pink-50/30 border-x border-pink-50">Đã Bán (Ảo)</th>
                <th className="p-4 w-40">Bắt Đầu</th>
                <th className="p-4 w-40">Kết Thúc</th>
                <th className="p-4 text-right w-24 sticky right-0 bg-gray-50 shadow-[-4px_0_8px_rgba(0,0,0,0.02)]">Lưu</th>
                </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-sm">
                {filtered.map(p => {
                const isActive = p.isFlashSale;
                const imgUrl = getImageUrl(p.images?.[0]?.url);
                const hasError = isActive && Number(p.soldCount) > Number(p.totalFlashSale);

                return (
                    <tr key={p._id} className={`hover:bg-gray-50 transition ${isActive ? 'bg-orange-50/30' : ''}`}>
                        {/* Ảnh vừa phải (w-10 h-10) */}
                        <td className="p-3 text-center">
                            <div className="w-10 h-10 rounded border bg-white flex items-center justify-center overflow-hidden mx-auto">
                                {imgUrl ? <img src={imgUrl} alt="" className="w-full h-full object-cover"/> : <ImageIcon size={16} className="text-gray-300"/>}
                            </div>
                        </td>

                        <td className="p-3">
                            <div className="font-medium text-gray-800 truncate w-48" title={p.name}>{p.name}</div>
                            <div className="text-xs text-gray-400 mt-0.5">Gốc: {p.price.toLocaleString()}đ</div>
                        </td>

                        <td className="p-3 text-center font-bold text-blue-700 bg-blue-50/30 border-x border-blue-50">
                            {p.stock}
                        </td>
                        
                        <td className="p-3 text-center">
                            <button onClick={() => handleChange(p._id, 'isFlashSale', !p.isFlashSale)} 
                                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${isActive ? 'bg-green-500' : 'bg-gray-300'}`}>
                                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${isActive ? 'translate-x-6' : 'translate-x-1'}`} />
                            </button>
                        </td>

                        <td className="p-3">
                            <input type="number" min="0" className="w-full p-2 border rounded text-red-600 font-bold focus:ring-1 focus:ring-red-500 text-sm" 
                            value={p.flashSalePrice || 0} onChange={e=>handleChange(p._id,'flashSalePrice',e.target.value)} disabled={!isActive}/>
                        </td>
                        
                        <td className="p-3">
                            <input type="number" min="0" className="w-full p-2 border rounded text-center bg-white text-sm" 
                            value={p.totalFlashSale || 0} onChange={e=>handleChange(p._id,'totalFlashSale',e.target.value)} disabled={!isActive}/>
                        </td>
                        
                        {/* Cột Marketing nổi bật nhẹ */}
                        <td className="p-3 bg-pink-50/30 border-x border-pink-50 relative">
                            <input type="number" min="0" 
                            className={`w-full p-2 border bg-white rounded text-center text-pink-700 font-bold text-sm focus:ring-1 transition-colors ${hasError ? 'border-red-500 text-red-600' : 'border-pink-200 focus:border-pink-500'}`}
                            value={p.soldCount || 0} 
                            onChange={e=>handleChange(p._id,'soldCount',e.target.value)} 
                            disabled={!isActive}
                            title="Số lượng ảo"/>
                            {hasError && <div className="absolute top-1 right-1 text-red-500"><AlertTriangle size={12}/></div>}
                        </td>

                        <td className="p-3">
                            <input type="datetime-local" className="w-full p-1.5 border rounded text-xs text-gray-600 focus:border-blue-500" 
                            value={formatForInput(p.flashSaleStartDate)} onChange={e=>handleChange(p._id,'flashSaleStartDate',e.target.value)} disabled={!isActive}/>
                        </td>
                        <td className="p-3">
                            <input type="datetime-local" className="w-full p-1.5 border rounded text-xs text-gray-600 focus:border-red-500" 
                            value={formatForInput(p.flashSaleEndTime)} onChange={e=>handleChange(p._id,'flashSaleEndTime',e.target.value)} disabled={!isActive}/>
                        </td>
                        
                        <td className="p-3 text-right sticky right-0 bg-white/90 backdrop-blur-sm shadow-[-4px_0_8px_rgba(0,0,0,0.02)]">
                            <button onClick={() => handleSave(p)} disabled={updatingId === p._id || hasError} 
                            className={`p-2 rounded-lg shadow-sm transition-all text-white flex items-center justify-center w-full
                                ${hasError ? 'bg-gray-300 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 active:scale-95'}`}>
                                {updatingId === p._id ? <Loader size={16} className="animate-spin"/> : <Save size={16}/>}
                            </button>
                        </td>
                    </tr>
                )})}
            </tbody>
            </table>
        </div>
      </div>
    </div>
  );
};
export default FlashSaleManager;