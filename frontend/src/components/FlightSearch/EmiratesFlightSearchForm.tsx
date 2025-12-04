import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { setSearchParams } from '../../store/slices/flightSlice';
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

const EmiratesFlightSearchForm: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'search' | 'manage' | 'whatson' | 'status' | 'services'>('search');
  const [tripType, setTripType] = useState<'roundtrip' | 'oneway'>('roundtrip');
  const [formData, setFormData] = useState({
    origin: 'THR',
    destination: '',
    departureDate: '',
    returnDate: '',
    passengers: { adults: 1, children: 0, infants: 0 },
    class: 'economy' as 'economy' | 'business' | 'first'
  });
  
  // Flight status form
  const [flightStatusForm, setFlightStatusForm] = useState({
    flightNumber: '',
    date: ''
  });
  
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { t, fontClass } = useLanguage();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.origin || !formData.destination || !formData.departureDate) {
      alert(t('home.flightSearch.pleaseFillFields'));
      return;
    }

    if (tripType === 'roundtrip' && !formData.returnDate) {
      alert(t('home.flightSearch.pleaseReturnDate'));
      return;
    }
    
    const searchParams = {
      origin: formData.origin,
      destination: formData.destination,
      departureDate: formData.departureDate,
      returnDate: tripType === 'roundtrip' ? formData.returnDate : undefined,
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

  return (
    <div className="bg-white/95 backdrop-blur-md rounded-lg shadow-2xl overflow-hidden">
      {/* Tabs */}
      <div className="flex border-b border-gray-200 overflow-x-auto">
        <button
          onClick={() => setActiveTab('search')}
          className={`flex items-center gap-2 px-4 py-3 font-medium transition-colors whitespace-nowrap ${
            activeTab === 'search'
              ? 'text-blue-900 border-b-2 border-blue-900 bg-white'
              : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
          } ${fontClass}`}
          style={{ fontSize: '13px' }}
        >
          <PaperAirplaneIcon className="w-4 h-4" />
          {t('home.flightSearch.bookFlight')}
        </button>
        <button
          onClick={() => setActiveTab('manage')}
          className={`flex items-center gap-2 px-4 py-3 font-medium transition-colors whitespace-nowrap ${
            activeTab === 'manage'
              ? 'text-blue-900 border-b-2 border-blue-900 bg-white'
              : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
          } ${fontClass}`}
          style={{ fontSize: '13px' }}
        >
          <TagIcon className="w-4 h-4" />
          {t('home.flightSearch.manageBooking')}
        </button>
        <button
          onClick={() => setActiveTab('services')}
          className={`flex items-center gap-2 px-4 py-3 font-medium transition-colors whitespace-nowrap ${
            activeTab === 'services'
              ? 'text-blue-900 border-b-2 border-blue-900 bg-white'
              : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
          } ${fontClass}`}
          style={{ fontSize: '13px' }}
        >
          <MapPinIcon className="w-4 h-4" />
          {t('home.flightSearch.specialServices')}
        </button>
        <button
          onClick={() => setActiveTab('whatson')}
          className={`flex items-center gap-2 px-4 py-3 font-medium transition-colors whitespace-nowrap ${
            activeTab === 'whatson'
              ? 'text-blue-900 border-b-2 border-blue-900 bg-white'
              : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
          } ${fontClass}`}
          style={{ fontSize: '13px' }}
        >
          <PaperAirplaneIcon className="w-4 h-4" />
          {t('home.flightSearch.flightFacilities')}
        </button>
        <button
          onClick={() => setActiveTab('status')}
          className={`flex items-center gap-2 px-4 py-3 font-medium transition-colors whitespace-nowrap ${
            activeTab === 'status'
              ? 'text-blue-900 border-b-2 border-blue-900 bg-white'
              : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
          } ${fontClass}`}
          style={{ fontSize: '13px' }}
        >
          <ClockIcon className="w-4 h-4" />
          {t('home.flightSearch.flightStatus')}
        </button>
      </div>

      {/* Tab Content */}
      {activeTab === 'search' && (
        <form onSubmit={handleSearch} className="p-4">
          {/* Trip Type Selector - Compact */}
          <div className="flex gap-2 mb-3">
            <button
              type="button"
              onClick={() => setTripType('roundtrip')}
              className={`px-4 py-1.5 rounded-lg text-sm font-bold transition-all ${
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
              className={`px-4 py-1.5 rounded-lg text-sm font-bold transition-all ${
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
          <div className="flex gap-2 items-end mb-3">
            {/* Origin */}
            <div className="flex-1 relative" style={{ minWidth: '140px' }}>
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
                className="absolute left-0 top-6 transform translate-x-1/2 z-10 w-6 h-6 bg-blue-900 hover:bg-blue-800 text-white rounded-full flex items-center justify-center shadow-lg transition-all hover:scale-110"
                title={t('home.flightSearch.swap')}
              >
                <ArrowsRightLeftIcon className="w-3 h-3" />
              </button>
            </div>

            {/* Destination */}
            <div className="flex-1" style={{ minWidth: '140px' }}>
              <CitySelect
                value={formData.destination}
                onChange={(value) => setFormData(prev => ({ ...prev, destination: value }))}
                label={t('home.flightSearch.destination')}
                placeholder={t('home.flightSearch.destination')}
              />
            </div>

            {/* Departure Date */}
            <div className="flex-1" style={{ minWidth: '130px' }}>
              <label className="block text-xs font-medium text-gray-600 mb-1" style={{ fontFamily: 'DigiHamisheBold, Arial, sans-serif' }}>
                {t('home.flightSearch.departDate')}
              </label>
              <input
                type="date"
                value={formData.departureDate}
                onChange={(e) => setFormData(prev => ({ ...prev, departureDate: e.target.value }))}
                min={new Date().toISOString().split('T')[0]}
                className="w-full px-2 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-900 focus:border-blue-900 bg-white"
                style={{ fontFamily: 'DigiHamisheBold, Arial, sans-serif' }}
                required
              />
            </div>

            {/* Return Date */}
            {tripType === 'roundtrip' && (
              <div className="flex-1" style={{ minWidth: '130px' }}>
                <label className="block text-xs font-medium text-gray-600 mb-1" style={{ fontFamily: 'DigiHamisheBold, Arial, sans-serif' }}>
                  {t('home.flightSearch.returnDate')}
                </label>
                <input
                  type="date"
                  value={formData.returnDate}
                  onChange={(e) => setFormData(prev => ({ ...prev, returnDate: e.target.value }))}
                  min={formData.departureDate || new Date().toISOString().split('T')[0]}
                  className="w-full px-2 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-900 focus:border-blue-900 bg-white"
                  style={{ fontFamily: 'DigiHamisheBold, Arial, sans-serif' }}
                  required
                />
              </div>
            )}

            {/* Passengers */}
            <div className="flex-1" style={{ minWidth: '140px' }}>
              <PassengerSelect
                value={formData.passengers}
                onChange={(value) => setFormData(prev => ({ ...prev, passengers: value }))}
                label={t('home.flightSearch.passengers')}
              />
            </div>

            {/* Class */}
            <div className="flex-1" style={{ minWidth: '120px' }}>
              <label className="block text-xs font-medium text-gray-600 mb-1" style={{ fontFamily: 'DigiHamisheBold, Arial, sans-serif' }}>
                {t('home.flightSearch.class')}
              </label>
              <div style={{ height: '42px' }}>
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

            {/* Search Button */}
            <button
              type="submit"
              className="bg-blue-900 hover:bg-blue-800 text-white font-bold px-6 py-2 rounded-lg transition-all transform hover:scale-105 shadow-lg flex items-center gap-2 whitespace-nowrap"
              style={{ fontFamily: 'DigiHamisheBold, Arial, sans-serif', height: '42px' }}
            >
              <PaperAirplaneIcon className="w-4 h-4" />
              {t('home.flightSearch.search')}
            </button>
          </div>
        </form>
      )}

      {activeTab === 'manage' && (
        <div className="p-4">
          <div className="flex gap-2 items-end">
            {/* National ID / Passport */}
            <div className="flex-1">
              <label className="block text-xs font-medium text-gray-600 mb-1" style={{ fontFamily: 'DigiHamisheBold, Arial, sans-serif' }}>
                {t('home.flightSearch.nationalIdPassport')}
              </label>
              <input
                type="text"
                placeholder={t('home.flightSearch.nationalIdPlaceholder')}
                className="w-full px-2 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-900 focus:border-blue-900 bg-white"
                style={{ fontFamily: 'DigiHamisheBold, Arial, sans-serif', direction: 'rtl' }}
                required
              />
            </div>

            {/* PNR */}
            <div className="flex-1">
              <label className="block text-xs font-medium text-gray-600 mb-1" style={{ fontFamily: 'DigiHamisheBold, Arial, sans-serif' }}>
                {t('home.flightSearch.pnrCode')}
              </label>
              <input
                type="text"
                placeholder={t('home.flightSearch.pnrPlaceholder')}
                className="w-full px-2 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-900 focus:border-blue-900 bg-white"
                style={{ fontFamily: 'DigiHamisheBold, Arial, sans-serif', direction: 'rtl' }}
                required
              />
            </div>

            {/* Search Button */}
            <button
              type="button"
              onClick={() => navigate('/booking/manage')}
              className="bg-blue-900 hover:bg-blue-800 text-white font-bold px-6 py-2 rounded-lg transition-all transform hover:scale-105 shadow-lg flex items-center gap-2 whitespace-nowrap"
              style={{ fontFamily: 'DigiHamisheBold, Arial, sans-serif', height: '42px' }}
            >
              <PaperAirplaneIcon className="w-4 h-4" />
              {t('home.flightSearch.track')}
            </button>
          </div>
        </div>
      )}

      {/* Services Tab */}
      {activeTab === 'services' && (
        <div className="p-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <button
              onClick={() => navigate('/services/seat-selection')}
              className="p-4 bg-gradient-to-br from-blue-50 to-white border border-blue-200 rounded-lg hover:shadow-lg transition-all group"
            >
              <TicketIcon className="w-8 h-8 text-blue-900 mx-auto mb-2 group-hover:scale-110 transition-transform" />
              <p className="text-sm font-bold text-gray-900" style={{ fontFamily: 'DigiHamisheBold, Arial, sans-serif' }}>
                {t('home.flightSearch.seatSelection')}
              </p>
            </button>
            <button
              onClick={() => navigate('/services/extra-baggage')}
              className="p-4 bg-gradient-to-br from-blue-50 to-white border border-blue-200 rounded-lg hover:shadow-lg transition-all group"
            >
              <TagIcon className="w-8 h-8 text-blue-900 mx-auto mb-2 group-hover:scale-110 transition-transform" />
              <p className="text-sm font-bold text-gray-900" style={{ fontFamily: 'DigiHamisheBold, Arial, sans-serif' }}>
                {t('home.flightSearch.extraBaggage')}
              </p>
            </button>
            <button
              onClick={() => navigate('/services/pet-travel')}
              className="p-4 bg-gradient-to-br from-blue-50 to-white border border-blue-200 rounded-lg hover:shadow-lg transition-all group"
            >
              <MapPinIcon className="w-8 h-8 text-blue-900 mx-auto mb-2 group-hover:scale-110 transition-transform" />
              <p className="text-sm font-bold text-gray-900" style={{ fontFamily: 'DigiHamisheBold, Arial, sans-serif' }}>
                {t('home.flightSearch.petTravel')}
              </p>
            </button>
            <button
              onClick={() => navigate('/services/wheelchair')}
              className="p-4 bg-gradient-to-br from-blue-50 to-white border border-blue-200 rounded-lg hover:shadow-lg transition-all group"
            >
              <ClockIcon className="w-8 h-8 text-blue-900 mx-auto mb-2 group-hover:scale-110 transition-transform" />
              <p className="text-sm font-bold text-gray-900" style={{ fontFamily: 'DigiHamisheBold, Arial, sans-serif' }}>
                {t('home.flightSearch.wheelchair')}
              </p>
            </button>
          </div>
        </div>
      )}

      {/* What's On Flight Tab */}
      {activeTab === 'whatson' && (
        <div className="p-4">
          <div className="flex gap-2 items-end">
            <div className="flex-1">
              <label className="block text-xs font-medium text-gray-600 mb-1" style={{ fontFamily: 'DigiHamisheBold, Arial, sans-serif' }}>
                {t('home.flightSearch.flightNumber')}
              </label>
              <input
                type="text"
                placeholder={t('home.flightSearch.flightNumberPlaceholder')}
                className="w-full px-2 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-900 focus:border-blue-900 bg-white"
                style={{ fontFamily: 'DigiHamisheBold, Arial, sans-serif', direction: 'rtl' }}
              />
            </div>
            <div className="flex-1">
              <label className="block text-xs font-medium text-gray-600 mb-1" style={{ fontFamily: 'DigiHamisheBold, Arial, sans-serif' }}>
                {t('home.flightSearch.flightDate')}
              </label>
              <input
                type="date"
                className="w-full px-2 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-900 focus:border-blue-900 bg-white"
                style={{ fontFamily: 'DigiHamisheBold, Arial, sans-serif' }}
              />
            </div>
            <button
              type="button"
              onClick={() => navigate('/flight/amenities')}
              className="bg-blue-900 hover:bg-blue-800 text-white font-bold px-6 py-2 rounded-lg transition-all transform hover:scale-105 shadow-lg flex items-center gap-2 whitespace-nowrap"
              style={{ fontFamily: 'DigiHamisheBold, Arial, sans-serif', height: '42px' }}
            >
              <PaperAirplaneIcon className="w-4 h-4" />
              {t('home.flightSearch.viewAmenities')}
            </button>
          </div>
        </div>
      )}

      {/* Flight Status Tab */}
      {activeTab === 'status' && (
        <div className="p-4">
          <div className="flex gap-2 items-end">
            <div className="flex-1">
              <label className="block text-xs font-medium text-gray-600 mb-1" style={{ fontFamily: 'DigiHamisheBold, Arial, sans-serif' }}>
                {t('home.flightSearch.flightNumber')}
              </label>
              <input
                type="text"
                value={flightStatusForm.flightNumber}
                onChange={(e) => setFlightStatusForm(prev => ({ ...prev, flightNumber: e.target.value }))}
                placeholder={t('home.flightSearch.flightNumberPlaceholder')}
                className="w-full px-2 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-900 focus:border-blue-900 bg-white"
                style={{ fontFamily: 'DigiHamisheBold, Arial, sans-serif', direction: 'rtl' }}
              />
            </div>
            <div className="flex-1">
              <label className="block text-xs font-medium text-gray-600 mb-1" style={{ fontFamily: 'DigiHamisheBold, Arial, sans-serif' }}>
                {t('home.flightSearch.flightDate')}
              </label>
              <input
                type="date"
                value={flightStatusForm.date}
                onChange={(e) => setFlightStatusForm(prev => ({ ...prev, date: e.target.value }))}
                className="w-full px-2 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-900 focus:border-blue-900 bg-white"
                style={{ fontFamily: 'DigiHamisheBold, Arial, sans-serif' }}
              />
            </div>
            <button
              type="button"
              onClick={() => navigate('/flight/status')}
              className="bg-blue-900 hover:bg-blue-800 text-white font-bold px-6 py-2 rounded-lg transition-all transform hover:scale-105 shadow-lg flex items-center gap-2 whitespace-nowrap"
              style={{ fontFamily: 'DigiHamisheBold, Arial, sans-serif', height: '42px' }}
            >
              <ClockIcon className="w-4 h-4" />
              {t('home.flightSearch.checkStatus')}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmiratesFlightSearchForm;

