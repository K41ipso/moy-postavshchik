'use client';
import { useState } from 'react';
import { getDictionaries } from '../lib/dictionaries';
import { PackageIcon, LocationIcon, PriceIcon, VolumeIcon, SpeedIcon, CertificateIcon, BuilderIcon, SearchIcon } from './Icons';

export default function SearchBuilder({ onSearch }) {
  const dicts = getDictionaries();
  
  const [criteria, setCriteria] = useState({
    category: '',
    city: '',
    maxPrice: dicts.priceRange.max,
    volume: 50,
    urgency: 'normal',
    needsCertificates: false
  });

  const updateCriteria = (key, value) => {
    setCriteria(prev => ({ ...prev, [key]: value }));
  };

  return (
    <div className="bg-white p-8 rounded-2xl shadow-xl border border-orange-100">
      <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
        <span className="p-2 bg-orange-100 rounded-lg text-orange-600"><BuilderIcon /></span>
        Конструктор запроса
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Категория */}
        <div className="md:col-span-2">
          <label className="flex items-center gap-2 text-sm font-bold text-gray-900 mb-3">
            <PackageIcon className="w-4 h-4 text-orange-500" /> Категория товара
          </label>
          <div className="flex flex-wrap gap-2">
            {dicts.categories.map((cat) => (
              <button
                key={cat}
                onClick={() => updateCriteria('category', cat)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition border ${
                  criteria.category === cat
                    ? 'bg-orange-500 text-white border-orange-500 shadow-md'
                    : 'bg-gray-100 text-gray-900 border-gray-300 hover:border-orange-400 hover:bg-orange-100'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Город */}
        <div>
          <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-3">
            <LocationIcon className="w-4 h-4 text-orange-500" /> Город поставки
          </label>
          <select
            value={criteria.city}
            onChange={(e) => updateCriteria('city', e.target.value)}
            className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
          >
            <option value="">Любой город</option>
            {dicts.cities.map((city) => (
              <option key={city} value={city}>{city}</option>
            ))}
          </select>
        </div>

        {/* Срочность */}
        <div>
          <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-3">
            <SpeedIcon className="w-4 h-4 text-orange-500" /> Срочность
          </label>
          <div className="flex gap-2">
            {[
              { value: 'normal', label: 'Планово' },
              { value: 'tomorrow', label: 'Завтра' },
              { value: 'today', label: 'Срочно' }
            ].map((opt) => (
              <button
                key={opt.value}
                onClick={() => updateCriteria('urgency', opt.value)}
                className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition border ${
                  criteria.urgency === opt.value
                    ? 'bg-red-500 text-white border-red-500'
                    : 'bg-white text-gray-700 border-gray-200 hover:border-red-300'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* Цена */}
        <div className="md:col-span-2">
          <div className="flex justify-between mb-2">
            <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
              <PriceIcon className="w-4 h-4 text-orange-500" /> Максимальная цена
            </label>
            <span className="text-sm font-bold text-orange-600">до {criteria.maxPrice} ₽</span>
          </div>
          <input
            type="range"
            min={dicts.priceRange.min}
            max={dicts.priceRange.max}
            value={criteria.maxPrice}
            onChange={(e) => updateCriteria('maxPrice', parseInt(e.target.value))}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-orange-500"
          />
        </div>

        {/* Объем */}
        <div className="md:col-span-2">
          <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-3">
            <VolumeIcon className="w-4 h-4 text-orange-500" /> Требуемый объем
          </label>
          <div className="flex gap-2 flex-wrap">
            {[10, 50, 100, 500, 1000].map((vol) => (
              <button
                key={vol}
                onClick={() => updateCriteria('volume', vol)}
                className={`px-5 py-2 rounded-lg text-sm font-medium transition border ${
                  criteria.volume === vol
                    ? 'bg-orange-500 text-white border-orange-500'
                    : 'bg-white text-gray-700 border-gray-200 hover:border-orange-300'
                }`}
              >
                {vol} кг
              </button>
            ))}
          </div>
        </div>

        {/* Сертификаты */}
        <div className="md:col-span-2">
          <label className="flex items-center gap-3 cursor-pointer p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition">
            <input
              type="checkbox"
              checked={criteria.needsCertificates}
              onChange={(e) => updateCriteria('needsCertificates', e.target.checked)}
              className="w-5 h-5 accent-orange-500 rounded"
            />
            <CertificateIcon className="w-5 h-5 text-green-600" />
            <span className="text-sm font-semibold text-gray-800">Только поставщики с сертификатами качества</span>
          </label>
        </div>
      </div>

      <button
        onClick={() => onSearch(criteria)}
        className="w-full mt-8 py-4 bg-gradient-to-r from-orange-500 to-red-500 text-white text-lg font-bold rounded-xl shadow-lg hover:shadow-xl hover:from-orange-600 hover:to-red-600 transition transform hover:scale-[1.01] flex items-center justify-center gap-2"
      >
        <SearchIcon className="w-6 h-6" />
        Подобрать поставщиков
      </button>
    </div>
  );
}
