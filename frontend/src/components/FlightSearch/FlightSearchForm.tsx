import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { setSearchParams } from '../../store/slices/flightSlice';
import { 
  MapPinIcon, 
  CalendarIcon, 
  UserIcon,
  ArrowPathIcon 
} from '@heroicons/react/24/outline';

interface FlightSearchFormProps {
  className?: string;
}

const FlightSearchForm: React.FC<FlightSearchFormProps> = ({ className = '' }) => {
  const [searchType, setSearchType] = useState<'oneway' | 'roundtrip' | 'multicity'>('roundtrip');
  const [formData, setFormData] = useState({
    origin: '',
    destination: '',
    departureDate: '',
    returnDate: '',
    passengers: 1,
    class: 'economy' as 'economy' | 'business' | 'first'
  });
  
  const dispatch = useDispatch();
  const navigate = useNavigate();

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
      returnDate: searchType === 'roundtrip' ? formData.returnDate : undefined,
      passengers: formData.passengers,
      class: formData.class
    };

    dispatch(setSearchParams(searchParams));
    navigate('/flights/search');
  };

  const swapLocations = () => {
    setFormData(prev => ({
      ...prev,
      origin: prev.destination,
      destination: prev.origin
    }));
  };

  return (
    <div className={`bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl p-8 border border-white/20 ${className}`}>
      {/* Search Type Tabs */}
      <div className="flex mb-6">
        <button
          onClick={() => setSearchType('oneway')}
          className={`px-6 py-3 text-sm font-semibold rounded-r-xl border transition-all duration-300 ${
            searchType === 'oneway'
              ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white border-transparent shadow-lg'
              : 'bg-white/80 text-gray-700 border-gray-200 hover:bg-white hover:shadow-md'
          }`}
        >
          یک طرفه
        </button>
        <button
          onClick={() => setSearchType('roundtrip')}
          className={`px-6 py-3 text-sm font-semibold border-t border-b transition-all duration-300 ${
            searchType === 'roundtrip'
              ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white border-transparent shadow-lg'
              : 'bg-white/80 text-gray-700 border-gray-200 hover:bg-white hover:shadow-md'
          }`}
        >
          رفت و برگشت
        </button>
        <button
          onClick={() => setSearchType('multicity')}
          className={`px-6 py-3 text-sm font-semibold rounded-l-xl border transition-all duration-300 ${
            searchType === 'multicity'
              ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white border-transparent shadow-lg'
              : 'bg-white/80 text-gray-700 border-gray-200 hover:bg-white hover:shadow-md'
          }`}
        >
          چند مقصد
        </button>
      </div>

      <form onSubmit={handleSearch} className="space-y-4">
        {/* Origin and Destination */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="relative">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              مبدا
            </label>
            <div className="relative">
              <MapPinIcon className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                name="origin"
                value={formData.origin}
                onChange={handleInputChange}
                placeholder="شهر یا فرودگاه مبدا"
                className="w-full pr-10 pl-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                required
              />
            </div>
          </div>

          <div className="relative">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              مقصد
            </label>
            <div className="relative">
              <MapPinIcon className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                name="destination"
                value={formData.destination}
                onChange={handleInputChange}
                placeholder="شهر یا فرودگاه مقصد"
                className="w-full pr-10 pl-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                required
              />
              <button
                type="button"
                onClick={swapLocations}
                className="absolute left-3 top-1/2 transform -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600"
              >
                <ArrowPathIcon className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Dates */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              تاریخ رفت
            </label>
            <div className="relative">
              <CalendarIcon className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="date"
                name="departureDate"
                value={formData.departureDate}
                onChange={handleInputChange}
                className="w-full pr-10 pl-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                required
              />
            </div>
          </div>

          {searchType === 'roundtrip' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                تاریخ برگشت
              </label>
              <div className="relative">
                <CalendarIcon className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="date"
                  name="returnDate"
                  value={formData.returnDate}
                  onChange={handleInputChange}
                  className="w-full pr-10 pl-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                />
              </div>
            </div>
          )}
        </div>

        {/* Passengers and Class */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              تعداد مسافران
            </label>
            <div className="relative">
              <UserIcon className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <select
                name="passengers"
                value={formData.passengers}
                onChange={handleInputChange}
                className="w-full pr-10 pl-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              >
                <option value={1}>1 مسافر</option>
                <option value={2}>2 مسافر</option>
                <option value={3}>3 مسافر</option>
                <option value={4}>4 مسافر</option>
                <option value={5}>5 مسافر</option>
                <option value={6}>6 مسافر</option>
                <option value={7}>7 مسافر</option>
                <option value={8}>8 مسافر</option>
                <option value={9}>9 مسافر</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              کلاس پرواز
            </label>
            <select
              name="class"
              value={formData.class}
              onChange={handleInputChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            >
              <option value="economy">اکونومی</option>
              <option value="business">بیزنس</option>
              <option value="first">فرست کلاس</option>
            </select>
          </div>
        </div>

        {/* Search Button */}
        <button
          type="submit"
          className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white py-4 px-8 rounded-xl font-semibold text-lg hover:from-blue-600 hover:to-purple-700 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          ✈️ جستجوی پرواز
        </button>
      </form>
    </div>
  );
};

export default FlightSearchForm;
