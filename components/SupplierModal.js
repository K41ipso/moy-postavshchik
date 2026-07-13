'use client';
import { useState, useEffect } from 'react';
import { LocationIcon, PriceIcon, VolumeIcon, SpeedIcon, CertificateIcon, PhoneIcon, StarIcon } from './Icons';

export default function SupplierModal({ supplier, isOpen, onClose }) {
  const [note, setNote] = useState('');
  const [volume, setVolume] = useState(supplier?.minOrder || 1);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      setTimeout(() => setIsVisible(true), 10);
    } else {
      setIsVisible(false);
      setTimeout(() => {
        document.body.style.overflow = '';
      }, 300);
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  useEffect(() => {
    if (supplier) {
      setVolume(supplier.minOrder || 1);
      const savedNote = localStorage.getItem(`note_${supplier.id}`) || '';
      setNote(savedNote);
    }
  }, [supplier]);

  const handleNoteChange = (e) => {
    const newValue = e.target.value;
    setNote(newValue);
    if (supplier) {
      localStorage.setItem(`note_${supplier.id}`, newValue);
    }
  };

  const handleVolumeChange = (e) => {
    const val = parseInt(e.target.value) || 0;
    setVolume(Math.min(1000, Math.max(supplier.minOrder, val)));
  };

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(() => {
      onClose();
    }, 300);
  };

  if (!isOpen || !supplier) return null;

  const totalCost = supplier.pricePerUnit * volume;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div 
        className={`absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-300 ${
          isVisible ? 'opacity-100' : 'opacity-0'
        }`}
        onClick={handleClose}
      />

      <div 
        className={`relative bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col transition-all duration-300 ease-out ${
          isVisible 
            ? 'opacity-100 scale-100 translate-y-0' 
            : 'opacity-0 scale-90 translate-y-8'
        }`}
      >
        <div className="bg-gradient-to-r from-orange-500 to-red-500 p-6 text-white flex justify-between items-start shrink-0">
          <div>
            <h2 className="text-2xl md:text-3xl font-bold mb-1">{supplier.name}</h2>
            <p className="text-white/90 text-sm md:text-base">{supplier.category} • {supplier.subCategory}</p>
          </div>
          <button
            onClick={handleClose}
            className="p-2 hover:bg-white/20 rounded-lg transition shrink-0"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          <div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">О поставщике</h3>
            <p className="text-gray-600 leading-relaxed">{supplier.description}</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-orange-50 p-4 rounded-xl border border-orange-100">
              <div className="flex items-center gap-2 mb-2">
                <PriceIcon className="w-5 h-5 text-orange-600" />
                <span className="text-sm font-semibold text-gray-700">Цена за ед.</span>
              </div>
              <p className="text-2xl font-bold text-gray-900">{supplier.pricePerUnit} ₽/{supplier.unit}</p>
            </div>

            <div className="bg-blue-50 p-4 rounded-xl border border-blue-100">
              <div className="flex items-center gap-2 mb-2">
                <VolumeIcon className="w-5 h-5 text-blue-600" />
                <span className="text-sm font-semibold text-gray-700">Мин. заказ</span>
              </div>
              <p className="text-2xl font-bold text-gray-900">{supplier.minOrder} {supplier.unit}</p>
            </div>

            <div className="bg-green-50 p-4 rounded-xl border border-green-100">
              <div className="flex items-center gap-2 mb-2">
                <LocationIcon className="w-5 h-5 text-green-600" />
                <span className="text-sm font-semibold text-gray-700">Город</span>
              </div>
              <p className="text-xl font-bold text-gray-900">{supplier.city}</p>
            </div>

            <div className="bg-purple-50 p-4 rounded-xl border border-purple-100">
              <div className="flex items-center gap-2 mb-2">
                <SpeedIcon className="w-5 h-5 text-purple-600" />
                <span className="text-sm font-semibold text-gray-700">Срок доставки</span>
              </div>
              <p className="text-xl font-bold text-gray-900">{supplier.deliveryDays} дн.</p>
            </div>
          </div>

          <div className="bg-gradient-to-r from-yellow-50 to-orange-50 p-6 rounded-xl border border-orange-200">
            <h3 className="text-lg font-bold text-gray-900 mb-4">💰 Калькулятор стоимости</h3>
            <div className="flex flex-col sm:flex-row items-center gap-4">
              <div className="flex-1 w-full">
                <label className="block text-sm font-semibold text-gray-700 mb-2">Объем заказа ({supplier.unit}) <span className="text-xs text-gray-500 font-normal">(макс. 1000)</span></label>
                <input
                  type="number"
                  value={volume}
                  onChange={handleVolumeChange}
                  min={supplier.minOrder}
                  max={1000}
                  className="w-full px-4 py-3 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 font-bold text-gray-900"
                />
              </div>
              <div className="text-center sm:text-right shrink-0">
                <p className="text-sm text-gray-600 mb-1">Итоговая стоимость:</p>
                <p className="text-3xl font-extrabold text-orange-600">{totalCost.toLocaleString()} ₽</p>
              </div>
            </div>
          </div>

          {supplier.certificates.length > 0 && (
            <div>
              <h3 className="text-lg font-bold text-gray-900 mb-3">Сертификаты и документы</h3>
              <div className="flex flex-wrap gap-2">
                {supplier.certificates.map((cert, i) => (
                  <span key={i} className="px-3 py-1.5 bg-green-100 text-green-800 rounded-lg text-sm font-medium border border-green-200 flex items-center gap-2">
                    <CertificateIcon className="w-4 h-4" /> {cert}
                  </span>
                ))}
              </div>
            </div>
          )}

          <div>
            <h3 className="text-lg font-bold text-gray-900 mb-3">Рейтинг</h3>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-0.5">
                {[...Array(5)].map((_, i) => (
                  <StarIcon 
                    key={i} 
                    className={`w-6 h-6 ${i < Math.round(supplier.rating) ? 'text-yellow-400' : 'text-gray-200'}`} 
                  />
                ))}
              </div>
              <span className="text-2xl font-bold text-gray-900">{supplier.rating}</span>
              <span className="text-gray-500">из 5.0</span>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-bold text-gray-900 mb-3">📝 Мои заметки</h3>
            <textarea
              value={note}
              onChange={handleNoteChange}
              placeholder="Напишите здесь что-нибудь об этом поставщике (сохраняется автоматически)..."
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 h-24 resize-none text-gray-700"
            />
          </div>
        </div>

        <div className="p-6 border-t border-gray-200 bg-gray-50 flex flex-col sm:flex-row gap-4 shrink-0">
          <a
            href={`tel:${supplier.contact.replace(/\D/g, '')}`}
            className="flex-1 py-4 bg-gradient-to-r from-orange-500 to-red-500 text-white text-lg font-bold rounded-xl shadow-lg hover:shadow-xl hover:from-orange-600 hover:to-red-600 transition flex items-center justify-center gap-2"
          >
            <PhoneIcon className="w-6 h-6" />
            Позвонить поставщику
          </a>
          <button
            onClick={handleClose}
            className="px-8 py-4 bg-white border-2 border-gray-300 text-gray-700 font-bold rounded-xl hover:bg-gray-100 transition"
          >
            Закрыть
          </button>
        </div>
      </div>
    </div>
  );
}
