import React, { useState, useMemo } from 'react';
import { Sector } from '../types';
import { ProductIcon, TrendIcon, GlobeIcon, LightbulbIcon, LockClosedIcon, ArrowUpIcon, ArrowDownIcon, DollarIcon, SearchIcon, SupplierIcon } from './IconComponents';
import { useI18n } from '../hooks/useI18n';

interface SectorCardProps {
  sector: Sector;
  onAnalyze: (sectorName: string) => void;
  isPremiumFeature: boolean;
  isPremiumUser: boolean;
}

const SectorCard: React.FC<SectorCardProps> = ({ sector, onAnalyze, isPremiumFeature, isPremiumUser }) => {
  const { t } = useI18n();
  const isLocked = isPremiumFeature && !isPremiumUser;
  
  type SortKey = 'demandRate' | 'profitabilityScore';
  const [sortKey, setSortKey] = useState<SortKey | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [searchQuery, setSearchQuery] = useState('');

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      if (sortDirection === 'desc') {
        setSortDirection('asc');
      } else {
        setSortKey(null); // Reset to default
      }
    } else {
      setSortKey(key);
      setSortDirection('desc');
    }
  };

  const filteredAndSortedProducts = useMemo(() => {
    const lowercasedQuery = searchQuery.toLowerCase();
    
    let filtered = sector.products.filter(product =>
      product.name.toLowerCase().includes(lowercasedQuery) || 
      product.suppliers.some(supplier => supplier.toLowerCase().includes(lowercasedQuery))
    );

    if (sortKey === null) {
      return filtered;
    }

    return [...filtered].sort((a, b) => {
      const valA = a[sortKey];
      const valB = b[sortKey];

      if (valA < valB) return sortDirection === 'asc' ? -1 : 1;
      if (valA > valB) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
  }, [sector.products, searchQuery, sortKey, sortDirection]);


  return (
    <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-2xl p-6 shadow-lg transform hover:scale-[1.02] transition-transform duration-300 flex flex-col h-full">
      <div className="flex justify-between items-start mb-4 gap-2">
        <h3 className="text-2xl font-bold text-cyan-400">{sector.sectorName}</h3>
        <div className="flex items-center gap-2 flex-shrink-0">
            <button
              onClick={() => handleSort('demandRate')}
              title={t('sectorCard.sort.demand')}
              aria-sort={sortKey === 'demandRate' ? (sortDirection === 'asc' ? 'ascending' : 'descending') : 'none'}
              className={`flex-shrink-0 flex items-center gap-2 text-xs font-semibold px-3 py-1.5 rounded-md transition-colors ${
                sortKey === 'demandRate' ? 'bg-cyan-500 text-white' : 'bg-gray-700/50 text-gray-300 hover:bg-gray-700 hover:text-white'
              }`}
            >
              <TrendIcon className="w-4 h-4" />
              {sortKey === 'demandRate' && (sortDirection === 'asc' ? <ArrowUpIcon className="w-4 h-4"/> : <ArrowDownIcon className="w-4 h-4"/>)}
            </button>
            <button
              onClick={() => handleSort('profitabilityScore')}
              title={t('sectorCard.sort.profitability')}
              aria-sort={sortKey === 'profitabilityScore' ? (sortDirection === 'asc' ? 'ascending' : 'descending') : 'none'}
              className={`flex-shrink-0 flex items-center gap-2 text-xs font-semibold px-3 py-1.5 rounded-md transition-colors ${
                sortKey === 'profitabilityScore' ? 'bg-amber-500 text-white' : 'bg-gray-700/50 text-gray-300 hover:bg-gray-700 hover:text-white'
              }`}
            >
              <DollarIcon className="w-4 h-4" />
              {sortKey === 'profitabilityScore' && (sortDirection === 'asc' ? <ArrowUpIcon className="w-4 h-4"/> : <ArrowDownIcon className="w-4 h-4"/>)}
            </button>
        </div>
      </div>
       <div className="mb-4">
            <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                    <SearchIcon className="w-5 h-5 text-gray-500" />
                </span>
                <input
                    type="text"
                    placeholder={t('sectorCard.searchPlaceholder')}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-gray-900/70 border border-gray-600 rounded-md pl-10 pr-4 py-2 text-white placeholder-gray-500 focus:ring-cyan-500 focus:border-cyan-500 text-sm"
                />
            </div>
        </div>
      <div className="space-y-6 flex-grow">
        {filteredAndSortedProducts.length > 0 ? (
          filteredAndSortedProducts.map((product, index) => (
            <div key={index} className="border-l-4 border-cyan-500 pl-4 py-2 bg-gray-900/40 rounded-r-lg">
              <div className="flex justify-between items-start mb-3">
                <h4 className="text-lg font-semibold text-white flex items-center gap-2"><ProductIcon className="w-5 h-5 text-cyan-400"/> {product.name}</h4>
                <div className="flex items-center gap-2">
                  <div title={`${t('common.profitabilityScore')}: ${product.profitabilityScore}/10`} className="flex items-center gap-1 text-base font-bold text-amber-400 bg-amber-900/50 px-3 py-1 rounded-full text-xs sm:text-base">
                      <DollarIcon className="w-4 h-4" />
                      <span>{product.profitabilityScore}/10</span>
                  </div>
                  <div title={`${t('csv.report.demandRate')}: ${product.demandRate}%`} className="flex items-center gap-1 text-base font-bold text-green-400 bg-green-900/50 px-3 py-1 rounded-full text-xs sm:text-base">
                      <TrendIcon className="w-4 h-4 sm:w-5 sm:h-5" />
                      <span>{product.demandRate}%</span>
                  </div>
                </div>
              </div>
              <div className="text-gray-300 space-y-2 text-sm">
                <p className="flex items-start gap-2">
                  <GlobeIcon className="w-5 h-5 text-cyan-400 flex-shrink-0 mt-0.5" />
                  <strong>{t('sectorCard.regions')}:</strong> {product.regions}
                </p>
                <p className="flex items-start gap-2">
                  <LightbulbIcon className="w-5 h-5 text-cyan-400 flex-shrink-0 mt-0.5" />
                  <strong>{t('sectorCard.reasons')}:</strong> {product.reasons}
                </p>
                <p className="flex items-start gap-2">
                  <SupplierIcon className="w-5 h-5 text-cyan-400 flex-shrink-0 mt-0.5" />
                  <strong>{t('sectorCard.suppliersLabel')}:</strong> {product.suppliers.join(', ')}
                </p>
              </div>
            </div>
          ))
        ) : (
            <div className="text-center text-gray-500 py-10">
                <p>{t('sectorCard.noProductsFound')}</p>
            </div>
        )}
      </div>
       <div className="mt-6 text-right">
        <button
          onClick={() => onAnalyze(sector.sectorName)}
          className={`inline-flex items-center gap-2 bg-cyan-600/50 text-cyan-200 font-semibold py-2 px-5 rounded-lg hover:bg-cyan-600/80 hover:text-white transition-all duration-300 ease-in-out text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500/70 ${isLocked ? 'cursor-pointer' : ''}`}
        >
          {isLocked && <LockClosedIcon className="w-4 h-4" />}
          {t('sectorCard.analyzeButton')}
        </button>
      </div>
    </div>
  );
};

export default SectorCard;