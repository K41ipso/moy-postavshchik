import suppliersData from '../data/suppliers.json';

export function getDictionaries() {
  // 1. Собираем уникальные категории
  const categories = [...new Set(suppliersData.map(s => s.category))];
  
  // 2. Собираем уникальные города
  const cities = [...new Set(suppliersData.map(s => s.city))];
  
  // 3. Собираем все сертификаты и считаем, сколько поставщиков их имеет
  const certCounts = {};
  suppliersData.forEach(s => {
    s.certificates.forEach(cert => {
      certCounts[cert] = (certCounts[cert] || 0) + 1;
    });
  });
  const certificates = Object.entries(certCounts).map(([name, count]) => ({ name, count }));

  // 4. Считаем диапазоны цен и объемов для слайдеров
  const prices = suppliersData.map(s => s.pricePerUnit);
  const volumes = suppliersData.map(s => s.minOrder);

  return {
    categories,
    cities,
    certificates,
    priceRange: { min: Math.min(...prices), max: Math.max(...prices) },
    volumeRange: { min: Math.min(...volumes), max: Math.max(...volumes) }
  };
}

export { suppliersData };
