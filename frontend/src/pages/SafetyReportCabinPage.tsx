/**
 * صفحه گزارش اجباری ایمنی کابین - همان فرم که در staff-dashboard و از هدر گزارشات ایمنی در دسترس است
 */
import React from 'react';
import EmiratesHeader from '../components/Layout/EmiratesHeader';
import CabinSafetyForm from '../components/Staff/CabinSafetyForm';

const SafetyReportCabinPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <EmiratesHeader />
      <section className="relative py-12 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-2xl shadow-lg p-6 sm:p-8">
            <CabinSafetyForm />
          </div>
        </div>
      </section>
    </div>
  );
};

export default SafetyReportCabinPage;
