import React, { useState, useEffect, memo, useRef } from 'react';
import { CloudIcon, SunIcon, BoltIcon } from '@heroicons/react/24/outline';
import { useLanguage } from '../../contexts/LanguageContext';
import api from '../../services/api';

interface WeatherData {
  city: string;
  temperature: number;
  description: string;
  icon: string;
  humidity: number;
  windSpeed: number;
  loading: boolean;
  error: string | null;
}

interface WeatherWidgetProps {
  cities?: string[];
}

const WeatherWidget: React.FC<WeatherWidgetProps> = ({ 
  cities = ['Tehran', 'Mashhad', 'Kish', 'Abadan', 'Isfahan'] 
}) => {
  const { language, fontClass } = useLanguage();
  const [weatherData, setWeatherData] = useState<WeatherData[]>(() =>
    cities.map(city => ({
      city,
      temperature: 0,
      description: '',
      icon: '',
      humidity: 0,
      windSpeed: 0,
      loading: true,
      error: null,
    }))
  );
  const hasFetchedRef = useRef(false);
  const citiesRef = useRef<string[]>([]);

  const cityNames: Record<string, Record<string, string>> = {
    Tehran: { fa: 'تهران', ar: 'طهران', en: 'Tehran' },
    Mashhad: { fa: 'مشهد', ar: 'مشهد', en: 'Mashhad' },
    Kish: { fa: 'کیش', ar: 'كيش', en: 'Kish' },
    Abadan: { fa: 'آبادان', ar: 'أبادان', en: 'Abadan' },
    Isfahan: { fa: 'اصفهان', ar: 'أصفهان', en: 'Isfahan' },
  };

  useEffect(() => {
    const citiesString = JSON.stringify(cities);
    if (hasFetchedRef.current && citiesString === JSON.stringify(citiesRef.current)) return;
    citiesRef.current = cities;
    hasFetchedRef.current = true;

    const lang = language === 'fa' ? 'fa' : language === 'ar' ? 'ar' : 'en';

    api
      .get('/support/weather/', { params: { cities: cities.join(','), lang }, timeout: 15000 })
      .then(res => {
        const data = (res.data?.data || res.data) as Array<{ city: string; temperature: number; description: string; icon: string; humidity: number; windSpeed: number; error: string | null }>;
        setWeatherData(
          (data || []).map(item => ({
            ...item,
            loading: false,
          }))
        );
      })
      .catch(() => {
        setWeatherData(cities.map(city => ({
          city,
          temperature: 0,
          description: '',
          icon: '',
          humidity: 0,
          windSpeed: 0,
          loading: false,
          error: 'خطا در دریافت اطلاعات',
        })));
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cities]);

  const getWeatherIcon = (iconCode: string) => {
    if (!iconCode) return <SunIcon className="h-8 w-8 text-yellow-400" />;
    
    // Map OpenWeatherMap icon codes to Heroicons
    if (iconCode.includes('01')) return <SunIcon className="h-8 w-8 text-yellow-400" />;
    if (iconCode.includes('02') || iconCode.includes('03')) return <CloudIcon className="h-8 w-8 text-gray-400" />;
    if (iconCode.includes('09') || iconCode.includes('10')) return <CloudIcon className="h-8 w-8 text-blue-400" />;
    if (iconCode.includes('11')) return <BoltIcon className="h-8 w-8 text-yellow-500" />;
    return <CloudIcon className="h-8 w-8 text-gray-400" />;
  };

  return (
    <div className="w-full py-4">
      <div className="mx-auto px-4 sm:px-6 lg:px-8" style={{ maxWidth: '1400px' }}>
        <div className="flex justify-center gap-4 sm:gap-6 overflow-x-auto pb-2" style={{ scrollbarWidth: 'thin' }}>
          {weatherData.map((weather, index) => (
            <div
              key={index}
              className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-gray-800 dark:to-gray-900 rounded-xl p-6 shadow-lg border border-blue-200 dark:border-gray-700 flex-shrink-0"
              style={{
                contain: 'layout style paint',
                willChange: 'auto',
                minWidth: '200px',
                width: '200px',
              }}
            >
              {weather.loading ? (
                <div className="flex items-center justify-center h-32">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>
              ) : weather.error ? (
                <div className="text-center text-red-500">
                  <p>{weather.error}</p>
                </div>
              ) : (
                <>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className={`text-xl font-semibold ${fontClass}`}>
                      {cityNames[weather.city]?.[language] || weather.city}
                    </h3>
                    {getWeatherIcon(weather.icon)}
                  </div>
                  
                  <div className="text-center mb-4">
                    <div className={`text-4xl font-bold text-blue-600 dark:text-blue-400 ${fontClass}`}>
                      {weather.temperature}°
                    </div>
                    <p className={`text-sm text-gray-600 dark:text-gray-300 mt-1 capitalize ${fontClass}`}>
                      {weather.description}
                    </p>
                  </div>
                  
                  <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                    <div>
                      <span className={fontClass}>
                        {language === 'fa' ? 'رطوبت' : language === 'ar' ? 'رطوبة' : 'Humidity'}
                      </span>
                      <br />
                      <span className="font-semibold">{weather.humidity}%</span>
                    </div>
                    <div className="text-right">
                      <span className={fontClass}>
                        {language === 'fa' ? 'باد' : language === 'ar' ? 'رياح' : 'Wind'}
                      </span>
                      <br />
                      <span className="font-semibold">{weather.windSpeed} km/h</span>
                    </div>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
        
      </div>
    </div>
  );
};

export default memo(WeatherWidget);

