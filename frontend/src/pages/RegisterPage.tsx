import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { RootState } from '../store';
import { registerUser, clearError } from '../store/slices/authSlice';
import { useAppDispatch } from '../store/hooks';
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';
import GlassmorphismHeader from '../components/Layout/GlassmorphismHeader';

const RegisterPage: React.FC = () => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  const { loading, error } = useSelector((state: RootState) => state.auth);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    if (error) {
      dispatch(clearError());
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.password !== formData.confirmPassword) {
      alert('رمز عبور و تأیید رمز عبور مطابقت ندارند');
      return;
    }

    try {
      await dispatch(registerUser({
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        phone: formData.phone,
        password: formData.password
      })).unwrap();
      navigate('/dashboard');
    } catch (error) {
      // Error is handled by Redux
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Background image */}
      <div 
        className="fixed inset-0 bg-cover bg-center bg-no-repeat"
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

      <GlassmorphismHeader />

      <div className="relative z-10 min-h-screen flex items-center justify-center px-4 pt-32 pb-8">
        <div className="w-full max-w-md">
          <div className="bg-white/20 backdrop-blur-lg rounded-2xl p-6 shadow-2xl border border-white/30">
            {/* Header */}
            <div className="text-center mb-6">
              <h1 className="text-2xl font-bold text-white mb-2 persian-font-vazir">
                ایجاد حساب کاربری
              </h1>
              <p className="text-blue-200 text-xs persian-font-vazir">
                یا{' '}
                <Link to="/login" className="font-medium text-blue-300 hover:text-blue-200 transition-colors">
                  وارد حساب موجود شوید
                </Link>
              </p>
            </div>

            <form className="space-y-4" onSubmit={handleSubmit}>
              {error && (
                <div className="bg-red-500/20 backdrop-blur-sm border border-red-400/50 text-red-200 px-3 py-2 rounded-lg text-xs persian-font-vazir">
                  {error}
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label htmlFor="firstName" className="flex items-center gap-1.5 text-white font-medium mb-1 text-xs persian-font-vazir">
                    نام
                  </label>
                  <div className="mt-1">
                    <input
                      id="firstName"
                      name="firstName"
                      type="text"
                      required
                      value={formData.firstName}
                      onChange={handleInputChange}
                      className="w-full bg-white/80 backdrop-blur-sm rounded-lg p-2.5 border border-white/50 text-blue-900 placeholder-blue-600/60 focus:outline-none focus:ring-2 focus:ring-blue-500/50 text-sm persian-font-vazir"
                      placeholder="نام"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="lastName" className="flex items-center gap-1.5 text-white font-medium mb-1 text-xs persian-font-vazir">
                    نام خانوادگی
                  </label>
                  <div className="mt-1">
                    <input
                      id="lastName"
                      name="lastName"
                      type="text"
                      required
                      value={formData.lastName}
                      onChange={handleInputChange}
                      className="w-full bg-white/80 backdrop-blur-sm rounded-lg p-2.5 border border-white/50 text-blue-900 placeholder-blue-600/60 focus:outline-none focus:ring-2 focus:ring-blue-500/50 text-sm persian-font-vazir"
                      placeholder="نام خانوادگی"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label htmlFor="email" className="flex items-center gap-1.5 text-white font-medium mb-1 text-xs persian-font-vazir">
                  آدرس ایمیل
                </label>
                <div className="mt-1">
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    value={formData.email}
                    onChange={handleInputChange}
                    className="w-full bg-white/80 backdrop-blur-sm rounded-lg p-2.5 border border-white/50 text-blue-900 placeholder-blue-600/60 focus:outline-none focus:ring-2 focus:ring-blue-500/50 text-sm persian-font-vazir"
                    placeholder="ایمیل خود را وارد کنید"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="phone" className="flex items-center gap-1.5 text-white font-medium mb-1 text-xs persian-font-vazir">
                  شماره تلفن
                </label>
                <div className="mt-1">
                  <input
                    id="phone"
                    name="phone"
                    type="tel"
                    required
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="w-full bg-white/80 backdrop-blur-sm rounded-lg p-2.5 border border-white/50 text-blue-900 placeholder-blue-600/60 focus:outline-none focus:ring-2 focus:ring-blue-500/50 text-sm persian-font-vazir"
                    placeholder="شماره تلفن خود را وارد کنید"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="password" className="flex items-center gap-1.5 text-white font-medium mb-1 text-xs persian-font-vazir">
                  رمز عبور
                </label>
                <div className="mt-1 relative">
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="new-password"
                    required
                    value={formData.password}
                    onChange={handleInputChange}
                    className="w-full bg-white/80 backdrop-blur-sm rounded-lg p-2.5 pr-10 border border-white/50 text-blue-900 placeholder-blue-600/60 focus:outline-none focus:ring-2 focus:ring-blue-500/50 text-sm persian-font-vazir"
                    placeholder="رمز عبور خود را وارد کنید"
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeSlashIcon className="h-4 w-4 text-blue-600" />
                    ) : (
                      <EyeIcon className="h-4 w-4 text-blue-600" />
                    )}
                  </button>
                </div>
              </div>

              <div>
                <label htmlFor="confirmPassword" className="flex items-center gap-1.5 text-white font-medium mb-1 text-xs persian-font-vazir">
                  تأیید رمز عبور
                </label>
                <div className="mt-1 relative">
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    autoComplete="new-password"
                    required
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    className="w-full bg-white/80 backdrop-blur-sm rounded-lg p-2.5 pr-10 border border-white/50 text-blue-900 placeholder-blue-600/60 focus:outline-none focus:ring-2 focus:ring-blue-500/50 text-sm persian-font-vazir"
                    placeholder="رمز عبور را دوباره وارد کنید"
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? (
                      <EyeSlashIcon className="h-4 w-4 text-blue-600" />
                    ) : (
                      <EyeIcon className="h-4 w-4 text-blue-600" />
                    )}
                  </button>
                </div>
              </div>

              <div className="flex items-center">
                <input
                  id="agree-terms"
                  name="agree-terms"
                  type="checkbox"
                  required
                  className="w-4 h-4 text-blue-600 bg-white/80 border-white/50 rounded focus:ring-blue-500/50"
                />
                <label htmlFor="agree-terms" className="mr-2 block text-xs text-white persian-font-vazir">
                  با{' '}
                  <a href="#" className="text-blue-300 hover:text-blue-200 transition-colors">
                    شرایط و قوانین
                  </a>{' '}
                  موافقم
                </label>
              </div>

              <div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-lg shadow-lg text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-105 persian-font-vazir"
                >
                  {loading ? 'در حال ایجاد حساب...' : 'ایجاد حساب'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
