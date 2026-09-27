import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppSelector } from '../store/hooks';
import EmiratesHeader from '../components/Layout/EmiratesHeader';
import { useLanguage } from '../contexts/LanguageContext';
import { 
  WalletIcon,
  PlusIcon,
  ArrowDownTrayIcon,
  CreditCardIcon,
  BuildingLibraryIcon,
  BanknotesIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon
} from '@heroicons/react/24/outline';
import api from '../services/api';

interface Transaction {
  id: number;
  amount: number;
  type: 'charge' | 'payment' | 'refund';
  status: 'success' | 'pending' | 'failed';
  gateway?: string;
  created_at: string;
  description?: string;
}

const WalletPage: React.FC = () => {
  const { user, isAuthenticated } = useAppSelector((state) => state.auth);
  const navigate = useNavigate();
  const { t, fontClass, language } = useLanguage();
  
  const [walletBalance, setWalletBalance] = useState<number>(0);
  const [chargeAmount, setChargeAmount] = useState<string>('');
  const [selectedGateway, setSelectedGateway] = useState<string>('');
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(false);
  const [showChargeModal, setShowChargeModal] = useState(false);
  const [showMessage, setShowMessage] = useState(false);

  // Payment gateways
  const paymentGateways = [
    { id: 'zarinpal', name: 'زرین‌پال', logo: '/images/payment-gateways/zarinpal.png', color: 'bg-green-500' },
    { id: 'pep', name: 'پی‌پینگ', logo: '/images/payment-gateways/pep.png', color: 'bg-blue-500' },
    { id: 'saman', name: 'سامان', logo: '/images/payment-gateways/saman.png', color: 'bg-purple-500' },
    { id: 'mellat', name: 'ملت', logo: '/images/payment-gateways/mellat.png', color: 'bg-orange-500' },
    { id: 'parsian', name: 'پارسیان', logo: '/images/payment-gateways/parsian.png', color: 'bg-indigo-500' }
  ];

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    fetchWalletData();
  }, [isAuthenticated, navigate]);

  const fetchWalletData = async () => {
    try {
      setLoading(true);
      // Fetch wallet balance
      const balanceResponse = await api.get('/accounts/wallet/balance/');
      setWalletBalance(balanceResponse.data.balance || 0);
      
      // Fetch transactions
      const transactionsResponse = await api.get('/accounts/wallet/transactions/');
      setTransactions(transactionsResponse.data.results || []);
    } catch (error: any) {
      console.error('Error fetching wallet data:', error);
      // If API doesn't exist yet, use mock data
      setWalletBalance(0);
      setTransactions([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCharge = async () => {
    if (!chargeAmount || !selectedGateway || parseFloat(chargeAmount) <= 0) {
      alert(language === 'fa' ? 'لطفاً مبلغ و درگاه پرداخت را انتخاب کنید' : 'Please select amount and payment gateway');
      return;
    }

    // TODO: When backend is ready, uncomment this code to enable actual payment
    // try {
    //   setLoading(true);
    //   const response = await api.post('/accounts/wallet/charge/', {
    //     amount: parseFloat(chargeAmount),
    //     gateway: selectedGateway
    //   });
    //   
    //   // Redirect to payment gateway
    //   if (response.data.payment_url) {
    //     window.location.href = response.data.payment_url;
    //   }
    // } catch (error: any) {
    //   console.error('Error charging wallet:', error);
    //   alert(language === 'fa' ? 'خطا در شارژ کیف پول' : 'Error charging wallet');
    // } finally {
    //   setLoading(false);
    // }

    // Temporary: Show message that charging is not available
    setShowMessage(true);
    
    // Hide message after 5 seconds
    setTimeout(() => {
      setShowMessage(false);
    }, 5000);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fa-IR').format(amount) + ' تومان';
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fa-IR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getTransactionStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckCircleIcon className="w-5 h-5 text-green-500" />;
      case 'pending':
        return <ClockIcon className="w-5 h-5 text-yellow-500" />;
      case 'failed':
        return <XCircleIcon className="w-5 h-5 text-red-500" />;
      default:
        return null;
    }
  };

  const getTransactionTypeText = (type: string) => {
    switch (type) {
      case 'charge':
        return language === 'fa' ? 'شارژ' : 'Charge';
      case 'payment':
        return language === 'fa' ? 'پرداخت' : 'Payment';
      case 'refund':
        return language === 'fa' ? 'بازگشت وجه' : 'Refund';
      default:
        return type;
    }
  };

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 via-blue-500 to-indigo-600">
      <EmiratesHeader />
      
      <div className="container mx-auto px-4 pt-28 pb-8">
        <div className="max-w-4xl mx-auto">
          {/* Wallet Balance Card - Compact */}
          <div className="bg-white rounded-xl shadow-xl p-5 mb-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 mb-1 text-xs" style={{ fontFamily: 'DigiHamishe, DigiHamisheBold, sans-serif' }}>
                  {language === 'fa' ? 'موجودی' : 'Balance'}
                </p>
                <p className="text-3xl font-bold text-blue-600" style={{ fontFamily: 'DigiHamishe, DigiHamisheBold, sans-serif' }}>
                  {formatCurrency(walletBalance)}
                </p>
              </div>
              <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full p-3">
                <WalletIcon className="w-10 h-10 text-white" />
              </div>
            </div>
          </div>

          {/* Charge Wallet Section - Compact */}
          <div className="bg-white rounded-xl shadow-xl p-5 mb-5">
            <h2 className={`text-lg font-bold text-blue-600 mb-3 ${fontClass}`} style={{ fontFamily: 'DigiHamishe, DigiHamisheBold, sans-serif' }}>
              {language === 'fa' ? 'شارژ' : 'Charge'}
            </h2>
            
            {/* Amount Input */}
            <div className="mb-3">
              <label className="block text-xs font-medium text-gray-600 mb-1" style={{ fontFamily: 'DigiHamishe, DigiHamisheBold, sans-serif' }}>
                {language === 'fa' ? 'مبلغ (تومان)' : 'Amount'}
              </label>
              <input
                type="number"
                value={chargeAmount}
                onChange={(e) => setChargeAmount(e.target.value)}
                placeholder={language === 'fa' ? 'مبلغ' : 'Amount'}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                style={{ fontFamily: 'DigiHamishe, DigiHamisheBold, sans-serif', direction: 'rtl' }}
                min="10000"
                step="10000"
              />
            </div>

            {/* Quick Amount Buttons - Compact */}
            <div className="mb-3">
              <div className="flex gap-2 flex-wrap">
                {[1000000, 2000000, 3000000, 5000000, 10000000].map((amount) => (
                  <button
                    key={amount}
                    onClick={() => setChargeAmount(amount.toString())}
                    className={`px-3 py-1 text-xs rounded-lg border-2 transition-all ${
                      chargeAmount === amount.toString()
                        ? 'border-blue-600 bg-blue-50 text-blue-600'
                        : 'border-gray-300 bg-white text-gray-700 hover:border-blue-600'
                    }`}
                    style={{ fontFamily: 'DigiHamishe, DigiHamisheBold, sans-serif' }}
                  >
                    {formatCurrency(amount)}
                  </button>
                ))}
              </div>
            </div>

            {/* Payment Gateways - Compact */}
            <div className="mb-3">
              <label className="block text-xs font-medium text-gray-600 mb-2 text-center" style={{ fontFamily: 'DigiHamishe, DigiHamisheBold, sans-serif' }}>
                {language === 'fa' ? 'درگاه' : 'Gateway'}
              </label>
              <div className="flex justify-center items-center gap-2 flex-wrap">
                {paymentGateways.map((gateway) => (
                  <button
                    key={gateway.id}
                    onClick={() => setSelectedGateway(gateway.id)}
                    className={`p-3 rounded-lg border-2 transition-all flex flex-col items-center justify-center min-w-[100px] ${
                      selectedGateway === gateway.id
                        ? 'border-blue-600 bg-blue-50'
                        : 'border-gray-300 bg-white hover:border-blue-600'
                    }`}
                  >
                    <img 
                      src={gateway.logo} 
                      alt={gateway.name}
                      className="w-12 h-12 object-contain mb-1"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.style.display = 'none';
                        const fallback = document.createElement('div');
                        fallback.className = 'text-2xl mb-1';
                        fallback.textContent = '💳';
                        target.parentElement?.insertBefore(fallback, target);
                      }}
                    />
                    <div className="text-xs font-bold text-gray-900 text-center" style={{ fontFamily: 'DigiHamishe, DigiHamisheBold, sans-serif' }}>
                      {gateway.name}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Charge Button - Compact */}
            <button
              onClick={handleCharge}
              disabled={loading || !chargeAmount || !selectedGateway}
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold py-2 px-4 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm"
              style={{ fontFamily: 'DigiHamishe, DigiHamisheBold, sans-serif' }}
            >
              <PlusIcon className="w-4 h-4" />
              {loading 
                ? (language === 'fa' ? 'در حال پردازش...' : 'Processing...')
                : (language === 'fa' ? 'شارژ' : 'Charge')
              }
            </button>

            {/* Message - Compact */}
            {showMessage && (
              <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-yellow-800 text-center text-xs font-bold" style={{ fontFamily: 'DigiHamishe, DigiHamisheBold, sans-serif' }}>
                  {language === 'fa' ? 'فعلاً امکان شارژ وجود ندارد' : 'Charging unavailable'}
                </p>
              </div>
            )}
          </div>

          {/* Transactions History - Compact */}
          <div className="bg-white rounded-xl shadow-xl p-5">
            <h2 className={`text-lg font-bold text-blue-600 mb-3 ${fontClass}`} style={{ fontFamily: 'DigiHamishe, DigiHamisheBold, sans-serif' }}>
              {language === 'fa' ? 'تراکنش‌ها' : 'Transactions'}
            </h2>
            
            {transactions.length === 0 ? (
              <div className="text-center py-6 text-gray-500 text-sm" style={{ fontFamily: 'DigiHamishe, DigiHamisheBold, sans-serif' }}>
                {language === 'fa' ? 'تراکنشی یافت نشد' : 'No transactions'}
              </div>
            ) : (
              <div className="space-y-2">
                {transactions.map((transaction) => (
                  <div
                    key={transaction.id}
                    className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-blue-50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      {getTransactionStatusIcon(transaction.status)}
                      <div>
                        <p className="font-bold text-gray-900 text-sm" style={{ fontFamily: 'DigiHamishe, DigiHamisheBold, sans-serif' }}>
                          {getTransactionTypeText(transaction.type)} - {formatCurrency(transaction.amount)}
                        </p>
                        <p className="text-xs text-gray-500" style={{ fontFamily: 'DigiHamishe, DigiHamisheBold, sans-serif' }}>
                          {transaction.gateway && `${transaction.gateway} - `}
                          {formatDate(transaction.created_at)}
                        </p>
                        {transaction.description && (
                          <p className="text-xs text-gray-400 mt-0.5" style={{ fontFamily: 'DigiHamishe, DigiHamisheBold, sans-serif' }}>
                            {transaction.description}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className={`px-2 py-1 rounded-full text-xs font-bold ${
                      transaction.status === 'success' ? 'bg-green-100 text-green-800' :
                      transaction.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`} style={{ fontFamily: 'DigiHamishe, DigiHamisheBold, sans-serif' }}>
                      {transaction.status === 'success' ? (language === 'fa' ? 'موفق' : 'Success') :
                       transaction.status === 'pending' ? (language === 'fa' ? 'انتظار' : 'Pending') :
                       (language === 'fa' ? 'ناموفق' : 'Failed')}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default WalletPage;
