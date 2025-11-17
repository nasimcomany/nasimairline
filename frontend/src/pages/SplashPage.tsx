import React, { useState, useEffect } from 'react';
import GlassmorphismHeader from '../components/Layout/GlassmorphismHeader';

const SplashPage: React.FC = () => {
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoaded(true), 1000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="min-h-screen relative overflow-hidden">
      <GlassmorphismHeader />

      {/* Hero Section with airplane background */}
      <div className="relative min-h-screen flex items-center justify-center">
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
            <div className="flex justify-between px-1">
              {[...Array(20)].map((_, i) => (
                <div key={i} className="w-1 h-20 bg-yellow-400/60 blur-sm"></div>
              ))}
            </div>
          </div>
          
          {/* Misty atmosphere */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent"></div>
        </div>



      </div>
    </div>
  );
};

export default SplashPage;