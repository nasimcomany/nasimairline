/**
 * Support Request Page - Create and view support requests
 */
import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import EmiratesHeader from '../components/Layout/EmiratesHeader';
import CustomSelect from '../components/CustomSelect/CustomSelect';
import { useLanguage } from '../contexts/LanguageContext';
import { ticketService, CreateTicketData } from '../services/ticketService';
import { AppDispatch, RootState } from '../store';
import { 
  TicketIcon, 
  ChatBubbleLeftRightIcon,
  ExclamationCircleIcon,
  CheckCircleIcon,
  PhoneIcon,
  XMarkIcon,
  DocumentTextIcon,
  PaperAirplaneIcon
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

  // Support request categories mapping
  const getTicketCategories = () => [
    { value: 'HR', label: t('ticket.category.hr') },
    { value: 'FEEDBACK', label: t('ticket.category.feedback') },
    { value: 'MISC', label: t('ticket.category.misc') },
    { value: 'SECURITY', label: t('ticket.category.security') },
    { value: 'BOOKING', label: t('ticket.category.booking') },
    { value: 'FLIGHT', label: t('ticket.category.flight') },
    { value: 'PAYMENT', label: t('ticket.category.payment') },
  ];
  
  const getPriorityOptions = () => [
    { value: 'LOW', label: t('ticket.priority.low') },
    { value: 'NORMAL', label: t('ticket.priority.normal') },
    { value: 'HIGH', label: t('ticket.priority.high') },
    { value: 'URGENT', label: t('ticket.priority.urgent') },
  ];

  useEffect(() => {
    // Load security contact info
    loadSecurityContact();
    
    // Load user requests if authenticated
    if (activeTab === 'my-tickets' && isAuthenticated) {
      loadMyTickets();
    }
  }, [isAuthenticated, activeTab]);

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
      setError(t('ticket.errorLoading'));
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
        alert(`${t('ticket.securityContact')}:\n${securityPhone}`);
      }
      return;
    }

    if (!formData.title || !formData.description) {
      setError(t('ticket.pleaseFillFields'));
      return;
    }

    try {
      setLoading(true);
      const ticket = await ticketService.createTicket(formData);
      setSuccess(t('ticket.submitSuccess'));
      setFormData({
        title: '',
        description: '',
        category: 'MISC',
        priority: 'NORMAL',
        source: 'WEB',
      });
      // Reload requests
      if (activeTab === 'my-tickets') {
        await loadMyTickets();
      }
    } catch (error: any) {
      setError(error.response?.data?.detail || t('ticket.submitError'));
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

  return (
    <div className="min-h-screen bg-white">
      <EmiratesHeader />
      
      {/* Hero Section - Similar to ComplaintPage */}
      <section className="relative min-h-[40vh] sm:min-h-[60vh] flex items-center justify-center overflow-hidden bg-gradient-to-br from-blue-900 via-blue-800 to-blue-900">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)',
            backgroundSize: '40px 40px'
          }}></div>
        </div>
        
        {/* Content */}
        <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 text-center">
          {/* Logo */}
          <div className="flex justify-center mb-4 sm:mb-6">
            <img 
              src="/images/nasim0.png" 
              alt="نسیم ایر" 
              className="h-40 sm:h-60 md:h-80 w-auto object-contain"
              style={{ 
                filter: 'drop-shadow(2px 2px 8px rgba(0,0,0,0.5))'
              }}
            />
          </div>
          
          <h1 
            className="text-white mb-6"
            style={{ 
              fontFamily: 'DigiHamisheBold, Arial, sans-serif',
              fontSize: 'clamp(2.5rem, 8vw, 4rem)',
              fontWeight: 'bold',
              lineHeight: '1.2',
              textShadow: '2px 2px 8px rgba(0,0,0,0.5)',
              direction: 'rtl'
            }}
          >
            {language === 'en' ? 'Support Requests' : language === 'ar' ? 'طلبات الدعم' : 'پشتیبانی و درخواست‌ها'}
          </h1>
          <p 
            className="text-white/90 mb-8"
            style={{ 
              fontFamily: 'DigiHamisheBold, Arial, sans-serif',
              fontSize: 'clamp(1.2rem, 3vw, 1.5rem)',
              fontWeight: 'normal',
              lineHeight: '1.6',
              textShadow: '1px 1px 4px rgba(0,0,0,0.5)',
              direction: 'rtl'
            }}
          >
            {language === 'en' 
              ? 'Create a support request or view your existing requests' 
              : language === 'ar' 
              ? 'إنشاء طلب دعم أو عرض طلباتك الموجودة'
              : 'درخواست پشتیبانی ایجاد کنید یا درخواست‌های خود را مشاهده کنید'}
          </p>
        </div>
      </section>

      <div className="container mx-auto px-4 sm:px-6 py-4 sm:py-8">
        <div className="max-w-6xl mx-auto">

          {/* Tabs */}
          <div className="flex space-x-2 sm:space-x-4 mb-4 sm:mb-6 border-b border-gray-200 overflow-x-auto">
            <button
              onClick={() => setActiveTab('create')}
              className={`px-3 sm:px-6 py-2 sm:py-3 text-sm sm:text-base font-medium transition-colors whitespace-nowrap ${
                activeTab === 'create'
                  ? 'text-blue-900 border-b-2 border-blue-900'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
              style={{ fontFamily: 'DigiHamisheBold, Arial, sans-serif', direction: language === 'en' ? 'ltr' : 'rtl' }}
            >
              {t('ticket.createTicket')}
            </button>
            <button
              onClick={() => {
                setActiveTab('my-tickets');
                if (isAuthenticated) {
                  loadMyTickets();
                }
              }}
              className={`px-3 sm:px-6 py-2 sm:py-3 text-sm sm:text-base font-medium transition-colors whitespace-nowrap ${
                activeTab === 'my-tickets'
                  ? 'text-blue-900 border-b-2 border-blue-900'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
              style={{ fontFamily: 'DigiHamisheBold, Arial, sans-serif', direction: language === 'en' ? 'ltr' : 'rtl' }}
            >
              {t('ticket.myTickets')}
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

          {/* Create Support Request Form */}
          {activeTab === 'create' && (
            <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
              <div className="bg-gradient-to-r from-blue-900 to-blue-800 px-4 sm:px-6 py-3 sm:py-4">
                <h2 
                  className="text-white text-lg sm:text-2xl font-bold"
                  style={{ 
                    fontFamily: 'DigiHamisheBold, Arial, sans-serif',
                    direction: language === 'en' ? 'ltr' : 'rtl'
                  }}
                >
                  {t('ticket.formTitle')}
                </h2>
              </div>
              <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4 sm:space-y-6">
                {/* Category */}
                <div>
                  <label className="flex items-center gap-2 mb-2 text-xs sm:text-sm text-gray-700" style={{ fontFamily: 'DigiHamisheBold, Arial, sans-serif', direction: language === 'en' ? 'ltr' : 'rtl' }}>
                    <TicketIcon className="w-4 h-4 sm:w-5 sm:h-5 text-blue-900" />
                    {t('ticket.category')}
                  </label>
                  <CustomSelect
                    value={formData.category}
                    onChange={(value) => setFormData({ ...formData, category: value as any })}
                    options={getTicketCategories()}
                    required
                  />
                </div>

                {/* Security Notice */}
                {formData.category === 'SECURITY' && securityPhone && (
                  <div className="p-3 sm:p-4 bg-yellow-50 border border-yellow-200 rounded-lg flex items-start gap-2 sm:gap-3">
                    <PhoneIcon className="h-4 w-4 sm:h-5 sm:w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium text-xs sm:text-sm text-yellow-800" style={{ direction: language === 'en' ? 'ltr' : 'rtl' }}>
                        {language === 'en' ? 'Contact Security' : language === 'ar' ? 'اتصل بالأمن' : 'ارتباط با حراست'}
                      </p>
                      <p className="text-xs sm:text-sm text-yellow-700 mt-1" style={{ direction: language === 'en' ? 'ltr' : 'rtl' }}>
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
                  <label className="flex items-center gap-2 mb-2 text-xs sm:text-sm text-gray-700" style={{ fontFamily: 'DigiHamisheBold, Arial, sans-serif', direction: language === 'en' ? 'ltr' : 'rtl' }}>
                    <DocumentTextIcon className="w-4 h-4 sm:w-5 sm:h-5 text-blue-900" />
                    {t('ticket.title')} <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-900 focus:border-blue-900 transition-all"
                    style={{ fontFamily: 'DigiHamisheBold, Arial, sans-serif', direction: language === 'en' ? 'ltr' : 'rtl' }}
                    placeholder={t('ticket.titlePlaceholder')}
                    required={formData.category !== 'SECURITY'}
                    disabled={formData.category === 'SECURITY'}
                  />
                </div>

                {/* Description */}
                <div>
                  <label className="flex items-center gap-2 mb-2 text-xs sm:text-sm text-gray-700" style={{ fontFamily: 'DigiHamisheBold, Arial, sans-serif', direction: language === 'en' ? 'ltr' : 'rtl' }}>
                    <DocumentTextIcon className="w-4 h-4 sm:w-5 sm:h-5 text-blue-900" />
                    {t('ticket.description')} <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={6}
                    className="w-full px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-900 focus:border-blue-900 transition-all resize-none"
                    style={{ fontFamily: 'DigiHamisheBold, Arial, sans-serif', direction: language === 'en' ? 'ltr' : 'rtl' }}
                    placeholder={t('ticket.descriptionPlaceholder')}
                    required={formData.category !== 'SECURITY'}
                    disabled={formData.category === 'SECURITY'}
                  />
                </div>

                {/* Priority */}
                <div>
                  <label className="flex items-center gap-2 mb-2 text-xs sm:text-sm text-gray-700" style={{ fontFamily: 'DigiHamisheBold, Arial, sans-serif', direction: language === 'en' ? 'ltr' : 'rtl' }}>
                    <ExclamationCircleIcon className="w-4 h-4 sm:w-5 sm:h-5 text-blue-900" />
                    {t('ticket.priority')}
                  </label>
                  <CustomSelect
                    value={formData.priority || 'NORMAL'}
                    onChange={(value) => setFormData({ ...formData, priority: value as any })}
                    options={getPriorityOptions()}
                    disabled={formData.category === 'SECURITY'}
                  />
                </div>

                {/* Submit Button */}
                <div className="flex justify-center pt-2 sm:pt-4">
                  <button
                    type="submit"
                    disabled={loading || formData.category === 'SECURITY'}
                    className="w-full sm:w-auto bg-blue-900 hover:bg-blue-800 text-white font-semibold px-6 sm:px-12 py-3 sm:py-4 rounded-lg transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 sm:gap-3 text-sm sm:text-base"
                    style={{ 
                      fontFamily: 'DigiHamisheBold, Arial, sans-serif',
                      direction: language === 'en' ? 'ltr' : 'rtl'
                    }}
                  >
                    {loading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 sm:h-5 sm:w-5 border-b-2 border-white"></div>
                        {t('ticket.loading')}
                      </>
                    ) : (
                      <>
                        <PaperAirplaneIcon className="w-4 h-4 sm:w-5 sm:h-5" />
                        {t('ticket.submit')}
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* My Requests List */}
          {activeTab === 'my-tickets' && (
            <div className="bg-white rounded-lg shadow-lg p-4 sm:p-6">
              {loading ? (
                <div className="text-center py-8">
                  <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  <p className="mt-4 text-gray-600">
                    {language === 'en' ? 'Loading requests...' : language === 'ar' ? 'جارٍ تحميل الطلبات...' : 'در حال بارگذاری درخواست‌ها...'}
                  </p>
                </div>
              ) : myTickets.length === 0 ? (
                <div className="text-center py-8">
                  <TicketIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">
                    {language === 'en' ? 'No requests found' : language === 'ar' ? 'لم يتم العثور على طلبات' : 'درخواستی یافت نشد'}
                  </p>
                </div>
              ) : (
                <div className="space-y-3 sm:space-y-4">
                  {myTickets.map((ticket) => (
                    <div
                      key={ticket.uuid}
                      className="border border-gray-200 rounded-lg p-3 sm:p-4 hover:shadow-md transition-shadow"
                    >
                      <div className="flex flex-col sm:flex-row items-start justify-between gap-3 sm:gap-0">
                        <div className="flex-1 w-full sm:w-auto">
                          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-1 sm:gap-2 mb-2">
                            <h3 className="text-base sm:text-lg font-semibold text-gray-900">{ticket.title}</h3>
                            <span className="text-xs sm:text-sm text-gray-500">#{ticket.reference}</span>
                          </div>
                          <p className="text-sm sm:text-base text-gray-600 mb-2 sm:mb-3 line-clamp-2">{ticket.description}</p>
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

