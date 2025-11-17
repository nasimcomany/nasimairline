import React, { useState } from 'react';
import GlassmorphismHeader from '../components/Layout/GlassmorphismHeader';
import { 
  PhotoIcon, 
  EyeIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';

const GalleryPage: React.FC = () => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const galleryImages = [
    {
      id: 1,
      title: 'هواپیمای مدرن',
      description: 'ناوگان هوایی پیشرفته و مدرن',
      image: '/images/airport-plane-photo_991869-62.jpg',
      category: 'هواپیما'
    },
    {
      id: 2,
      title: 'پرواز در شب',
      description: 'پرواز زیبا در آسمان شب',
      image: '/images/airplane-clouds-night_864588-19786.jpg',
      category: 'پرواز'
    },
    {
      id: 3,
      title: 'آسمان آبی',
      description: 'پرواز در آسمان صاف و آبی',
      image: '/images/skyward-soar-airplane-flying-blue-sky-clouds_391229-21566.jpg',
      category: 'آسمان'
    },
    {
      id: 4,
      title: 'فرودگاه شبانه',
      description: 'فرودگاه زیبا در شب بارانی',
      image: '/images/sheremetyevo-airport-view-in-rainy-evening-moscow-free-video.jpg',
      category: 'فرودگاه'
    },
    {
      id: 5,
      title: 'منظره هوایی',
      description: 'منظره زیبای شهر از بالا',
      image: '/images/360_F_600352190_78zb8hHbSeQdHtfGQliVRtHXEEXcvtHf.jpg',
      category: 'منظره'
    },
    {
      id: 6,
      title: 'شهر زیبا',
      description: 'تصویر زیبای شهر در شب',
      image: '/images/1697200583302.jpg',
      category: 'شهر'
    },
    {
      id: 7,
      title: 'هواپیمای تجاری',
      description: 'هواپیمای تجاری در فرودگاه',
      image: '/images/airport-plane-photo_991869-62.jpg',
      category: 'هواپیما'
    },
    {
      id: 8,
      title: 'پرواز طلوع',
      description: 'پرواز در زمان طلوع خورشید',
      image: '/images/airplane-clouds-night_864588-19786.jpg',
      category: 'پرواز'
    },
    {
      id: 9,
      title: 'کابین هواپیما',
      description: 'کابین راحت و مدرن هواپیما',
      image: '/images/skyward-soar-airplane-flying-blue-sky-clouds_391229-21566.jpg',
      category: 'کابین'
    }
  ];

  const openModal = (image: string) => {
    setSelectedImage(image);
  };

  const closeModal = () => {
    setSelectedImage(null);
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
        <div className="max-w-6xl mx-auto px-6">
          
          {/* Header */}
          <div className="text-center mb-6">
            <h1 className="text-2xl font-bold text-white mb-1 persian-font-vazir">
              گالری تصاویر
            </h1>
            <p className="text-blue-200 text-xs persian-font-vazir">
              تصاویر زیبا از هواپیماها و خدمات ما
            </p>
          </div>

          {/* Gallery Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {galleryImages.map((item) => (
              <div key={item.id} className="group bg-white/10 backdrop-blur-lg rounded-xl overflow-hidden border border-white/20 shadow-xl hover:bg-white/20 transition-all duration-300 hover:scale-105 cursor-pointer" onClick={() => openModal(item.image)}>
                {/* Image */}
                <div className="relative h-48 overflow-hidden">
                  <img 
                    src={item.image} 
                    alt={item.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-all duration-300"></div>
                  
                  {/* Overlay */}
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <div className="bg-white/20 backdrop-blur-sm rounded-full p-3">
                      <EyeIcon className="h-6 w-6 text-white" />
                    </div>
                  </div>
                  
                  {/* Category Badge */}
                  <div className="absolute top-2 right-2">
                    <div className="bg-white/20 backdrop-blur-sm rounded-lg px-2 py-1">
                      <span className="text-white text-xs font-medium persian-font-vazir">{item.category}</span>
                    </div>
                  </div>
                </div>
                
                {/* Content */}
                <div className="p-4">
                  <h3 className="text-lg font-semibold text-white mb-1 persian-font-vazir">
                    {item.title}
                  </h3>
                  
                  <p className="text-white/70 text-sm persian-font-vazir">
                    {item.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Modal */}
      {selectedImage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            onClick={closeModal}
          ></div>
          
          {/* Modal Content */}
          <div className="relative bg-white/10 backdrop-blur-xl rounded-2xl p-4 max-w-4xl w-full mx-4 border border-white/20 shadow-2xl">
            {/* Close Button */}
            <button
              onClick={closeModal}
              className="absolute top-4 right-4 text-white/70 hover:text-white transition-colors duration-200 z-10"
            >
              <XMarkIcon className="w-6 h-6" />
            </button>

            {/* Image */}
            <div className="relative">
              <img 
                src={selectedImage} 
                alt="Gallery Image"
                className="w-full h-auto rounded-xl"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GalleryPage;
