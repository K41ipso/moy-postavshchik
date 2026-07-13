const fs = require('fs');
const path = require('path');

const categories = [
  { name: 'Мясо и птица', sub: ['Говядина', 'Свинина', 'Курица', 'Индейка', 'Баранина'] },
  { name: 'Рыба и морепродукты', sub: ['Лосось', 'Форель', 'Тунец', 'Креветки', 'Кальмары'] },
  { name: 'Овощи и фрукты', sub: ['Картофель', 'Томаты', 'Огурцы', 'Яблоки', 'Цитрусовые', 'Ягоды'] },
  { name: 'Молочные продукты', sub: ['Молоко', 'Сыр', 'Творог', 'Сливки', 'Йогурты'] },
  { name: 'Хлеб и выпечка', sub: ['Хлеб', 'Булочки', 'Круассаны', 'Лаваш', 'Сдоба'] },
  { name: 'Напитки', sub: ['Кофе', 'Чай', 'Соки', 'Вода', 'Газировка'] },
  { name: 'Бакалея', sub: ['Крупы', 'Макароны', 'Сахар', 'Соль', 'Специи'] },
  { name: 'Упаковка', sub: ['Контейнеры', 'Пакеты', 'Коробки', 'Плёнка', 'Стаканчики'] }
];

const cities = ['Москва', 'Санкт-Петербург', 'Екатеринбург', 'Новосибирск', 'Казань', 'Нижний Новгород', 'Челябинск', 'Самара', 'Омск', 'Ростов-на-Дону', 'Уфа', 'Краснодар', 'Воронеж', 'Пермь', 'Волгоград'];

const certificates = ['ХАССП', 'ISO 22000', 'ГОСТ', 'Органик', 'Вет. контроль', 'Пищевая безопасность', 'FSSC 22000'];

const descriptions = [
  'Крупный оптовый поставщик с собственным складом. Доставка 24/7.',
  'Фермерское хозяйство с собственным производством. Экологически чистая продукция.',
  'Официальный дистрибьютор импортных товаров. Прямые контракты с производителями.',
  'Специализируемся на HoReCa сегменте. Индивидуальные условия для ресторанов.',
  'Работаем с 2010 года. Более 500 постоянных клиентов.',
  'Собственная логистика. Доставка от 2 часов по городу.',
  'Сертифицированный поставщик для федеральных сетей.',
  'Производитель с 20-летним опытом. Контроль качества на всех этапах.'
];

// Реалистичные названия для генерации
const prefixes = ['Агро', 'Фуд', 'Молочный', 'Свежий', 'Эко', 'Зеленая', 'Русский', 'Южный', 'Сибирский', 'Донской', 'Балтийский', 'Уральский'];
const suffixes = ['Путь', 'Дар', 'Продукт', 'Снаб', 'Трейд', 'Групп', 'Ферма', 'Холдинг', 'Компания', 'Альянс'];

function randomInt(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min; }
function randomChoice(arr) { return arr[Math.floor(Math.random() * arr.length)]; }

function generateSupplier(id) {
  const category = randomChoice(categories);
  const subCategory = randomChoice(category.sub);
  const city = randomChoice(cities);
  
  let basePrice, unit, minOrder;
  if (category.name.includes('Мясо')) { basePrice = randomInt(350, 900); unit = 'кг'; minOrder = randomInt(20, 100); }
  else if (category.name.includes('Рыба')) { basePrice = randomInt(600, 1500); unit = 'кг'; minOrder = randomInt(10, 50); }
  else if (category.name.includes('Овощи')) { basePrice = randomInt(80, 250); unit = 'кг'; minOrder = randomInt(50, 200); }
  else if (category.name.includes('Молоч')) { basePrice = randomInt(90, 300); unit = category.sub.includes('Сыр') ? 'кг' : 'л'; minOrder = randomInt(50, 300); }
  else if (category.name.includes('Хлеб')) { basePrice = randomInt(40, 120); unit = 'шт'; minOrder = randomInt(100, 500); }
  else if (category.name.includes('Напитки')) { basePrice = category.sub.includes('Кофе') ? randomInt(800, 2000) : randomInt(50, 150); unit = category.sub.includes('Кофе') ? 'кг' : 'л'; minOrder = randomInt(20, 100); }
  else if (category.name.includes('Бакалея')) { basePrice = randomInt(60, 200); unit = 'кг'; minOrder = randomInt(50, 200); }
  else { basePrice = randomInt(5, 50); unit = 'шт'; minOrder = randomInt(500, 5000); }
  
  const numCerts = randomInt(1, 3);
  const certs = [];
  const availableCerts = [...certificates];
  for (let i = 0; i < numCerts; i++) {
    const cert = randomChoice(availableCerts);
    certs.push(cert);
    const idx = availableCerts.indexOf(cert);
    if (idx > -1) availableCerts.splice(idx, 1);
  }
  
  // Генерируем красивое название: "Агро-Юг", "Свежий Дар" и т.д.
  const companyName = `${randomChoice(prefixes)}-${randomChoice(suffixes)}`;
  
  return {
    id,
    name: companyName,
    category: category.name,
    subCategory,
    city,
    pricePerUnit: basePrice,
    minOrder,
    unit,
    certificates: certs,
    deliveryDays: randomInt(1, 7),
    rating: parseFloat((Math.random() * 2 + 3).toFixed(1)),
    description: randomChoice(descriptions),
    contact: `+7 (${randomInt(495, 499)}) ${randomInt(100, 999)}-${randomInt(10, 99)}-${randomInt(10, 99)}`
  };
}

const suppliers = [];
for (let i = 1; i <= 500; i++) {
  suppliers.push(generateSupplier(i));
}

const outputPath = path.join(__dirname, '..', 'data', 'suppliers.json');
fs.writeFileSync(outputPath, JSON.stringify(suppliers, null, 2), 'utf8');

console.log(`✅ Сгенерировано ${suppliers.length} реалистичных поставщиков`);
console.log(`📁 Файл сохранен: ${outputPath}`);
