import React from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../store';
import GlassmorphismHeader from '../components/Layout/GlassmorphismHeader';
import { 
  UserIcon, 
  TicketIcon, 
  CreditCardIcon,
  BellIcon
} from '@heroicons/react/24/outline';

const DashboardPage: React.FC = () => {
  const { user } = useSelector((state: RootState) => state.auth);

  const getMembershipBadge = (level: string) => {
    const badges = {
      bronze: 'bg-amber-100 text-amber-800',
      silver: 'bg-gray-100 text-gray-800',
      gold: 'bg-yellow-100 text-yellow-800',
      platinum: 'bg-purple-100 text-purple-800'
    };
    return badges[level as keyof typeof badges] || badges.bronze;
  };

  const getMembershipName = (level: string) => {
    const names = {
      bronze: 'برنزی',
      silver: 'نقره‌ای',
      gold: 'طلایی',
      platinum: 'پلاتینیوم'
    };
    return names[level as keyof typeof names] || 'برنزی';
  };

  return (
    <div className="min-h-screen bg-gray-50 relative">
      <GlassmorphismHeader />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">داشبورد کاربری</h1>
          <p className="text-gray-600">خوش آمدید، {user?.first_name} {user?.last_name}</p>
        </div>

        {/* User Info Card */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <div className="flex items-center space-x-4 space-x-reverse">
            <div className="bg-primary-100 p-3 rounded-full">
              <UserIcon className="h-8 w-8 text-primary-600" />
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-semibold text-gray-900">
                {user?.first_name} {user?.last_name}
              </h2>
              <p className="text-gray-600">{user?.email}</p>
              <p className="text-gray-600">{user?.phone_number || '-'}</p>
            </div>
            <div className="text-right">
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getMembershipBadge(user?.membership_level?.toLowerCase() || 'bronze')}`}>
                {getMembershipName(user?.membership_level?.toLowerCase() || 'bronze')}
              </span>
              <p className="text-sm text-gray-500 mt-2">{user?.loyalty_points || 0} امتیاز</p>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="bg-blue-100 p-3 rounded-lg">
                <TicketIcon className="h-6 w-6 text-blue-600" />
              </div>
              <div className="mr-4">
                <h3 className="text-lg font-semibold text-gray-900">رزرو بلیط</h3>
                <p className="text-gray-600">جستجو و رزرو پرواز</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="bg-green-100 p-3 rounded-lg">
                <CreditCardIcon className="h-6 w-6 text-green-600" />
              </div>
              <div className="mr-4">
                <h3 className="text-lg font-semibold text-gray-900">پرداخت‌ها</h3>
                <p className="text-gray-600">تاریخچه پرداخت‌ها</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="bg-yellow-100 p-3 rounded-lg">
                <BellIcon className="h-6 w-6 text-yellow-600" />
              </div>
              <div className="mr-4">
                <h3 className="text-lg font-semibold text-gray-900">اعلان‌ها</h3>
                <p className="text-gray-600">پیام‌ها و اطلاع‌رسانی‌ها</p>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Bookings */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">رزروهای اخیر</h2>
          <div className="text-center py-8">
            <p className="text-gray-500">هنوز رزروی انجام نداده‌اید</p>
            <button className="mt-4 bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors">
              جستجوی پرواز
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
