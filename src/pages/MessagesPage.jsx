import React, { useState, useMemo, useEffect, useRef } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { 
  Send, MessageSquare, ArrowLeft, User, Search, MapPin, 
  CheckCircle, Package, Sparkles, Sprout, Store, Clock
} from 'lucide-react';
import { useApp } from '../context/AppContext';

export default function MessagesPage() {
  const { messages, sendMessage, user, farmers, listings } = useApp();
  const [searchParams] = useSearchParams();
  const initialFarmerId = searchParams.get('farmer');

  // Safe list of conversations
  const validMessages = useMemo(() => {
    return Array.isArray(messages) ? messages.filter(m => m && typeof m === 'object') : [];
  }, [messages]);

  const [activeConvId, setActiveConvId] = useState(() => {
    if (initialFarmerId) {
      const match = validMessages.find(m => m.conversation_with_id === initialFarmerId);
      if (match) return match.id;
    }
    return validMessages[0]?.id || null;
  });

  const [inputText, setInputText] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const chatScrollRef = useRef(null);

  // Sync active conversation if params change or messages update
  useEffect(() => {
    if (initialFarmerId) {
      const match = validMessages.find(m => m.conversation_with_id === initialFarmerId);
      if (match) setActiveConvId(match.id);
    } else if (!activeConvId && validMessages.length > 0) {
      setActiveConvId(validMessages[0].id);
    }
  }, [initialFarmerId, validMessages, activeConvId]);

  // Scroll to bottom of chat when new message arrives
  useEffect(() => {
    if (chatScrollRef.current) {
      chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight;
    }
  }, [activeConvId, validMessages]);

  const activeConv = useMemo(() => {
    return validMessages.find(m => m.id === activeConvId) || validMessages[0] || null;
  }, [validMessages, activeConvId]);

  // Filter conversations list by search
  const filteredConversations = useMemo(() => {
    if (!searchQuery.trim()) return validMessages;
    const q = searchQuery.toLowerCase();
    return validMessages.filter(c => 
      (c.conversation_with_name && c.conversation_with_name.toLowerCase().includes(q)) ||
      (c.last_message && c.last_message.toLowerCase().includes(q)) ||
      (c.product_context?.product_name && c.product_context.product_name.toLowerCase().includes(q))
    );
  }, [validMessages, searchQuery]);

  const handleSend = (e) => {
    e?.preventDefault();
    if (!inputText.trim() || !activeConv) return;

    sendMessage(
      activeConv.conversation_with_id,
      activeConv.conversation_with_name,
      inputText.trim(),
      activeConv.product_context || null
    );
    setInputText('');
  };

  const handleQuickQuestion = (questionText) => {
    if (!activeConv) return;
    sendMessage(
      activeConv.conversation_with_id,
      activeConv.conversation_with_name,
      questionText,
      activeConv.product_context || null
    );
  };

  const activeChats = Array.isArray(activeConv?.chats) ? activeConv.chats : [];

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-5 pb-24 space-y-4">
      
      {/* HEADER BREADCRUMB */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <MessageSquare className="w-6 h-6 text-brand-forest" />
            <span>Direct Producer & Buyer Messages</span>
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Communicate directly on crop availability, crate quantities, and harvest dispatch schedules.
          </p>
        </div>

        <Link
          to="/marketplace"
          className="text-xs font-semibold text-brand-forest hover:underline hidden sm:flex items-center gap-1"
        >
          <Store className="w-3.5 h-3.5" />
          <span>Browse Marketplace</span>
        </Link>
      </div>

      {/* MESSAGING CONTAINER (SPLIT VIEW) */}
      <div className="bg-white/90 backdrop-blur-md rounded-3xl border border-slate-200/90 shadow-sm h-[75vh] min-h-[520px] flex overflow-hidden">
        
        {/* LEFT: CONVERSATION LIST */}
        <div className={`w-full md:w-80 lg:w-96 border-r border-slate-200/90 flex flex-col bg-slate-50/40 shrink-0 ${activeConvId ? 'hidden md:flex' : 'flex'}`}>
          
          {/* Search Header */}
          <div className="p-3.5 border-b border-slate-200/80 bg-white space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-900 text-sm">Conversations</span>
              <span className="text-[10px] font-semibold bg-emerald-50 text-emerald-800 px-2 py-0.5 rounded-full border border-emerald-200/60">
                {validMessages.length} active
              </span>
            </div>

            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search conversations or crops..."
                className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-100/80 border border-slate-200/70 rounded-xl focus:bg-white focus:border-brand-forest focus:outline-none transition-all"
              />
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
            </div>
          </div>

          {/* Conversation Thread Items */}
          <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
            {filteredConversations.length > 0 ? (
              filteredConversations.map((conv) => {
                const isSelected = activeConv?.id === conv.id;
                return (
                  <button
                    key={conv.id}
                    onClick={() => setActiveConvId(conv.id)}
                    className={`w-full p-3.5 text-left flex items-start space-x-3 transition-all cursor-pointer ${
                      isSelected 
                        ? 'bg-emerald-50/80 border-l-4 border-brand-forest shadow-xs' 
                        : 'hover:bg-slate-100/60'
                    }`}
                  >
                    <div className="relative shrink-0">
                      <img 
                        src={conv.farmer_avatar || 'https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=150&q=80'} 
                        alt="" 
                        className="w-11 h-11 rounded-2xl object-cover border border-slate-200 shadow-xs" 
                      />
                      <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 rounded-full border-2 border-white" />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1">
                        <h3 className="font-bold text-xs text-slate-900 truncate">
                          {conv.conversation_with_name}
                        </h3>
                        <span className="text-[10px] text-slate-400 shrink-0">
                          {conv.last_time || 'Recent'}
                        </span>
                      </div>

                      {conv.product_context && (
                        <div className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-800 bg-emerald-50/80 px-1.5 py-0.2 rounded mt-0.5">
                          <Package className="w-2.5 h-2.5" />
                          <span className="truncate">{conv.product_context.product_name}</span>
                        </div>
                      )}

                      <p className="text-xs text-slate-500 truncate mt-1">
                        {conv.last_message || 'Tap to view conversation history'}
                      </p>
                    </div>
                  </button>
                );
              })
            ) : (
              <div className="p-8 text-center text-xs text-slate-400 space-y-2">
                <MessageSquare className="w-8 h-8 text-slate-300 mx-auto" />
                <p>No conversations match your search.</p>
              </div>
            )}
          </div>
        </div>

        {/* RIGHT: ACTIVE CHAT THREAD */}
        <div className={`flex-1 flex flex-col bg-white ${!activeConvId ? 'hidden md:flex' : 'flex'}`}>
          {activeConv ? (
            <>
              {/* Chat Thread Header */}
              <div className="p-3.5 border-b border-slate-200/80 flex items-center justify-between bg-white/80 backdrop-blur-md">
                <div className="flex items-center space-x-3">
                  <button 
                    onClick={() => setActiveConvId(null)}
                    className="p-1.5 rounded-xl text-slate-500 hover:text-slate-900 hover:bg-slate-100 md:hidden transition-colors"
                    aria-label="Back to conversations"
                  >
                    <ArrowLeft className="w-5 h-5" />
                  </button>

                  <img 
                    src={activeConv.farmer_avatar || 'https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=150&q=80'} 
                    alt="" 
                    className="w-10 h-10 rounded-2xl object-cover border border-slate-200 shrink-0" 
                  />

                  <div>
                    <div className="flex items-center space-x-1.5">
                      <h2 className="font-bold text-slate-900 text-sm">{activeConv.conversation_with_name}</h2>
                      <CheckCircle className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    </div>
                    <p className="text-[10px] text-slate-500 flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-slate-400" />
                      <span>{activeConv.farmer_location || 'Eswatini Registered Producer'}</span>
                    </p>
                  </div>
                </div>

                <Link
                  to={`/farmer/${activeConv.conversation_with_id}`}
                  className="hidden sm:inline-flex items-center text-xs font-semibold px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
                >
                  <span>View Farm</span>
                </Link>
              </div>

              {/* PRODUCT INQUIRY CONTEXT CARD (If inquiry has produce details) */}
              {activeConv.product_context && (
                <div className="bg-emerald-50/70 border-b border-emerald-100 p-3 sm:px-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 bg-emerald-600 text-white rounded-xl shadow-xs">
                      <Package className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-[11px] font-semibold text-emerald-900">
                        Inquiry Reference: <span className="font-bold underline">{activeConv.product_context.product_name}</span>
                      </div>
                      <div className="text-[10px] text-emerald-700">
                        Price: E{activeConv.product_context.price}/{activeConv.product_context.unit || 'crate'}
                        {activeConv.product_context.available && (
                          <span className="ml-2 font-medium">• {activeConv.product_context.available} units currently in stock</span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Quick question action chips requested by user */}
                  <div className="flex flex-wrap items-center gap-1.5">
                    <button
                      onClick={() => handleQuickQuestion('How many crates are available in stock right now?')}
                      className="text-[10px] font-semibold px-2 py-1 rounded-lg bg-white border border-emerald-200 text-emerald-800 hover:bg-emerald-100 transition-colors cursor-pointer shadow-xs"
                    >
                      Crates in stock?
                    </button>
                    <button
                      onClick={() => handleQuickQuestion('Can you produce more crates by next week Friday?')}
                      className="text-[10px] font-semibold px-2 py-1 rounded-lg bg-white border border-emerald-200 text-emerald-800 hover:bg-emerald-100 transition-colors cursor-pointer shadow-xs"
                    >
                      Produce more next week?
                    </button>
                    <button
                      onClick={() => handleQuickQuestion('Is delivery or pickup available in Manzini hub?')}
                      className="text-[10px] font-semibold px-2 py-1 rounded-lg bg-white border border-emerald-200 text-emerald-800 hover:bg-emerald-100 transition-colors cursor-pointer shadow-xs"
                    >
                      Manzini delivery?
                    </button>
                  </div>
                </div>
              )}

              {/* Chat Message Stream */}
              <div 
                ref={chatScrollRef}
                className="flex-1 p-4 overflow-y-auto space-y-3 bg-gradient-to-b from-slate-50/50 to-white"
              >
                {activeChats.length > 0 ? (
                  activeChats.map((chat, idx) => {
                    const isMe = chat.sender === (user?.role === 'farmer' ? 'farmer' : 'buyer');
                    return (
                      <div 
                        key={idx}
                        className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
                      >
                        <div className="flex items-end gap-1.5 max-w-[85%] sm:max-w-lg">
                          {!isMe && (
                            <img
                              src={activeConv.farmer_avatar || 'https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=150&q=80'}
                              alt=""
                              className="w-6 h-6 rounded-full object-cover shrink-0 mb-1 border border-slate-200"
                            />
                          )}
                          <div className={`p-3 rounded-2xl text-xs sm:text-sm leading-relaxed shadow-xs ${
                            isMe 
                              ? 'bg-brand-forest text-white rounded-br-xs' 
                              : 'bg-white text-slate-800 border border-slate-200/90 rounded-bl-xs'
                          }`}>
                            {chat.text}
                          </div>
                        </div>
                        <span className="text-[10px] text-slate-400 mt-1 px-1">
                          {chat.time || 'Just now'}
                        </span>
                      </div>
                    );
                  })
                ) : (
                  <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-400 space-y-2">
                    <MessageSquare className="w-10 h-10 text-slate-300" />
                    <p className="text-xs">No message history yet. Send your first inquiry below!</p>
                  </div>
                )}
              </div>

              {/* Quick Inquiry Chips (when empty or active) */}
              <div className="px-3 py-1.5 bg-slate-50 border-t border-slate-100 flex flex-wrap items-center gap-1.5 overflow-x-auto text-[11px]">
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Quick Inquire:</span>
                <button
                  type="button"
                  onClick={() => setInputText('How many crates do you currently have left in stock?')}
                  className="text-[10px] px-2 py-0.5 rounded-md bg-white border border-slate-200 text-slate-600 hover:text-brand-forest hover:border-emerald-300 transition-colors"
                >
                  How many crates left?
                </button>
                <button
                  type="button"
                  onClick={() => setInputText('Can you produce more quantity for next week?')}
                  className="text-[10px] px-2 py-0.5 rounded-md bg-white border border-slate-200 text-slate-600 hover:text-brand-forest hover:border-emerald-300 transition-colors"
                >
                  Can you produce more?
                </button>
                <button
                  type="button"
                  onClick={() => setInputText('What is the earliest harvest dispatch date?')}
                  className="text-[10px] px-2 py-0.5 rounded-md bg-white border border-slate-200 text-slate-600 hover:text-brand-forest hover:border-emerald-300 transition-colors"
                >
                  Earliest dispatch?
                </button>
              </div>

              {/* Chat Input Bar */}
              <form onSubmit={handleSend} className="p-3 border-t border-slate-200/80 bg-white flex items-center space-x-2">
                <input
                  type="text"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder={`Send direct inquiry to ${activeConv.conversation_with_name}...`}
                  className="flex-1 px-4 py-2.5 bg-slate-100/80 border border-slate-200 rounded-2xl text-xs sm:text-sm text-slate-900 focus:bg-white focus:border-brand-forest focus:outline-none transition-all"
                />
                <button
                  type="submit"
                  disabled={!inputText.trim()}
                  className="p-2.5 bg-brand-forest hover:bg-brand-dark disabled:opacity-40 disabled:hover:bg-brand-forest text-white rounded-2xl transition-all shadow-xs cursor-pointer shrink-0"
                  aria-label="Send message"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center space-y-3">
              <MessageSquare className="w-12 h-12 text-slate-300" />
              <h3 className="font-bold text-slate-900 text-sm">No Conversation Selected</h3>
              <p className="text-xs text-slate-500 max-w-sm">
                Select a producer conversation on the left, or visit any produce listing in the marketplace to start an inquiry.
              </p>
              <Link
                to="/marketplace"
                className="px-4 py-2 rounded-xl bg-brand-forest text-white text-xs font-semibold hover:bg-brand-dark transition-colors"
              >
                Go to Marketplace
              </Link>
            </div>
          )}

        </div>

      </div>

    </div>
  );
}
