import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { 
    MessageSquare, Send, User, ShieldCheck, Plus, Clock, Loader, 
    MapPin, Phone, Mail, Trash2, Image as ImageIcon, X, Store
} from 'lucide-react';

const ContactPage = () => {
    // State
    const [contacts, setContacts] = useState([]); 
    const [selectedTicket, setSelectedTicket] = useState(null); 
    const [chatInput, setChatInput] = useState(''); 
    const [newTicketMessage, setNewTicketMessage] = useState(''); 
    const [selectedFile, setSelectedFile] = useState(null);
    const [previewUrl, setPreviewUrl] = useState(null);
    const [isCreating, setIsCreating] = useState(false); 
    const [loading, setLoading] = useState(false);
    const [loadingList, setLoadingList] = useState(true);

    const token = localStorage.getItem("ACCESS_TOKEN");
    const chatEndRef = useRef(null); 
    const fileInputRef = useRef(null); 

    useEffect(() => {
        if (token) fetchMyHistory();
        else setLoadingList(false);
    }, [token]);

    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }, [selectedTicket?.conversation, selectedTicket]);

    const fetchMyHistory = async () => {
        try {
            const res = await axios.get('http://localhost:5000/api/contacts/my-history', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setContacts(res.data.data);
        } catch (error) { console.error(error); } 
        finally { setLoadingList(false); }
    };

    // ✅ HÀM XỬ LÝ KHI BẤM VÀO TICKET (Đánh dấu đã đọc)
    const handleSelectTicket = async (ticket) => {
        setSelectedTicket(ticket);
        setIsCreating(false);

        // Nếu có tin nhắn mới (chưa đọc) -> Gọi API đánh dấu đã đọc ngay
        if (ticket.isReadByUser === false) {
            try {
                // 1. Gọi API Backend
                await axios.put(`http://localhost:5000/api/contacts/${ticket._id}/read`, {}, {
                    headers: { Authorization: `Bearer ${token}` }
                });

                // 2. Cập nhật UI ngay lập tức (Tắt chấm xanh)
                const updatedContacts = contacts.map(c => 
                    c._id === ticket._id ? { ...c, isReadByUser: true } : c
                );
                setContacts(updatedContacts);
            } catch (error) {
                console.error("Lỗi mark read", error);
            }
        }
    };

    const handleCreateTicket = async (e) => {
        e.preventDefault();
        if (!newTicketMessage.trim()) return;
        setLoading(true);
        try {
            const res = await axios.post('http://localhost:5000/api/contacts', 
                { message: newTicketMessage },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            const newTicket = res.data.data;
            setContacts([newTicket, ...contacts]);
            handleSelectTicket(newTicket); // Chọn luôn ticket mới
            setNewTicketMessage('');
        } catch (error) { alert("Lỗi tạo yêu cầu"); } 
        finally { setLoading(false); }
    };

    // ... (Phần handleFileSelect, handleSendMessage, handleDeleteTicket GIỮ NGUYÊN như cũ)
    const handleFileSelect = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (file.size > 5 * 1024 * 1024) return alert("File quá lớn (Max 5MB)");
            setSelectedFile(file);
            setPreviewUrl(URL.createObjectURL(file));
        }
    };
    const clearSelectedFile = () => {
        setSelectedFile(null);
        setPreviewUrl(null);
        if (fileInputRef.current) fileInputRef.current.value = "";
    };
    const handleSendMessage = async (e) => {
        e.preventDefault();
        if ((!chatInput.trim() && !selectedFile) || !selectedTicket) return;
        const formData = new FormData();
        formData.append('message', chatInput);
        if (selectedFile) formData.append('image', selectedFile);
        try {
            const res = await axios.put(`http://localhost:5000/api/contacts/${selectedTicket._id}/chat`, formData, { headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'multipart/form-data' }});
            const updatedTicket = res.data.data;
            setSelectedTicket(updatedTicket);
            const updatedList = contacts.map(c => c._id === updatedTicket._id ? updatedTicket : c);
            setContacts(updatedList.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt)));
            setChatInput('');
            clearSelectedFile();
        } catch (error) { alert("Lỗi gửi tin nhắn"); }
    };
    const handleDeleteTicket = async (ticketId) => {
        if (!window.confirm("Xóa cuộc trò chuyện này?")) return;
        try {
            await axios.delete(`http://localhost:5000/api/contacts/${ticketId}`, { headers: { Authorization: `Bearer ${token}` }});
            const newList = contacts.filter(c => c._id !== ticketId);
            setContacts(newList);
            if (selectedTicket?._id === ticketId) setSelectedTicket(null);
        } catch (error) { alert("Lỗi xóa"); }
    };
    // ...

    // Helper UI
    const InfoCard = ({ icon: Icon, title, desc, sub, color }) => (
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition flex items-center gap-4">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${color} text-white shadow-lg`}>
                <Icon size={20} />
            </div>
            <div>
                <h3 className="font-bold text-gray-800 text-base">{title}</h3>
                <p className="text-gray-600 text-sm font-medium">{desc}</p>
                <p className="text-[10px] text-gray-400 mt-0.5">{sub}</p>
            </div>
        </div>
    );
    const getImageUrl = (path) => path ? `http://localhost:5000${path}` : '';

    return (
        <div className="min-h-screen bg-[#FDF8F6] font-sans text-gray-800 pb-10">
            {/* Header Info */}
            <div className="bg-white border-b border-gray-100 py-8 px-4 mb-8 shadow-sm">
                <div className="container mx-auto max-w-6xl">
                    <h1 className="text-3xl font-extrabold text-gray-800 mb-6 text-center">Liên Hệ <span className="text-pink-600">HanHan Bakery</span></h1>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <InfoCard icon={MapPin} title="Cửa hàng" desc="Số 126 Nguyễn Thiện Thành, khóm 4, phường Hòa Thuận, Vĩnh Long, Việt Nam" sub="Vĩnh Long" color="bg-pink-500" />
                        <InfoCard icon={Phone} title="Hotline" desc="0999 999 999" sub="8:00 - 22:00" color="bg-orange-400" />
                        <InfoCard icon={Mail} title="Email" desc="contac@hanhanbakery.com" sub="Phản hồi 24h" color="bg-blue-500" />
                    </div>
                </div>
            </div>

            <div className="container mx-auto max-w-6xl px-4">
                {!token ? (
                    <div className="text-center py-20 bg-white rounded-3xl shadow-sm border border-gray-200">
                        <p className="text-gray-500 mb-4">Vui lòng đăng nhập để chat với nhân viên.</p>
                        <a href="/login" className="text-pink-600 font-bold hover:underline">Đăng nhập ngay</a>
                    </div>
                ) : (
                    <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden flex flex-col md:flex-row h-[75vh]">
                        
                        {/* --- CỘT TRÁI (DANH SÁCH) --- */}
                        <div className="w-full md:w-1/3 border-r border-gray-100 flex flex-col bg-gray-50">
                            <div className="p-4 border-b border-gray-200 bg-white flex justify-between items-center sticky top-0 z-10">
                                <h2 className="font-bold text-gray-800">Hộp thư hỗ trợ</h2>
                                <button onClick={() => { setIsCreating(true); setSelectedTicket(null); }} className="bg-pink-100 text-pink-600 p-2 rounded-lg hover:bg-pink-200 transition"><Plus size={20} /></button>
                            </div>

                            <div className="flex-1 overflow-y-auto p-3 space-y-2">
                                {loadingList ? <div className="text-center py-10"><Loader className="animate-spin inline text-pink-500"/></div> : 
                                 contacts.length === 0 ? <div className="text-center py-10 text-gray-400 text-xs">Chưa có tin nhắn</div> : 
                                 contacts.map(ticket => {
                                    const lastMsg = ticket.conversation[ticket.conversation.length - 1];
                                    // ✅ KIỂM TRA CHƯA ĐỌC
                                    const isUnread = !ticket.isReadByUser; 

                                    return (
                                        <div 
                                            key={ticket._id}
                                            // ✅ SỰ KIỆN CLICK ĐỂ ĐỌC TIN NHẮN
                                            onClick={() => handleSelectTicket(ticket)}
                                            className={`p-3 rounded-xl cursor-pointer transition border relative group ${
                                                selectedTicket?._id === ticket._id 
                                                ? 'bg-white border-pink-400 shadow-sm' 
                                                : 'bg-white border-transparent hover:border-pink-200 hover:shadow-sm'
                                            }`}
                                        >
                                            <div className="flex justify-between items-center mb-1">
                                                {/* Nếu chưa đọc thì chữ Đậm */}
                                                <h4 className={`text-sm truncate w-2/3 ${isUnread ? 'font-bold text-gray-900' : 'font-bold text-gray-600'}`}>
                                                    {ticket.subject}
                                                </h4>
                                                
                                                {/* ✅ CHẤM XANH NẾU CHƯA ĐỌC */}
                                                {isUnread && (
                                                    <span className="bg-green-500 w-2.5 h-2.5 rounded-full shadow-sm animate-pulse"></span>
                                                )}
                                            </div>
                                            
                                            <div className={`text-xs truncate h-4 flex items-center ${isUnread ? 'font-semibold text-gray-800' : 'text-gray-500'}`}>
                                                {lastMsg?.message ? (
                                                    <span className="truncate">{lastMsg.message}</span>
                                                ) : (
                                                    <span className="flex items-center gap-1 italic opacity-80 text-pink-600">
                                                        <ImageIcon size={12} /> Đã gửi ảnh
                                                    </span>
                                                )}
                                            </div>

                                            <p className={`text-[10px] mt-1 text-right ${isUnread ? 'text-green-600 font-bold' : 'text-gray-400'}`}>
                                                {new Date(ticket.updatedAt).toLocaleDateString('vi-VN')}
                                            </p>
                                        </div>
                                    )
                                })}
                            </div>
                        </div>

                        {/* --- CỘT PHẢI (CHAT) --- */}
                        <div className="w-full md:w-2/3 flex flex-col bg-white relative">
                            {isCreating ? (
                                <div className="flex-1 flex flex-col items-center justify-center p-6 bg-pink-50/20">
                                    {/* ... Form tạo mới giữ nguyên ... */}
                                    <div className="w-full max-w-md bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                                        <h2 className="text-xl font-bold text-center text-gray-800 mb-4">Gửi yêu cầu mới</h2>
                                        <form onSubmit={handleCreateTicket} className="space-y-4">
                                            <textarea className="w-full p-3 border border-gray-200 rounded-xl bg-gray-50 focus:bg-white focus:border-pink-500 outline-none transition h-32 resize-none text-sm" placeholder="Nội dung cần hỗ trợ..." value={newTicketMessage} onChange={(e) => setNewTicketMessage(e.target.value)} required></textarea>
                                            <button disabled={loading} className="w-full bg-pink-600 text-white font-bold py-3 rounded-xl hover:bg-pink-700 transition flex justify-center items-center gap-2">{loading ? <Loader className="animate-spin" size={18}/> : <Send size={18}/>} Gửi Ngay</button>
                                        </form>
                                    </div>
                                </div>
                            ) : selectedTicket ? (
                                <>
                                    {/* Header Chat */}
                                    <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-white z-10 shadow-sm">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-pink-100 flex items-center justify-center text-pink-600 shadow-sm border border-pink-200">
                                                <Store size={22} />
                                            </div>
                                            <div>
                                                <h3 className="font-bold text-gray-800 text-lg flex items-center gap-2">
                                                    HanHan Bakery <span className="text-blue-500 text-[10px] bg-blue-50 px-1.5 py-0.5 rounded border border-blue-100 flex items-center gap-0.5"><ShieldCheck size={10}/> Shop</span>
                                                </h3>
                                                <p className="text-xs text-gray-400 mt-0.5 max-w-[250px] truncate" title={selectedTicket.subject}>Chủ đề: {selectedTicket.subject}</p>
                                            </div>
                                        </div>
                                        <button onClick={() => handleDeleteTicket(selectedTicket._id)} className="text-gray-400 hover:text-red-500 hover:bg-red-50 p-2 rounded-lg transition"><Trash2 size={20} /></button>
                                    </div>

                                    {/* Chat Body */}
                                    <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
                                        {selectedTicket.conversation.map((msg, idx) => {
                                            const isMe = msg.sender === 'user';
                                            return (
                                                <div key={idx} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                                                    <div className={`flex gap-2 max-w-[85%] ${isMe ? 'flex-row-reverse' : 'flex-row'}`}>
                                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 shadow-sm ${isMe ? 'bg-pink-500 text-white' : 'bg-white text-blue-600 border'}`}>
                                                            {isMe ? <User size={16}/> : <ShieldCheck size={16}/>}
                                                        </div>
                                                        <div>
                                                            <div className={`p-3 rounded-2xl text-sm shadow-sm overflow-hidden ${isMe ? 'bg-pink-600 text-white rounded-tr-none' : 'bg-white text-gray-700 border border-gray-200 rounded-tl-none'}`}>
                                                                {msg.image && <div className="mb-2"><img src={getImageUrl(msg.image)} alt="sent" className="max-w-full h-auto rounded-lg cursor-pointer hover:opacity-90" onClick={() => window.open(getImageUrl(msg.image), '_blank')}/></div>}
                                                                {msg.message && <p className="leading-relaxed whitespace-pre-wrap">{msg.message}</p>}
                                                            </div>
                                                            <div className={`text-[10px] mt-1 opacity-50 ${isMe ? 'text-right' : 'text-left'}`}>{new Date(msg.timestamp).toLocaleTimeString('vi-VN', {hour:'2-digit', minute:'2-digit'})}</div>
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                        <div ref={chatEndRef} />
                                    </div>

                                    {/* Chat Input */}
                                    <div className="p-3 bg-white border-t border-gray-100">
                                        {previewUrl && (
                                            <div className="px-4 pb-2 flex"><div className="relative"><img src={previewUrl} alt="preview" className="h-16 w-auto rounded-lg border border-pink-200 shadow-sm object-cover"/><button onClick={clearSelectedFile} className="absolute -top-2 -right-2 bg-gray-500 text-white rounded-full p-0.5 hover:bg-red-500 transition"><X size={12}/></button></div></div>
                                        )}
                                        <form onSubmit={handleSendMessage} className="flex gap-2 items-center bg-gray-50 p-1.5 rounded-3xl border border-gray-200">
                                            <button type="button" onClick={() => fileInputRef.current.click()} className="p-2 text-gray-400 hover:text-pink-600 hover:bg-pink-50 rounded-full transition"><ImageIcon size={20} /></button>
                                            <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileSelect}/>
                                            <input type="text" className="flex-1 px-4 py-2 bg-transparent outline-none text-sm text-gray-700 placeholder-gray-400" placeholder="Nhập tin nhắn..." value={chatInput} onChange={(e) => setChatInput(e.target.value)}/>
                                            <button type="submit" disabled={(!chatInput.trim() && !selectedFile)} className="bg-pink-600 text-white p-2.5 rounded-full hover:bg-pink-700 transition shadow-md disabled:bg-gray-300 disabled:cursor-not-allowed"><Send size={18} /></button>
                                        </form>
                                    </div>
                                </>
                            ) : (
                                <div className="flex-1 flex flex-col items-center justify-center text-gray-400 bg-gray-50/50">
                                    <MessageSquare size={48} className="mb-3 text-pink-200" />
                                    <p className="text-sm">Chọn một hội thoại để bắt đầu</p>
                                    <button onClick={() => setIsCreating(true)} className="mt-4 text-pink-600 text-sm font-bold hover:underline">Tạo yêu cầu mới</button>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ContactPage;