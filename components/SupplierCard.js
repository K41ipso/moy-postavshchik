'use client';
import { useState, useEffect } from 'react';
import { LocationIcon, PriceIcon, VolumeIcon, SpeedIcon, CertificateIcon, PhoneIcon, StarIcon } from './Icons';

export default function SupplierCard({ supplier, onClick }) {
  // 1. Изначально всегда false (чтобы совпадало с серверным рендером)
  const [isFavorite, setIsFavorite] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  // 2. Читаем localStorage только на клиенте после монтирования
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
    
    // Сохраняем в localStorage
    if (typeof window !== 'undefined') {
      let favorites = [];
      try {
        const saved = localStorage.getItem('favorites');
        if (saved) favorites = JSON.parse(saved);
      } catch (e) {
        console.error('Error parsing favorites', e);
      }
      
      if (newFavoriteState) {
        if (!favorites.includes(supplier.id)) {
          favorites.push(supplier.id);
        }
      } else {
        favorites = favorites.filter(id => id !== supplier.id);
      }
      localStorage.setItem('favorites', JSON.stringify(favorites));
    }
  };

  return (
    <div 
      onClick={() => onClick && onClick(supplier)}
      className={`bg-white p-6 rounded-2xl shadow-md border-2 transition-all duration-300 cursor-pointer hover:shadow-xl hover:scale-[1.02] ${
        isBestMatch ? 'border-green-400 shadow-[0_0_20px_rgba(34,197,94,0.3)]' : 'border-gray-100 hover:border-orange-200'
      }`}
    >
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1 min-w-0 pr-4">
          <h3 className="text-xl font-bold text-gray-900 truncate">{supplier.name}</h3>
          <p className="text-sm text-gray-500 mt-1">{supplier.category} • {supplier.subCategory}</p>
        </div>
        
        {matchInfo && (
          <div className={`px-3 py-1.5 rounded-lg text-xs font-bold border flex-shrink-0 ${matchInfo.color}`}>
            {matchInfo.text}
          </div>
        )}
        
        <button
          onClick={handleFavoriteClick}
          // Пока компонент не смонтирован, рендерим дефолтное состояние, чтобы избежать мигания и ошибок
          className={`ml-2 p-2 rounded-full transition shrink-0 ${
            isMounted && isFavorite ? 'text-red-500 bg-red-50' : 'text-gray-300 hover:text-red-400 hover:bg-gray-50'
          }`}
        >
          <svg 
            className="w-5 h-5" 
            fill={isMounted && isFavorite ? "currentColor" : "none"} 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
          </svg>
        </button>
      </div>

      <p className="text-gray-600 text-sm mb-4 line-clamp-2">{supplier.description}</p>

      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="bg-gray-50 p-3 rounded-lg flex items-center gap-2">
          <PriceIcon className="w-4 h-4 text-orange-500" />
          <div>
            <p className="text-xs text-gray-500">Цена</p>
            <p className="text-sm font-bold text-gray-900">{supplier.pricePerUnit} ₽/{supplier.unit}</p>
          </div>
        </div>
        <div className="bg-gray-50 p-3 rounded-lg flex items-center gap-2">
          <VolumeIcon className="w-4 h-4 text-orange-500" />
          <div>
            <p className="text-xs text-gray-500">Мин. заказ</p>
            <p className="text-sm font-bold text-gray-900">{supplier.minOrder} {supplier.unit}</p>
          </div>
        </div>
        <div className="bg-gray-50 p-3 rounded-lg flex items-center gap-2">
          <LocationIcon className="w-4 h-4 text-orange-500" />
          <div>
            <p className="text-xs text-gray-500">Город</p>
            <p className="text-sm font-bold text-gray-900">{supplier.city}</p>
          </div>
        </div>
        <div className="bg-gray-50 p-3 rounded-lg flex items-center gap-2">
          <SpeedIcon className="w-4 h-4 text-orange-500" />
          <div>
            <p className="text-xs text-gray-500">Доставка</p>
            <p className="text-sm font-bold text-gray-900">{supplier.deliveryDays} дн.</p>
          </div>
        </div>
      </div>

      {supplier.certificates.length > 0 && (
        <div className="mb-4">
          <div className="flex flex-wrap gap-2">
            {supplier.certificates.map((cert, i) => (
              <span key={i} className="px-2 py-1 bg-green-50 text-green-700 rounded text-xs font-medium border border-green-100 flex items-center gap-1">
                <CertificateIcon className="w-3 h-3" /> {cert}
              </span>
            ))}
          </div>
        </div>
      )}

      <div className="mt-auto pt-4 border-t border-gray-100 flex items-center justify-between">
        <div className="flex items-center gap-1 text-yellow-500">
          <StarIcon className="w-4 h-4" />
          <span className="text-sm font-bold text-gray-800">{supplier.rating}</span>
        </div>
        <div className="flex gap-2">
          <span className="px-3 py-2 text-sm text-orange-600 font-medium">Подробнее →</span>
          <a 
            href={`tel:${supplier.contact.replace(/\D/g, '')}`} 
            onClick={(e) => e.stopPropagation()} 
            className="px-4 py-2 bg-orange-500 text-white text-sm font-semibold rounded-lg hover:bg-orange-600 transition flex items-center gap-2"
          >
            <PhoneIcon className="w-4 h-4" /> Связаться
          </a>
        </div>
      </div>
    </div>
  );
}
