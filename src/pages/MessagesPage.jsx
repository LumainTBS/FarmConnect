import React, { useState } from 'react';
import { Send, MessageSquare, ArrowLeft, User } from 'lucide-react';
import { useApp } from '../context/AppContext';

export default function MessagesPage() {
  const { messages, sendMessage, user } = useApp();
  const [activeConvId, setActiveConvId] = useState(messages[0]?.id || null);
  const [inputText, setInputText] = useState('');

  const activeConv = messages.find(m => m.id === activeConvId) || messages[0];

  const handleSend = (e) => {
    e.preventDefault();
    if (!inputText.trim() || !activeConv) return;

    sendMessage(
      activeConv.conversation_with_id,
      activeConv.conversation_with_name,
      inputText.trim()
    );
    setInputText('');
  };

  if (messages.length === 0) {
    return (
      <div className="max-w-md mx-auto px-4 py-16 text-center space-y-3">
        <MessageSquare className="w-12 h-12 text-slate-300 mx-auto" />
        <h2 className="text-lg font-bold text-slate-900">No Messages Yet</h2>
        <p className="text-xs text-slate-500">Contact a farmer from any product listing to start a direct message thread.</p>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-4 pb-20">
      
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm h-[75vh] flex overflow-hidden">
        
        {/* Left: Conversation List */}
        <div className={`w-full md:w-80 border-r border-slate-200 flex flex-col ${activeConvId ? 'hidden md:flex' : 'flex'}`}>
          <div className="p-4 border-b border-slate-200">
            <h1 className="font-bold text-slate-900 text-lg">Messages</h1>
            <p className="text-[11px] text-slate-500">Direct buyer ↔ farmer enquiries</p>
          </div>

          <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
            {messages.map((conv) => (
              <button
                key={conv.id}
                onClick={() => setActiveConvId(conv.id)}
                className={`w-full p-3.5 text-left flex items-center space-x-3 transition-colors ${
                  activeConvId === conv.id ? 'bg-emerald-50/70 border-l-4 border-brand-forest' : 'hover:bg-slate-50'
                }`}
              >
                <img 
                  src={conv.farmer_avatar || 'https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=150&q=80'} 
                  alt="" 
                  className="w-11 h-11 rounded-full object-cover shrink-0 border border-slate-200" 
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h3 className="font-bold text-xs text-slate-900 truncate">{conv.conversation_with_name}</h3>
                    <span className="text-[10px] text-slate-400">{conv.last_time}</span>
                  </div>
                  <p className="text-xs text-slate-500 truncate mt-0.5">{conv.last_message}</p>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Right: Active Chat View */}
        <div className={`flex-1 flex flex-col ${!activeConvId ? 'hidden md:flex' : 'flex'}`}>
          
          {activeConv ? (
            <>
              {/* Chat Header */}
              <div className="p-3.5 border-b border-slate-200 flex items-center space-x-3 bg-slate-50/50">
                <button 
                  onClick={() => setActiveConvId(null)}
                  className="p-1 text-slate-500 hover:text-slate-800 md:hidden"
                >
                  <ArrowLeft className="w-5 h-5" />
                </button>
                <img 
                  src={activeConv.farmer_avatar} 
                  alt="" 
                  className="w-9 h-9 rounded-full object-cover border border-slate-200" 
                />
                <div>
                  <h2 className="font-bold text-slate-900 text-sm">{activeConv.conversation_with_name}</h2>
                  <span className="text-[10px] text-emerald-700 font-semibold">Active Conversation</span>
                </div>
              </div>

              {/* Chat Bubble History */}
              <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-slate-50/30">
                {activeConv.chats.map((chat, idx) => {
                  const isMe = chat.sender === 'buyer';
                  return (
                    <div 
                      key={idx}
                      className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
                    >
                      <div className={`max-w-[80%] sm:max-w-md p-3 rounded-2xl text-xs sm:text-sm leading-relaxed shadow-xs ${
                        isMe 
                          ? 'bg-brand-forest text-white rounded-br-none' 
                          : 'bg-white text-slate-800 border border-slate-200/90 rounded-bl-none'
                      }`}>
                        {chat.text}
                      </div>
                      <span className="text-[10px] text-slate-400 mt-1 px-1">{chat.time}</span>
                    </div>
                  );
                })}
              </div>

              {/* Chat Input Bar */}
              <form onSubmit={handleSend} className="p-3 border-t border-slate-200 bg-white flex items-center space-x-2">
                <input
                  type="text"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder="Type your message to the farmer..."
                  className="flex-1 px-4 py-2.5 bg-slate-100 border border-transparent rounded-xl text-xs sm:text-sm text-slate-900 focus:bg-white focus:border-brand-forest focus:outline-none"
                />
                <button
                  type="submit"
                  className="p-2.5 bg-brand-forest text-white rounded-xl hover:bg-brand-dark transition-colors shadow-xs"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-slate-400 text-xs">
              Select a conversation to start chatting
            </div>
          )}

        </div>

      </div>

    </div>
  );
}
