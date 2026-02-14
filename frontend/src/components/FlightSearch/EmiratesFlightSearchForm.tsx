import React, { useState, useRef, useEffect, forwardRef } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { setSearchParams } from '../../store/slices/flightSlice';
import DatePicker from 'react-datepicker';
import { registerLocale } from 'react-datepicker';
import { faIR } from 'date-fns/locale';
import 'react-datepicker/dist/react-datepicker.css';
import { toJalaali, toGregorian } from 'jalaali-js';
import { 
  PaperAirplaneIcon, 
  MapPinIcon, 
  CalendarIcon, 
  TagIcon,
  ClockIcon,
  XMarkIcon,
  ArrowsRightLeftIcon,
  TicketIcon
} from '@heroicons/react/24/outline';
import { useLanguage } from '../../contexts/LanguageContext';
import CitySelect from './CitySelect';
import PassengerSelect from './PassengerSelect';
import CustomSelect from '../CustomSelect/CustomSelect';

interface EmiratesFlightSearchFormProps {
  onTabChange?: (tab: 'search' | 'manage' | 'whatson' | 'status' | 'services') => void;
}

// Register Persian locale
registerLocale('fa', faIR);

// Helper functions for date conversion
const toJalaliDate = (date: Date) => {
  const jalaali = toJalaali(date.getFullYear(), date.getMonth() + 1, date.getDate());
  return {
    year: jalaali.jy,
    month: jalaali.jm,
    day: jalaali.jd
  };
};

const toGregorianDate = (jalaliDate: { year: number; month: number; day: number }) => {
  const gregorian = toGregorian(jalaliDate.year, jalaliDate.month, jalaliDate.day);
  return new Date(gregorian.gy, gregorian.gm - 1, gregorian.gd);
};

// Persian month names
const persianMonths = [
  'فروردین', 'اردیبهشت', 'خرداد', 'تیر', 'مرداد', 'شهریور',
  'مهر', 'آبان', 'آذر', 'دی', 'بهمن', 'اسفند'
];

// Format date in Jalali for display
const formatJalaliDate = (date: Date): string => {
  const jalaali = toJalaali(date.getFullYear(), date.getMonth() + 1, date.getDate());
  return `${jalaali.jy}/${jalaali.jm.toString().padStart(2, '0')}/${jalaali.jd.toString().padStart(2, '0')}`;
};

// Custom input component for Persian date display
const JalaliDateInput = forwardRef<HTMLInputElement, { value?: string; onClick?: () => void; date: Date | null; size?: 'small' | 'large' }>(
  ({ value: _value, onClick, date, size = 'small' }, ref) => {
    // Always use Jalali date format, ignore the value from react-datepicker
    const displayValue = date ? formatJalaliDate(date) : '';
    
    const isLarge = size === 'large';
    
    return (
      <input
        ref={ref}
        type="text"
        readOnly
        value={displayValue}
        onClick={onClick}
        placeholder="انتخاب تاریخ"
        className={`w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-900 focus:border-blue-900 bg-white cursor-pointer ${
          isLarge ? 'px-3 py-2.5 text-base' : 'px-3 py-2.5 text-sm'
        }`}
        style={{ 
          fontFamily: 'DigiHamisheBold, Arial, sans-serif', 
          direction: 'rtl',
          minHeight: '48px',
          height: '48px'
        }}
      />
    );
  }
);

JalaliDateInput.displayName = 'JalaliDateInput';

