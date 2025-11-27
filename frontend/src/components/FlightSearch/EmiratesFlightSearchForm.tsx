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
  XMarkIcon
} from '@heroicons/react/24/outline';
import { useLanguage } from '../../contexts/LanguageContext';

const EmiratesFlightSearchForm: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'search' | 'manage' | 'whatson' | 'status'>('search');
  const [formData, setFormData] = useState({
    origin: 'Tehran (IKA)',
    destination: '',
    departureDate: '',
    returnDate: '',
    passengers: 1,
    class: 'economy' as 'economy' | 'business' | 'first'
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
    
    const searchParams = {
      origin: formData.origin,
      destination: formData.destination,
      departureDate: formData.departureDate,
      returnDate: formData.returnDate || undefined,
      passengers: formData.passengers,
      class: formData.class
    };

    dispatch(setSearchParams(searchParams));
    navigate('/flights/search');
  };

  const clearOrigin = () => {
    setFormData(prev => ({ ...prev, origin: '' }));
  };

  return (
    <div className="bg-white/95 backdrop-blur-md rounded-lg shadow-2xl overflow-hidden">
      {/* Tabs */}
      <div className="flex border-b border-gray-200">
        <button
          onClick={() => setActiveTab('search')}
          className={`flex items-center gap-2 px-6 py-4 font-medium transition-colors ${
            activeTab === 'search'
              ? 'text-blue-600 border-b-2 border-blue-600 bg-white'
              : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
          } ${fontClass}`}
          style={{ 
            textTransform: 'none',
            fontSize: '14px'
          }}
        >
          <PaperAirplaneIcon className="w-5 h-5" />
          {t('nav.bookFlights') || 'Search flights'}
        </button>
        <button
          onClick={() => setActiveTab('manage')}
          className={`flex items-center gap-2 px-6 py-4 font-medium transition-colors ${
            activeTab === 'manage'
              ? 'text-blue-600 border-b-2 border-blue-600 bg-white'
              : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
          } ${fontClass}`}
          style={{ 
            textTransform: 'none',
            fontSize: '14px'
          }}
        >
          <TagIcon className="w-5 h-5" />
          {t('nav.manageBooking') || 'Manage booking / Check in'}
        </button>
        <button
          onClick={() => setActiveTab('whatson')}
          className={`flex items-center gap-2 px-6 py-4 font-medium transition-colors ${
            activeTab === 'whatson'
              ? 'text-blue-600 border-b-2 border-blue-600 bg-white'
              : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
          } ${fontClass}`}
          style={{ 
            textTransform: 'none',
            fontSize: '14px'
          }}
        >
          <PaperAirplaneIcon className="w-5 h-5" />
          {t('nav.whatsOnFlight') || 'What\'s on your flight'}
        </button>
        <button
          onClick={() => setActiveTab('status')}
          className={`flex items-center gap-2 px-6 py-4 font-medium transition-colors ${
            activeTab === 'status'
              ? 'text-blue-600 border-b-2 border-blue-600 bg-white'
              : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
          } ${fontClass}`}
          style={{ 
            textTransform: 'none',
            fontSize: '14px'
          }}
        >
          <ClockIcon className="w-5 h-5" />
          {t('nav.flightStatus') || 'Flight status'}
        </button>
      </div>

      {/* Tab Content */}
      {activeTab === 'search' && (
        <form onSubmit={handleSearch} className="p-6">
          <div className="flex gap-4 items-end">
            {/* Origin */}
            <div className="flex-1">
              <label className={`block text-xs font-medium text-gray-600 mb-2 uppercase tracking-wide ${fontClass}`}>
                {t('home.flightSearch.from') || 'Departure airport'}
              </label>
              <div className="relative">
                <MapPinIcon className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none" />
                <input
                  type="text"
                  name="origin"
                  value={formData.origin}
                  onChange={handleInputChange}
                  placeholder={t('home.flightSearch.cityOrAirport') || 'City or airport'}
                  className="w-full pr-10 pl-10 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm bg-white"
                  style={{ paddingRight: '2.5rem', paddingLeft: '2.5rem' }}
                />
                {formData.origin && (
                  <button
                    type="button"
                    onClick={clearOrigin}
                    className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 z-10"
                  >
                    <XMarkIcon className="w-5 h-5" />
                  </button>
                )}
              </div>
            </div>

            {/* Destination */}
            <div className="flex-1">
              <label className={`block text-xs font-medium text-gray-600 mb-2 uppercase tracking-wide ${fontClass}`}>
                {t('home.flightSearch.to') || 'Arrival airport'}
              </label>
              <div className="relative">
                <MapPinIcon className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none" />
                <input
                  type="text"
                  name="destination"
                  value={formData.destination}
                  onChange={handleInputChange}
                  placeholder={t('home.flightSearch.cityOrAirport') || 'City or airport'}
                  className="w-full pr-10 pl-10 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm bg-white"
                  style={{ paddingRight: '2.5rem', paddingLeft: '2.5rem' }}
                />
              </div>
            </div>

            {/* Continue Button */}
            <button
              type="submit"
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-8 py-3 rounded-lg transition-colors whitespace-nowrap"
              style={{ 
                minWidth: '120px',
                height: '48px'
              }}
            >
              {t('common.continue') || 'Continue'}
            </button>
          </div>

          {/* Advanced Search Link */}
          <div className="mt-4">
            <a 
              href="#" 
              className={`text-blue-600 hover:text-blue-700 text-sm ${fontClass}`}
              style={{ textDecoration: 'none' }}
            >
              {t('home.flightSearch.advancedSearch') || 'Advanced search: multi-city, promo codes, flydubai and partner airlines >'}
            </a>
          </div>
        </form>
      )}

      {activeTab === 'manage' && (
        <div className="p-6">
          <p className={`text-gray-600 ${fontClass}`}>
            {t('nav.manageBooking') || 'مدیریت رزرو و چک این'}
          </p>
        </div>
      )}

      {activeTab === 'whatson' && (
        <div className="p-6">
          <p className={`text-gray-600 ${fontClass}`}>
            {t('nav.whatsOnFlight') || 'آنچه در پرواز شماست'}
          </p>
        </div>
      )}

      {activeTab === 'status' && (
        <div className="p-6">
          <p className={`text-gray-600 ${fontClass}`}>
            {t('nav.flightStatus') || 'وضعیت پرواز'}
          </p>
        </div>
      )}
    </div>
  );
};

export default EmiratesFlightSearchForm;

