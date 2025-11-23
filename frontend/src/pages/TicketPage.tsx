/**
 * Ticket Page - Create and view support tickets
 */
import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import GlassmorphismHeader from '../components/Layout/GlassmorphismHeader';
import { useLanguage } from '../contexts/LanguageContext';
import { ticketService, CreateTicketData } from '../services/ticketService';
import { AppDispatch, RootState } from '../store';
import { 
  TicketIcon, 
  ChatBubbleLeftRightIcon,
  ExclamationCircleIcon,
  CheckCircleIcon,
  PhoneIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';

const TicketPage: React.FC = () => {
  const { t, language } = useLanguage();
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const { isAuthenticated, user } = useSelector((state: RootState) => state.auth);
  
  const [activeTab, setActiveTab] = useState<'create' | 'my-tickets'>('create');
  const [categories, setCategories] = useState<any[]>([]);
  const [myTickets, setMyTickets] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [securityPhone, setSecurityPhone] = useState<string | null>(null);
  
  // Form state
  const [formData, setFormData] = useState<CreateTicketData>({
    title: '',
    description: '',
    category: 'MISC',
    priority: 'NORMAL',
    source: 'WEB',
  });

  // Ticket categories mapping
  const ticketCategories = [
    { value: 'HR', label: 'همکاری با ما', description: 'برای درخواست همکاری با منابع انسانی' },
    { value: 'FEEDBACK', label: 'انتقادات و پیشنهادات', description: 'برای ارسال انتقادات و پیشنهادات به روابط عمومی' },
    { value: 'MISC', label: 'متفرقه', description: 'سوالات و درخواست‌های متفرقه' },
    { value: 'SECURITY', label: 'ارتباط با حراست', description: 'برای ارتباط با حراست' },
    { value: 'BOOKING', label: 'رزرو بلیط', description: 'مشکلات مربوط به رزرو بلیط' },
    { value: 'FLIGHT', label: 'پرواز', description: 'سوالات و مشکلات مربوط به پرواز' },
    { value: 'PAYMENT', label: 'پرداخت', description: 'مشکلات مربوط به پرداخت' },
  ];

  useEffect(() => {
    // Check authentication
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    // Load security contact info
    loadSecurityContact();
    
    // Load user tickets
    if (activeTab === 'my-tickets') {
      loadMyTickets();
    }
  }, [isAuthenticated, activeTab, navigate]);

  const loadSecurityContact = async () => {
    try {
      const info = await ticketService.getSecurityContact();
      setSecurityPhone(info.phone);
    } catch (error) {
      console.error('Error loading security contact:', error);
    }
  };

  const loadMyTickets = async () => {
    try {
      setLoading(true);
      const tickets = await ticketService.getMyTickets();
      setMyTickets(tickets);
    } catch (error: any) {
      setError('خطا در بارگذاری تیکت‌ها');
      console.error('Error loading tickets:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    // Special handling for security category
    if (formData.category === 'SECURITY') {
      if (securityPhone) {
        alert(`برای ارتباط با حراست با شماره زیر تماس بگیرید:\n${securityPhone}`);
      }
      return;
    }

    if (!formData.title || !formData.description) {
      setError('لطفاً عنوان و توضیحات را وارد کنید');
      return;
    }

    try {
      setLoading(true);
      const ticket = await ticketService.createTicket(formData);
      setSuccess(`تیکت شما با شماره ${ticket.reference} با موفقیت ایجاد شد`);
      setFormData({
        title: '',
        description: '',
        category: 'MISC',
        priority: 'NORMAL',
        source: 'WEB',
      });
      // Reload tickets
      if (activeTab === 'my-tickets') {
        await loadMyTickets();
      }
    } catch (error: any) {
      setError(error.response?.data?.detail || 'خطا در ایجاد تیکت');
      console.error('Error creating ticket:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'OPEN':
        return 'bg-blue-100 text-blue-800';
      case 'IN_PROGRESS':
        return 'bg-yellow-100 text-yellow-800';
      case 'RESOLVED':
        return 'bg-green-100 text-green-800';
      case 'CLOSED':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'CRITICAL':
        return 'bg-red-100 text-red-800';
      case 'URGENT':
        return 'bg-orange-100 text-orange-800';
      case 'HIGH':
        return 'bg-yellow-100 text-yellow-800';
      case 'NORMAL':
        return 'bg-blue-100 text-blue-800';
      case 'LOW':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <GlassmorphismHeader />
      
      <div className="container mx-auto px-4 py-8 mt-20">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">
              {language === 'en' ? 'Support Tickets' : language === 'ar' ? 'تذاكر الدعم' : 'پشتیبانی و تیکتینگ'}
            </h1>
            <p className="text-gray-600">
              {language === 'en' 
                ? 'Create a support ticket or view your existing tickets' 
                : language === 'ar' 
                ? 'إنشاء تذكرة دعم أو عرض تذاكرك الموجودة'
                : 'تیکت پشتیبانی ایجاد کنید یا تیکت‌های خود را مشاهده کنید'}
            </p>
          </div>

          {/* Tabs */}
          <div className="flex space-x-4 mb-6 border-b border-gray-200">
            <button
              onClick={() => setActiveTab('create')}
              className={`px-6 py-3 font-medium transition-colors ${
                activeTab === 'create'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              {language === 'en' ? 'Create Ticket' : language === 'ar' ? 'إنشاء تذكرة' : 'ایجاد تیکت'}
            </button>
            <button
              onClick={() => {
                setActiveTab('my-tickets');
                loadMyTickets();
              }}
              className={`px-6 py-3 font-medium transition-colors ${
                activeTab === 'my-tickets'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              {language === 'en' ? 'My Tickets' : language === 'ar' ? 'تذاكري' : 'تیکت‌های من'}
            </button>
          </div>

          {/* Error/Success Messages */}
          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center">
              <ExclamationCircleIcon className="h-5 w-5 text-red-600 mr-2" />
              <span className="text-red-800">{error}</span>
              <button onClick={() => setError(null)} className="ml-auto">
                <XMarkIcon className="h-5 w-5 text-red-600" />
              </button>
            </div>
          )}

          {success && (
            <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center">
              <CheckCircleIcon className="h-5 w-5 text-green-600 mr-2" />
              <span className="text-green-800">{success}</span>
              <button onClick={() => setSuccess(null)} className="ml-auto">
                <XMarkIcon className="h-5 w-5 text-green-600" />
              </button>
            </div>
          )}

          {/* Create Ticket Form */}
          {activeTab === 'create' && (
            <div className="bg-white rounded-lg shadow-lg p-6">
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Category */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {language === 'en' ? 'Category' : language === 'ar' ? 'الفئة' : 'دسته‌بندی'}
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value as any })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  >
                    {ticketCategories.map((cat) => (
                      <option key={cat.value} value={cat.value}>
                        {cat.label} - {cat.description}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Security Notice */}
                {formData.category === 'SECURITY' && securityPhone && (
                  <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg flex items-start">
                    <PhoneIcon className="h-5 w-5 text-yellow-600 mr-2 mt-0.5" />
                    <div>
                      <p className="font-medium text-yellow-800">
                        {language === 'en' ? 'Contact Security' : language === 'ar' ? 'اتصل بالأمن' : 'ارتباط با حراست'}
                      </p>
                      <p className="text-yellow-700 mt-1">
                        {language === 'en' 
                          ? `Please contact security at: ${securityPhone}`
                          : language === 'ar'
                          ? `يرجى الاتصال بالأمن على: ${securityPhone}`
                          : `لطفاً با حراست تماس بگیرید: ${securityPhone}`}
                      </p>
                    </div>
                  </div>
                )}

                {/* Title */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {language === 'en' ? 'Title' : language === 'ar' ? 'العنوان' : 'عنوان'}
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder={language === 'en' ? 'Enter ticket title' : language === 'ar' ? 'أدخل عنوان التذكرة' : 'عنوان تیکت را وارد کنید'}
                    required={formData.category !== 'SECURITY'}
                    disabled={formData.category === 'SECURITY'}
                  />
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {language === 'en' ? 'Description' : language === 'ar' ? 'الوصف' : 'توضیحات'}
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={6}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder={language === 'en' ? 'Describe your issue or request' : language === 'ar' ? 'اوصف مشكلتك أو طلبك' : 'مشکل یا درخواست خود را توضیح دهید'}
                    required={formData.category !== 'SECURITY'}
                    disabled={formData.category === 'SECURITY'}
                  />
                </div>

                {/* Priority */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {language === 'en' ? 'Priority' : language === 'ar' ? 'الأولوية' : 'اولویت'}
                  </label>
                  <select
                    value={formData.priority}
                    onChange={(e) => setFormData({ ...formData, priority: e.target.value as any })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    disabled={formData.category === 'SECURITY'}
                  >
                    <option value="LOW">{language === 'en' ? 'Low' : language === 'ar' ? 'منخفض' : 'کم'}</option>
                    <option value="NORMAL">{language === 'en' ? 'Normal' : language === 'ar' ? 'عادي' : 'عادی'}</option>
                    <option value="HIGH">{language === 'en' ? 'High' : language === 'ar' ? 'عالي' : 'بالا'}</option>
                    <option value="URGENT">{language === 'en' ? 'Urgent' : language === 'ar' ? 'عاجل' : 'فوری'}</option>
                    <option value="CRITICAL">{language === 'en' ? 'Critical' : language === 'ar' ? 'حرج' : 'بحرانی'}</option>
                  </select>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={loading || formData.category === 'SECURITY'}
                  className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center"
                >
                  {loading ? (
                    <span>{language === 'en' ? 'Creating...' : language === 'ar' ? 'جارٍ الإنشاء...' : 'در حال ایجاد...'}</span>
                  ) : (
                    <span>{language === 'en' ? 'Create Ticket' : language === 'ar' ? 'إنشاء تذكرة' : 'ایجاد تیکت'}</span>
                  )}
                </button>
              </form>
            </div>
          )}

          {/* My Tickets List */}
          {activeTab === 'my-tickets' && (
            <div className="bg-white rounded-lg shadow-lg p-6">
              {loading ? (
                <div className="text-center py-8">
                  <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  <p className="mt-4 text-gray-600">
                    {language === 'en' ? 'Loading tickets...' : language === 'ar' ? 'جارٍ تحميل التذاكر...' : 'در حال بارگذاری تیکت‌ها...'}
                  </p>
                </div>
              ) : myTickets.length === 0 ? (
                <div className="text-center py-8">
                  <TicketIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">
                    {language === 'en' ? 'No tickets found' : language === 'ar' ? 'لم يتم العثور على تذاكر' : 'تیکتی یافت نشد'}
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {myTickets.map((ticket) => (
                    <div
                      key={ticket.uuid}
                      className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <h3 className="text-lg font-semibold text-gray-900">{ticket.title}</h3>
                            <span className="text-sm text-gray-500">#{ticket.reference}</span>
                          </div>
                          <p className="text-gray-600 mb-3 line-clamp-2">{ticket.description}</p>
                          <div className="flex flex-wrap gap-2">
                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(ticket.status)}`}>
                              {ticket.status}
                            </span>
                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${getPriorityColor(ticket.priority)}`}>
                              {ticket.priority}
                            </span>
                            {ticket.message_count > 0 && (
                              <span className="px-3 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800 flex items-center">
                                <ChatBubbleLeftRightIcon className="h-3 w-3 mr-1" />
                                {ticket.message_count} {language === 'en' ? 'messages' : language === 'ar' ? 'رسائل' : 'پیام'}
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="text-right text-sm text-gray-500">
                          {new Date(ticket.created_at).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TicketPage;

