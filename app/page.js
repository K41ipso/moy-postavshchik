'use client';
import { useState, useMemo, useEffect } from 'react';
import SearchBuilder from '../components/SearchBuilder';
import SupplierCard from '../components/SupplierCard';
import SupplierModal from '../components/SupplierModal';
import ScrollToTop from '../components/ScrollToTop';
import Footer from '../components/Footer';
import FavoritesTray from '../components/FavoritesTray';
import OrderCalendar from '../components/OrderCalendar';
import OrderPlannerModal from '../components/OrderPlannerModal';
import Toast from '../components/Toast';
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

  const [isOrderPlannerOpen, setIsOrderPlannerOpen] = useState(false);
  const [orderPlannerSupplier, setOrderPlannerSupplier] = useState(null);
  const [orderPlannerVolume, setOrderPlannerVolume] = useState(0);

  const [toast, setToast] = useState(null);
  const [sortBy, setSortBy] = useState('');
  const [filterCity, setFilterCity] = useState('');

  const dicts = getDictionaries();

  const isBuilderEmpty = mode === 'builder' && !hasSearched;

  useEffect(() => {
    setCurrentPage(1);
  }, [catalogQuery, catalogCategory, sortBy, filterCity]);

  useEffect(() => {
    setBuilderPage(1);
  }, [hasSearched]);

  const handleModeChange = (newMode) => {
    if (newMode === mode) return;
    setMode(newMode);
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

  const handleAddToPlan = (supplier, volume) => {
    setOrderPlannerSupplier(supplier);
    setOrderPlannerVolume(volume);
    setIsOrderPlannerOpen(true);
  };

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
  };

  const filteredCatalog = useMemo(() => {
    let result = suppliersData.filter(s => {
      const matchesQuery = catalogQuery === '' || 
        s.name.toLowerCase().includes(catalogQuery.toLowerCase()) ||
        s.subCategory.toLowerCase().includes(catalogQuery.toLowerCase());
      const matchesCategory = catalogCategory === '' || s.category === catalogCategory;
      const matchesCity = filterCity === '' || s.city === filterCity;
      return matchesQuery && matchesCategory && matchesCity;
    });

    if (sortBy === 'price-asc') {
      result.sort((a, b) => a.pricePerUnit - b.pricePerUnit);
    } else if (sortBy === 'price-desc') {
      result.sort((a, b) => b.pricePerUnit - a.pricePerUnit);
    } else if (sortBy === 'rating') {
      result.sort((a, b) => b.rating - a.rating);
    }

    return result;
  }, [catalogQuery, catalogCategory, filterCity, sortBy]);

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

  const Pagination = ({ currentPage, totalPages, goToPage }) => {
    if (totalPages <= 1) return null;
    
    return (
      <div className="flex justify-center items-center gap-1 sm:gap-2 mt-8 flex-wrap">
        <button
          onClick={() => goToPage(currentPage - 1)}
          disabled={currentPage === 1}
          className="px-3 sm:px-4 py-2 bg-white/90 text-gray-700 rounded-lg font-semibold disabled:opacity-30 disabled:cursor-not-allowed hover:bg-white transition flex items-center gap-1 text-sm sm:text-base"
        >
          <ChevronLeftIcon className="w-4 h-4" /> <span className="hidden sm:inline">Назад</span>
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
                  className={`w-8 h-8 sm:w-10 sm:h-10 rounded-lg font-semibold transition ${
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
                <span key={page} className="w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center text-white/60">
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
          className="px-3 sm:px-4 py-2 bg-white/90 text-gray-700 rounded-lg font-semibold disabled:opacity-30 disabled:cursor-not-allowed hover:bg-white transition flex items-center gap-1 text-sm sm:text-base"
        >
          <span className="hidden sm:inline">Вперёд</span> <ChevronRightIcon className="w-4 h-4" />
        </button>
      </div>
    );
  };

  return (
    <div className={`min-h-screen flex flex-col bg-gradient-to-br from-yellow-400 via-orange-500 to-red-500 ${
      isBuilderEmpty ? 'overflow-hidden' : ''
    }`}>
      <main className="flex-1 p-3 sm:p-4 md:p-8">
        <div className="max-w-7xl mx-auto w-full">
          <header className="text-center mb-6 sm:mb-10">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-white mb-2 sm:mb-3 tracking-tight drop-shadow-md">
              Мой.ПоставщИИк
            </h1>
            <p className="text-white/90 text-sm sm:text-lg font-medium">
              Умный поиск и каталог поставщиков продуктов питания
            </p>
          </header>

          <div className="flex flex-col sm:flex-row justify-center items-center gap-4 mb-6 sm:mb-8">
            <div className="bg-white/20 backdrop-blur-md p-1 rounded-xl flex gap-1 border border-white/30 shadow-lg relative overflow-hidden w-full sm:w-auto">
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
                className={`relative z-10 flex items-center justify-center gap-2 px-4 sm:px-6 py-2.5 rounded-lg font-semibold transition-colors duration-300 flex-1 sm:flex-none ${
                  mode === 'builder' ? 'text-orange-600' : 'text-white hover:text-white/90'
                }`}
              >
                <BuilderIcon className="w-4 h-4 sm:w-5 sm:h-5" /> 
                <span className="sm:hidden">Подбор</span>
                <span className="hidden sm:inline">Умный подбор</span>
              </button>
              <button
                onClick={() => handleModeChange('catalog')}
                className={`relative z-10 flex items-center justify-center gap-2 px-4 sm:px-6 py-2.5 rounded-lg font-semibold transition-colors duration-300 flex-1 sm:flex-none ${
                  mode === 'catalog' ? 'text-orange-600' : 'text-white hover:text-white/90'
                }`}
              >
                <ListIcon className="w-4 h-4 sm:w-5 sm:h-5" /> 
                <span className="sm:hidden">Каталог</span>
                <span className="hidden sm:inline">Каталог ({suppliersData.length})</span>
              </button>
            </div>

            <div className="flex gap-2">
              <FavoritesTray onOpenSupplier={openModal} />
              <OrderCalendar showToast={showToast} onOpenSupplier={openModal} />
            </div>
          </div>

          {mode === 'builder' ? (
            <>
              <SearchBuilder onSearch={handleSearch} />
              
              {hasSearched && (
                <div className="mt-8 sm:mt-12">
                  <h2 className="text-xl sm:text-2xl font-bold text-white mb-6 drop-shadow">
                    Результаты подбора ({results.length})
                  </h2>
                  {paginatedResults.length > 0 ? (
                    <>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
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
                    <div className="bg-white p-8 sm:p-12 rounded-2xl text-center shadow-xl">
                      <p className="text-lg sm:text-xl text-gray-800 font-bold">Ничего не найдено</p>
                      <p className="text-gray-600 mt-2">Попробуйте смягчить требования</p>
                    </div>
                  )}
                </div>
              )}
            </>
          ) : (
            <>
              <div className="bg-white p-4 sm:p-6 rounded-2xl shadow-xl mb-6 sm:mb-8 space-y-4">
                <div className="flex flex-col sm:flex-row gap-4">
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
                    className="sm:w-64 px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 text-gray-900"
                  >
                    <option value="">Все категории</option>
                    {dicts.categories.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                <div className="flex flex-col sm:flex-row gap-4 pt-4 border-t border-gray-100">
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="sm:w-48 px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 text-gray-900 text-sm"
                  >
                    <option value="">Сортировка</option>
                    <option value="price-asc">Цена: по возрастанию</option>
                    <option value="price-desc">Цена: по убыванию</option>
                    <option value="rating">По рейтингу</option>
                  </select>

                  <select
                    value={filterCity}
                    onChange={(e) => setFilterCity(e.target.value)}
                    className="sm:w-48 px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 text-gray-900 text-sm"
                  >
                    <option value="">Все города</option>
                    {[...new Set(suppliersData.map(s => s.city))].sort().map(city => (
                      <option key={city} value={city}>{city}</option>
                    ))}
                  </select>

                  {(sortBy || filterCity || catalogQuery || catalogCategory) && (
                    <button
                      onClick={() => {
                        setSortBy('');
                        setFilterCity('');
                        setCatalogQuery('');
                        setCatalogCategory('');
                      }}
                      className="px-4 py-2.5 text-sm text-gray-600 hover:text-orange-600 font-medium transition-colors flex items-center gap-2"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                      Сбросить фильтры
                    </button>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                {paginatedCatalog.map((supplier) => (
                  <SupplierCard 
                    key={supplier.id} 
                    supplier={{...supplier, finalScore: 0, matchReasons: []}} 
                    onClick={() => openModal(supplier)}
                  />
                ))}
              </div>
              
              {paginatedCatalog.length === 0 && (
                <div className="bg-white p-8 sm:p-12 rounded-2xl text-center shadow-xl">
                  <p className="text-lg sm:text-xl text-gray-800">В каталоге нет таких поставщиков</p>
                </div>
              )}

              <Pagination 
                currentPage={currentPage} 
                totalPages={catalogTotalPages} 
                goToPage={goToCatalogPage} 
              />
            </>
          )}
        </div>
      </main>

      {!isBuilderEmpty && <Footer />}

      <SupplierModal 
        supplier={selectedSupplier}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onAddToPlan={handleAddToPlan}
      />

      <OrderPlannerModal
        supplier={orderPlannerSupplier}
        volume={orderPlannerVolume}
        isOpen={isOrderPlannerOpen}
        onClose={() => setIsOrderPlannerOpen(false)}
        onSuccess={(msg) => showToast(msg, 'success')}
      />

      {toast && (
        <Toast 
          message={toast.message} 
          type={toast.type} 
          onClose={() => setToast(null)} 
        />
      )}

      <ScrollToTop />
    </div>
  );
}
