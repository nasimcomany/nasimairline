/**
 * Chat Widget Component - Online chat support
 * Fixed position at bottom right, follows scroll
 */
import React, { useState, useEffect, useRef } from 'react';
import { useLanguage } from '../../contexts/LanguageContext';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';
import api from '../../services/api';
import {
  ChatBubbleLeftRightIcon,
  XMarkIcon,
  PaperAirplaneIcon,
} from '@heroicons/react/24/outline';

interface ChatMessage {
  uuid: string;
  message: string;
  sender_name: string;
  sender_email: string;
  is_staff: boolean;
  is_read: boolean;
  formatted_time: string;
  created_at: string;
  session_id?: string;
}

interface ChatWidgetProps {
  sessionId?: string;
}

const ChatWidget: React.FC<ChatWidgetProps> = ({ sessionId: propSessionId }) => {
  const { t, language } = useLanguage();
  const { isAuthenticated, user } = useSelector((state: RootState) => state.auth);
  
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [guestName, setGuestName] = useState('');
  const [guestEmail, setGuestEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId, setSessionId] = useState<string>(propSessionId || '');
  const [lastMessageTime, setLastMessageTime] = useState<string>('');
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  
  // Generate or get session ID
  useEffect(() => {
    if (!sessionId) {
      // Try to get from localStorage first (for both authenticated and guest users)
      const storedSessionId = localStorage.getItem('chat_session_id');
      if (storedSessionId) {
        setSessionId(storedSessionId);
      } else if (!isAuthenticated) {
        // Generate session ID for guest users only if not in localStorage
        const newSessionId = `guest_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        setSessionId(newSessionId);
        localStorage.setItem('chat_session_id', newSessionId);
      }
    }
  }, [isAuthenticated, sessionId]);
  
  // Load initial messages when chat opens
  useEffect(() => {
    if (isOpen) {
      loadMessages();
    }
  }, [isOpen]);
  
  // Polling for new messages
  useEffect(() => {
    if (isOpen && sessionId) {
      // Start polling every 2 seconds (کاهش فاصله برای دریافت سریع‌تر)
      pollingIntervalRef.current = setInterval(() => {
        loadNewMessages();
      }, 2000);
      
      return () => {
        if (pollingIntervalRef.current) {
          clearInterval(pollingIntervalRef.current);
        }
      };
    } else {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
      }
    }
  }, [isOpen, sessionId]);
  
  // Scroll to bottom when new messages arrive
  useEffect(() => {
    scrollToBottom();
  }, [messages]);
  
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };
  
  const loadMessages = async () => {
    try {
      setIsLoading(true);
      const params: any = {};
      
      // استفاده از sessionId از localStorage یا state
      let currentSessionId = sessionId || localStorage.getItem('chat_session_id') || '';
      if (currentSessionId) {
        params.session_id = currentSessionId;
      }
      
      const response = await api.get('/support/chat/', { params });
      const data = Array.isArray(response.data) ? response.data : response.data.results || [];
      
      // Debug: چاپ داده‌های دریافتی
      console.log('Loaded messages:', data.map((m: any) => ({
        uuid: m.uuid,
        is_staff: m.is_staff,
        session_id: m.session_id,
        sender_name: m.sender_name
      })));
      
      // استخراج session_id از پیام‌ها (اگر sessionId نداریم یا تغییر کرده)
      let newSessionId = currentSessionId;
      if (data.length > 0) {
        // بررسی تمام پیام‌ها برای یافتن session_id
        for (const msg of data) {
          const msgAny = msg as any;
          if (msgAny.session_id) {
            newSessionId = msgAny.session_id;
            if (newSessionId !== currentSessionId) {
              setSessionId(newSessionId);
              localStorage.setItem('chat_session_id', newSessionId);
            }
            break;
          }
        }
      }
      
      // اگر sessionId تغییر کرد، دوباره درخواست بزن تا همه پیام‌ها را بگیریم
      if (newSessionId && newSessionId !== currentSessionId) {
        params.session_id = newSessionId;
        const retryResponse = await api.get('/support/chat/', { params });
        const retryData = Array.isArray(retryResponse.data) ? retryResponse.data : retryResponse.data.results || [];
        // مرتب‌سازی بر اساس created_at
        retryData.sort((a: any, b: any) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
        setMessages(retryData);
        
        // Set last message time
        if (retryData.length > 0) {
          setLastMessageTime(retryData[retryData.length - 1].created_at);
        }
      } else {
        // استفاده از داده‌های دریافت شده
        // مرتب‌سازی بر اساس created_at
        data.sort((a: any, b: any) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
        setMessages(data);
        
        // Set last message time
        if (data.length > 0) {
          setLastMessageTime(data[data.length - 1].created_at);
        }
      }
    } catch (error) {
      console.error('Error loading messages:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  const loadNewMessages = async () => {
    try {
      const params: any = {};
      // استفاده از sessionId از localStorage یا state
      const currentSessionId = sessionId || localStorage.getItem('chat_session_id') || '';
      if (currentSessionId) {
        params.session_id = currentSessionId;
      }
      if (lastMessageTime) {
        params.last_message_time = lastMessageTime;
      }
      
      const response = await api.get('/support/chat/recent/', { params });
      const data = Array.isArray(response.data) ? response.data : response.data.results || [];
      
      // Debug: چاپ پیام‌های جدید (فقط در حالت development)
      if (process.env.NODE_ENV === 'development' && data.length > 0) {
        console.log('New messages from polling:', data.map((m: any) => ({
          uuid: m.uuid,
          is_staff: m.is_staff,
          session_id: m.session_id,
          sender_name: m.sender_name
        })));
      }
      
      if (data.length > 0) {
        // اضافه کردن پیام‌های جدید به لیست موجود (بدون تکرار)
        setMessages(prev => {
          const existingUuids = new Set(prev.map(m => m.uuid));
          const newMessages = data.filter((m: any) => !existingUuids.has(m.uuid));
          if (newMessages.length > 0) {
            // مرتب‌سازی پیام‌های جدید و اضافه کردن به لیست
            const allMessages = [...prev, ...newMessages];
            allMessages.sort((a: any, b: any) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
            // به‌روزرسانی lastMessageTime با آخرین پیام
            const sorted = [...allMessages].sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
            if (sorted.length > 0) {
              setLastMessageTime(sorted[0].created_at);
            }
            return allMessages;
          }
          return prev;
        });
      }
    } catch (error) {
      console.error('Error loading new messages:', error);
    }
  };
  
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newMessage.trim()) return;
    
    // For guest users, check if name/email is provided
    if (!isAuthenticated && !guestName && !guestEmail) {
      alert('لطفاً نام یا ایمیل خود را وارد کنید');
      return;
    }
    
    try {
      setIsLoading(true);
      const payload: any = {
        message: newMessage,
        session_id: sessionId,
      };
      
      if (!isAuthenticated) {
        if (guestName) payload.guest_name = guestName;
        if (guestEmail) payload.guest_email = guestEmail;
      }
      
      const response = await api.post('/support/chat/', payload);
      
      // استخراج session_id از response (اگر backend برگرداند)
      const responseData = response.data;
      if (responseData && responseData.session_id) {
        if (responseData.session_id !== sessionId) {
          setSessionId(responseData.session_id);
          // ذخیره در localStorage
          localStorage.setItem('chat_session_id', responseData.session_id);
        }
      }
      
      setNewMessage('');
      // Reload messages to get the new one (با session_id جدید)
      await loadMessages();
    } catch (error: any) {
      console.error('Error sending message:', error);
      alert(error.response?.data?.detail || 'خطا در ارسال پیام');
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleToggleChat = () => {
    setIsOpen(!isOpen);
    if (!isOpen) {
      // Load messages when opening
      loadMessages();
    }
  };
  
  return (
    <>
      {/* Chat Button - Fixed Position */}
      <button
        onClick={handleToggleChat}
        className={`fixed bottom-6 right-6 z-50 bg-blue-900 hover:bg-blue-800 text-white rounded-full p-4 shadow-lg transition-all duration-300 hover:scale-110 ${
          isOpen ? 'hidden' : 'block'
        }`}
        aria-label="Open Chat"
      >
        <ChatBubbleLeftRightIcon className="w-6 h-6" />
      </button>
      
      {/* Chat Window - Fixed Position */}
      {isOpen && (
        <div
          ref={chatContainerRef}
          className="fixed bottom-6 right-6 z-50 w-96 max-w-[calc(100vw-3rem)] h-[600px] max-h-[calc(100vh-3rem)] bg-white rounded-lg shadow-2xl flex flex-col border border-gray-200"
        >
          {/* Chat Header */}
          <div className="bg-blue-900 text-white p-4 rounded-t-lg flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-lg">
                {t('chat.title')}
              </h3>
              <p className="text-sm text-blue-100">
                {t('chat.subtitle')}
              </p>
            </div>
            <button
              onClick={handleToggleChat}
              className="text-white hover:text-gray-200 transition-colors"
              aria-label="Close Chat"
            >
              <XMarkIcon className="w-6 h-6" />
            </button>
          </div>
          
          {/* Messages Container */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
            {isLoading && messages.length === 0 ? (
              <div className="text-center text-gray-500 py-8">
                {t('chat.loading')}
              </div>
            ) : messages.length === 0 ? (
              <div className="text-center text-gray-500 py-8">
                {t('chat.noMessages')}
              </div>
            ) : (
              messages.map((msg) => {
                // اطمینان از اینکه is_staff به درستی boolean است
                // اگر user وجود دارد و is_staff true نیست، باید false باشد
                // اگر user وجود ندارد (مهمان) و is_staff true نیست، باید false باشد
                const isStaffMessage = Boolean(msg.is_staff);
                return (
                <div
                  key={msg.uuid}
                  className={`flex ${isStaffMessage ? 'justify-start' : 'justify-end'}`}
                >
                  <div
                    className={`max-w-[80%] rounded-lg p-3 ${
                      isStaffMessage
                        ? 'bg-blue-100 text-gray-800'
                        : 'bg-blue-600 text-white'
                    }`}
                  >
                    <div className="text-xs mb-1 opacity-75 flex items-center justify-between">
                      <div>
                        {isStaffMessage ? (
                          <span>{t('chat.staff')}</span>
                        ) : (
                          <span>{msg.sender_name}</span>
                        )}
                        <span className="mx-2">•</span>
                        <span>{msg.formatted_time}</span>
                      </div>
                      {!isStaffMessage && msg.is_read && (
                        <div className="flex items-center text-green-600" title="خوانده شده">
                          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                          <svg className="w-3 h-3 ml-0.5" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                          <span className="text-[10px] mr-1">خوانده شد</span>
                        </div>
                      )}
                    </div>
                    <div className="text-sm whitespace-pre-wrap break-words">
                      {msg.message}
                    </div>
                  </div>
                </div>
                );
              })
            )}
            <div ref={messagesEndRef} />
          </div>
          
          {/* Guest Info Form (for non-authenticated users) */}
          {!isAuthenticated && (
            <div className="px-4 py-2 bg-gray-100 border-t border-gray-200">
              <div className="flex gap-2 mb-2">
                <input
                  type="text"
                  placeholder={t('chat.guestName')}
                  value={guestName}
                  onChange={(e) => setGuestName(e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <input
                  type="email"
                  placeholder={t('chat.guestEmail')}
                  value={guestEmail}
                  onChange={(e) => setGuestEmail(e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          )}
          
          {/* Message Input */}
          <form onSubmit={handleSendMessage} className="p-4 border-t border-gray-200 bg-white rounded-b-lg">
            <div className="flex gap-2">
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder={t('chat.placeholder')}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-900"
                disabled={isLoading}
              />
              <button
                type="submit"
                disabled={isLoading || !newMessage.trim()}
                className="bg-blue-900 hover:bg-blue-800 text-white px-4 py-2 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <PaperAirplaneIcon className="w-5 h-5" />
              </button>
            </div>
          </form>
        </div>
      )}
    </>
  );
};

export default ChatWidget;

