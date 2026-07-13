'use client';
import { useState, useMemo, useEffect } from 'react';
import SearchBuilder from '../components/SearchBuilder';
import SupplierCard from '../components/SupplierCard';
import SupplierModal from '../components/SupplierModal';
import ScrollToTop from '../components/ScrollToTop';
import Footer from '../components/Footer';
import { suppliersData, getDictionaries } from '../lib/dictionaries';
import { scoreSuppliers } from '../lib/scoring';
import { BuilderIcon, ListIcon, SearchIcon, ChevronLeftIcon, ChevronRightIcon } from '../components/Icons';

const ITEMS_PER_PAGE_CATALOG = 27;
const ITEMS_PER_PAGE_BUILDER = 9;

export default function Home() {
  const [selectedSupplier, setSelectedSupplier] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [mode, setMode] = useState('builder');
  const [results, setResults] = useState([]);
  const [hasSearched, setHasSearched] = useState(false);
  const [catalogQuery, setCatalogQuery] = useState('');
  const [catalogCategory, setCatalogCategory] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [builderPage, setBuilderPage] = useState(1);

  const dicts = getDictionaries();

  const isBuilderEmpty = mode === 'builder' && !hasSearched;

  // Блокируем скролл в режиме builder без поиска
  useEffect(() => {
    if (isBuilderEmpty) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    
    return () => {
      document.body.style.overflow = '';
    };
  }, [isBuilderEmpty]);

  // Сброс страниц при изменении фильтров
  useEffect(() => {
    setCurrentPage(1);
  }, [catalogQuery, catalogCategory]);

  useEffect(() => {
    setBuilderPage(1);
  }, [hasSearched]);

  const handleModeChange = (newMode) => {
    if (newMode === mode) return;
    setMode(newMode);
    
    if (newMode === 'builder' && !hasSearched) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleSearch = (criteria) => {
    const scored = scoreSuppliers(suppliersData, criteria);
    setResults(scored);
    setHasSearched(true);
  };

  const openModal = (supplier) => {
    setSelectedSupplier(supplier);
    setIsModalOpen(true);
  };

  const filteredCatalog = useMemo(() => {
    return suppliersData.filter(s => {
      const matchesQuery = catalogQuery === '' || 
        s.name.toLowerCase().includes(catalogQuery.toLowerCase()) ||
        s.subCategory.toLowerCase().includes(catalogQuery.toLowerCase());
      const matchesCategory = catalogCategory === '' || s.category === catalogCategory;
      return matchesQuery && matchesCategory;
    });
  }, [catalogQuery, catalogCategory]);

  const catalogTotalPages = Math.ceil(filteredCatalog.length / ITEMS_PER_PAGE_CATALOG);
  const paginatedCatalog = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE_CATALOG;
    return filteredCatalog.slice(start, start + ITEMS_PER_PAGE_CATALOG);
  }, [filteredCatalog, currentPage]);

  const builderTotalPages = Math.ceil(results.length / ITEMS_PER_PAGE_BUILDER);
  const paginatedResults = useMemo(() => {
    const start = (builderPage - 1) * ITEMS_PER_PAGE_BUILDER;
    return results.slice(start, start + ITEMS_PER_PAGE_BUILDER);
  }, [results, builderPage]);

  const goToCatalogPage = (page) => {
    if (page >= 1 && page <= catalogTotalPages) {
      setCurrentPage(page);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const goToBuilderPage = (page) => {
    if (page >= 1 && page <= builderTotalPages) {
      setBuilderPage(page);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // Запрещаем скроллить ниже футера
  useEffect(() => {
    if (isBuilderEmpty) return;

    const clampScroll = () => {
      const footer = document.querySelector('footer');
      if (footer) {
        const footerRect = footer.getBoundingClientRect();
        const footerTop = footerRect.top + window.scrollY;
        const viewportHeight = window.innerHeight;
        const maxScroll = footerTop - viewportHeight + 100; // +100 чтобы футер был виден
        
        if (window.scrollY > maxScroll && maxScroll > 0) {
          window.scrollTo({ top: maxScroll, behavior: 'auto' });
        }
      }
    };

    window.addEventListener('scroll', clampScroll, { passive: true });
    window.addEventListener('resize', clampScroll, { passive: true });
    
    // Запускаем при изменении контента
    clampScroll();
    
    return () => {
      window.removeEventListener('scroll', clampScroll);
      window.removeEventListener('resize', clampScroll);
    };
  }, [isBuilderEmpty, mode, hasSearched, currentPage, builderPage, catalogQuery, catalogCategory]);

  const Pagination = ({ currentPage, totalPages, goToPage }) => {
    if (totalPages <= 1) return null;
    
    return (
      <div className="flex justify-center items-center gap-2 mt-8">
        <button
          onClick={() => goToPage(currentPage - 1)}
          disabled={currentPage === 1}
          className="px-4 py-2 bg-white/90 text-gray-700 rounded-lg font-semibold disabled:opacity-30 disabled:cursor-not-allowed hover:bg-white transition flex items-center gap-1"
        >
          <ChevronLeftIcon className="w-4 h-4" /> Назад
        </button>
        
        <div className="flex gap-1">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => {
            if (
              page === 1 || 
              page === totalPages || 
              (page >= currentPage - 1 && page <= currentPage + 1)
            ) {
              return (
                <button
                  key={page}
                  onClick={() => goToPage(page)}
                  className={`w-10 h-10 rounded-lg font-semibold transition ${
                    currentPage === page
                      ? 'bg-white text-orange-600 shadow-md'
                      : 'bg-white/20 text-white hover:bg-white/30'
                  }`}
                >
                  {page}
                </button>
              );
            } else if (
              page === currentPage - 2 || 
              page === currentPage + 2
            ) {
              return (
                <span key={page} className="w-10 h-10 flex items-center justify-center text-white/60">
                  ...
                </span>
              );
            }
            return null;
          })}
        </div>
        
        <button
          onClick={() => goToPage(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="px-4 py-2 bg-white/90 text-gray-700 rounded-lg font-semibold disabled:opacity-30 disabled:cursor-not-allowed hover:bg-white transition flex items-center gap-1"
        >
          Вперёд <ChevronRightIcon className="w-4 h-4" />
        </button>
      </div>
    );
  };

  return (
    <div className={isBuilderEmpty ? 'h-screen overflow-hidden' : ''}>
      {/* Основной контент */}
      <main className="p-4 md:p-8 relative">
        <div className="max-w-7xl mx-auto w-full">
          {/* Header */}
          <header className="text-center mb-10">
            <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-3 tracking-tight drop-shadow-md">
              Мой.ПоставщИИк
            </h1>
            <p className="text-white/90 text-lg font-medium">
              Умный поиск и каталог поставщиков продуктов питания
            </p>
          </header>

          {/* Переключатель */}
          <div className="flex justify-center mb-8">
            <div className="bg-white/20 backdrop-blur-md p-1 rounded-xl flex gap-1 border border-white/30 shadow-lg relative overflow-hidden">
              <div 
                className="absolute top-1 h-[calc(100%-8px)] bg-white rounded-lg shadow-lg transition-transform duration-300 ease-out"
                style={{
                  left: '4px',
                  width: `calc(50% - 4px)`,
                  transform: mode === 'builder' ? 'translateX(0)' : 'translateX(100%)',
                  willChange: 'transform'
                }}
              />
              
              <button
                onClick={() => handleModeChange('builder')}
                className={`relative z-10 flex items-center gap-2 px-6 py-2.5 rounded-lg font-semibold transition-colors duration-300 ${
                  mode === 'builder' ? 'text-orange-600' : 'text-white hover:text-white/90'
                }`}
              >
                <BuilderIcon className="w-5 h-5" /> Умный подбор
              </button>
              <button
                onClick={() => handleModeChange('catalog')}
                className={`relative z-10 flex items-center gap-2 px-6 py-2.5 rounded-lg font-semibold transition-colors duration-300 ${
                  mode === 'catalog' ? 'text-orange-600' : 'text-white hover:text-white/90'
                }`}
              >
                <ListIcon className="w-5 h-5" /> Каталог ({suppliersData.length})
              </button>
            </div>
          </div>

          {/* Контент */}
          <div className="relative">
            {/* Умный подбор */}
            <div 
              className={`transition-all duration-400 ease-out ${
                mode === 'builder' 
                  ? 'opacity-100 transform scale-100 translate-y-0' 
                  : 'opacity-0 transform scale-95 translate-y-4 pointer-events-none absolute inset-0'
              }`}
              style={{ willChange: 'opacity, transform' }}
            >
              <SearchBuilder onSearch={handleSearch} />
              
              {hasSearched && (
                <div className="mt-12">
                  <h2 className="text-2xl font-bold text-white mb-6 drop-shadow">
                    Результаты подбора ({results.length})
                  </h2>
                  {paginatedResults.length > 0 ? (
                    <>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {paginatedResults.map((supplier) => (
                          <SupplierCard 
                            key={supplier.id} 
                            supplier={supplier} 
                            onClick={() => openModal(supplier)} 
                          />
                        ))}
                      </div>
                      <Pagination 
                        currentPage={builderPage} 
                        totalPages={builderTotalPages} 
                        goToPage={goToBuilderPage} 
                      />
                    </>
                  ) : (
                    <div className="bg-white p-12 rounded-2xl text-center shadow-xl">
                      <p className="text-xl text-gray-800 font-bold">Ничего не найдено</p>
                      <p className="text-gray-600 mt-2">Попробуйте смягчить требования</p>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Каталог */}
            <div 
              className={`transition-all duration-400 ease-out ${
                mode === 'catalog' 
                  ? 'opacity-100 transform scale-100 translate-y-0' 
                  : 'opacity-0 transform scale-95 translate-y-4 pointer-events-none absolute inset-0'
              }`}
              style={{ willChange: 'opacity, transform' }}
            >
              <div className="bg-white p-6 rounded-2xl shadow-xl mb-8 flex flex-col md:flex-row gap-4">
                <div className="flex-1 relative">
                  <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Поиск по названию или подкатегории..."
                    value={catalogQuery}
                    onChange={(e) => setCatalogQuery(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 text-gray-900"
                  />
                </div>
                <select
                  value={catalogCategory}
                  onChange={(e) => setCatalogCategory(e.target.value)}
                  className="md:w-64 px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 text-gray-900"
                >
                  <option value="">Все категории</option>
                  {dicts.categories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {paginatedCatalog.map((supplier) => (
                  <SupplierCard 
                    key={supplier.id} 
                    supplier={{...supplier, finalScore: 0, matchReasons: []}} 
                    onClick={() => openModal(supplier)}
                  />
                ))}
              </div>
              
              {paginatedCatalog.length === 0 && (
                <div className="bg-white p-12 rounded-2xl text-center shadow-xl">
                  <p className="text-xl text-gray-800">В каталоге нет таких поставщиков</p>
                </div>
              )}

              <Pagination 
                currentPage={currentPage} 
                totalPages={catalogTotalPages} 
                goToPage={goToCatalogPage} 
              />
            </div>
          </div>
        </div>
      </main>

      {/* Футер */}
      {!isBuilderEmpty && <Footer />}

      <SupplierModal 
        supplier={selectedSupplier}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />

      <ScrollToTop />
    </div>
  );
}
