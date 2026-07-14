'use client';
import { useState, useEffect } from 'react';
import { LocationIcon, PriceIcon, PhoneIcon, StarIcon, CertificateIcon } from './Icons';

export default function SupplierCard({ supplier, onClick }) {
  const [isFavorite, setIsFavorite] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    const saved = localStorage.getItem('favorites');
    if (saved) {
      try {
        const favorites = JSON.parse(saved);
        setIsFavorite(favorites.includes(supplier.id));
      } catch (e) {
        console.error('Error parsing favorites', e);
      }
    }
  }, [supplier.id]);

  useEffect(() => {
    const handleFavoritesChange = () => {
      const saved = localStorage.getItem('favorites');
      if (saved) {
        try {
          const favorites = JSON.parse(saved);
          setIsFavorite(favorites.includes(supplier.id));
        } catch (e) {
          console.error('Error parsing favorites', e);
        }
      } else {
        setIsFavorite(false);
      }
    };

    window.addEventListener('favoritesChanged', handleFavoritesChange);
    return () => window.removeEventListener('favoritesChanged', handleFavoritesChange);
  }, [supplier.id]);

  const getMatchInfo = (score) => {
    if (score >= 80) return { text: 'Идеально подходит', color: 'text-green-700 bg-green-100 border-green-300' };
    if (score >= 60) return { text: 'Хороший вариант', color: 'text-orange-700 bg-orange-100 border-orange-300' };
    return { text: 'Возможный вариант', color: 'text-gray-700 bg-gray-100 border-gray-300' };
  };

  const matchInfo = supplier.finalScore ? getMatchInfo(supplier.finalScore) : null;
  const isBestMatch = supplier.finalScore >= 80;

  const handleFavoriteClick = (e) => {
    e.stopPropagation();
    const newFavoriteState = !isFavorite;
    setIsFavorite(newFavoriteState);
    
    if (typeof window !== 'undefined') {
      let favorites = [];
      try {
        const saved = localStorage.getItem('favorites');
        if (saved) favorites = JSON.parse(saved);
      } catch (e) {}
      
      if (newFavoriteState) {
        if (!favorites.includes(supplier.id)) favorites.push(supplier.id);
      } else {
        favorites = favorites.filter(id => id !== supplier.id);
      }
      localStorage.setItem('favorites', JSON.stringify(favorites));
      
      window.dispatchEvent(new Event('favoritesChanged'));
    }
  };

  return (
    <div 
      onClick={() => onClick && onClick(supplier)}
      className={`bg-white p-4 sm:p-5 rounded-xl shadow-sm border-2 transition-all duration-300 cursor-pointer hover:shadow-xl hover:scale-[1.02] ${
        isBestMatch ? 'border-green-400 shadow-[0_0_15px_rgba(34,197,94,0.2)]' : 'border-gray-100 hover:border-orange-200'
      }`}
    >
      <div className="flex justify-between items-start mb-3">
        <div className="flex-1 min-w-0 pr-3">
          <h3 className="text-base sm:text-lg font-bold text-gray-900 truncate leading-tight">{supplier.name}</h3>
          <p className="text-xs text-gray-500 mt-1 font-medium">{supplier.category} • {supplier.subCategory}</p>
        </div>
        
        {matchInfo && (
          <div className={`px-2 sm:px-2.5 py-1 rounded-md text-[10px] font-bold border flex-shrink-0 uppercase tracking-wide ${matchInfo.color}`}>
            {matchInfo.text}
          </div>
        )}
        
        <button
          onClick={handleFavoriteClick}
          className={`ml-1 p-1.5 rounded-full transition shrink-0 ${
            isMounted && isFavorite ? 'text-red-500 bg-red-50' : 'text-gray-300 hover:text-red-400 hover:bg-gray-50'
          }`}
        >
          <svg className="w-4 h-4 sm:w-5 sm:h-5" fill={isMounted && isFavorite ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
          </svg>
        </button>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="flex items-center gap-2">
          <PriceIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-orange-500" />
          <div>
            <p className="text-[10px] text-gray-500 uppercase tracking-wider">Цена</p>
            <p className="text-sm font-bold text-gray-900">{supplier.pricePerUnit} ₽/{supplier.unit}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <LocationIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-orange-500" />
          <div>
            <p className="text-[10px] text-gray-500 uppercase tracking-wider">Город</p>
            <p className="text-sm font-bold text-gray-900">{supplier.city}</p>
          </div>
        </div>
      </div>

      {supplier.certificates.length > 0 && (
        <div className="mb-4 flex items-center gap-1.5 text-xs text-green-700 bg-green-50 px-2 py-1.5 rounded-md border border-green-100 w-fit">
          <CertificateIcon className="w-3 h-3 sm:w-3.5 sm:h-3.5" /> 
          <span className="font-medium">{supplier.certificates.length} сертификатов</span>
        </div>
      )}

      <div className="mt-auto pt-4 border-t border-gray-100 flex items-center justify-between">
        <div className="flex items-center gap-1 text-yellow-500">
          <StarIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          <span className="text-sm font-bold text-gray-800">{supplier.rating}</span>
        </div>
        
        <div className="flex items-center gap-2 sm:gap-3">
          <span className="text-xs sm:text-sm text-gray-500 font-medium hover:text-orange-600 transition-colors cursor-pointer hidden sm:inline">
            Подробнее →
          </span>
          <a
            href={`tel:${supplier.contact.replace(/\D/g, '')}`}
            onClick={(e) => e.stopPropagation()}
            className="px-3 sm:px-4 py-2 bg-orange-500 text-white text-xs sm:text-sm font-semibold rounded-lg hover:bg-orange-600 transition-colors flex items-center gap-1.5 shadow-sm hover:shadow-md"
          >
            <PhoneIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> <span className="hidden sm:inline">Связаться</span><span className="sm:hidden">📞</span>
          </a>
        </div>
      </div>
    </div>
  );
}
