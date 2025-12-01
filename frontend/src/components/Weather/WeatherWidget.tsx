import React, { useState, useEffect } from 'react';
import { CloudIcon, SunIcon, BoltIcon } from '@heroicons/react/24/outline';
import { useLanguage } from '../../contexts/LanguageContext';

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
  cities = ['Tehran', 'Mashhad', 'Kish', 'Abadan'] 
}) => {
  const { language, fontClass } = useLanguage();
  const [weatherData, setWeatherData] = useState<WeatherData[]>([]);

  // City names in different languages
  const cityNames: Record<string, Record<string, string>> = {
    Tehran: { fa: 'تهران', ar: 'طهران', en: 'Tehran' },
    Mashhad: { fa: 'مشهد', ar: 'مشهد', en: 'Mashhad' },
    Kish: { fa: 'کیش', ar: 'كيش', en: 'Kish' },
    Abadan: { fa: 'آبادان', ar: 'أبادان', en: 'Abadan' },
  };

  useEffect(() => {
    const fetchWeather = async () => {
      // Initialize with loading state
      setWeatherData(
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

      // Fetch weather for each city
      const weatherPromises = cities.map(async (city) => {
        try {
          // Using OpenWeatherMap API (free tier)
          // You need to get API key from https://openweathermap.org/api
          const API_KEY = process.env.REACT_APP_WEATHER_API_KEY || '';
          
          if (!API_KEY) {
            // Fallback: Use mock data if API key is not set
            return {
              city,
              temperature: Math.floor(Math.random() * 15) + 20, // 20-35°C
              description: language === 'fa' ? 'آفتابی' : language === 'ar' ? 'مشمس' : 'Sunny',
              icon: '01d',
              humidity: Math.floor(Math.random() * 30) + 40, // 40-70%
              windSpeed: Math.floor(Math.random() * 10) + 5, // 5-15 km/h
              loading: false,
              error: null,
            };
          }

          const response = await fetch(
            `https://api.openweathermap.org/data/2.5/weather?q=${city},IR&appid=${API_KEY}&units=metric&lang=${language === 'fa' ? 'fa' : language === 'ar' ? 'ar' : 'en'}`
          );

          if (!response.ok) {
            throw new Error('Failed to fetch weather');
          }

          const data = await response.json();
          
          return {
            city,
            temperature: Math.round(data.main.temp),
            description: data.weather[0].description,
            icon: data.weather[0].icon,
            humidity: data.main.humidity,
            windSpeed: Math.round(data.wind.speed * 3.6), // Convert m/s to km/h
            loading: false,
            error: null,
          };
        } catch (error) {
          console.error(`Error fetching weather for ${city}:`, error);
          return {
            city,
            temperature: 0,
            description: '',
            icon: '',
            humidity: 0,
            windSpeed: 0,
            loading: false,
            error: 'خطا در دریافت اطلاعات',
          };
        }
      });

      const results = await Promise.all(weatherPromises);
      setWeatherData(results);
    };

    fetchWeather();
  }, [cities, language]);

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
    <div className="w-full py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h2 className={`text-2xl md:text-3xl ${fontClass}`} style={{ 
            fontFamily: 'DigiHamisheBold, Arial, sans-serif',
            fontWeight: language === 'fa' ? 300 : 400,
            letterSpacing: language === 'en' ? '1.5px' : '0.2px',
            marginBottom: '0',
            color: '#000000',
            opacity: 1,
            textTransform: language === 'en' ? 'uppercase' : 'none',
            fontFeatureSettings: language === 'fa' ? "'kern' 1" : 'normal',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px'
          }}>
            {language === 'fa' ? 'وضعیت آب و هوا' : language === 'ar' ? 'حالة الطقس' : 'Weather Status'}
          </h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {weatherData.map((weather, index) => (
            <div
              key={index}
              className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-gray-800 dark:to-gray-900 rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border border-blue-200 dark:border-gray-700"
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
        
        {!process.env.REACT_APP_WEATHER_API_KEY && (
          <div className="mt-6 text-center">
            <p className={`text-sm text-gray-500 ${fontClass}`}>
              {language === 'fa' 
                ? 'برای دریافت اطلاعات واقعی آب و هوا، لطفاً API Key را در فایل .env تنظیم کنید' 
                : language === 'ar'
                ? 'للحصول على معلومات الطقس الفعلية، يرجى تعيين مفتاح API في ملف .env'
                : 'To get real weather data, please set API_KEY in .env file'}
            </p>
            <a 
              href="https://openweathermap.org/api" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-800 underline mt-2 inline-block"
            >
              {language === 'fa' ? 'دریافت API Key رایگان' : language === 'ar' ? 'احصل على مفتاح API مجاني' : 'Get Free API Key'}
            </a>
          </div>
        )}
      </div>
    </div>
  );
};

export default WeatherWidget;

