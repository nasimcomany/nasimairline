/**
 * داشبورد پرسنل - صفحه جداگانه و خالی پس از ورود پرسنل
 */
import React from 'react';
import EmiratesHeader from '../components/Layout/EmiratesHeader';

const StaffDashboardPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-white">
      <EmiratesHeader />
      <div className="min-h-[80vh] bg-white" />
    </div>
  );
};

export default StaffDashboardPage;