// Custom header renderer for Persian calendar
const renderCustomHeader = (props: {
  date: Date;
  changeYear: (year: number) => void;
  changeMonth: (month: number) => void;
  decreaseMonth: () => void;
  increaseMonth: () => void;
  prevMonthButtonDisabled: boolean;
  nextMonthButtonDisabled: boolean;
  decreaseYear: () => void;
  increaseYear: () => void;
  prevYearButtonDisabled: boolean;
  nextYearButtonDisabled: boolean;
}, language: string): React.ReactElement => {
  const { date, decreaseMonth, increaseMonth, prevMonthButtonDisabled, nextMonthButtonDisabled } = props;
  
  if (language === 'fa') {
    const jalaali = toJalaali(date.getFullYear(), date.getMonth() + 1, date.getDate());
    const monthName = persianMonths[jalaali.jm - 1];
    const year = jalaali.jy;

    return (
      <div className="react-datepicker__header" style={{ direction: 'rtl', fontFamily: 'DigiHamisheBold, Arial, sans-serif' }}>
        <div className="react-datepicker__current-month">
          {monthName} {year}
        </div>
        <div className="react-datepicker__navigation">
          <button
            type="button"
            className="react-datepicker__navigation react-datepicker__navigation--next"
            onClick={increaseMonth}
            disabled={nextMonthButtonDisabled}
            aria-label="ماه بعد"
          >
            <span className="react-datepicker__navigation-icon react-datepicker__navigation-icon--next">‹</span>
          </button>
          <button
            type="button"
            className="react-datepicker__navigation react-datepicker__navigation--previous"
            onClick={decreaseMonth}
            disabled={prevMonthButtonDisabled}
            aria-label="ماه قبل"
          >
            <span className="react-datepicker__navigation-icon react-datepicker__navigation-icon--previous">›</span>
          </button>
        </div>
      </div>
    );
  }

  // Default header for non-Persian
  return (
    <div className="react-datepicker__header">
      <div className="react-datepicker__current-month">
        {date.toLocaleDateString(language, { month: 'long', year: 'numeric' })}
      </div>
    </div>
  );
};

// Custom day content renderer for Persian calendar
const renderDayContents = (day: number, date: Date) => {
  if (!date) return day;
  const jalaali = toJalaali(date.getFullYear(), date.getMonth() + 1, date.getDate());
  return jalaali.jd;
};

