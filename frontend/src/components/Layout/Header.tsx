import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../../store';
import { logout } from '../../store/slices/authSlice';
import { 
  UserIcon, 
  BellIcon, 
  MagnifyingGlassIcon,
  Bars3Icon,
  XMarkIcon
} from '@heroicons/react/24/outline';

const Header: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user, isAuthenticated } = useSelector((state: RootState) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogout = () => {
    dispatch(logout());
    navigate('/');
  };

  const getMembershipBadge = (level: string) => {
    const badges = {
      bronze: 'bg-amber-100 text-amber-800',
      silver: 'bg-gray-100 text-gray-800',
      gold: 'bg-yellow-100 text-yellow-800',
      platinum: 'bg-purple-100 text-purple-800'
    };
    return badges[level as keyof typeof badges] || badges.bronze;
  };

  return (
    <header className="bg-white shadow-lg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center">
            <div className="flex-shrink-0">
              <h1 className="text-2xl font-bold text-primary-600">
                نسیم ایر
              </h1>
              <p className="text-xs text-gray-500">ایرلاین</p>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex space-x-8 space-x-reverse">
            <Link 
              to="/flights" 
              className="text-gray-700 hover:text-primary-600 px-3 py-2 text-sm font-medium transition-colors"
            >
              پروازها
            </Link>
            <Link 
              to="/hotels" 
              className="text-gray-700 hover:text-primary-600 px-3 py-2 text-sm font-medium transition-colors"
            >
              هتل‌ها
            </Link>
            <Link 
              to="/packages" 
              className="text-gray-700 hover:text-primary-600 px-3 py-2 text-sm font-medium transition-colors"
            >
              پکیج‌ها
            </Link>
            <Link 
              to="/support" 
              className="text-gray-700 hover:text-primary-600 px-3 py-2 text-sm font-medium transition-colors"
            >
              پشتیبانی
            </Link>
          </nav>

          {/* User Actions */}
          <div className="hidden md:flex items-center space-x-4 space-x-reverse">
            {isAuthenticated ? (
              <>
                <button className="relative p-2 text-gray-400 hover:text-gray-500">
                  <BellIcon className="h-6 w-6" />
                  <span className="absolute top-0 right-0 block h-2 w-2 rounded-full bg-red-400"></span>
                </button>
                
                <div className="flex items-center space-x-3 space-x-reverse">
                  <div className="flex items-center space-x-2 space-x-reverse">
                    <UserIcon className="h-8 w-8 text-gray-400" />
                    <div className="text-right">
                      <p className="text-sm font-medium text-gray-900">
                        {user?.firstName} {user?.lastName}
                      </p>
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getMembershipBadge(user?.membershipLevel || 'bronze')}`}>
                        {user?.membershipLevel === 'bronze' && 'برنزی'}
                        {user?.membershipLevel === 'silver' && 'نقره‌ای'}
                        {user?.membershipLevel === 'gold' && 'طلایی'}
                        {user?.membershipLevel === 'platinum' && 'پلاتینیوم'}
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2 space-x-reverse">
                    <span className="text-sm text-gray-500">{user?.points} امتیاز</span>
                    <button
                      onClick={handleLogout}
                      className="text-sm text-gray-500 hover:text-gray-700"
                    >
                      خروج
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex items-center space-x-4 space-x-reverse">
                <Link
                  to="/login"
                  className="text-gray-700 hover:text-primary-600 px-3 py-2 text-sm font-medium"
                >
                  ورود
                </Link>
                <Link
                  to="/register"
                  className="bg-primary-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary-700 transition-colors"
                >
                  ثبت‌نام
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-gray-400 hover:text-gray-500"
            >
              {isMenuOpen ? (
                <XMarkIcon className="h-6 w-6" />
              ) : (
                <Bars3Icon className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-gray-50 rounded-lg mt-2">
              <Link
                to="/flights"
                className="text-gray-700 hover:text-primary-600 block px-3 py-2 text-base font-medium"
                onClick={() => setIsMenuOpen(false)}
              >
                پروازها
              </Link>
              <Link
                to="/hotels"
                className="text-gray-700 hover:text-primary-600 block px-3 py-2 text-base font-medium"
                onClick={() => setIsMenuOpen(false)}
              >
                هتل‌ها
              </Link>
              <Link
                to="/packages"
                className="text-gray-700 hover:text-primary-600 block px-3 py-2 text-base font-medium"
                onClick={() => setIsMenuOpen(false)}
              >
                پکیج‌ها
              </Link>
              <Link
                to="/support"
                className="text-gray-700 hover:text-primary-600 block px-3 py-2 text-base font-medium"
                onClick={() => setIsMenuOpen(false)}
              >
                پشتیبانی
              </Link>
              
              {!isAuthenticated && (
                <div className="pt-4 border-t border-gray-200">
                  <Link
                    to="/login"
                    className="text-gray-700 hover:text-primary-600 block px-3 py-2 text-base font-medium"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    ورود
                  </Link>
                  <Link
                    to="/register"
                    className="bg-primary-600 text-white block px-3 py-2 text-base font-medium rounded-lg mx-3 mt-2"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    ثبت‌نام
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
