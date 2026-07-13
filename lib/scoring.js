export function scoreSuppliers(suppliers, criteria) {
  return suppliers
    .map(supplier => {
      let score = 0;
      const reasons = [];

      // 1. Совпадение категории (40 баллов)
      if (criteria.category && supplier.category === criteria.category) {
        score += 40;
        reasons.push("Точное совпадение категории");
      } else if (!criteria.category) {
        score += 20; // Нейтрально, если не выбрали
      }

      // 2. Попадание в бюджет (30 баллов)
      if (criteria.maxPrice && supplier.pricePerUnit <= criteria.maxPrice) {
        score += 30;
        reasons.push(`Цена ${supplier.pricePerUnit}₽ вписывается в бюджет`);
      } else if (!criteria.maxPrice) {
        score += 15;
      }

      // 3. Город (20 баллов)
      if (criteria.city && supplier.city === criteria.city) {
        score += 20;
        reasons.push("Доставка из вашего города");
      } else if (!criteria.city) {
        score += 10;
      }

      // 4. Скорость доставки (10 баллов)
      if (criteria.urgency === 'today' && supplier.deliveryDays <= 1) {
        score += 10;
        reasons.push("Доставка сегодня/завтра");
      } else if (criteria.urgency === 'tomorrow' && supplier.deliveryDays <= 2) {
        score += 10;
        reasons.push("Быстрая доставка");
      } else if (!criteria.urgency) {
        score += 5;
      }

      // 5. Сертификаты (10 баллов)
      if (criteria.needsCertificates && supplier.certificates.length > 0) {
        score += 10;
        reasons.push("Есть все сертификаты");
      } else if (!criteria.needsCertificates) {
        score += 5;
      }

      // Штраф за высокий минимальный заказ (если объем пользователя меньше MOQ)
      if (criteria.volume && supplier.minOrder > criteria.volume) {
        score -= 15;
        reasons.push(`Мин. заказ (${supplier.minOrder} ${supplier.unit}) больше вашего`);
      }

      return {
        ...supplier,
        finalScore: Math.max(0, Math.min(100, score)), // Ограничиваем от 0 до 100
        matchReasons: reasons
      };
    })
    .sort((a, b) => b.finalScore - a.finalScore); // Сортируем от лучшего к худшему
}
