import React, { useState } from 'react';
import GlassmorphismHeader from '../components/Layout/GlassmorphismHeader';
import { 
  UserIcon, 
  EnvelopeIcon, 
  PhoneIcon, 
  CreditCardIcon,
  MapPinIcon,
  CalendarDaysIcon,
  UserGroupIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';

const BookingPage: React.FC = () => {
  // Form state
  const [passengerInfo, setPassengerInfo] = useState({
    firstName: '',
    lastName: '',
    nationalId: '',
    email: '',
    phone: '',
    address: ''
  });

  const [flightInfo, setFlightInfo] = useState({
    from: 'تهران (THR)',
    to: 'دبی (DXB)',
    date: '2024-01-15',
    passengers: '2 بزرگسال، 1 کودک',
    seat: '12A',
    price: '$450'
  });

  const [extras, setExtras] = useState({
    insurance: false,
    extraBaggage: false,
    meal: false
  });

  const [selectedSeats, setSelectedSeats] = useState<string[]>([]);
  const [showSeatModal, setShowSeatModal] = useState(false);
  const [show3DViewer, setShow3DViewer] = useState(false);
  const [seatPrices, setSeatPrices] = useState<{[key: string]: number}>({
    'A1': 0, 'B1': 0, 'C1': 0, 'D1': 0,
    'A2': 0, 'B2': 0, 'C2': 0, 'D2': 0,
    'A3': 0, 'B3': 0, 'C3': 0, 'D3': 0,
    'A4': 0, 'B4': 0, 'C4': 0, 'D4': 0,
    'A5': 0, 'B5': 0, 'C5': 0, 'D5': 0,
    'A6': 0, 'B6': 0, 'C6': 0, 'D6': 0,
    'A7': 0, 'B7': 0, 'C7': 0, 'D7': 0,
    'A8': 0, 'B8': 0, 'C8': 0, 'D8': 0,
    'A9': 0, 'B9': 0, 'C9': 0, 'D9': 0,
    'A10': 0, 'B10': 0, 'C10': 0, 'D10': 0,
  });

  // Reserved seats (simulated)
  const reservedSeats = ['A1', 'B2', 'C3', 'D4', 'A5', 'B6'];

  const handleInputChange = (field: string, value: string) => {
    setPassengerInfo(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleExtraChange = (field: string, checked: boolean) => {
    setExtras(prev => ({
      ...prev,
      [field]: checked
    }));
  };

  const handleSeatSelection = (seatId: string) => {
    if (reservedSeats.includes(seatId)) return; // Can't select reserved seats
    
    setSelectedSeats(prev => {
      if (prev.includes(seatId)) {
        return prev.filter(seat => seat !== seatId);
      } else {
        return [...prev, seatId];
      }
    });
  };

  const getSeatPrice = (seatId: string) => {
    const row = parseInt(seatId.slice(1));
    const seat = seatId[0];
    
    // Window seats (A, D) are more expensive
    if (seat === 'A' || seat === 'D') {
      return row <= 5 ? 25 : 15; // Front rows more expensive
    }
    // Middle seats (B, C) are standard
    return row <= 5 ? 15 : 0; // Front rows slightly more expensive
  };

  const getSeatStatus = (seatId: string) => {
    if (reservedSeats.includes(seatId)) return 'reserved';
    if (selectedSeats.includes(seatId)) return 'selected';
    return 'available';
  };

  return (
    <div className="min-h-screen relative overflow-hidden">
      <GlassmorphismHeader />

      {/* Background image */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: 'url(/images/airport-crew.jpg)'
        }}
      >
        {/* Dark overlay for better text readability */}
        <div className="absolute inset-0 bg-black/30"></div>
        
        {/* Runway lights effect */}
        <div className="absolute bottom-0 left-0 right-0 h-32">
          <div className="flex justify-between px-8">
            {[...Array(20)].map((_, i) => (
              <div key={i} className="w-1 h-20 bg-yellow-400/60 blur-sm"></div>
            ))}
          </div>
        </div>
        
        {/* Misty atmosphere */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent"></div>
      </div>

      {/* Main content */}
      <div className="relative z-10 pt-32 pb-16">
        <div className="max-w-3xl mx-auto px-6">
          
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-white mb-2 persian-font-vazir">
              رزرو بلیط پرواز
            </h1>
            <p className="text-blue-200 text-sm persian-font-vazir">
              اطلاعات خود را تکمیل کنید تا رزرو شما نهایی شود
            </p>
          </div>

          {/* Booking form */}
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20 shadow-2xl">
            
            {/* Flight Summary */}
            <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4 mb-6 border border-white/30">
              <h3 className="text-white font-semibold mb-3 text-sm persian-font-vazir flex items-center gap-2">
                <MapPinIcon className="w-4 h-4" />
                خلاصه پرواز
              </h3>
              <div className="grid grid-cols-2 gap-4 text-xs">
                <div>
                  <span className="text-blue-200 persian-font-vazir">مبدا:</span>
                  <span className="text-white mr-2 persian-font-vazir">{flightInfo.from}</span>
                </div>
                <div>
                  <span className="text-blue-200 persian-font-vazir">مقصد:</span>
                  <span className="text-white mr-2 persian-font-vazir">{flightInfo.to}</span>
                </div>
                <div>
                  <span className="text-blue-200 persian-font-vazir">تاریخ:</span>
                  <span className="text-white mr-2 persian-font-vazir">{flightInfo.date}</span>
                </div>
                <div>
                  <span className="text-blue-200 persian-font-vazir">مسافران:</span>
                  <span className="text-white mr-2 persian-font-vazir">{flightInfo.passengers}</span>
                </div>
              </div>
            </div>

            {/* Passenger Information */}
            <div className="mb-6">
              <h3 className="text-white font-semibold mb-4 text-sm persian-font-vazir flex items-center gap-2">
                <UserIcon className="w-4 h-4" />
                اطلاعات مسافر
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="flex items-center gap-1.5 text-white font-medium mb-1.5 text-sm persian-font-vazir">
                    <UserIcon className="w-4 h-4" />
                    نام
                  </label>
                  <input
                    type="text"
                    value={passengerInfo.firstName}
                    onChange={(e) => handleInputChange('firstName', e.target.value)}
                    className="w-full bg-white/80 backdrop-blur-sm rounded-lg p-3 border border-white/50 text-blue-900 placeholder-blue-600/60 focus:outline-none focus:ring-2 focus:ring-blue-500/50 text-sm persian-font-vazir"
                    placeholder="نام خود را وارد کنید"
                  />
                </div>

                <div>
                  <label className="flex items-center gap-1.5 text-white font-medium mb-1.5 text-sm persian-font-vazir">
                    <UserIcon className="w-4 h-4" />
                    نام خانوادگی
                  </label>
                  <input
                    type="text"
                    value={passengerInfo.lastName}
                    onChange={(e) => handleInputChange('lastName', e.target.value)}
                    className="w-full bg-white/80 backdrop-blur-sm rounded-lg p-3 border border-white/50 text-blue-900 placeholder-blue-600/60 focus:outline-none focus:ring-2 focus:ring-blue-500/50 text-sm persian-font-vazir"
                    placeholder="نام خانوادگی خود را وارد کنید"
                  />
                </div>

                <div>
                  <label className="flex items-center gap-1.5 text-white font-medium mb-1.5 text-sm persian-font-vazir">
                    <UserIcon className="w-4 h-4" />
                    کد ملی
                  </label>
                  <input
                    type="text"
                    value={passengerInfo.nationalId}
                    onChange={(e) => handleInputChange('nationalId', e.target.value)}
                    className="w-full bg-white/80 backdrop-blur-sm rounded-lg p-3 border border-white/50 text-blue-900 placeholder-blue-600/60 focus:outline-none focus:ring-2 focus:ring-blue-500/50 text-sm persian-font-vazir"
                    placeholder="کد ملی خود را وارد کنید"
                  />
                </div>

                <div>
                  <label className="flex items-center gap-1.5 text-white font-medium mb-1.5 text-sm persian-font-vazir">
                    <EnvelopeIcon className="w-4 h-4" />
                    ایمیل
                  </label>
                  <input
                    type="email"
                    value={passengerInfo.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    className="w-full bg-white/80 backdrop-blur-sm rounded-lg p-3 border border-white/50 text-blue-900 placeholder-blue-600/60 focus:outline-none focus:ring-2 focus:ring-blue-500/50 text-sm persian-font-vazir"
                    placeholder="ایمیل خود را وارد کنید"
                  />
                </div>

                <div>
                  <label className="flex items-center gap-1.5 text-white font-medium mb-1.5 text-sm persian-font-vazir">
                    <PhoneIcon className="w-4 h-4" />
                    شماره تلفن
                  </label>
                  <input
                    type="tel"
                    value={passengerInfo.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    className="w-full bg-white/80 backdrop-blur-sm rounded-lg p-3 border border-white/50 text-blue-900 placeholder-blue-600/60 focus:outline-none focus:ring-2 focus:ring-blue-500/50 text-sm persian-font-vazir"
                    placeholder="شماره تلفن خود را وارد کنید"
                  />
                </div>

                <div>
                  <label className="flex items-center gap-1.5 text-white font-medium mb-1.5 text-sm persian-font-vazir">
                    <MapPinIcon className="w-4 h-4" />
                    آدرس
                  </label>
                  <input
                    type="text"
                    value={passengerInfo.address}
                    onChange={(e) => handleInputChange('address', e.target.value)}
                    className="w-full bg-white/80 backdrop-blur-sm rounded-lg p-3 border border-white/50 text-blue-900 placeholder-blue-600/60 focus:outline-none focus:ring-2 focus:ring-blue-500/50 text-sm persian-font-vazir"
                    placeholder="آدرس خود را وارد کنید"
                  />
                </div>
              </div>
            </div>

            {/* Seat Selection */}
            <div className="mb-6">
              <h3 className="text-white font-semibold mb-4 text-sm persian-font-vazir flex items-center gap-2">
                <UserGroupIcon className="w-4 h-4" />
                انتخاب صندلی
              </h3>
              
              <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4 border border-white/30">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-white text-sm persian-font-vazir mb-1">
                      صندلی‌های انتخاب شده: {selectedSeats.length > 0 ? selectedSeats.join(', ') : 'هیچ صندلی انتخاب نشده'}
                    </div>
                    {selectedSeats.length > 0 && (
                      <div className="text-blue-200 text-xs persian-font-vazir">
                        هزینه صندلی‌ها: ${selectedSeats.reduce((total, seat) => total + getSeatPrice(seat), 0)}
                      </div>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setShowSeatModal(true)}
                      className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-medium py-2 px-4 rounded-lg transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl persian-font-vazir text-sm"
                    >
                      انتخاب صندلی
                    </button>
                    <button
                      onClick={() => setShow3DViewer(true)}
                      className="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white font-medium py-2 px-4 rounded-lg transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl persian-font-vazir text-sm"
                    >
                      مشاهده فضای سه‌بعدی
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Extras */}
            <div className="mb-6">
              <h3 className="text-white font-semibold mb-4 text-sm persian-font-vazir flex items-center gap-2">
                <CheckCircleIcon className="w-4 h-4" />
                خدمات اضافی
              </h3>
              
              <div className="space-y-3">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={extras.insurance}
                    onChange={(e) => handleExtraChange('insurance', e.target.checked)}
                    className="w-4 h-4 text-blue-600 bg-white/80 border-white/50 rounded focus:ring-blue-500/50"
                  />
                  <span className="text-white text-sm persian-font-vazir">بیمه مسافرتی (+$25)</span>
                </label>

                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={extras.extraBaggage}
                    onChange={(e) => handleExtraChange('extraBaggage', e.target.checked)}
                    className="w-4 h-4 text-blue-600 bg-white/80 border-white/50 rounded focus:ring-blue-500/50"
                  />
                  <span className="text-white text-sm persian-font-vazir">بار اضافی (+$35)</span>
                </label>

                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={extras.meal}
                    onChange={(e) => handleExtraChange('meal', e.target.checked)}
                    className="w-4 h-4 text-blue-600 bg-white/80 border-white/50 rounded focus:ring-blue-500/50"
                  />
                  <span className="text-white text-sm persian-font-vazir">غذای ویژه (+$15)</span>
                </label>
              </div>
            </div>

            {/* Payment Summary */}
            <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4 mb-6 border border-white/30">
              <h3 className="text-white font-semibold mb-3 text-sm persian-font-vazir flex items-center gap-2">
                <CreditCardIcon className="w-4 h-4" />
                خلاصه پرداخت
              </h3>
                <div className="space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-blue-200 persian-font-vazir">بلیط پرواز:</span>
                  <span className="text-white persian-font-vazir">{flightInfo.price}</span>
                </div>
                {selectedSeats.length > 0 && (
                  <div className="flex justify-between">
                    <span className="text-blue-200 persian-font-vazir">هزینه صندلی‌ها:</span>
                    <span className="text-white persian-font-vazir">+${selectedSeats.reduce((total, seat) => total + getSeatPrice(seat), 0)}</span>
                  </div>
                )}
                {extras.insurance && (
                  <div className="flex justify-between">
                    <span className="text-blue-200 persian-font-vazir">بیمه مسافرتی:</span>
                    <span className="text-white persian-font-vazir">+$25</span>
                  </div>
                )}
                {extras.extraBaggage && (
                  <div className="flex justify-between">
                    <span className="text-blue-200 persian-font-vazir">بار اضافی:</span>
                    <span className="text-white persian-font-vazir">+$35</span>
                  </div>
                )}
                {extras.meal && (
                  <div className="flex justify-between">
                    <span className="text-blue-200 persian-font-vazir">غذای ویژه:</span>
                    <span className="text-white persian-font-vazir">+$15</span>
                  </div>
                )}
                <div className="border-t border-white/30 pt-2 mt-2">
                  <div className="flex justify-between">
                    <span className="text-white font-semibold persian-font-vazir">مجموع:</span>
                    <span className="text-white font-semibold persian-font-vazir">
                      ${450 + selectedSeats.reduce((total, seat) => total + getSeatPrice(seat), 0) + 
                        (extras.insurance ? 25 : 0) + 
                        (extras.extraBaggage ? 35 : 0) + 
                        (extras.meal ? 15 : 0)}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Submit button */}
            <button className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl persian-font-vazir">
              تکمیل رزرو و پرداخت
            </button>
          </div>
        </div>
      </div>

      {/* Seat Selection Modal */}
      {showSeatModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            onClick={() => setShowSeatModal(false)}
          ></div>
          
          {/* Modal Content */}
          <div className="relative bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800 rounded-3xl p-8 max-w-4xl w-full mx-4 border border-white/20 shadow-2xl transform transition-all duration-500">
            {/* Close Button */}
            <button
              onClick={() => setShowSeatModal(false)}
              className="absolute top-4 left-4 text-white/70 hover:text-white transition-colors duration-200"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            {/* Modal Header */}
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-white mb-2 persian-font-vazir">
                انتخاب صندلی
              </h2>
              <p className="text-blue-200 text-sm persian-font-vazir">
                صندلی‌های دلخواه خود را انتخاب کنید
              </p>
            </div>

            {/* Compact Airplane Seat Map */}
            <div className="relative w-full bg-gradient-to-b from-gray-100 to-gray-50 rounded-xl p-4 shadow-lg border border-gray-200">
              
              {/* Header */}
              <div className="text-center mb-4">
                <h4 className="text-base font-bold text-gray-800 persian-font-vazir mb-1">نقشه صندلی‌های هواپیما</h4>
                <p className="text-xs text-gray-600 persian-font-vazir">صندلی‌های دلخواه خود را انتخاب کنید</p>
              </div>
              
              {/* Airplane Layout */}
              <div className="max-w-lg mx-auto">
                
                {/* Column Headers */}
                <div className="flex justify-center gap-2 mb-2">
                  <div className="w-8 text-center text-xs font-bold text-gray-700 persian-font-vazir">ردیف</div>
                  <div className="w-8 text-center text-xs font-bold text-gray-700 persian-font-vazir">A</div>
                  <div className="w-8 text-center text-xs font-bold text-gray-700 persian-font-vazir">B</div>
                  <div className="w-6 text-center text-xs font-bold text-gray-700 persian-font-vazir">راهرو</div>
                  <div className="w-8 text-center text-xs font-bold text-gray-700 persian-font-vazir">C</div>
                  <div className="w-8 text-center text-xs font-bold text-gray-700 persian-font-vazir">D</div>
                </div>
                
                {/* Seat Rows */}
                <div className="space-y-1">
                  {[1,2,3,4,5,6,7,8,9,10].map(row => (
                    <div key={row} className="flex items-center justify-center gap-2">
                      {/* Row Number */}
                      <div className="w-8 text-center text-xs font-bold text-gray-600 persian-font-vazir">{row}</div>
                      
                      {/* Left Side Seats */}
                      {['A', 'B'].map(seat => {
                        const seatId = `${seat}${row}`;
                        const status = getSeatStatus(seatId);
                        const price = getSeatPrice(seatId);
                        
                        return (
                          <button
                            key={seatId}
                            onClick={() => handleSeatSelection(seatId)}
                            disabled={status === 'reserved'}
                            className={`
                              w-8 h-8 rounded text-xs font-bold transition-all duration-200 transform
                              ${status === 'reserved' 
                                ? 'bg-red-500 text-white cursor-not-allowed shadow-inner' 
                                : status === 'selected'
                                ? 'bg-blue-600 text-white shadow-lg transform scale-110 border border-blue-300'
                                : 'bg-gray-200 text-gray-700 hover:bg-blue-500 hover:text-white hover:scale-105 hover:shadow-md border border-gray-300'
                              }
                            `}
                            title={`صندلی ${seatId}${price > 0 ? ` (+$${price})` : ''}`}
                          >
                            {seat}
                          </button>
                        );
                      })}
                      
                      {/* Aisle */}
                      <div className="w-6 h-8 bg-amber-200 rounded border border-amber-300 flex items-center justify-center">
                        <div className="w-0.5 h-6 bg-amber-100 rounded-full"></div>
                      </div>
                      
                      {/* Right Side Seats */}
                      {['C', 'D'].map(seat => {
                        const seatId = `${seat}${row}`;
                        const status = getSeatStatus(seatId);
                        const price = getSeatPrice(seatId);
                        
                        return (
                          <button
                            key={seatId}
                            onClick={() => handleSeatSelection(seatId)}
                            disabled={status === 'reserved'}
                            className={`
                              w-8 h-8 rounded text-xs font-bold transition-all duration-200 transform
                              ${status === 'reserved' 
                                ? 'bg-red-500 text-white cursor-not-allowed shadow-inner' 
                                : status === 'selected'
                                ? 'bg-blue-600 text-white shadow-lg transform scale-110 border border-blue-300'
                                : 'bg-gray-200 text-gray-700 hover:bg-blue-500 hover:text-white hover:scale-105 hover:shadow-md border border-gray-300'
                              }
                            `}
                            title={`صندلی ${seatId}${price > 0 ? ` (+$${price})` : ''}`}
                          >
                            {seat}
                          </button>
                        );
                      })}
                    </div>
                  ))}
                </div>
                
                {/* Airplane Front */}
                <div className="text-center mt-3">
                  <div className="inline-block bg-gray-600 text-white px-3 py-1 rounded text-xs persian-font-vazir font-bold">
                    کابین خلبان
                  </div>
                </div>
              </div>
            </div>

            {/* Seat Legend */}
            <div className="flex justify-center gap-6 mb-4">
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 bg-gray-200 rounded border border-gray-300"></div>
                <span className="text-white text-xs persian-font-vazir font-medium">خالی</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 bg-blue-600 rounded border border-blue-300"></div>
                <span className="text-white text-xs persian-font-vazir font-medium">انتخاب شده</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 bg-red-500 rounded border border-red-300"></div>
                <span className="text-white text-xs persian-font-vazir font-medium">رزرو شده</span>
              </div>
            </div>

            {/* Selected Seats Summary */}
            {selectedSeats.length > 0 && (
              <div className="bg-gradient-to-r from-blue-600/20 to-blue-700/20 rounded-xl p-4 mb-6 border border-blue-400/30">
                <div className="text-white text-sm persian-font-vazir mb-3 font-semibold">
                  صندلی‌های انتخاب شده:
                </div>
                <div className="flex flex-wrap gap-2 mb-3">
                  {selectedSeats.map(seat => (
                    <span key={seat} className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-3 py-1 rounded-lg text-sm persian-font-vazir font-medium shadow-lg">
                      {seat} {getSeatPrice(seat) > 0 && `(+$${getSeatPrice(seat)})`}
                    </span>
                  ))}
                </div>
                <div className="text-white text-sm persian-font-vazir font-semibold">
                  مجموع هزینه صندلی‌ها: ${selectedSeats.reduce((total, seat) => total + getSeatPrice(seat), 0)}
                </div>
              </div>
            )}

            {/* Modal Actions */}
            <div className="flex gap-4 justify-center">
              <button
                onClick={() => setShowSeatModal(false)}
                className="bg-gradient-to-r from-slate-600 to-slate-700 hover:from-slate-700 hover:to-slate-800 text-white font-medium py-3 px-6 rounded-lg transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl persian-font-vazir"
              >
                لغو
              </button>
              <button
                onClick={() => setShowSeatModal(false)}
                className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-medium py-3 px-6 rounded-lg transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl persian-font-vazir"
              >
                تأیید انتخاب
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 3D Viewer Modal */}
      {show3DViewer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            onClick={() => setShow3DViewer(false)}
          ></div>
          
          {/* Modal Content */}
          <div className="relative bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800 rounded-3xl p-6 max-w-6xl w-full mx-4 border border-white/20 shadow-2xl transform transition-all duration-500">
            {/* Close Button */}
            <button
              onClick={() => setShow3DViewer(false)}
              className="absolute top-4 right-4 text-white/70 hover:text-white transition-colors duration-200 z-10"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            {/* Modal Header */}
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-white mb-2 persian-font-vazir">
                مشاهده فضای سه‌بعدی کابین هواپیما
              </h2>
              <p className="text-blue-200 text-sm persian-font-vazir">
                با ماوس می‌توانید کابین را بچرخانید و از زوایای مختلف مشاهده کنید
              </p>
            </div>

            {/* 3D Viewer Container */}
            <div className="relative w-full h-96 bg-gray-900 rounded-2xl overflow-hidden border border-white/20">
              <iframe
                src="https://sketchfab.com/models/3d075f94c48a437bb67b417fd509c658/embed?autostart=1&ui_controls=1&ui_infos=0&ui_inspector=0&ui_watermark=0&ui_stop=0&ui_help=0&ui_settings=0&ui_vr=0&ui_fullscreen=0&ui_annotations=0"
                width="100%"
                height="100%"
                frameBorder="0"
                allow="autoplay; fullscreen; vr"
                allowFullScreen
                title="Airplane Cabin 3D Model"
                className="rounded-2xl"
              ></iframe>
            </div>

            {/* Instructions */}
            <div className="mt-4 p-4 bg-blue-600/20 rounded-xl border border-blue-400/30">
              <div className="text-white text-sm persian-font-vazir">
                <div className="font-semibold mb-2">راهنمای استفاده:</div>
                <ul className="space-y-1 text-xs">
                  <li>• برای چرخاندن: کلیک چپ و کشیدن</li>
                  <li>• برای زوم: اسکرول ماوس</li>
                  <li>• برای جابجایی: کلیک راست و کشیدن</li>
                  <li>• برای تمام صفحه: دکمه تمام صفحه در گوشه پایین راست</li>
                </ul>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex gap-4 justify-center mt-6">
              <button
                onClick={() => setShow3DViewer(false)}
                className="bg-gradient-to-r from-slate-600 to-slate-700 hover:from-slate-700 hover:to-slate-800 text-white font-medium py-3 px-6 rounded-lg transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl persian-font-vazir"
              >
                بستن
              </button>
              <button
                onClick={() => window.open('https://sketchfab.com/3d-models/airplane-cabin-3d075f94c48a437bb67b417fd509c658', '_blank')}
                className="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white font-medium py-3 px-6 rounded-lg transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl persian-font-vazir"
              >
                مشاهده در Sketchfab
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BookingPage;
