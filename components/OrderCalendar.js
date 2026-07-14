'use client';
import { useState, useEffect, useRef } from 'react';
import CalendarView from './CalendarView';

export default function OrderCalendar({ showToast, onOpenSupplier }) {
  const [isOpen, setIsOpen] = useState(false);
  const [showCalendar, setShowCalendar] = useState(false);
  const [orders, setOrders] = useState([]);
  const trayRef = useRef(null);

  const loadOrders = () => {
    const saved = localStorage.getItem('orders');
    if (saved) {
      try {
        const ordersList = JSON.parse(saved);
        const sorted = ordersList.sort((a, b) => new Date(a.deliveryDate) - new Date(b.deliveryDate));
        setOrders(sorted);
      } catch (e) {
        console.error('Error loading orders', e);
      }
    } else {
      setOrders([]);
    }
  };

  useEffect(() => {
    loadOrders();
    
    const handleOrdersChange = () => loadOrders();
    window.addEventListener('ordersChanged', handleOrdersChange);
    
    return () => {
      window.removeEventListener('ordersChanged', handleOrdersChange);
    };
  }, []);

  useEffect(() => {
    if (isOpen) {
      loadOrders();
    }
  }, [isOpen]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (trayRef.current && !trayRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (!isOpen) return;

    const handleScroll = () => {
      setIsOpen(false);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [isOpen]);

  const removeOrder = (e, orderId) => {
    e.stopPropagation();
    
    const saved = localStorage.getItem('orders');
    let ordersList = [];
    if (saved) {
      try {
        ordersList = JSON.parse(saved);
      } catch (e) {}
    }
    
    ordersList = ordersList.filter(order => order.id !== orderId);
    localStorage.setItem('orders', JSON.stringify(ordersList));
    
    loadOrders();
    window.dispatchEvent(new Event('ordersChanged'));
  };

  const handleRemoveFromCalendar = (order) => {
    const saved = localStorage.getItem('orders');
    let ordersList = [];
    if (saved) {
      try {
        ordersList = JSON.parse(saved);
      } catch (e) {}
    }
    
    ordersList = ordersList.filter(o => o.id !== order.id);
    localStorage.setItem('orders', JSON.stringify(ordersList));
    
    loadOrders();
    window.dispatchEvent(new Event('ordersChanged'));
    
    // Показываем уведомление
    if (showToast) {
      showToast(`Заказ "${order.supplierName}" удалён из плана`, 'error');
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    if (date.toDateString() === today.toDateString()) {
      return 'Сегодня';
    } else if (date.toDateString() === tomorrow.toDateString()) {
      return 'Завтра';
    } else {
      return date.toLocaleDateString('ru-RU', { day: 'numeric', month: 'long' });
    }
  };

  const getStatusColor = (dateString) => {
    const date = new Date(dateString);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (date < today) return 'bg-red-100 text-red-700 border-red-300';
    if (date.toDateString() === today.toDateString()) return 'bg-orange-100 text-orange-700 border-orange-300';
    return 'bg-green-100 text-green-700 border-green-300';
  };

  const getStatusText = (dateString) => {
    const date = new Date(dateString);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (date < today) return 'Просрочено';
    if (date.toDateString() === today.toDateString()) return 'Сегодня';
    return 'Запланировано';
  };

  return (
    <>
      <div className="relative" ref={trayRef}>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="relative p-2.5 bg-white/20 backdrop-blur-md rounded-lg hover:bg-white/30 transition-colors border border-white/30"
        >
          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          
          {orders.length > 0 && (
            <span className="absolute -top-1 -right-1 bg-blue-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
              {orders.length}
            </span>
          )}
        </button>

        <div 
          className={`absolute right-0 mt-2 w-96 bg-white rounded-xl shadow-2xl border border-gray-100 overflow-hidden z-50 transition-all duration-300 ease-out origin-top ${
            isOpen 
              ? 'opacity-100 max-h-[600px] scale-100' 
              : 'opacity-0 max-h-0 scale-95 pointer-events-none'
          }`}
        >
          <div className="p-4 border-b border-gray-100 bg-gray-50">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="font-bold text-gray-900">План закупок</h3>
                <p className="text-xs text-gray-500 mt-0.5">{orders.length} заказов</p>
              </div>
              <button
                onClick={() => {
                  setIsOpen(false);
                  setShowCalendar(true);
                }}
                className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
                title="Открыть календарь"
              >
                <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </button>
            </div>
          </div>

          <div className="max-h-[500px] overflow-y-auto">
            {orders.length === 0 ? (
              <div className="p-8 text-center">
                <svg className="w-12 h-12 text-gray-300 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <p className="text-gray-500 text-sm">Нет запланированных заказов</p>
                <p className="text-gray-400 text-xs mt-1">Добавьте заказ из карточки поставщика</p>
              </div>
            ) : (
              orders.map((order) => (
                <div
                  key={order.id}
                  className="p-4 hover:bg-blue-50 transition-colors border-b border-gray-50 last:border-b-0 group"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1 min-w-0 pr-3">
                      <p className="font-semibold text-gray-900 truncate">{order.supplierName}</p>
                      <p className="text-xs text-gray-500 mt-0.5">{order.category}</p>
                    </div>
                    
                    <button
                      onClick={(e) => removeOrder(e, order.id)}
                      className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors opacity-0 group-hover:opacity-100"
                      title="Удалить заказ"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                  
                  <div className="flex items-center gap-2 mb-2">
                    <span className={`px-2 py-1 rounded-md text-xs font-medium border ${getStatusColor(order.deliveryDate)}`}>
                      {getStatusText(order.deliveryDate)}
                    </span>
                    <span className="text-xs text-gray-500">
                      {formatDate(order.deliveryDate)}
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">
                      Объем: <span className="font-semibold text-gray-900">{order.volume} {order.unit}</span>
                    </span>
                    <span className="font-bold text-orange-600">
                      {order.totalCost.toLocaleString()} ₽
                    </span>
                  </div>
                  
                  {order.comment && (
                    <p className="text-xs text-gray-500 mt-2 italic">"{order.comment}"</p>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {showCalendar && (
        <CalendarView 
          orders={orders} 
          onClose={() => setShowCalendar(false)}
          onRemoveOrder={handleRemoveFromCalendar}
          onOpenSupplier={onOpenSupplier}
        />
      )}
    </>
  );
}
