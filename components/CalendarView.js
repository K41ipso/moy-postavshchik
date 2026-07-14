'use client';
import { useState, useEffect } from 'react';

export default function CalendarView({ orders, onClose, onRemoveOrder, onOpenSupplier }) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(null);
  const [rangeMode, setRangeMode] = useState(false);
  const [rangeStart, setRangeStart] = useState(null);
  const [rangeEnd, setRangeEnd] = useState(null);
  const [isVisible, setIsVisible] = useState(false);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = new Date(year, month, 1).getDay();
  
  const startDay = firstDayOfMonth === 0 ? 6 : firstDayOfMonth - 1;

  const monthNames = ['Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь', 'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'];
  const dayNames = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];

  // Плавное появление модалки
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    setTimeout(() => setIsVisible(true), 10);
    return () => {
      document.body.style.overflow = '';
    };
  }, []);

  const getOrdersForDate = (day) => {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return orders.filter(order => order.deliveryDate === dateStr);
  };

  const getDateStr = (day) => {
    return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
  };

  const isDateInRange = (day) => {
    if (!rangeStart || !rangeEnd) return false;
    const date = new Date(getDateStr(day));
    const start = new Date(getDateStr(rangeStart));
    const end = new Date(getDateStr(rangeEnd));
    return date >= start && date <= end;
  };

  const handleDayClick = (day) => {
    if (rangeMode) {
        if (!rangeStart || (rangeStart && rangeEnd)) {
        setRangeStart(day);
        setRangeEnd(null);
        setSelectedDate(null);
        } else {
        if (day < rangeStart) {
            setRangeEnd(rangeStart);
            setRangeStart(day);
        } else {
            setRangeEnd(day);
        }
        // АВТОСБРОС режима диапазона после выбора второго конца
        setRangeMode(false);
        }
    } else {
        setSelectedDate(day);
        setRangeStart(null);
        setRangeEnd(null);
    }
  };

  const prevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
    setSelectedDate(null);
    setRangeStart(null);
    setRangeEnd(null);
  };

  const nextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
    setSelectedDate(null);
    setRangeStart(null);
    setRangeEnd(null);
  };

  const isToday = (day) => {
    const today = new Date();
    return day === today.getDate() && month === today.getMonth() && year === today.getFullYear();
  };

  // Собираем заказы для отображения
  let displayOrders = [];
  let summaryTitle = '';

  if (rangeStart && rangeEnd) {
    const startDate = new Date(getDateStr(rangeStart));
    const endDate = new Date(getDateStr(rangeEnd));
    
    displayOrders = orders.filter(order => {
      const d = new Date(order.deliveryDate);
      return d >= startDate && d <= endDate;
    }).sort((a, b) => new Date(a.deliveryDate) - new Date(b.deliveryDate));

    summaryTitle = `${rangeStart}–${rangeEnd} ${monthNames[month]}`;
  } else if (selectedDate) {
    displayOrders = getOrdersForDate(selectedDate);
    summaryTitle = `${selectedDate} ${monthNames[month]}`;
  } else {
    displayOrders = orders.filter(order => {
      const d = new Date(order.deliveryDate);
      return d.getMonth() === month && d.getFullYear() === year;
    }).sort((a, b) => new Date(a.deliveryDate) - new Date(b.deliveryDate));
    summaryTitle = `Весь ${monthNames[month]}`;
  }

  const totalVolume = displayOrders.reduce((sum, order) => sum + order.volume, 0);
  const totalCost = displayOrders.reduce((sum, order) => sum + order.totalCost, 0);
  const totalOrders = displayOrders.length;

  const volumeByUnit = displayOrders.reduce((acc, order) => {
    acc[order.unit] = (acc[order.unit] || 0) + order.volume;
    return acc;
  }, {});

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(() => {
      onClose();
    }, 300);
  };

  const resetRange = () => {
    setRangeStart(null);
    setRangeEnd(null);
    setSelectedDate(null);
    setRangeMode(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div 
        className={`absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-300 ${
          isVisible ? 'opacity-100' : 'opacity-0'
        }`}
        onClick={handleClose}
      />

      <div 
        className={`relative bg-white rounded-2xl shadow-2xl w-full max-w-7xl h-[650px] overflow-hidden flex transition-all duration-300 ease-out ${
          isVisible 
            ? 'opacity-100 scale-100 translate-y-0' 
            : 'opacity-0 scale-95 translate-y-8'
        }`}
      >
        
        {/* ЛЕВАЯ КОЛОНКА: Календарь (расширенная) */}
        <div className="flex-1 flex flex-col border-r border-gray-200">
          <div className="bg-gradient-to-r from-blue-500 to-indigo-500 p-5 text-white shrink-0">
            <div className="flex justify-between items-start">
              <div>
                <h2 className="text-2xl font-bold">Календарь заказов</h2>
                <p className="text-white/90 text-sm">{orders.length} запланированных поставок</p>
              </div>
              
              <button
                onClick={() => {
                    setRangeMode(!rangeMode);
                    setRangeStart(null);
                    setRangeEnd(null);
                    setSelectedDate(null);
                }}
                className={`px-3 py-1.5 rounded-lg text-sm font-semibold transition-colors ${
                    rangeMode 
                    ? 'bg-red-500 text-white shadow-md' 
                    : 'bg-orange-500 text-white hover:bg-white/30'
                }`}
                >
                {rangeMode ? '✓ Диапазон' : 'Выбрать период'}
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 shrink-0">
            <button onClick={prevMonth} className="p-2 hover:bg-gray-100 rounded-lg transition">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <h3 className="text-lg font-bold text-gray-900">{monthNames[month]} {year}</h3>
            <button onClick={nextMonth} className="p-2 hover:bg-gray-100 rounded-lg transition">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>

          <div className="flex-1 p-6 flex flex-col">
            <div className="grid grid-cols-7 gap-2 mb-3 shrink-0">
              {dayNames.map(day => (
                <div key={day} className="text-center text-xs font-semibold text-gray-500 py-2">
                  {day}
                </div>
              ))}
            </div>

            <div className="grid grid-cols-7 grid-rows-6 gap-2 flex-1">
              {Array.from({ length: startDay }).map((_, i) => (
                <div key={`empty-${i}`} className="min-h-0" />
              ))}
              
              {Array.from({ length: daysInMonth }).map((_, i) => {
                const day = i + 1;
                const dayOrders = getOrdersForDate(day);
                const hasOrders = dayOrders.length > 0;
                const isSelected = selectedDate === day;
                const today = isToday(day);
                const inRange = isDateInRange(day);
                const isRangeStart = rangeStart === day;
                const isRangeEnd = rangeEnd === day;

                return (
                  <button
                    key={day}
                    onClick={() => handleDayClick(day)}
                    className={`min-h-0 rounded-lg border-2 transition-all duration-200 relative flex flex-col items-center justify-center ${
                      isSelected
                        ? 'border-blue-500 bg-blue-50 shadow-md'
                        : inRange
                        ? 'border-blue-300 bg-blue-50'
                        : isRangeStart || isRangeEnd
                        ? 'border-blue-500 bg-blue-100 shadow-md'
                        : today
                        ? 'border-orange-500 bg-orange-50'
                        : hasOrders
                        ? 'border-green-300 bg-green-50 hover:bg-green-100'
                        : 'border-gray-200 hover:bg-gray-50'
                    }`}
                  >
                    <span className={`text-sm font-semibold ${
                      isSelected || inRange || isRangeStart || isRangeEnd ? 'text-blue-600' : today ? 'text-orange-600' : 'text-gray-700'
                    }`}>
                      {day}
                    </span>
                    
                    {hasOrders && (
                      <div className="flex gap-0.5 mt-0.5">
                        {dayOrders.slice(0, 3).map((_, idx) => (
                          <div key={idx} className="w-1 h-1 rounded-full bg-green-500" />
                        ))}
                      </div>
                    )}
                  </button>
                );
              })}
              
              {Array.from({ length: 42 - startDay - daysInMonth }).map((_, i) => (
                <div key={`fill-${i}`} className="min-h-0" />
              ))}
            </div>
          </div>
        </div>

        {/* ПРАВАЯ КОЛОНКА: Список заказов */}
        <div className="w-[400px] flex flex-col bg-gray-50">
          <div className="p-4 border-b border-gray-200 bg-white shrink-0">
            <div className="flex justify-between items-start mb-2">
              <h4 className="font-bold text-gray-900 text-sm">{summaryTitle}</h4>
              {(rangeStart || selectedDate) && (
                <button
                  onClick={resetRange}
                  className="text-xs text-blue-600 hover:text-blue-800 font-medium"
                >
                  Сбросить
                </button>
              )}
            </div>
            <p className="text-xs text-gray-500">
              {totalOrders} {totalOrders === 1 ? 'заказ' : totalOrders < 5 ? 'заказа' : 'заказов'}
            </p>
          </div>

          {totalOrders > 0 && (
            <div className="p-4 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50 shrink-0">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <p className="text-xs text-gray-600 mb-1">Общий объем</p>
                  <p className="text-lg font-bold text-gray-900">
                    {Object.entries(volumeByUnit).map(([unit, vol]) => (
                      <span key={unit}>{vol} {unit}<br/></span>
                    ))}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-600 mb-1">Общая сумма</p>
                  <p className="text-lg font-bold text-orange-600">
                    {totalCost.toLocaleString()} ₽
                  </p>
                </div>
              </div>
            </div>
          )}

          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {totalOrders === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center">
                <svg className="w-16 h-16 text-gray-300 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <p className="text-gray-500 text-sm font-medium">Нет заказов</p>
                <p className="text-gray-400 text-xs mt-1">
                  {rangeStart && rangeEnd ? 'За выбранный период' : selectedDate ? 'На этот день' : 'В этом месяце'}
                </p>
              </div>
            ) : (
              displayOrders.map(order => (
                <div 
                  key={order.id} 
                  className="bg-white p-4 rounded-xl border border-gray-200 hover:shadow-md transition-shadow group cursor-pointer"
                  onClick={() => {
                    if (onOpenSupplier) {
                      const supplier = orders.find(o => o.id === order.id)?.supplierId 
                        ? require('../lib/dictionaries').suppliersData.find(s => s.id === order.supplierId)
                        : null;
                      if (supplier) {
                        onOpenSupplier(supplier);
                        handleClose();
                      }
                    }
                  }}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1 min-w-0 pr-2">
                      <p className="font-semibold text-gray-900 truncate text-sm">{order.supplierName}</p>
                      <p className="text-xs text-gray-500 mt-0.5">{order.category}</p>
                      <p className="text-xs text-blue-600 mt-1 font-medium">
                        {new Date(order.deliveryDate).toLocaleDateString('ru-RU', { day: 'numeric', month: 'long' })}
                      </p>
                    </div>
                    
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onRemoveOrder(order);
                      }}
                      className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors opacity-0 group-hover:opacity-100 shrink-0"
                      title="Удалить заказ"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                  
                  <div className="flex items-center justify-between text-sm pt-2 border-t border-gray-100">
                    <span className="text-gray-600">
                      <span className="font-semibold text-gray-900">{order.volume}</span> {order.unit}
                    </span>
                    <span className="font-bold text-orange-600">
                      {order.totalCost.toLocaleString()} ₽
                    </span>
                  </div>
                  
                  {order.comment && (
                    <p className="text-xs text-gray-500 mt-2 italic bg-gray-50 p-2 rounded">"{order.comment}"</p>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
