import React from 'react';
import { Sector } from '../types';
import { ProductIcon, TrendIcon, GlobeIcon, LightbulbIcon, LockClosedIcon } from './IconComponents';
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
  return (
    <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-2xl p-6 shadow-lg transform hover:scale-[1.02] transition-transform duration-300 flex flex-col h-full">
      <h3 className="text-2xl font-bold text-cyan-400 mb-6">{sector.sectorName}</h3>
      <div className="space-y-6 flex-grow">
        {sector.products.map((product, index) => (
          <div key={index} className="border-l-4 border-cyan-500 pl-4 py-2 bg-gray-900/40 rounded-r-lg">
            <div className="flex justify-between items-start mb-3">
              <h4 className="text-lg font-semibold text-white flex items-center gap-2"><ProductIcon className="w-5 h-5 text-cyan-400"/> {product.name}</h4>
              <div className="flex items-center gap-2 text-lg font-bold text-green-400 bg-green-900/50 px-3 py-1 rounded-full">
                <TrendIcon className="w-5 h-5" />
                <span>{product.demandRate}%</span>
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
            </div>
          </div>
        ))}
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