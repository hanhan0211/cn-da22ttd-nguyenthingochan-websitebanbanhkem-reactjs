import React, { useState } from 'react';
import axios from 'axios'; 
import { MapPin, Phone, Mail, Clock, Send, CheckCircle } from 'lucide-react';

const ContactPage = () => {
  // Khớp với Backend: name, email, phone, message
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '', 
    message: ''
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Gọi API gửi tin nhắn
      await axios.post('http://localhost:5000/api/contact', formData);
      
      setIsSubmitting(false);
      setIsSuccess(true);
      setFormData({ name: '', email: '', phone: '', message: '' });
      
      setTimeout(() => setIsSuccess(false), 5000);
    } catch (error) {
      console.error(error);
      alert("Gửi thất bại, vui lòng thử lại!");
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-white font-sans text-gray-800">
      
      {/* HEADER BANNER */}
      <div className="bg-pink-50 py-16 text-center">
        <h1 className="text-4xl font-bold text-gray-800 mb-4">Liên Hệ Với Chúng Tôi</h1>
        <p className="text-gray-500 max-w-2xl mx-auto px-4">
          Hãy để lại lời nhắn, chúng tôi sẽ phản hồi sớm nhất!
        </p>
      </div>

      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          
          {/* CỘT TRÁI: THÔNG TIN & BẢN ĐỒ */}
          <div className="space-y-8">
            <div>
              <h2 className="text-2xl font-bold mb-6 text-gray-800">Thông Tin Cửa Hàng</h2>
              <div className="space-y-6">
                
                {/* Địa chỉ */}
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-pink-100 rounded-full flex items-center justify-center text-pink-600 flex-shrink-0">
                    <MapPin size={24} />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg">Địa chỉ</h3>
                    <p className="text-gray-600">Số 126 Nguyễn Thiện Thành, khóm 4, phường Hòa Thuận, Vĩnh Long, Việt Nam</p>
                  </div>
                </div>

                {/* Hotline */}
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-pink-100 rounded-full flex items-center justify-center text-pink-600 flex-shrink-0">
                    <Phone size={24} />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg">Hotline</h3>
                    <p className="text-gray-600 font-bold text-xl">0999999999</p>
                    <p className="text-gray-500 text-sm">(Hỗ trợ 24/7)</p>
                  </div>
                </div>

                {/* Email */}
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-pink-100 rounded-full flex items-center justify-center text-pink-600 flex-shrink-0">
                    <Mail size={24} />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg">Email</h3>
                    <p className="text-gray-600">contact@hanhanbakery.com</p>
                  </div>
                </div>

                {/* Giờ mở cửa */}
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-pink-100 rounded-full flex items-center justify-center text-pink-600 flex-shrink-0">
                    <Clock size={24} />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg">Giờ mở cửa</h3>
                    <p className="text-gray-600">Thứ 2 - Chủ Nhật: 7:00 - 22:00</p>
                  </div>
                </div>

              </div>
            </div>

            {/* BẢN ĐỒ (IFRAME GOOGLE MAPS) */}
            <div className="rounded-2xl overflow-hidden shadow-sm border border-gray-100 h-64">
              <iframe 
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3926.376846663528!2d105.95287631534963!3d10.231149992694726!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x310a82b9e6e1e6b7%3A0x6b8f3b6b8f3b6b8f!2zMTI2IE5ndXnhu4VuIFRoaeG7hW4gVGjDoG5oLCBQaMaw4budbmcgNCwgVHAu Vm9uaCBMb25nLCBWxaluZyBMb25n!5e0!3m2!1svi!2s!4v1620000000000!5m2!1svi!2s" 
                width="100%" 
                height="100%" 
                style={{ border: 0 }} 
                allowFullScreen="" 
                loading="lazy" 
                referrerPolicy="no-referrer-when-downgrade"
                title="Google Maps"
              ></iframe>
            </div>
          </div>

          {/* CỘT PHẢI: FORM GỬI TIN NHẮN */}
          <div className="bg-white p-8 rounded-3xl shadow-lg border border-pink-100">
            <h2 className="text-2xl font-bold mb-6 text-gray-800">Gửi Tin Nhắn</h2>
            
            {isSuccess ? (
              <div className="bg-green-50 border border-green-200 text-green-700 p-6 rounded-xl flex flex-col items-center justify-center text-center h-80 animate-fade-in">
                <CheckCircle size={48} className="mb-4 text-green-500" />
                <h3 className="text-xl font-bold mb-2">Đã gửi thành công!</h3>
                <p>Cảm ơn bạn đã liên hệ.</p>
                <button 
                  onClick={() => setIsSuccess(false)}
                  className="mt-6 text-green-700 font-bold hover:underline"
                >
                  Gửi tin nhắn khác
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Họ tên</label>
                    <input 
                      type="text" 
                      name="name" 
                      required
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="Nguyễn Văn A"
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-pink-500 transition"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                    <input 
                      type="email" 
                      name="email" 
                      required
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="email@example.com"
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-pink-500 transition"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Số điện thoại</label>
                  <input 
                    type="tel" 
                    name="phone" 
                    required
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="0909xxxxxx"
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-pink-500 transition"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nội dung</label>
                  <textarea 
                    name="message" 
                    required
                    rows="5"
                    value={formData.message}
                    onChange={handleChange}
                    placeholder="Nhập nội dung tin nhắn..."
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-pink-500 transition resize-none"
                  ></textarea>
                </div>

                <button 
                  type="submit" 
                  disabled={isSubmitting}
                  className="w-full bg-pink-600 hover:bg-pink-700 text-white font-bold py-4 rounded-xl transition flex items-center justify-center gap-2 disabled:bg-gray-400"
                >
                  {isSubmitting ? 'Đang gửi...' : (
                    <> <Send size={20} /> Gửi Tin Nhắn </>
                  )}
                </button>
              </form>
            )}
          </div>

        </div>
      </div>
    </div>
  );
};

export default ContactPage;