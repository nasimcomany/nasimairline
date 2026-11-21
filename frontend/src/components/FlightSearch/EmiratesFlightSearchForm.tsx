import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { setSearchParams } from '../../store/slices/flightSlice';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { 
  PaperAirplaneIcon, 
  MapPinIcon, 
  TagIcon,
  ClockIcon,
  ArrowsRightLeftIcon,
  TicketIcon
} from '@heroicons/react/24/outline';
import { useLanguage } from '../../contexts/LanguageContext';
import { useChat } from '../../contexts/ChatContext';
import CitySelect from './CitySelect';
import PassengerSelect from './PassengerSelect';
import CustomSelect from '../CustomSelect/CustomSelect';
import JalaliBookingDatePicker from './JalaliBookingDatePicker';
import { toLocalDateISO } from '../../utils/dateFormatter';

interface EmiratesFlightSearchFormProps {
  onTabChange?: (tab: 'search' | 'manage' | 'whatson' | 'status' | 'services') => void;
}

const englishMonths = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

/** Month/year selects for Gregorian (EN) react-datepicker */
const renderCustomHeader = (props: {
  date: Date;
  changeYear: (year: number) => void;
  changeMonth: (month: number) => void;
  decreaseMonth: () => void;
  increaseMonth: () => void;
  prevMonthButtonDisabled: boolean;
  nextMonthButtonDisabled: boolean;
}): React.ReactElement => {
  const {
    date,
    changeYear,
    changeMonth,
    decreaseMonth,
    increaseMonth,
    prevMonthButtonDisabled,
    nextMonthButtonDisabled,
  } = props;

  const selectStyle: React.CSSProperties = {
    fontSize: '15px',
    fontWeight: 700,
    color: '#1e3a8a',
    background: '#fff',
    border: '1px solid #cbd5e1',
    borderRadius: 8,
    padding: '8px 10px',
    minHeight: 40,
    maxWidth: '100%',
    cursor: 'pointer',
  };

  const navBtnStyle: React.CSSProperties = {
    width: 40,
    height: 40,
    borderRadius: 8,
    border: '1px solid #cbd5e1',
    background: '#fff',
    color: '#1e3a8a',
    fontSize: 20,
    lineHeight: 1,
    cursor: 'pointer',
    flexShrink: 0,
  };

  const gy = date.getFullYear();
  const gm = date.getMonth();
  const nowY = new Date().getFullYear();
  const years: number[] = [];
  for (let y = nowY; y <= nowY + 4; y += 1) years.push(y);

  return (
    <div
      className="nasim-dp-header"
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 8,
        padding: '10px 12px 6px',
      }}
    >
      <button type="button" style={navBtnStyle} onClick={decreaseMonth} disabled={prevMonthButtonDisabled} aria-label="Previous month">
        ‹
      </button>
      <div style={{ display: 'flex', gap: 6, flex: 1, minWidth: 0 }}>
        <select
          aria-label="Month"
          value={gm}
          onChange={(e) => changeMonth(Number(e.target.value))}
          style={{ ...selectStyle, flex: 1.4 }}
        >
          {englishMonths.map((name, idx) => (
            <option key={name} value={idx}>{name}</option>
          ))}
        </select>
        <select
          aria-label="Year"
          value={gy}
          onChange={(e) => changeYear(Number(e.target.value))}
          style={{ ...selectStyle, flex: 1 }}
        >
          {years.map((y) => (
            <option key={y} value={y}>{y}</option>
          ))}
        </select>
      </div>
      <button type="button" style={navBtnStyle} onClick={increaseMonth} disabled={nextMonthButtonDisabled} aria-label="Next month">
        ›
      </button>
    </div>
  );
};