const EmiratesFlightSearchForm: React.FC<EmiratesFlightSearchFormProps> = ({ onTabChange }) => {
  const [activeTab, setActiveTab] = useState<'search' | 'manage' | 'whatson' | 'status' | 'services'>('search');
  const [tripType, setTripType] = useState<'roundtrip' | 'oneway'>('roundtrip');
  const [departureDate, setDepartureDate] = useState<Date | null>(new Date());
  const [returnDate, setReturnDate] = useState<Date | null>(null);
  const [formData, setFormData] = useState({
    origin: 'THR',
    destination: '',
    passengers: { adults: 1, children: 0, infants: 0 },
    class: 'economy' as 'economy' | 'business' | 'first'
  });
  
  // Flight status form
  const [flightStatusForm, setFlightStatusForm] = useState({
    flightNumber: '',
    date: ''
  });
  
  // Dates for whatson and status tabs
  const [whatsonDate, setWhatsonDate] = useState<Date | null>(new Date());
  const [statusDate, setStatusDate] = useState<Date | null>(new Date());
  
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { t, fontClass, language } = useLanguage();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.origin || !formData.destination || !departureDate) {
      alert(t('home.flightSearch.pleaseFillFields'));
      return;
    }

    if (tripType === 'roundtrip' && !returnDate) {
      alert(t('home.flightSearch.pleaseReturnDate'));
      return;
    }
    
    const searchParams = {
      origin: formData.origin,
      destination: formData.destination,
      departureDate: departureDate.toISOString().split('T')[0],
      returnDate: tripType === 'roundtrip' && returnDate ? returnDate.toISOString().split('T')[0] : undefined,
      passengers: formData.passengers,
      class: formData.class,
      tripType
    };

    dispatch(setSearchParams(searchParams));
    navigate('/flights/results');
  };

  const swapCities = () => {
    setFormData(prev => ({
      ...prev,
      origin: prev.destination,
      destination: prev.origin
    }));
  };

  const handleTabChange = (tab: 'search' | 'manage' | 'whatson' | 'status' | 'services') => {
    setActiveTab(tab);
    if (onTabChange) {
      onTabChange(tab);
    }
  };

  return (
    <>
      <style>{`
        ${language === 'fa' ? `
          .react-datepicker {
            font-family: 'DigiHamisheBold', Arial, sans-serif !important;
            direction: rtl;
            z-index: 9999 !important;
          }
          .react-datepicker__header {
            direction: rtl;
            font-family: 'DigiHamisheBold', Arial, sans-serif !important;
          }
          .react-datepicker__current-month {
            font-family: 'DigiHamisheBold', Arial, sans-serif !important;
          }
          .react-datepicker__day-names {
            direction: rtl;
          }
          .react-datepicker__week {
            direction: rtl;
          }
          .react-datepicker__day {
            font-family: 'DigiHamisheBold', Arial, sans-serif !important;
          }
        ` : ''}
        .react-datepicker-popper {
          z-index: 9999 !important;
        }
      `}</style>
      <div className="rounded-3xl shadow-2xl overflow-visible">
      {/* Tabs */}
      <div className="flex border-b border-gray-300/30 overflow-x-auto bg-gray-400/30 backdrop-blur-xl rounded-t-3xl">
        <button
          onClick={() => handleTabChange('search')}
          className={`flex items-center gap-2.5 px-8 py-5 font-medium transition-colors whitespace-nowrap ${
            activeTab === 'search'
              ? 'text-blue-900 border-b-2 border-blue-900 bg-gray-300/25'
              : 'text-white bg-transparent hover:text-white hover:bg-gray-300/15'
          } ${fontClass}`}
          style={{ fontSize: '17px' }}
        >
          <PaperAirplaneIcon className={`w-5 h-5 ${activeTab === 'search' ? 'text-blue-900' : 'text-white'}`} />
          {t('home.flightSearch.bookFlight')}
        </button>
        <button
          onClick={() => handleTabChange('manage')}
          className={`flex items-center gap-2.5 px-8 py-5 font-medium transition-colors whitespace-nowrap ${
            activeTab === 'manage'
              ? 'text-blue-900 border-b-2 border-blue-900 bg-gray-300/25'
              : 'text-white bg-transparent hover:text-white hover:bg-gray-300/15'
          } ${fontClass}`}
          style={{ fontSize: '17px' }}
        >
          <TagIcon className={`w-5 h-5 ${activeTab === 'manage' ? 'text-blue-900' : 'text-white'}`} />
          {t('home.flightSearch.manageBooking')}
        </button>
        <button
          onClick={() => handleTabChange('services')}
          className={`flex items-center gap-2.5 px-8 py-5 font-medium transition-colors whitespace-nowrap ${
            activeTab === 'services'
              ? 'text-blue-900 border-b-2 border-blue-900 bg-gray-300/25'
              : 'text-white bg-transparent hover:text-white hover:bg-gray-300/15'
          } ${fontClass}`}
          style={{ fontSize: '17px' }}
        >
          <MapPinIcon className={`w-5 h-5 ${activeTab === 'services' ? 'text-blue-900' : 'text-white'}`} />
          {t('home.flightSearch.specialServices')}
        </button>
        <button
          onClick={() => handleTabChange('whatson')}
          className={`flex items-center gap-2.5 px-8 py-5 font-medium transition-colors whitespace-nowrap ${
            activeTab === 'whatson'
              ? 'text-blue-900 border-b-2 border-blue-900 bg-gray-300/25'
              : 'text-white bg-transparent hover:text-white hover:bg-gray-300/15'
          } ${fontClass}`}
          style={{ fontSize: '17px' }}
        >
          <PaperAirplaneIcon className={`w-5 h-5 ${activeTab === 'whatson' ? 'text-blue-900' : 'text-white'}`} />
          {t('home.flightSearch.flightFacilities')}
        </button>
        <button
          onClick={() => handleTabChange('status')}
          className={`flex items-center gap-2.5 px-8 py-5 font-medium transition-colors whitespace-nowrap ${
            activeTab === 'status'
              ? 'text-blue-900 border-b-2 border-blue-900 bg-gray-300/25'
              : 'text-white bg-transparent hover:text-white hover:bg-gray-300/15'
          } ${fontClass}`}
          style={{ fontSize: '17px' }}
        >
          <ClockIcon className={`w-5 h-5 ${activeTab === 'status' ? 'text-blue-900' : 'text-white'}`} />
          {t('home.flightSearch.flightStatus')}
        </button>
      </div>

      {/* Tab Content */}
      <div className="bg-gray-200 overflow-visible rounded-b-3xl" style={{ minHeight: '220px' }}>
      {activeTab === 'search' && (
        <form onSubmit={handleSearch} className="p-8">
          {/* Trip Type Selector - Compact */}
          <div className="flex gap-3 mb-5">
            <button
              type="button"
              onClick={() => setTripType('roundtrip')}
              className={`px-8 py-4 rounded-lg text-lg font-bold transition-all ${
                tripType === 'roundtrip'
                  ? 'bg-blue-900 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
              style={{ fontFamily: 'DigiHamisheBold, Arial, sans-serif' }}
            >
              {t('home.flightSearch.roundTrip')}
            </button>
            <button
              type="button"
              onClick={() => setTripType('oneway')}
              className={`px-8 py-4 rounded-lg text-lg font-bold transition-all ${
                tripType === 'oneway'
                  ? 'bg-blue-900 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
              style={{ fontFamily: 'DigiHamisheBold, Arial, sans-serif' }}
            >
              {t('home.flightSearch.oneWay')}
            </button>
          </div>

          {/* Main Row - All fields in one row */}
          <div className="flex gap-2.5 items-end mb-5 flex-nowrap overflow-visible pb-1">
            {/* Origin */}
            <div className="relative flex-shrink-0" style={{ flexBasis: '148px', minWidth: '148px', width: '148px' }}>
              <CitySelect
                value={formData.origin}
                onChange={(value) => setFormData(prev => ({ ...prev, origin: value }))}
                label={t('home.flightSearch.origin')}
                placeholder={t('home.flightSearch.origin')}
              />
              
              {/* Swap Button */}
              <button
                type="button"
                onClick={swapCities}
                className="absolute left-0 top-7 transform translate-x-1/2 z-10 w-8 h-8 bg-blue-900 hover:bg-blue-800 text-white rounded-full flex items-center justify-center shadow-lg transition-all hover:scale-110"
                title={t('home.flightSearch.swap')}
              >
                <ArrowsRightLeftIcon className="w-4 h-4" />
              </button>
            </div>

            {/* Destination */}
            <div className="flex-shrink-0" style={{ flexBasis: '148px', minWidth: '148px', width: '148px' }}>
              <CitySelect
                value={formData.destination}
                onChange={(value) => setFormData(prev => ({ ...prev, destination: value }))}
                label={t('home.flightSearch.destination')}
                placeholder={t('home.flightSearch.destination')}
              />
            </div>

            {/* Departure Date */}
            <div className="flex-shrink-0" style={{ flexBasis: '148px', minWidth: '148px', width: '148px' }}>
              <label className="block text-sm font-medium text-gray-600 mb-1.5" style={{ fontFamily: 'DigiHamisheBold, Arial, sans-serif' }}>
                {language === 'fa' ? 'تاریخ رفت' : t('home.flightSearch.departDate')}
              </label>
              <DatePicker
                selected={departureDate}
                onChange={(date: Date | null) => setDepartureDate(date)}
                minDate={new Date()}
                dateFormat={language === 'fa' ? 'yyyy/MM/dd' : 'yyyy-MM-dd'}
                locale={language === 'fa' ? 'fa' : undefined}
                className="w-full px-2 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-900 focus:border-blue-900 bg-white"
                wrapperClassName="w-full"
                popperPlacement="top-start"
                renderCustomHeader={(props) => renderCustomHeader(props, language)}
                renderDayContents={language === 'fa' ? renderDayContents : undefined}
                customInput={language === 'fa' ? <JalaliDateInput date={departureDate} size="large" /> : undefined}
                required
              />
            </div>

            {/* Return Date */}
            {tripType === 'roundtrip' && (
              <div className="flex-shrink-0" style={{ flexBasis: '148px', minWidth: '148px', width: '148px' }}>
                <label className="block text-sm font-medium text-gray-600 mb-1.5" style={{ fontFamily: 'DigiHamisheBold, Arial, sans-serif' }}>
                  {language === 'fa' ? 'تاریخ برگشت' : t('home.flightSearch.returnDate')}
                </label>
                <DatePicker
                  selected={returnDate}
                  onChange={(date: Date | null) => setReturnDate(date)}
                  minDate={departureDate || new Date()}
                  dateFormat={language === 'fa' ? 'yyyy/MM/dd' : 'yyyy-MM-dd'}
                  locale={language === 'fa' ? 'fa' : undefined}
                  className="w-full px-2 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-900 focus:border-blue-900 bg-white"
                  wrapperClassName="w-full"
                  popperPlacement="top-start"
                  renderCustomHeader={(props) => renderCustomHeader(props, language)}
                  renderDayContents={language === 'fa' ? renderDayContents : undefined}
                  customInput={language === 'fa' ? <JalaliDateInput date={returnDate} size="large" /> : undefined}
                  required
                />
              </div>
            )}

            {/* Passengers */}
            <div className="flex-shrink-0" style={{ flexBasis: '148px', minWidth: '148px', width: '148px' }}>
              <PassengerSelect
                value={formData.passengers}
                onChange={(value) => setFormData(prev => ({ ...prev, passengers: value }))}
                label={t('home.flightSearch.passengers')}
              />
            </div>

            {/* Class + Search Button - همیشه کنار هم */}
            <div className="flex flex-shrink-0 items-end gap-2.5">
              <div style={{ flexBasis: '148px', minWidth: '148px', width: '148px' }}>
                <label className="block text-sm font-medium text-gray-600 mb-1.5" style={{ fontFamily: 'DigiHamisheBold, Arial, sans-serif' }}>
                  {t('home.flightSearch.class')}
                </label>
                <div className="h-12">
                  <CustomSelect
                    value={formData.class}
                    onChange={(value) => setFormData(prev => ({ ...prev, class: value as any }))}
                    options={[
                      { value: 'economy', label: t('class.economy') },
                      { value: 'business', label: t('class.business') },
                      { value: 'first', label: t('class.first') }
                    ]}
                    placeholder={t('class.economy')}
                    dropdownPosition="top"
                  />
                </div>
              </div>
              <button
                type="submit"
                className="bg-blue-900 hover:bg-blue-800 text-white font-bold px-5 py-3 rounded-lg transition-all transform hover:scale-105 shadow-lg flex items-center gap-2 whitespace-nowrap shrink-0"
                style={{ fontFamily: 'DigiHamisheBold, Arial, sans-serif', height: '48px', minHeight: '48px', minWidth: 'max-content', fontSize: '15px' }}
              >
                <PaperAirplaneIcon className="w-5 h-5" />
                {t('home.flightSearch.search')}
              </button>
            </div>
          </div>
        </form>
      )}

      {activeTab === 'manage' && (
        <div className="p-8">
          <div className="flex gap-2 items-end">
            {/* National ID / Passport */}
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-600 mb-1" style={{ fontFamily: 'DigiHamisheBold, Arial, sans-serif' }}>
                {t('home.flightSearch.nationalIdPassport')}
              </label>
              <input
                type="text"
                placeholder={t('home.flightSearch.nationalIdPlaceholder')}
                className="w-full px-4 py-3.5 text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-900 focus:border-blue-900 bg-white"
                style={{ fontFamily: 'DigiHamisheBold, Arial, sans-serif', direction: 'rtl' }}
                required
              />
            </div>

            {/* PNR */}
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-600 mb-1" style={{ fontFamily: 'DigiHamisheBold, Arial, sans-serif' }}>
                {t('home.flightSearch.pnrCode')}
              </label>
              <input
                type="text"
                placeholder={t('home.flightSearch.pnrPlaceholder')}
                className="w-full px-4 py-3.5 text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-900 focus:border-blue-900 bg-white"
                style={{ fontFamily: 'DigiHamisheBold, Arial, sans-serif', direction: 'rtl' }}
                required
              />
            </div>

            {/* Search Button */}
            <button
              type="button"
              onClick={() => navigate('/booking/manage')}
              className="bg-blue-900 hover:bg-blue-800 text-white font-bold px-8 py-3 rounded-lg transition-all transform hover:scale-105 shadow-lg flex items-center gap-2.5 whitespace-nowrap"
              style={{ fontFamily: 'DigiHamisheBold, Arial, sans-serif', height: '48px', fontSize: '16px' }}
            >
              <PaperAirplaneIcon className="w-5 h-5" />
              {t('home.flightSearch.track')}
            </button>
          </div>
        </div>
      )}

      {/* Services Tab */}
      {activeTab === 'services' && (
        <div className="p-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <button
              onClick={() => navigate('/services/seat-selection')}
              className="p-5 bg-gradient-to-br from-blue-50 to-white border border-blue-200 rounded-lg hover:shadow-lg transition-all group"
            >
              <TicketIcon className="w-10 h-10 text-blue-900 mx-auto mb-3 group-hover:scale-110 transition-transform" />
              <p className="text-lg font-bold text-gray-900" style={{ fontFamily: 'DigiHamisheBold, Arial, sans-serif' }}>
                {t('home.flightSearch.seatSelection')}
              </p>
            </button>
            <button
              onClick={() => navigate('/services/extra-baggage')}
              className="p-5 bg-gradient-to-br from-blue-50 to-white border border-blue-200 rounded-lg hover:shadow-lg transition-all group"
            >
              <TagIcon className="w-10 h-10 text-blue-900 mx-auto mb-3 group-hover:scale-110 transition-transform" />
              <p className="text-lg font-bold text-gray-900" style={{ fontFamily: 'DigiHamisheBold, Arial, sans-serif' }}>
                {t('home.flightSearch.extraBaggage')}
              </p>
            </button>
            <button
              onClick={() => navigate('/services/pet-travel')}
              className="p-5 bg-gradient-to-br from-blue-50 to-white border border-blue-200 rounded-lg hover:shadow-lg transition-all group"
            >
              <MapPinIcon className="w-10 h-10 text-blue-900 mx-auto mb-3 group-hover:scale-110 transition-transform" />
              <p className="text-lg font-bold text-gray-900" style={{ fontFamily: 'DigiHamisheBold, Arial, sans-serif' }}>
                {t('home.flightSearch.petTravel')}
              </p>
            </button>
            <button
              onClick={() => navigate('/services/wheelchair')}
              className="p-5 bg-gradient-to-br from-blue-50 to-white border border-blue-200 rounded-lg hover:shadow-lg transition-all group"
            >
              <ClockIcon className="w-10 h-10 text-blue-900 mx-auto mb-3 group-hover:scale-110 transition-transform" />
              <p className="text-lg font-bold text-gray-900" style={{ fontFamily: 'DigiHamisheBold, Arial, sans-serif' }}>
                {t('home.flightSearch.wheelchair')}
              </p>
            </button>
          </div>
        </div>
      )}

      {/* What's On Flight Tab */}
      {activeTab === 'whatson' && (
        <div className="p-8">
          <div className="flex gap-2 items-end">
            <div className="flex-1 min-w-0">
              <label className="block text-sm font-medium text-gray-600 mb-1" style={{ fontFamily: 'DigiHamisheBold, Arial, sans-serif' }}>
                {t('home.flightSearch.flightNumber')}
              </label>
              <input
                type="text"
                placeholder={t('home.flightSearch.flightNumberPlaceholder')}
                className="w-full px-3 text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-900 focus:border-blue-900 bg-white"
                style={{ fontFamily: 'DigiHamisheBold, Arial, sans-serif', direction: 'rtl', minHeight: '48px', height: '48px' }}
              />
            </div>
            <div className="flex-1 min-w-0">
              <label className="block text-sm font-medium text-gray-600 mb-1" style={{ fontFamily: 'DigiHamisheBold, Arial, sans-serif' }}>
                {t('home.flightSearch.flightDate')}
              </label>
              <div className="h-12">
                <DatePicker
                  selected={whatsonDate}
                  onChange={(date: Date | null) => setWhatsonDate(date)}
                  minDate={new Date()}
                  dateFormat={language === 'fa' ? 'yyyy/MM/dd' : 'yyyy-MM-dd'}
                  locale={language === 'fa' ? 'fa' : undefined}
                  className="w-full text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-900 focus:border-blue-900 bg-white"
                  wrapperClassName="w-full h-full"
                  popperPlacement="top-start"
                  renderCustomHeader={(props) => renderCustomHeader(props, language)}
                  renderDayContents={language === 'fa' ? renderDayContents : undefined}
                  customInput={language === 'fa' ? <JalaliDateInput date={whatsonDate} size="large" /> : undefined}
                  required
                />
              </div>
            </div>
            <button
              type="button"
              onClick={() => navigate('/flight/amenities')}
              className="bg-blue-900 hover:bg-blue-800 text-white font-bold px-6 py-2 rounded-lg transition-all transform hover:scale-105 shadow-lg flex items-center gap-2 whitespace-nowrap"
              style={{ fontFamily: 'DigiHamisheBold, Arial, sans-serif', height: '48px', fontSize: '16px' }}
            >
              <PaperAirplaneIcon className="w-5 h-5" />
              {t('home.flightSearch.viewAmenities')}
            </button>
          </div>
        </div>
      )}

      {/* Flight Status Tab */}
      {activeTab === 'status' && (
        <div className="p-8">
          <div className="flex gap-2 items-end">
            <div className="flex-1 min-w-0">
              <label className="block text-sm font-medium text-gray-600 mb-1" style={{ fontFamily: 'DigiHamisheBold, Arial, sans-serif' }}>
                {t('home.flightSearch.flightNumber')}
              </label>
              <input
                type="text"
                value={flightStatusForm.flightNumber}
                onChange={(e) => setFlightStatusForm(prev => ({ ...prev, flightNumber: e.target.value }))}
                placeholder={t('home.flightSearch.flightNumberPlaceholder')}
                className="w-full px-3 text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-900 focus:border-blue-900 bg-white"
                style={{ fontFamily: 'DigiHamisheBold, Arial, sans-serif', direction: 'rtl', minHeight: '48px', height: '48px' }}
              />
            </div>
            <div className="flex-1 min-w-0">
              <label className="block text-sm font-medium text-gray-600 mb-1" style={{ fontFamily: 'DigiHamisheBold, Arial, sans-serif' }}>
                {t('home.flightSearch.flightDate')}
              </label>
              <div className="h-12">
                <DatePicker
                  selected={statusDate}
                  onChange={(date: Date | null) => setStatusDate(date)}
                  minDate={new Date()}
                  dateFormat={language === 'fa' ? 'yyyy/MM/dd' : 'yyyy-MM-dd'}
                  locale={language === 'fa' ? 'fa' : undefined}
                  className="w-full text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-900 focus:border-blue-900 bg-white"
                  wrapperClassName="w-full h-full"
                  popperPlacement="top-start"
                  renderCustomHeader={(props) => renderCustomHeader(props, language)}
                  renderDayContents={language === 'fa' ? renderDayContents : undefined}
                  customInput={language === 'fa' ? <JalaliDateInput date={statusDate} size="large" /> : undefined}
                  required
                />
              </div>
            </div>
            <button
              type="button"
              onClick={() => navigate('/flight/status')}
              className="bg-blue-900 hover:bg-blue-800 text-white font-bold px-6 py-2 rounded-lg transition-all transform hover:scale-105 shadow-lg flex items-center gap-2 whitespace-nowrap"
              style={{ fontFamily: 'DigiHamisheBold, Arial, sans-serif', height: '48px', fontSize: '16px' }}
            >
              <ClockIcon className="w-5 h-5" />
              {t('home.flightSearch.checkStatus')}
            </button>
          </div>
        </div>
      )}
      </div>
    </div>
    </>
  );
};

export default EmiratesFlightSearchForm;

