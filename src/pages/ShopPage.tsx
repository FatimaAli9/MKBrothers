import { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Filter, Grid, List, SlidersHorizontal, X } from 'lucide-react';
import { useStore, CATEGORIES } from '../store/useStore';
import ProductCard from '../components/ProductCard';

export default function ShopPage() {
  const { products } = useStore();
  const [searchParams, setSearchParams] = useSearchParams();
  const [view, setView] = useState<'grid' | 'list'>('grid');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const [filters, setFilters] = useState({
    category: searchParams.get('category') || '',
    minPrice: 0,
    maxPrice: 10000,
    sort: searchParams.get('sort') || 'default',
    inStock: false,
    isNew: searchParams.get('sort') === 'new',
    isBestseller: searchParams.get('sort') === 'popular',
    search: searchParams.get('search') || '',
  });

  useEffect(() => {
    setFilters(f => ({
      ...f,
      category: searchParams.get('category') || '',
      sort: searchParams.get('sort') || 'default',
      isNew: searchParams.get('sort') === 'new',
      isBestseller: searchParams.get('sort') === 'popular',
      search: searchParams.get('search') || '',
    }));
  }, [searchParams]);

  const filtered = useMemo(() => {
    let result = [...products];
    if (filters.category) result = result.filter(p => p.category === filters.category);
    if (filters.inStock) result = result.filter(p => p.inStock);
    if (filters.isNew) result = result.filter(p => p.isNew);
    if (filters.isBestseller) result = result.filter(p => p.isBestseller);
    if (filters.search) {
      const q = filters.search.toLowerCase();
      result = result.filter(p => p.name.toLowerCase().includes(q) || p.description.toLowerCase().includes(q));
    }
    result = result.filter(p => p.price >= filters.minPrice && p.price <= filters.maxPrice);
    if (filters.sort === 'price-asc') result.sort((a, b) => a.price - b.price);
    else if (filters.sort === 'price-desc') result.sort((a, b) => b.price - a.price);
    else if (filters.sort === 'rating') result.sort((a, b) => b.rating - a.rating);
    return result;
  }, [products, filters]);

  const resetFilters = () => {
    setFilters({ category: '', minPrice: 0, maxPrice: 10000, sort: 'default', inStock: false, isNew: false, isBestseller: false, search: '' });
    setSearchParams({});
  };

  const setCategory = (cat: string) => {
    setFilters(f => ({ ...f, category: cat === f.category ? '' : cat }));
  };

  const FilterPanel = () => (
    <div className="space-y-6">
      {/* Search */}
      <div className="filter-section">
        <h3 className="text-white font-semibold text-sm uppercase tracking-wider mb-3">Search</h3>
        <input
          type="text"
          value={filters.search}
          onChange={e => setFilters(f => ({ ...f, search: e.target.value }))}
          placeholder="Search fragrances..."
          className="luxury-input w-full px-3 py-2 rounded-lg text-sm"
        />
      </div>

      {/* Categories */}
      <div className="filter-section">
        <h3 className="text-white font-semibold text-sm uppercase tracking-wider mb-3">Category</h3>
        <div className="space-y-2">
          <button
            onClick={() => setCategory('')}
            className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${!filters.category ? 'text-gold bg-gold/10 border border-gold/30' : 'text-gray-400 hover:text-gold hover:bg-gold/5'}`}
          >
            All Products
          </button>
          {CATEGORIES.map(cat => (
            <button
              key={cat.id}
              onClick={() => setCategory(cat.id)}
              className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors flex items-center gap-2 ${filters.category === cat.id ? 'text-gold bg-gold/10 border border-gold/30' : 'text-gray-400 hover:text-gold hover:bg-gold/5'}`}
            >
              <span>{cat.icon}</span> {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Price Range */}
      <div className="filter-section">
        <h3 className="text-white font-semibold text-sm uppercase tracking-wider mb-3">Price Range</h3>
        <div className="space-y-3">
          <input
            type="range"
            min={0}
            max={10000}
            step={500}
            value={filters.maxPrice}
            onChange={e => setFilters(f => ({ ...f, maxPrice: parseInt(e.target.value) }))}
          />
          <div className="flex justify-between text-xs text-gray-400">
            <span>Rs. 0</span>
            <span className="text-gold font-semibold">Up to Rs. {filters.maxPrice.toLocaleString()}</span>
          </div>
        </div>
      </div>

      {/* Other Filters */}
      <div className="filter-section">
        <h3 className="text-white font-semibold text-sm uppercase tracking-wider mb-3">Filter By</h3>
        <div className="space-y-2.5">
          {[
            { key: 'inStock', label: 'In Stock Only' },
            { key: 'isNew', label: 'New Arrivals' },
            { key: 'isBestseller', label: 'Bestsellers Only' },
          ].map(item => (
            <label key={item.key} className="flex items-center gap-2.5 cursor-pointer group">
              <input
                type="checkbox"
                checked={filters[item.key as keyof typeof filters] as boolean}
                onChange={e => setFilters(f => ({ ...f, [item.key]: e.target.checked }))}
                className="w-4 h-4 rounded"
              />
              <span className="text-sm text-gray-400 group-hover:text-gold transition-colors">{item.label}</span>
            </label>
          ))}
        </div>
      </div>

      <button
        onClick={resetFilters}
        className="btn-outline-gold w-full py-2.5 rounded-lg text-sm flex items-center justify-center gap-2"
      >
        <X size={14} /> Reset Filters
      </button>
    </div>
  );

  return (
    <div className="pt-[104px] max-w-7xl mx-auto px-4 py-10">
      {/* Header */}
      <div className="mb-8">
        <p className="text-gold text-xs tracking-[0.3em] uppercase mb-1">Our Collection</p>
        <h1 className="font-display text-4xl font-bold text-white">
          {filters.category ? CATEGORIES.find(c => c.id === filters.category)?.label + ' Fragrances' : 'All Fragrances'}
        </h1>
        {filters.search && <p className="text-gray-400 mt-1 text-sm">Search results for: "<span className="text-gold">{filters.search}</span>"</p>}
      </div>

      <div className="flex gap-8">
        {/* Sidebar – Desktop */}
        <aside className="hidden lg:block w-64 flex-shrink-0">
          <div className="luxury-card rounded-2xl p-5 sticky top-28">
            <div className="flex items-center gap-2 mb-4">
              <SlidersHorizontal size={16} className="text-gold" />
              <h2 className="font-display font-semibold text-white">Filters</h2>
            </div>
            <FilterPanel />
          </div>
        </aside>

        {/* Main Content */}
        <div className="flex-1 min-w-0">
          {/* Toolbar */}
          <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
            <span className="text-gray-400 text-sm">
              Showing <span className="text-white font-semibold">{filtered.length}</span> products
            </span>
            <div className="flex items-center gap-3">
              {/* Mobile filter btn */}
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden btn-outline-gold px-4 py-2 rounded-lg text-xs flex items-center gap-1.5"
              >
                <Filter size={14} /> Filters
              </button>

              {/* Sort */}
              <div className="relative">
                <select
                  value={filters.sort}
                  onChange={e => setFilters(f => ({ ...f, sort: e.target.value }))}
                  className="luxury-select px-4 py-2 rounded-lg text-xs pr-8 appearance-none cursor-pointer"
                >
                  <option value="default">Sort: Default</option>
                  <option value="price-asc">Price: Low to High</option>
                  <option value="price-desc">Price: High to Low</option>
                  <option value="rating">Top Rated</option>
                </select>
              </div>

              {/* View Toggle */}
              <div className="flex items-center gap-1 border border-gold/20 rounded-lg p-1">
                <button
                  onClick={() => setView('grid')}
                  className={`p-1.5 rounded ${view === 'grid' ? 'bg-gold/20 text-gold' : 'text-gray-500 hover:text-gold'} transition-colors`}
                >
                  <Grid size={14} />
                </button>
                <button
                  onClick={() => setView('list')}
                  className={`p-1.5 rounded ${view === 'list' ? 'bg-gold/20 text-gold' : 'text-gray-500 hover:text-gold'} transition-colors`}
                >
                  <List size={14} />
                </button>
              </div>
            </div>
          </div>

          {/* Products */}
          {filtered.length === 0 ? (
            <div className="text-center py-20">
              <div className="text-6xl mb-4">🔍</div>
              <h3 className="font-display text-2xl font-bold text-white mb-2">No fragrances found</h3>
              <p className="text-gray-500 text-sm mb-6">Try adjusting your filters or search query</p>
              <button onClick={resetFilters} className="btn-gold px-6 py-2.5 rounded-full text-sm">Clear Filters</button>
            </div>
          ) : (
            <div className={view === 'grid'
              ? 'grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6'
              : 'flex flex-col gap-4'
            }>
              {filtered.map(product => (
                <ProductCard key={product.id} product={product} view={view} />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setSidebarOpen(false)} />
          <div className="absolute left-0 top-0 bottom-0 w-80 bg-[#111] p-5 overflow-y-auto">
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-display font-semibold text-white flex items-center gap-2">
                <SlidersHorizontal size={16} className="text-gold" /> Filters
              </h2>
              <button onClick={() => setSidebarOpen(false)} className="text-gray-400 hover:text-gold">
                <X size={20} />
              </button>
            </div>
            <FilterPanel />
          </div>
        </div>
      )}
    </div>
  );
}
