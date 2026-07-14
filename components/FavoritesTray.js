'use client';
import { useState, useEffect, useRef } from 'react';
import { suppliersData } from '../lib/dictionaries';

export default function FavoritesTray({ onOpenSupplier }) {
  const [isOpen, setIsOpen] = useState(false);
  const [favorites, setFavorites] = useState([]);
  const trayRef = useRef(null);

  const loadFavorites = () => {
    const saved = localStorage.getItem('favorites');
    if (saved) {
      try {
        const ids = JSON.parse(saved);
        const favSuppliers = suppliersData.filter(s => ids.includes(s.id));
        setFavorites(favSuppliers);
      } catch (e) {
        console.error('Error loading favorites', e);
      }
    } else {
      setFavorites([]);
    }
  };

  useEffect(() => {
    loadFavorites();
    
    // Слушаем изменения избранного
    const handleFavoritesChange = () => loadFavorites();
    window.addEventListener('favoritesChanged', handleFavoritesChange);
    
    return () => {
      window.removeEventListener('favoritesChanged', handleFavoritesChange);
    };
  }, []);

  useEffect(() => {
    if (isOpen) {
      loadFavorites();
    }
  }, [isOpen]);

  // Закрытие при клике вне
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (trayRef.current && !trayRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Закрытие при скролле
  useEffect(() => {
    if (!isOpen) return;

    const handleScroll = () => {
      setIsOpen(false);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [isOpen]);

  const removeFromFavorites = (e, supplierId) => {
    e.stopPropagation();
    
    const saved = localStorage.getItem('favorites');
    let favorites = [];
    if (saved) {
      try {
        favorites = JSON.parse(saved);
      } catch (e) {}
    }
    
    favorites = favorites.filter(id => id !== supplierId);
    localStorage.setItem('favorites', JSON.stringify(favorites));
    
    // Обновляем UI
    setFavorites(favorites.filter(s => s.id !== supplierId));
    window.dispatchEvent(new Event('favoritesChanged'));
  };

  return (
    <div className="relative" ref={trayRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2.5 bg-white/20 backdrop-blur-md rounded-lg hover:bg-white/30 transition-colors border border-white/30"
      >
        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
        </svg>
        
        {favorites.length > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
            {favorites.length}
          </span>
        )}
      </button>

      {/* Анимированная шторка */}
      <div 
        className={`absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-2xl border border-gray-100 overflow-hidden z-50 transition-all duration-300 ease-out origin-top ${
          isOpen 
            ? 'opacity-100 max-h-[500px] scale-100' 
            : 'opacity-0 max-h-0 scale-95 pointer-events-none'
        }`}
      >
        <div className="p-4 border-b border-gray-100 bg-gray-50">
          <h3 className="font-bold text-gray-900">Избранные поставщики</h3>
          <p className="text-xs text-gray-500 mt-0.5">{favorites.length} сохранено</p>
        </div>

        <div className="max-h-96 overflow-y-auto">
          {favorites.length === 0 ? (
            <div className="p-8 text-center">
              <svg className="w-12 h-12 text-gray-300 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
              <p className="text-gray-500 text-sm">Нет сохраненных поставщиков</p>
              <p className="text-gray-400 text-xs mt-1">Нажмите ❤️ на карточке, чтобы добавить</p>
            </div>
          ) : (
            favorites.map((supplier) => (
              <div
                key={supplier.id}
                className="p-4 hover:bg-orange-50 transition-colors border-b border-gray-50 last:border-b-0 group"
              >
                <div className="flex items-start justify-between">
                  <button
                    className="flex-1 min-w-0 pr-3 text-left"
                    onClick={() => {
                      onOpenSupplier(supplier);
                      setIsOpen(false);
                    }}
                  >
                    <p className="font-semibold text-gray-900 truncate">{supplier.name}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{supplier.category}</p>
                    <p className="text-sm font-bold text-orange-600 mt-1">{supplier.pricePerUnit} ₽/{supplier.unit}</p>
                  </button>
                  
                  {/* Кнопка удаления */}
                  <button
                    onClick={(e) => removeFromFavorites(e, supplier.id)}
                    className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors opacity-0 group-hover:opacity-100"
                    title="Удалить из избранного"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
