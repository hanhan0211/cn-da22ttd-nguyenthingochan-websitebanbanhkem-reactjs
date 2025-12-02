import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Mail, Trash2, Calendar, User, Phone, MessageSquare, Send } from 'lucide-react';

const ContactManager = () => {
    const [contacts, setContacts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [replyingId, setReplyingId] = useState(null); // ID tin nhắn đang trả lời
    const [replyText, setReplyText] = useState("");

    useEffect(() => {
        fetchContacts();
    }, []);

    const fetchContacts = async () => {
        try {
            const token = localStorage.getItem("ACCESS_TOKEN");
            // ✅ Gọi API lấy danh sách
            const res = await axios.get('http://localhost:5000/api/contact', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setContacts(res.data);
        } catch (error) {
            console.error("Lỗi tải liên hệ:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if(!window.confirm("Bạn chắc chắn muốn xóa tin nhắn này?")) return;
        try {
            const token = localStorage.getItem("ACCESS_TOKEN");
            await axios.delete(`http://localhost:5000/api/contact/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setContacts(contacts.filter(c => c._id !== id));
        } catch (error) {
            alert("Lỗi khi xóa! Có thể do Backend chưa có hàm delete.");
        }
    };

    const handleReply = async (id) => {
        if (!replyText.trim()) return alert("Vui lòng nhập nội dung trả lời!");
        
        try {
            const token = localStorage.getItem("ACCESS_TOKEN");
            // ✅ Gọi API trả lời
            const res = await axios.put(`http://localhost:5000/api/contact/${id}/reply`, 
                { replyMessage: replyText },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            // Cập nhật lại UI: Thêm câu trả lời và đổi trạng thái
            setContacts(contacts.map(c => c._id === id ? res.data : c));
            
            // Reset form
            setReplyingId(null);
            setReplyText("");
            alert("Đã lưu câu trả lời thành công!");
        } catch (error) {
            console.error(error);
            alert("Lỗi khi trả lời!");
        }
    };

    if (loading) return <div className="p-10 text-center text-gray-500">Đang tải hộp thư...</div>;

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                <Mail className="text-pink-600" /> Hộp thư Liên hệ
                <span className="text-sm font-normal text-gray-500 ml-2 bg-gray-100 px-2 py-1 rounded-full">
                    {contacts.length} tin nhắn
                </span>
            </h2>

            <div className="space-y-4">
                {contacts.length > 0 ? contacts.map(contact => (
                    <div 
                        key={contact._id} 
                        className={`p-5 rounded-xl border transition relative group ${
                            contact.status === 'new' 
                                ? 'bg-blue-50/50 border-blue-100 shadow-sm' 
                                : 'bg-white border-gray-100'
                        }`}
                    >
                        {/* Header của mỗi tin nhắn */}
                        <div className="flex flex-wrap justify-between items-start gap-4 mb-3">
                            <div className="flex items-center gap-3">
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-lg ${
                                    contact.status === 'new' ? 'bg-blue-500' : 'bg-gray-400'
                                }`}>
                                    {contact.name.charAt(0).toUpperCase()}
                                </div>
                                <div>
                                    <div className="font-bold text-gray-800 flex items-center gap-2">
                                        {contact.name}
                                        {contact.status === 'new' && (
                                            <span className="text-[10px] bg-red-500 text-white px-2 py-0.5 rounded-full uppercase font-bold tracking-wider">Mới</span>
                                        )}
                                        {contact.status === 'read' && (
                                            <span className="text-[10px] bg-green-100 text-green-700 px-2 py-0.5 rounded-full uppercase font-bold tracking-wider">Đã xử lý</span>
                                        )}
                                    </div>
                                    <div className="text-xs text-gray-500 flex flex-wrap gap-3 mt-1">
                                        <span className="flex items-center gap-1"><Mail size={12}/> {contact.email}</span>
                                        <span className="flex items-center gap-1"><Phone size={12}/> {contact.phone || 'N/A'}</span>
                                        <span className="flex items-center gap-1"><Calendar size={12}/> {new Date(contact.createdAt).toLocaleString('vi-VN')}</span>
                                    </div>
                                </div>
                            </div>

                            <button 
                                onClick={() => handleDelete(contact._id)}
                                className="text-gray-400 hover:text-red-600 p-2 hover:bg-red-50 rounded-full transition"
                                title="Xóa tin nhắn"
                            >
                                <Trash2 size={18} />
                            </button>
                        </div>
                        
                        {/* Nội dung tin nhắn */}
                        <div className="ml-13 pl-3 border-l-2 border-gray-200 text-gray-700 text-sm mb-4 leading-relaxed">
                            {contact.message}
                        </div>

                        {/* Phần Trả lời (Admin Reply) */}
                        <div className="bg-gray-50 rounded-lg p-4 ml-13">
                            {contact.replyMessage ? (
                                // Nếu đã trả lời rồi thì hiện nội dung
                                <div>
                                    <div className="text-xs font-bold text-pink-600 mb-1 flex items-center gap-1">
                                        <MessageSquare size={12}/> Admin ({contact.repliedBy?.name || 'Admin'}) đã trả lời:
                                    </div>
                                    <div className="text-sm text-gray-600 italic">"{contact.replyMessage}"</div>
                                </div>
                            ) : (
                                // Nếu chưa trả lời thì hiện form
                                <div>
                                    {replyingId === contact._id ? (
                                        <div className="animate-fade-in">
                                            <textarea 
                                                className="w-full p-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-pink-500 mb-2"
                                                rows="3"
                                                placeholder="Nhập nội dung trả lời khách hàng..."
                                                value={replyText}
                                                onChange={(e) => setReplyText(e.target.value)}
                                            ></textarea>
                                            <div className="flex gap-2">
                                                <button 
                                                    onClick={() => handleReply(contact._id)}
                                                    className="bg-pink-600 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-pink-700 flex items-center gap-1"
                                                >
                                                    <Send size={14}/> Gửi trả lời
                                                </button>
                                                <button 
                                                    onClick={() => setReplyingId(null)}
                                                    className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg text-sm font-bold hover:bg-gray-300"
                                                >
                                                    Hủy
                                                </button>
                                            </div>
                                        </div>
                                    ) : (
                                        <button 
                                            onClick={() => {
                                                setReplyingId(contact._id);
                                                setReplyText("");
                                            }}
                                            className="text-sm text-pink-600 font-bold hover:underline flex items-center gap-1"
                                        >
                                            <MessageSquare size={16}/> Trả lời tin nhắn này
                                        </button>
                                    )}
                                </div>
                            )}
                        </div>

                    </div>
                )) : (
                    <div className="text-center py-16 bg-gray-50 rounded-xl">
                        <Mail size={48} className="mx-auto text-gray-300 mb-3" />
                        <p className="text-gray-500">Hộp thư đang trống.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ContactManager;