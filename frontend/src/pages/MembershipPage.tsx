import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import EmiratesHeader from '../components/Layout/EmiratesHeader';
import { useLanguage } from '../contexts/LanguageContext';
import AuthModal from '../components/Auth/AuthModal';
import customerService, { MembershipStatus } from '../services/customerService';
import { 
  StarIcon, 
  GiftIcon,
  TrophyIcon,
  SparklesIcon,
  HeartIcon,
  UserGroupIcon,
  ClockIcon,
  ShieldCheckIcon,
  TruckIcon,
  WifiIcon,
  ArrowTrendingUpIcon,
  FireIcon,
  CalendarIcon,
  TicketIcon
} from '@heroicons/react/24/outline';
import { CheckCircleIcon as CheckCircleIconSolid } from '@heroicons/react/24/solid';

interface RootState {
  auth: {
    user: {
      id: number;
      email: string;
      membership_level: string;
      loyalty_points: number;
    } | null;
    isAuthenticated: boolean;
  };
}

const MembershipPage: React.FC = () => {
  const { t, language, direction, fontClass } = useLanguage();
  const { isAuthenticated } = useSelector((state: RootState) => state.auth);
  const [membershipStatus, setMembershipStatus] = useState<MembershipStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<'login' | 'register'>('login');

  useEffect(() => {
    const fetchMembershipStatus = async () => {
      if (!isAuthenticated) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const data = await customerService.getMembershipStatus();
        setMembershipStatus(data);
      } catch (err: any) {
        console.error('Error fetching membership status:', err);
        setError(err.response?.data?.error || t('membershipPage.fetchError'));
      } finally {
        setLoading(false);
      }
    };

    fetchMembershipStatus();
  }, [isAuthenticated]);

  const getTierIcon = (tier: string) => {
    switch (tier) {
      case 'BRONZE':
        return StarIcon;
      case 'SILVER':
        return GiftIcon;
      case 'GOLD':
        return TrophyIcon;
      case 'PLATINUM':
        return SparklesIcon;
      default:
        return StarIcon;
    }
  };

  const getTierGradient = (tier: string) => {
    switch (tier) {
      case 'BRONZE':
        return 'from-amber-600 to-amber-700';
      case 'SILVER':
        return 'from-gray-400 to-gray-500';
      case 'GOLD':
        return 'from-yellow-500 to-yellow-600';
      case 'PLATINUM':
        return 'from-purple-600 to-indigo-600';
      default:
        return 'from-blue-500 to-blue-600';
    }
  };

  const getTierDisplayName = (tier: string) => {
    const key = `membershipPage.tierName.${tier?.toLowerCase() || 'bronze'}`;
    const translated = t(key);
    return translated !== key ? translated : (tier || '');
  };

  const getTierDescription = (tier: string) => {
    switch (tier) {
      case 'BRONZE':
        return t('membershipPage.tierDesc.bronze');
      case 'SILVER':
        return t('membershipPage.tierDesc.silver');
      case 'GOLD':
        return t('membershipPage.tierDesc.gold');
      case 'PLATINUM':
        return t('membershipPage.tierDesc.platinum');
      default:
        return '';
    }
  };

  const formatNumber = (num: number) => {
    const locale = language === 'en' ? 'en-US' : language === 'ar' ? 'ar-EG' : 'fa-IR';
    return new Intl.NumberFormat(locale).format(num);
  };

  const getMetricDisplay = (metricKey: string, fallbackCurrent: number) => {
    const progress = membershipStatus?.progress_to_next_tier?.[metricKey as keyof typeof membershipStatus.progress_to_next_tier];
    if (progress && typeof progress.current === 'number' && typeof progress.required === 'number') {
      return `${formatNumber(progress.current)}/${formatNumber(progress.required)}`;
    }
    return formatNumber(fallbackCurrent);
  };

  const getProgressLabel = (key: string) => {
    switch (key) {
      case 'total_bookings':
        return t('membershipPage.progressTotalBookings');
      case 'monthly_bookings':
        return t('membershipPage.progressMonthlyBookings');
      case 'weekly_bookings':
        return t('membershipPage.progressWeeklyBookings');
      case 'membership_days':
        return t('membershipPage.progressMembershipDays');
      case 'active_months':
        return t('membershipPage.progressActiveMonths');
      case 'completed_flights':
        return t('membershipPage.progressCompletedFlights');
      default:
        return key;
    }
  };

  const getTierBenefits = (tFunc: (k: string) => string): Record<string, Array<{ icon: any; title: string; desc: string }>> => ({
    BRONZE: [
      { icon: ClockIcon, title: tFunc('membershipPage.benefit.fastNotification'), desc: tFunc('membershipPage.benefit.fastNotificationDesc') },
      { icon: TicketIcon, title: tFunc('membershipPage.benefit.standardSeat'), desc: tFunc('membershipPage.benefit.standardSeatDesc') },
      { icon: UserGroupIcon, title: tFunc('membershipPage.benefit.betterSupport'), desc: tFunc('membershipPage.benefit.betterSupportDesc') },
      { icon: FireIcon, title: tFunc('membershipPage.benefit.campaigns'), desc: tFunc('membershipPage.benefit.campaignsDesc') },
    ],
    SILVER: [
      { icon: TicketIcon, title: tFunc('membershipPage.benefit.waitlistPriority'), desc: tFunc('membershipPage.benefit.waitlistPriorityDesc') },
      { icon: TruckIcon, title: tFunc('membershipPage.benefit.airportPriority'), desc: tFunc('membershipPage.benefit.airportPriorityDesc') },
      { icon: ClockIcon, title: tFunc('membershipPage.benefit.fasterSupport'), desc: tFunc('membershipPage.benefit.fasterSupportDesc') },
      { icon: WifiIcon, title: tFunc('membershipPage.benefit.betterSeat'), desc: tFunc('membershipPage.benefit.betterSeatDesc') },
    ],
    GOLD: [
      { icon: ShieldCheckIcon, title: tFunc('membershipPage.benefit.priorityBoarding'), desc: tFunc('membershipPage.benefit.priorityBoardingDesc') },
      { icon: TruckIcon, title: tFunc('membershipPage.benefit.baggagePriority'), desc: tFunc('membershipPage.benefit.baggagePriorityDesc') },
      { icon: HeartIcon, title: tFunc('membershipPage.benefit.vipSupport'), desc: tFunc('membershipPage.benefit.vipSupportDesc') },
      { icon: FireIcon, title: tFunc('membershipPage.benefit.flightChangePriority'), desc: tFunc('membershipPage.benefit.flightChangePriorityDesc') },
    ],
    PLATINUM: [
      { icon: SparklesIcon, title: tFunc('membershipPage.benefit.premiumService'), desc: tFunc('membershipPage.benefit.premiumServiceDesc') },
      { icon: ShieldCheckIcon, title: tFunc('membershipPage.benefit.fullTravelPriority'), desc: tFunc('membershipPage.benefit.fullTravelPriorityDesc') },
      { icon: HeartIcon, title: tFunc('membershipPage.benefit.support24_7'), desc: tFunc('membershipPage.benefit.support24_7Desc') },
      { icon: TicketIcon, title: tFunc('membershipPage.benefit.maxFlexibility'), desc: tFunc('membershipPage.benefit.maxFlexibilityDesc') },
    ],
  });

  const tierBenefits = getTierBenefits(t);
  const currentTierBenefits = membershipStatus ? (tierBenefits[membershipStatus.current_tier] || []) : [];
  const nextTierBenefits = membershipStatus?.next_tier ? (tierBenefits[membershipStatus.next_tier] || []) : [];

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-600 via-blue-500 to-indigo-600" dir={direction}>
        <EmiratesHeader />
        <section className="relative z-10 min-h-[70vh] flex items-center justify-center px-4 py-12">
          <div className="max-w-md mx-auto text-center">
            <div className="bg-white rounded-2xl p-6 shadow-2xl">
              <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl p-4 mb-4">
                <UserGroupIcon className="h-12 w-12 text-white mx-auto" />
              </div>
              <h2 className="text-xl font-bold text-gray-900 mb-2" style={{
                fontFamily: 'DigiHamishe, DigiHamisheBold, sans-serif'
              }}>
                {t('membershipPage.clubTitle')}
              </h2>
              <p className="text-gray-600 mb-4 text-sm" style={{
                fontFamily: 'DigiHamishe, DigiHamisheBold, sans-serif'
              }}>
                {t('membershipPage.loginToView')}
              </p>
              <button
                onClick={() => {
                  setAuthModalMode('login');
                  setIsAuthModalOpen(true);
                }}
                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold py-3 px-6 rounded-lg transition-all text-sm"
                style={{
                  fontFamily: 'DigiHamishe, DigiHamisheBold, sans-serif'
                }}
              >
                {t('membershipPage.loginButton')}
              </button>
            </div>
          </div>
        </section>

        <AuthModal
          isOpen={isAuthModalOpen}
          onClose={() => setIsAuthModalOpen(false)}
          initialMode={authModalMode}
        />
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-600 via-blue-500 to-indigo-600" dir={direction}>
        <EmiratesHeader />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-white text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-white mx-auto mb-4"></div>
            <p className="text-lg" style={{ fontFamily: 'DigiHamishe, DigiHamisheBold, sans-serif' }}>
              {t('common.loading')}
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !membershipStatus) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-600 via-blue-500 to-indigo-600" dir={direction}>
        <EmiratesHeader />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="bg-white rounded-xl p-6 max-w-md mx-4">
            <p className="text-red-600 text-center" style={{ fontFamily: 'DigiHamishe, DigiHamisheBold, sans-serif' }}>
              {error || t('membershipPage.genericError')}
            </p>
          </div>
        </div>
      </div>
    );
  }

  const TierIcon = getTierIcon(membershipStatus.current_tier);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 via-blue-500 to-indigo-600" dir={direction}>
      <EmiratesHeader />

      {/* Hero Section with Current Tier */}
      <section className="relative z-10 py-8 px-4">
        <div className="max-w-5xl mx-auto">
          {/* Current Tier Banner */}
          <div className={`bg-gradient-to-r ${getTierGradient(membershipStatus.current_tier)} rounded-2xl p-8 mb-6 shadow-2xl`}>
            <div className="flex flex-col items-center justify-center text-center">
              <div className="bg-white/20 backdrop-blur-md rounded-full p-4 mb-4">
                <TierIcon className="h-16 w-16 text-white" />
              </div>
              <h2 className="text-3xl font-bold text-white mb-2" style={{
                fontFamily: 'DigiHamishe, DigiHamisheBold, sans-serif',
              }}>
                {language === 'en' ? `${getTierDisplayName(membershipStatus.current_tier)} ${t('membershipPage.member')}` : `${t('membershipPage.member')} ${getTierDisplayName(membershipStatus.current_tier)}`}
              </h2>
              <p className="text-white/90 text-base mb-4">
                {getTierDescription(membershipStatus.current_tier)}
              </p>
              <div className="flex items-center gap-2 text-white/80 text-sm">
                <CalendarIcon className="h-5 w-5" />
                <span style={{ fontFamily: 'DigiHamishe, DigiHamisheBold, sans-serif' }}>
                  {t('membershipPage.membershipSince')} {formatNumber(membershipStatus.membership_duration_days)} {t('membershipPage.daysAgo')}
                </span>
              </div>
            </div>
          </div>

          {/* Activity Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-white rounded-xl p-5 shadow-lg">
              <div className="flex items-center gap-3 mb-2">
                <div className="bg-blue-100 rounded-lg p-2">
                  <TicketIcon className="h-6 w-6 text-blue-600" />
                </div>
                <span className="text-gray-700 text-sm" style={{ fontFamily: 'DigiHamishe, DigiHamisheBold, sans-serif' }}>
                  {t('membershipPage.totalBookings')}
                </span>
              </div>
              <div className="text-gray-900 font-bold text-2xl" style={{ fontFamily: 'DigiHamishe, DigiHamisheBold, sans-serif' }}>
                {getMetricDisplay('total_bookings', membershipStatus.total_bookings)}
              </div>
            </div>
            
            <div className="bg-white rounded-xl p-5 shadow-lg">
              <div className="flex items-center gap-3 mb-2">
                <div className="bg-indigo-100 rounded-lg p-2">
                  <ClockIcon className="h-6 w-6 text-indigo-600" />
                </div>
                <span className="text-gray-700 text-sm" style={{ fontFamily: 'DigiHamishe, DigiHamisheBold, sans-serif' }}>
                  {t('membershipPage.membershipDays')}
                </span>
              </div>
              <div className="text-gray-900 font-bold text-2xl" style={{ fontFamily: 'DigiHamishe, DigiHamisheBold, sans-serif' }}>
                {getMetricDisplay('membership_days', membershipStatus.membership_duration_days)}
              </div>
            </div>
            
            <div className="bg-white rounded-xl p-5 shadow-lg">
              <div className="flex items-center gap-3 mb-2">
                <div className="bg-purple-100 rounded-lg p-2">
                  <CalendarIcon className="h-6 w-6 text-purple-600" />
                </div>
                <span className="text-gray-700 text-sm" style={{ fontFamily: 'DigiHamishe, DigiHamisheBold, sans-serif' }}>
                  {t('membershipPage.bookingsPerMonth')}
                </span>
              </div>
              <div className="text-gray-900 font-bold text-2xl" style={{ fontFamily: 'DigiHamishe, DigiHamisheBold, sans-serif' }}>
                {getMetricDisplay('monthly_bookings', membershipStatus.bookings_last_30_days)}
              </div>
            </div>
            
            <div className="bg-white rounded-xl p-5 shadow-lg">
              <div className="flex items-center gap-3 mb-2">
                <div className="bg-orange-100 rounded-lg p-2">
                  <FireIcon className="h-6 w-6 text-orange-600" />
                </div>
                <span className="text-gray-700 text-sm" style={{ fontFamily: 'DigiHamishe, DigiHamisheBold, sans-serif' }}>
                  {t('membershipPage.activeMonths')}
                </span>
              </div>
              <div className="text-gray-900 font-bold text-2xl" style={{ fontFamily: 'DigiHamishe, DigiHamisheBold, sans-serif' }}>
                {getMetricDisplay('active_months', membershipStatus.active_months_count)}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Next Tier Progress */}
      {membershipStatus.next_tier && membershipStatus.progress_to_next_tier && (
        <section className="relative z-10 px-4 pb-6">
          <div className="max-w-5xl mx-auto">
            <div className="bg-white rounded-2xl p-6 shadow-xl">
              <div className="flex items-center gap-3 mb-6">
                <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg p-3">
                  <ArrowTrendingUpIcon className="h-7 w-7 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900" style={{ fontFamily: 'DigiHamishe, DigiHamisheBold, sans-serif' }}>
                    {t('membershipPage.progressToTier')} {getTierDisplayName(membershipStatus.next_tier || '')}
                  </h3>
                  <p className="text-gray-600 text-sm" style={{ fontFamily: 'DigiHamishe, DigiHamisheBold, sans-serif' }}>
                    {t('membershipPage.onPathToUpgrade')}
                  </p>
                </div>
              </div>
              
              <div className="space-y-4">
                {Object.entries(membershipStatus.progress_to_next_tier).map(([key, value]) => {
                  const progress = value as { current: number; required: number; percentage: number };
                  const isComplete = progress.percentage >= 100;
                  
                  return (
                    <div key={key} className="bg-gradient-to-r from-gray-50 to-blue-50 rounded-xl p-4 border-2 border-gray-200">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          {isComplete ? (
                            <CheckCircleIconSolid className="h-6 w-6 text-green-500" />
                          ) : (
                            <div className="h-6 w-6 rounded-full border-2 border-gray-300"></div>
                          )}
                          <span className="text-gray-900 font-bold text-base" style={{ fontFamily: 'DigiHamishe, DigiHamisheBold, sans-serif' }}>
                            {getProgressLabel(key)}
                          </span>
                        </div>
                        <div className="text-left">
                          <span className="text-blue-600 font-bold text-lg" style={{ fontFamily: 'DigiHamishe, DigiHamisheBold, sans-serif' }}>
                            {formatNumber(progress.current)}
                          </span>
                          <span className="text-gray-400 mx-1">/</span>
                          <span className="text-gray-700 font-semibold" style={{ fontFamily: 'DigiHamishe, DigiHamisheBold, sans-serif' }}>
                            {formatNumber(progress.required)}
                          </span>
                        </div>
                      </div>
                      
                      {/* Progress Bar */}
                      <div className="relative w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                        <div
                          className={`h-3 rounded-full transition-all duration-700 ${
                            isComplete 
                              ? 'bg-gradient-to-r from-green-400 to-green-500' 
                              : 'bg-gradient-to-r from-blue-500 to-indigo-600'
                          }`}
                          style={{
                            width: `${Math.min(progress.percentage, 100)}%`
                          }}
                        ></div>
                      </div>
                      
                      <div className="mt-2 text-left">
                        <span className={`text-sm font-semibold ${isComplete ? 'text-green-600' : 'text-blue-600'}`} style={{ fontFamily: 'DigiHamishe, DigiHamisheBold, sans-serif' }}>
                          {progress.percentage}%
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Tier Benefits Section */}
      <section className="relative z-10 px-4 pb-8">
        <div className="max-w-5xl mx-auto">
          <div className="bg-white rounded-2xl p-6 shadow-xl">
            <h2 
              className="text-gray-900 mb-6 text-center font-bold text-2xl"
              style={{
                fontFamily: 'DigiHamishe, DigiHamisheBold, sans-serif',
              }}
            >
              {t('membershipPage.yourBenefits')}
            </h2>

            <div className="mb-6">
              <h3 className="text-lg font-bold text-blue-900 mb-3 text-center" style={{ fontFamily: 'DigiHamishe, DigiHamisheBold, sans-serif' }}>
                {t('membershipPage.currentTierBenefits')} ({getTierDisplayName(membershipStatus.current_tier)})
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {currentTierBenefits.map((benefit, index) => (
                  <div key={`current-${index}`} className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-4 border-2 border-blue-100">
                    <div className="flex items-start gap-3">
                      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full p-2.5">
                        <benefit.icon className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <h4 className="text-gray-900 font-bold text-sm mb-1" style={{ fontFamily: 'DigiHamishe, DigiHamisheBold, sans-serif' }}>
                          {benefit.title}
                        </h4>
                        <p className="text-gray-600 text-xs" style={{ fontFamily: 'DigiHamishe, DigiHamisheBold, sans-serif' }}>
                          {benefit.desc}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {membershipStatus.next_tier && membershipStatus.next_tier_display && nextTierBenefits.length > 0 ? (
              <div className="border-t border-gray-200 pt-6">
                <h3 className="text-lg font-bold text-emerald-700 mb-3 text-center" style={{ fontFamily: 'DigiHamishe, DigiHamisheBold, sans-serif' }}>
                  {t('membershipPage.ifYouBecome')} {getTierDisplayName(membershipStatus.next_tier || '')} {t('membershipPage.becomeGetBenefits')}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {nextTierBenefits.map((benefit, index) => (
                    <div key={`next-${index}`} className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-xl p-4 border-2 border-emerald-100">
                      <div className="flex items-start gap-3">
                        <div className="bg-gradient-to-r from-emerald-600 to-teal-600 rounded-full p-2.5">
                          <benefit.icon className="h-5 w-5 text-white" />
                        </div>
                        <div>
                          <h4 className="text-gray-900 font-bold text-sm mb-1" style={{ fontFamily: 'DigiHamishe, DigiHamisheBold, sans-serif' }}>
                            {benefit.title}
                          </h4>
                          <p className="text-gray-600 text-xs" style={{ fontFamily: 'DigiHamishe, DigiHamisheBold, sans-serif' }}>
                            {benefit.desc}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="border-t border-gray-200 pt-6 text-center">
                <p className="text-emerald-700 font-bold" style={{ fontFamily: 'DigiHamishe, DigiHamisheBold, sans-serif' }}>
                  {t('membershipPage.highestTier')}
                </p>
              </div>
            )}
            
            <div className="mt-5 text-center">
              <p className="text-xs text-gray-500" style={{ fontFamily: 'DigiHamishe, DigiHamisheBold, sans-serif' }}>
                {t('membershipPage.benefitsDisclaimer')}
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default MembershipPage;