const EmiratesFlightSearchForm: React.FC<EmiratesFlightSearchFormProps> = ({ onTabChange }) => {
  const { openChat } = useChat();
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
      departureDate: toLocalDateISO(departureDate),
      returnDate: tripType === 'roundtrip' && returnDate ? toLocalDateISO(returnDate) : undefined,
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
        .react-datepicker-popper,
        .react-datepicker__portal {
          z-index: 10050 !important;
        }
        .react-datepicker__portal {
          background: rgba(15, 23, 42, 0.35);
          display: flex !important;
          align-items: center;
          justify-content: center;
          padding: 12px;
        }
        .react-datepicker {
          font-family: ${language === 'fa' ? "'DigiHamisheBold', 'DigiHamishe', Tahoma, sans-serif" : 'inherit'} !important;
          direction: ${language === 'fa' ? 'rtl' : 'ltr'};
          border: 1px solid #cbd5e1 !important;
          border-radius: 16px !important;
          box-shadow: 0 18px 40px rgba(15, 23, 42, 0.18) !important;
          overflow: hidden;
          width: min(340px, calc(100vw - 1.5rem)) !important;
          max-width: min(340px, calc(100vw - 1.5rem)) !important;
        }
        .react-datepicker__header {
          background: #f1f5f9 !important;
          border-bottom: 1px solid #e2e8f0 !important;
          padding: 0 0 8px !important;
        }
        .react-datepicker__navigation {
          display: none !important;
        }
        .react-datepicker__current-month,
        .react-datepicker-time__header,
        .react-datepicker-year-header {
          display: none !important;
        }
        .react-datepicker__day-names,
        .react-datepicker__week {
          display: flex;
          justify-content: space-between;
          margin: 0 6px;
        }
        .react-datepicker__day-name,
        .react-datepicker__day {
          width: 2.55rem !important;
          line-height: 2.55rem !important;
          margin: 0.12rem !important;
          font-size: 15px !important;
          border-radius: 10px !important;
          font-family: inherit !important;
        }
        .react-datepicker__day:hover {
          background: #dbeafe !important;
          color: #1e3a8a !important;
        }
        .react-datepicker__day--selected,
        .react-datepicker__day--keyboard-selected {
          background: #1e3a8a !important;
          color: #fff !important;
          font-weight: 700 !important;
        }
        .react-datepicker__day--disabled {
          color: #cbd5e1 !important;
        }
        .react-datepicker__month {
          margin: 0.4rem !important;
        }
        .nasim-dp-header select:focus {
          outline: 2px solid #1e3a8a;
          outline-offset: 1px;
        }
        @media (max-width: 480px) {
          .react-datepicker__day-name,
          .react-datepicker__day {
            width: 2.35rem !important;
            line-height: 2.35rem !important;
            font-size: 14px !important;
          }
        }
      `}</style>
      <div className="rounded-3xl shadow-2xl overflow-visible max-w-full">
      {/* Tabs */}
      <div id="flight-search-tabs" className="flex border-b border-gray-300/30 bg-gray-400/30 backdrop-blur-xl rounded-t-3xl">
        <button
          onClick={() => handleTabChange('search')}
          className={`flex items-center gap-2.5 px-7 py-5 font-medium transition-colors whitespace-nowrap shrink-0 ${
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
          className={`flex items-center gap-2.5 px-7 py-5 font-medium transition-colors whitespace-nowrap shrink-0 ${
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
          className={`flex items-center gap-2.5 px-7 py-5 font-medium transition-colors whitespace-nowrap shrink-0 ${
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
          className={`flex items-center gap-2.5 px-7 py-5 font-medium transition-colors whitespace-nowrap shrink-0 ${
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
          className={`flex items-center gap-2.5 px-7 py-5 font-medium transition-colors whitespace-nowrap shrink-0 ${
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
          {/* Trip Type Selector */}
          <div className="flex flex-wrap gap-3 mb-5">
            <button
              type="button"
              onClick={() => setTripType('roundtrip')}
              className={`px-8 py-4 rounded-lg text-lg font-bold transition-all ${
                tripType === 'roundtrip'
                  ? 'bg-blue-900 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
              style={{ fontFamily: 'DigiHamishe, DigiHamisheBold, sans-serif' }}
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
              style={{ fontFamily: 'DigiHamishe, DigiHamisheBold, sans-serif' }}
            >
              {t('home.flightSearch.oneWay')}
            </button>
          </div>

          {/* Desktop single-row fields (phones use desktop-scale viewport) */}
          <div
            className={`grid gap-3 items-end w-full ${
              tripType === 'roundtrip'
                ? 'grid-cols-[minmax(0,1.2fr)_minmax(0,1.2fr)_minmax(0,1fr)_minmax(0,1fr)_minmax(0,0.95fr)_minmax(0,0.9fr)_auto]'
                : 'grid-cols-[minmax(0,1.25fr)_minmax(0,1.25fr)_minmax(0,1fr)_minmax(0,0.95fr)_minmax(0,0.9fr)_auto]'
            }`}
          >
            {/* Origin */}
            <div className="relative min-w-0 w-full">
              <CitySelect
                value={formData.origin}
                onChange={(value) => setFormData(prev => ({ ...prev, origin: value, destination: '' }))}
                label={t('home.flightSearch.origin')}
                placeholder={t('home.flightSearch.origin')}
                mode="origin"
              />
              <button
                type="button"
                onClick={swapCities}
                className="absolute z-20 w-8 h-8 bg-blue-900 hover:bg-blue-800 text-white rounded-full flex items-center justify-center shadow-lg transition-all hover:scale-110 left-0 top-[2.4rem] -translate-x-1/2"
                title={t('home.flightSearch.swap')}
                aria-label={t('home.flightSearch.swap')}
              >
                <ArrowsRightLeftIcon className="w-4 h-4" />
              </button>
            </div>

            {/* Destination */}
            <div className="min-w-0 w-full pl-2">
              <CitySelect
                value={formData.destination}
                onChange={(value) => setFormData(prev => ({ ...prev, destination: value }))}
                label={t('home.flightSearch.destination')}
                placeholder={
                  formData.origin
                    ? t('home.flightSearch.destination')
                    : (language === 'fa' ? 'ابتدا مبدا را انتخاب کنید' : 'Select origin first')
                }
                mode="destination"
                originCode={formData.origin}
              />
            </div>

            {/* Departure Date */}
            <div className="min-w-0 w-full">
              <label className="block text-sm font-medium text-gray-600 mb-1.5" style={{ fontFamily: 'DigiHamishe, DigiHamisheBold, sans-serif' }}>
                {language === 'fa' ? 'تاریخ رفت' : t('home.flightSearch.departDate')}
              </label>
              {language === 'fa' ? (
                <JalaliBookingDatePicker
                  value={departureDate}
                  onChange={(date) => {
                    setDepartureDate(date);
                    if (date && returnDate && returnDate < date) {
                      setReturnDate(null);
                    }
                  }}
                  minDate={new Date()}
                  placeholder="انتخاب تاریخ"
                />
              ) : (
                <DatePicker
                  selected={departureDate}
                  onChange={(date: Date | null) => {
                    setDepartureDate(date);
                    if (date && returnDate && returnDate < date) {
                      setReturnDate(null);
                    }
                  }}
                  minDate={new Date()}
                  dateFormat="yyyy-MM-dd"
                  className="w-full px-2 py-2.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-900 focus:border-blue-900 bg-white h-12 box-border"
                  wrapperClassName="w-full block"
                  withPortal
                  portalId="nasim-datepicker-portal"
                  popperPlacement="bottom-start"
                  popperProps={{ strategy: 'fixed' }}
                  renderCustomHeader={renderCustomHeader}
                  shouldCloseOnSelect
                  required
                />
              )}
            </div>

            {/* Return Date */}
            {tripType === 'roundtrip' && (
              <div className="min-w-0 w-full relative z-20">
                <label className="block text-sm font-medium text-gray-600 mb-1.5" style={{ fontFamily: 'DigiHamishe, DigiHamisheBold, sans-serif' }}>
                  {language === 'fa' ? 'تاریخ برگشت' : t('home.flightSearch.returnDate')}
                </label>
                {language === 'fa' ? (
                  <JalaliBookingDatePicker
                    value={returnDate}
                    onChange={setReturnDate}
                    minDate={departureDate || new Date()}
                    placeholder="انتخاب تاریخ"
                  />
                ) : (
                  <DatePicker
                    selected={returnDate}
                    onChange={(date: Date | null) => setReturnDate(date)}
                    minDate={departureDate || new Date()}
                    openToDate={returnDate || departureDate || new Date()}
                    dateFormat="yyyy-MM-dd"
                    className="w-full px-2 py-2.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-900 focus:border-blue-900 bg-white h-12 box-border"
                    wrapperClassName="w-full block"
                    withPortal
                    portalId="nasim-datepicker-portal"
                    popperPlacement="bottom-end"
                    popperProps={{ strategy: 'fixed' }}
                    renderCustomHeader={renderCustomHeader}
                    shouldCloseOnSelect
                    required
                  />
                )}
              </div>
            )}

            {/* Passengers */}
            <div className="min-w-0 w-full">
              <PassengerSelect
                value={formData.passengers}
                onChange={(value) => setFormData(prev => ({ ...prev, passengers: value }))}
                label={t('home.flightSearch.passengers')}
              />
            </div>

            {/* Class */}
            <div className="min-w-0 w-full">
              <label className="block text-sm font-medium text-gray-600 mb-1.5" style={{ fontFamily: 'DigiHamishe, DigiHamisheBold, sans-serif' }}>
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

            {/* Search */}
            <div className="min-w-0 w-full sm:col-span-2 lg:col-span-1 xl:col-span-1">
              <label className="hidden xl:block text-sm font-medium text-transparent mb-1.5 select-none" aria-hidden>.</label>
              <button
                type="submit"
                className="w-full xl:min-w-[7.25rem] bg-blue-900 hover:bg-blue-800 text-white font-bold px-4 py-3 rounded-lg transition-all hover:scale-[1.02] shadow-lg flex items-center justify-center gap-2 whitespace-nowrap"
                style={{ fontFamily: 'DigiHamishe, DigiHamisheBold, sans-serif', height: '48px', minHeight: '48px', fontSize: '15px' }}
              >
                <PaperAirplaneIcon className="w-5 h-5" />
                {t('home.flightSearch.search')}
              </button>
            </div>
          </div>
        </form>
      )}

      {activeTab === 'manage' && (
        <div className="p-4 sm:p-6 md:p-8">
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-2 items-stretch sm:items-end">
            {/* National ID / Passport */}
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-600 mb-1" style={{ fontFamily: 'DigiHamishe, DigiHamisheBold, sans-serif' }}>
                {t('home.flightSearch.nationalIdPassport')}
              </label>
              <input
                type="text"
                placeholder={t('home.flightSearch.nationalIdPlaceholder')}
                className="w-full px-4 py-3.5 text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-900 focus:border-blue-900 bg-white"
                style={{ fontFamily: 'DigiHamishe, DigiHamisheBold, sans-serif', direction: 'rtl' }}
                required
              />
            </div>

            {/* PNR */}
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-600 mb-1" style={{ fontFamily: 'DigiHamishe, DigiHamisheBold, sans-serif' }}>
                {t('home.flightSearch.pnrCode')}
              </label>
              <input
                type="text"
                placeholder={t('home.flightSearch.pnrPlaceholder')}
                className="w-full px-4 py-3.5 text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-900 focus:border-blue-900 bg-white"
                style={{ fontFamily: 'DigiHamishe, DigiHamisheBold, sans-serif', direction: 'rtl' }}
                required
              />
            </div>

            {/* Search Button */}
            <button
              type="button"
              onClick={() => navigate('/booking/manage')}
              className="w-full sm:w-auto bg-blue-900 hover:bg-blue-800 text-white font-bold px-8 py-3 rounded-lg transition-all sm:hover:scale-105 shadow-lg flex items-center justify-center gap-2.5 whitespace-nowrap"
              style={{ fontFamily: 'DigiHamishe, DigiHamisheBold, sans-serif', height: '48px', fontSize: '16px' }}
            >
              <PaperAirplaneIcon className="w-5 h-5" />
              {t('home.flightSearch.track')}
            </button>
          </div>
        </div>
      )}

      {/* Services Tab */}
      {activeTab === 'services' && (
        <div className="p-4 sm:p-6 md:p-8">
          <div className="grid grid-cols-1 xs:grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
            <button
              onClick={() => handleTabChange('search')}
              className="p-5 bg-gradient-to-br from-blue-50 to-white border border-blue-200 rounded-lg hover:shadow-lg transition-all group"
            >
              <TicketIcon className="w-10 h-10 text-blue-900 mx-auto mb-3 group-hover:scale-110 transition-transform" />
              <p className="text-lg font-bold text-gray-900" style={{ fontFamily: 'DigiHamishe, DigiHamisheBold, sans-serif' }}>
                {t('home.flightSearch.seatSelection')}
              </p>
            </button>
            <button
              onClick={() => openChat('luggage_tracking')}
              className="p-5 bg-gradient-to-br from-blue-50 to-white border border-blue-200 rounded-lg hover:shadow-lg transition-all group"
            >
              <TagIcon className="w-10 h-10 text-blue-900 mx-auto mb-3 group-hover:scale-110 transition-transform" />
              <p className="text-lg font-bold text-gray-900" style={{ fontFamily: 'DigiHamishe, DigiHamisheBold, sans-serif' }}>
                {t('home.services.luggageTracking')}
              </p>
            </button>
            <button
              onClick={() => navigate('/meal-feedback')}
              className="p-5 bg-gradient-to-br from-blue-50 to-white border border-blue-200 rounded-lg hover:shadow-lg transition-all group"
            >
              <MapPinIcon className="w-10 h-10 text-blue-900 mx-auto mb-3 group-hover:scale-110 transition-transform" />
              <p className="text-lg font-bold text-gray-900" style={{ fontFamily: 'DigiHamishe, DigiHamisheBold, sans-serif' }}>
                {t('home.services.passengerMeal')}
              </p>
            </button>
            <button
              onClick={() => navigate('/flights/map')}
              className="p-5 bg-gradient-to-br from-blue-50 to-white border border-blue-200 rounded-lg hover:shadow-lg transition-all group"
            >
              <ClockIcon className="w-10 h-10 text-blue-900 mx-auto mb-3 group-hover:scale-110 transition-transform" />
              <p className="text-lg font-bold text-gray-900" style={{ fontFamily: 'DigiHamishe, DigiHamisheBold, sans-serif' }}>
                {t('home.services.flightMapSelect')}
              </p>
            </button>
          </div>
        </div>
      )}

      {/* What's On Flight Tab */}
      {activeTab === 'whatson' && (
        <div className="p-4 sm:p-6 md:p-8">
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-2 items-stretch sm:items-end">
            <div className="flex-1 min-w-0">
              <label className="block text-sm font-medium text-gray-600 mb-1" style={{ fontFamily: 'DigiHamishe, DigiHamisheBold, sans-serif' }}>
                {t('home.flightSearch.flightNumber')}
              </label>
              <input
                type="text"
                placeholder={t('home.flightSearch.flightNumberPlaceholder')}
                className="w-full px-3 text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-900 focus:border-blue-900 bg-white"
                style={{ fontFamily: 'DigiHamishe, DigiHamisheBold, sans-serif', direction: 'rtl', minHeight: '48px', height: '48px' }}
              />
            </div>
            <div className="flex-1 min-w-0">
              <label className="block text-sm font-medium text-gray-600 mb-1" style={{ fontFamily: 'DigiHamishe, DigiHamisheBold, sans-serif' }}>
                {t('home.flightSearch.flightDate')}
              </label>
              <div className="h-12">
                {language === 'fa' ? (
                  <JalaliBookingDatePicker
                    value={whatsonDate}
                    onChange={setWhatsonDate}
                    minDate={new Date()}
                    placeholder="انتخاب تاریخ"
                  />
                ) : (
                  <DatePicker
                    selected={whatsonDate}
                    onChange={(date: Date | null) => setWhatsonDate(date)}
                    minDate={new Date()}
                    dateFormat="yyyy-MM-dd"
                    className="w-full text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-900 focus:border-blue-900 bg-white"
                    wrapperClassName="w-full h-full block"
                    withPortal
                    portalId="nasim-datepicker-portal"
                    popperPlacement="bottom-start"
                    popperProps={{ strategy: 'fixed' }}
                    renderCustomHeader={renderCustomHeader}
                    shouldCloseOnSelect
                    required
                  />
                )}
              </div>
            </div>
            <button
              type="button"
              onClick={() => navigate('/flight/amenities')}
              className="w-full sm:w-auto bg-blue-900 hover:bg-blue-800 text-white font-bold px-6 py-2 rounded-lg transition-all sm:hover:scale-105 shadow-lg flex items-center justify-center gap-2 whitespace-nowrap"
              style={{ fontFamily: 'DigiHamishe, DigiHamisheBold, sans-serif', height: '48px', fontSize: '16px' }}
            >
              <PaperAirplaneIcon className="w-5 h-5" />
              {t('home.flightSearch.viewAmenities')}
            </button>
          </div>
        </div>
      )}

      {/* Flight Status Tab */}
      {activeTab === 'status' && (
        <div className="p-4 sm:p-6 md:p-8">
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-2 items-stretch sm:items-end">
            <div className="flex-1 min-w-0">
              <label className="block text-sm font-medium text-gray-600 mb-1" style={{ fontFamily: 'DigiHamishe, DigiHamisheBold, sans-serif' }}>
                {t('home.flightSearch.flightNumber')}
              </label>
              <input
                type="text"
                value={flightStatusForm.flightNumber}
                onChange={(e) => setFlightStatusForm(prev => ({ ...prev, flightNumber: e.target.value }))}
                placeholder={t('home.flightSearch.flightNumberPlaceholder')}
                className="w-full px-3 text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-900 focus:border-blue-900 bg-white"
                style={{ fontFamily: 'DigiHamishe, DigiHamisheBold, sans-serif', direction: 'rtl', minHeight: '48px', height: '48px' }}
              />
            </div>
            <div className="flex-1 min-w-0">
              <label className="block text-sm font-medium text-gray-600 mb-1" style={{ fontFamily: 'DigiHamishe, DigiHamisheBold, sans-serif' }}>
                {t('home.flightSearch.flightDate')}
              </label>
              <div className="h-12">
                {language === 'fa' ? (
                  <JalaliBookingDatePicker
                    value={statusDate}
                    onChange={setStatusDate}
                    minDate={new Date()}
                    placeholder="انتخاب تاریخ"
                  />
                ) : (
                  <DatePicker
                    selected={statusDate}
                    onChange={(date: Date | null) => setStatusDate(date)}
                    minDate={new Date()}
                    dateFormat="yyyy-MM-dd"
                    className="w-full text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-900 focus:border-blue-900 bg-white"
                    wrapperClassName="w-full h-full block"
                    withPortal
                    portalId="nasim-datepicker-portal"
                    popperPlacement="bottom-start"
                    popperProps={{ strategy: 'fixed' }}
                    renderCustomHeader={renderCustomHeader}
                    shouldCloseOnSelect
                    required
                  />
                )}
              </div>
            </div>
            <button
              type="button"
              onClick={() => navigate('/flight/status')}
              className="w-full sm:w-auto bg-blue-900 hover:bg-blue-800 text-white font-bold px-6 py-2 rounded-lg transition-all sm:hover:scale-105 shadow-lg flex items-center justify-center gap-2 whitespace-nowrap"
              style={{ fontFamily: 'DigiHamishe, DigiHamisheBold, sans-serif', height: '48px', fontSize: '16px' }}
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

