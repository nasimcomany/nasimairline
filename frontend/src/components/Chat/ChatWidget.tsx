/**
 * Chat Widget Component - Online chat support
 * Fixed position at bottom right, follows scroll
 */
import React, { useState, useEffect, useRef } from 'react';
import { useLanguage } from '../../contexts/LanguageContext';
import { useChat } from '../../contexts/ChatContext';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';
import api from '../../services/api';
import {
  ChatBubbleLeftRightIcon,
  XMarkIcon,
  PaperAirplaneIcon,
  SignalIcon,
  BriefcaseIcon,
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
  const { t, language, fontClass } = useLanguage();
  const { isOpen, openChat, closeChat, chatMode, setChatMode } = useChat();
  const { isAuthenticated, user } = useSelector((state: RootState) => state.auth);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [guestName, setGuestName] = useState('');
  const [guestEmail, setGuestEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId, setSessionId] = useState<string>(propSessionId || '');
  const [lastMessageTime, setLastMessageTime] = useState<string>('');
  
  // Captcha state
  const [captcha, setCaptcha] = useState({ num1: 0, num2: 0, operator: '+', answer: 0 });
  const [captchaInput, setCaptchaInput] = useState('');
  const [showCaptcha, setShowCaptcha] = useState(false);
  const [captchaError, setCaptchaError] = useState('');
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  
  // Generate new captcha
  const generateCaptcha = () => {
    const num1 = Math.floor(Math.random() * 20) + 1;
    const num2 = Math.floor(Math.random() * 20) + 1;
    const operators = ['+', '-'];
    const operator = operators[Math.floor(Math.random() * operators.length)];
    const answer = operator === '+' ? num1 + num2 : num1 - num2;
    setCaptcha({ num1, num2, operator, answer });
    setCaptchaInput('');
    setCaptchaError('');
  };

  // Generate captcha when chat opens or when needed
  useEffect(() => {
    if (isOpen) {
      generateCaptcha();
      setShowCaptcha(false);
    }
  }, [isOpen]);
  
  // Session ID: استفاده از sessionStorage برای مهمانان (با بستن تب پاک می‌شود) تا چت یک نفر به دیگری نمایش داده نشود
  const storageKey = 'chat_session_id';
  useEffect(() => {
    if (isAuthenticated) {
      sessionStorage.removeItem(storageKey);
      localStorage.removeItem(storageKey);
      setSessionId('');
      setMessages([]);
      setLastMessageTime('');
    } else if (!propSessionId) {
      const stored = sessionStorage.getItem(storageKey);
      if (stored) {
        setSessionId(stored);
      } else {
        const newSessionId = `guest_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        setSessionId(newSessionId);
        sessionStorage.setItem(storageKey, newSessionId);
      }
    }
  }, [isAuthenticated, propSessionId]);
  
  // Load initial messages when chat opens
  useEffect(() => {
    if (isOpen) {
      loadMessages();
    }
  }, [isOpen]);
  
  // Polling for new messages (برای مهمان sessionId لازم است؛ برای کاربر لاگین‌شده backend بر اساس user فیلتر می‌کند)
  useEffect(() => {
    if (isOpen && (sessionId || isAuthenticated)) {
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
  }, [isOpen, sessionId, isAuthenticated]);
  
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
      let currentSessionId = sessionId || (isAuthenticated ? '' : sessionStorage.getItem(storageKey) || '');
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
              if (!isAuthenticated) sessionStorage.setItem(storageKey, newSessionId);
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
      const currentSessionId = sessionId || (isAuthenticated ? '' : sessionStorage.getItem(storageKey) || '');
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

    // Check if captcha needs to be shown/validated
    if (!showCaptcha) {
      // Show captcha before sending first message
      setShowCaptcha(true);
      return;
    }

    // Validate captcha
    if (parseInt(captchaInput) !== captcha.answer) {
      setCaptchaError('کپچا اشتباه است. لطفاً دوباره تلاش کنید.');
      generateCaptcha();
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
      
      if (chatMode === 'luggage_tracking') {
        payload.metadata = { request_type: 'luggage_tracking' };
      }
      
      const response = await api.post('/support/chat/', payload);
      
      // استخراج session_id از response (اگر backend برگرداند)
      const responseData = response.data;
      if (responseData && responseData.session_id) {
        if (responseData.session_id !== sessionId) {
          setSessionId(responseData.session_id);
          if (!isAuthenticated) sessionStorage.setItem(storageKey, responseData.session_id);
        }
      }
      
      setNewMessage('');
      setCaptchaInput('');
      setShowCaptcha(false);
      generateCaptcha();
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
    if (isOpen) {
      closeChat();
    } else {
      openChat();
    }
  };

  const handleMessageInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewMessage(e.target.value);
    // Show captcha when user starts typing
    if (!showCaptcha && e.target.value.trim().length > 0) {
      setShowCaptcha(true);
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
          className="fixed bottom-6 right-6 z-50 w-96 max-w-[calc(100vw-3rem)] h-[600px] max-h-[calc(100vh-3rem)] bg-white rounded-lg shadow-2xl flex flex-col border border-gray-200 overflow-hidden"
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
          
          {/* VPN Tip - Minimal & Chic */}
          <div 
            className="flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-blue-100/50"
            style={{ direction: language === 'en' ? 'ltr' : 'rtl' }}
          >
            <SignalIcon className="w-4 h-4 text-blue-600 flex-shrink-0" />
            <p className={`text-xs text-blue-800/90 leading-snug ${fontClass}`}>
              {t('chat.vpnTip')}
            </p>
          </div>
          
          {/* Luggage Tracking - Optional: clickable card when normal, expanded block when selected */}
          {chatMode === 'normal' ? (
            <button
              type="button"
              onClick={() => setChatMode('luggage_tracking')}
              className="w-full flex items-center justify-between gap-2 px-3 py-2.5 bg-gradient-to-r from-amber-50/90 to-orange-50/90 hover:from-amber-100 hover:to-orange-100 border-b border-amber-200/50 transition-colors text-left"
              style={{ direction: language === 'en' ? 'ltr' : 'rtl' }}
            >
              <div className="flex items-center gap-2 min-w-0">
                <BriefcaseIcon className="w-4 h-4 text-amber-600 flex-shrink-0" />
                <span className={`text-xs text-amber-900 ${fontClass}`}>
                  {t('chat.luggageTrackingOption')} — {t('chat.luggageTrackingClickHere')}
                </span>
              </div>
              <span className="text-[10px] text-amber-600 font-medium whitespace-nowrap">→</span>
            </button>
          ) : (
            <div 
              className="px-3 py-3 bg-gradient-to-r from-amber-50/80 to-orange-50/80 border-b border-amber-200/60"
              style={{ direction: language === 'en' ? 'ltr' : 'rtl' }}
            >
              <div className="flex items-center justify-between gap-2 mb-2">
                <div className="flex items-center gap-2 min-w-0">
                  <BriefcaseIcon className="w-4 h-4 text-amber-600 flex-shrink-0" />
                  <span className={`text-sm font-medium text-amber-900 ${fontClass}`}>
                    {t('chat.luggageTrackingTitle')}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setChatMode('normal')}
                  className="text-[11px] text-amber-700 hover:text-amber-900 font-medium underline flex-shrink-0"
                >
                  {t('chat.luggageTrackingClose')}
                </button>
              </div>
              <p className={`text-xs text-amber-700/80 mb-0 ${fontClass}`}>
                {t('chat.luggageTrackingPlaceholder')}
              </p>
            </div>
          )}
          
          {/* Messages Container */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50 min-h-0">
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
            <div className="px-3 py-2 bg-gray-100 border-t border-gray-200 flex-shrink-0">
              <div className="flex gap-2 w-full">
                <input
                  type="text"
                  placeholder={t('chat.guestName')}
                  value={guestName}
                  onChange={(e) => setGuestName(e.target.value)}
                  className="flex-1 min-w-0 px-2 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <input
                  type="email"
                  placeholder={t('chat.guestEmail')}
                  value={guestEmail}
                  onChange={(e) => setGuestEmail(e.target.value)}
                  className="flex-1 min-w-0 px-2 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          )}
          
          {/* Message Input */}
          <form onSubmit={handleSendMessage} className="p-4 border-t border-gray-200 bg-white rounded-b-lg flex-shrink-0">
            {/* Captcha - Show when user starts typing */}
            {showCaptcha && (
              <div className="mb-3 pb-3 border-b border-gray-200">
                <label className="block text-sm font-semibold text-gray-700 mb-2 persian-font-vazir">
                  کپچا
                </label>
                <div className="flex items-center gap-2">
                  <div className="flex-1 bg-blue-50 border-2 border-blue-200 rounded-lg p-2 text-center">
                    <span className="text-lg font-bold text-blue-900 persian-font-vazir" style={{ direction: 'ltr' }}>
                      ? = {captcha.num1} {captcha.operator} {captcha.num2}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={generateCaptcha}
                    className="px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-xs persian-font-vazir"
                  >
                    تغییر
                  </button>
                </div>
                <input
                  type="number"
                  value={captchaInput}
                  onChange={(e) => {
                    setCaptchaInput(e.target.value);
                    setCaptchaError('');
                  }}
                  placeholder="پاسخ را وارد کنید"
                  className="w-full mt-2 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-900 persian-font-vazir"
                  style={{ direction: 'ltr', textAlign: 'right' }}
                  required={showCaptcha}
                />
                {captchaError && (
                  <p className="text-red-500 text-xs mt-1 persian-font-vazir">{captchaError}</p>
                )}
              </div>
            )}
            
            <div className="flex gap-2">
              <input
                type="text"
                value={newMessage}
                onChange={handleMessageInputChange}
                placeholder={t('chat.placeholder')}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-900"
                disabled={isLoading}
              />
              <button
                type="submit"
                disabled={isLoading || !newMessage.trim() || (showCaptcha && !captchaInput.trim())}
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
