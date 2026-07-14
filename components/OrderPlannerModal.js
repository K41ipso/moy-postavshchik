'use client';
import { useState, useEffect } from 'react';

const MAX_VOLUME = 5000; // Изменено с 1000 на 5000

export default function OrderPlannerModal({ supplier, volume, isOpen, onClose, onSuccess }) {
  const [deliveryDate, setDeliveryDate] = useState('');
  const [comment, setComment] = useState('');
  const [orderVolume, setOrderVolume] = useState(volume || supplier?.minOrder || 1);

  // Сбрасываем volume при открытии новой карточки
  useEffect(() => {
    if (isOpen && supplier) {
      setOrderVolume(volume || supplier.minOrder || 1);
      setDeliveryDate('');
      setComment('');
    }
  }, [isOpen, supplier, volume]);

  if (!isOpen || !supplier) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!deliveryDate) {
      alert('Пожалуйста, выберите дату поставки');
      return;
    }

    const order = {
      id: Date.now().toString(),
      supplierId: supplier.id,
      supplierName: supplier.name,
      category: `${supplier.category} • ${supplier.subCategory}`,
      volume: orderVolume,
      unit: supplier.unit,
      pricePerUnit: supplier.pricePerUnit,
      totalCost: supplier.pricePerUnit * orderVolume,
      deliveryDate,
      comment,
      createdAt: new Date().toISOString(),
    };

    const saved = localStorage.getItem('orders');
    let orders = [];
    if (saved) {
      try {
        orders = JSON.parse(saved);
      } catch (e) {}
    }

    orders.push(order);
    localStorage.setItem('orders', JSON.stringify(orders));
    window.dispatchEvent(new Event('ordersChanged'));

    // Показываем уведомление
    if (onSuccess) {
      onSuccess(`Заказ на ${orderVolume} ${supplier.unit} добавлен в план на ${new Date(deliveryDate).toLocaleDateString('ru-RU')}`);
    }

    onClose();
  };

  const handleClose = () => {
    setDeliveryDate('');
    setComment('');
    setOrderVolume(volume || supplier.minOrder || 1);
    onClose();
  };

  const today = new Date().toISOString().split('T')[0];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={handleClose}
      />

      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
        <div className="bg-gradient-to-r from-blue-500 to-indigo-500 p-6 text-white">
          <h2 className="text-2xl font-bold mb-1">Добавить в план закупок</h2>
          <p className="text-white/90 text-sm">{supplier.name}</p>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Дата поставки *
            </label>
            <input
              type="date"
              value={deliveryDate}
              onChange={(e) => setDeliveryDate(e.target.value)}
              min={today}
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Объем ({supplier.unit})
            </label>
            <input
              type="number"
              value={orderVolume}
              onChange={(e) => setOrderVolume(Math.min(MAX_VOLUME, Math.max(supplier.minOrder, parseInt(e.target.value) || 0)))}
              min={supplier.minOrder}
              max={MAX_VOLUME}
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 font-bold"
            />
            <p className="text-xs text-gray-500 mt-1">Мин. заказ: {supplier.minOrder} {supplier.unit} • Макс: {MAX_VOLUME} {supplier.unit}</p>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Комментарий (опционально)
            </label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Например: доставить до 10:00"
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 h-20 resize-none text-gray-700"
            />
          </div>

          <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Итоговая стоимость:</span>
              <span className="text-2xl font-bold text-blue-600">
                {(supplier.pricePerUnit * orderVolume).toLocaleString()} ₽
              </span>
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={handleClose}
              className="flex-1 py-3 bg-white border-2 border-gray-300 text-gray-700 font-bold rounded-lg hover:bg-gray-50 transition"
            >
              Отмена
            </button>
            <button
              type="submit"
              className="flex-1 py-3 bg-gradient-to-r from-blue-500 to-indigo-500 text-white font-bold rounded-lg hover:from-blue-600 hover:to-indigo-600 transition shadow-lg"
            >
              Добавить в план
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
