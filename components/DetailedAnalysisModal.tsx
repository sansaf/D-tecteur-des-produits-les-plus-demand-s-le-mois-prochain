import React from 'react';
import { DetailedSectorAnalysis } from '../types';
import LoadingSpinner from './LoadingSpinner';
import { XIcon, DownloadIcon, ProductIcon, ChartBarIcon, LightbulbIcon, DollarIcon, ShieldCheckIcon } from './IconComponents';
import { exportDetailedAnalysisToCsv } from '../utils/csvExporter';
import { useI18n } from '../hooks/useI18n';

interface DetailedAnalysisModalProps {
  isLoading: boolean;
  analysisData: DetailedSectorAnalysis | null;
  onClose: () => void;
  onAnalyzeProduct: (productName: string) => void;
}

const DetailedAnalysisModal: React.FC<DetailedAnalysisModalProps> = ({ isLoading, analysisData, onClose, onAnalyzeProduct }) => {
  const { t } = useI18n();
  if (!analysisData && !isLoading) return null;

  const getDifficultyColor = (difficulty: string) => {
    if (!difficulty) return 'text-gray-300';
    const lowerDifficulty = difficulty.toLowerCase();
    switch (lowerDifficulty) {
        case 'low':
        case 'faible':
            return 'font-semibold text-green-400';
        case 'medium':
        case 'moyenne':
        case 'moyen':
            return 'font-semibold text-amber-400';
        case 'high':
        case 'élevée':
        case 'élevé':
            return 'font-semibold text-red-400';
        default:
            return 'text-gray-300';
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 backdrop-blur-sm flex justify-center items-center z-50 p-4">
      <div className="bg-gray-800 border border-gray-700 rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col">
        <div className="flex justify-between items-center p-6 border-b border-gray-700">
          <h2 className="text-3xl font-bold text-cyan-400">{t('detailedAnalysis.title')}: <span className="text-white">{analysisData?.sectorName}</span></h2>
          <div className="flex items-center gap-4">
            {analysisData && (
              <button
                onClick={() => exportDetailedAnalysisToCsv(analysisData, t)}
                className="text-gray-400 hover:text-white transition-colors"
                title={t('common.exportCsv')}
              >
                <DownloadIcon className="w-6 h-6" />
              </button>
            )}
            <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
              <XIcon className="w-8 h-8" />
            </button>
          </div>
        </div>
        <div className="p-8 overflow-y-auto">
          {isLoading ? (
            <div className="min-h-[50vh] flex items-center justify-center">
                <LoadingSpinner />
            </div>
          ) : analysisData ? (
            <div className="space-y-8">
              <div>
                <h3 className="text-2xl font-semibold text-cyan-300 mb-4 flex items-center gap-3"><ChartBarIcon className="w-7 h-7" /> {t('detailedAnalysis.inDepthTitle')}</h3>
                <p className="text-gray-300 leading-relaxed whitespace-pre-wrap">{analysisData.inDepthAnalysis}</p>
              </div>
              <div>
                <h3 className="text-2xl font-semibold text-cyan-300 mb-6 flex items-center gap-3"><LightbulbIcon className="w-7 h-7" /> {t('detailedAnalysis.suggestionsTitle')}</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {analysisData.productSuggestions.map((product, index) => {
                    // FIX: Correctly handle translation with fallback for market entry difficulty.
                    const difficultyKey = `common.difficulty.${product.marketEntryDifficulty?.toLowerCase()}`;
                    const translatedDifficulty = t(difficultyKey);
                    const difficultyText =
                      translatedDifficulty === difficultyKey
                        ? product.marketEntryDifficulty
                        : translatedDifficulty;

                    return (
                      <div key={index} className="bg-gray-900/50 rounded-lg border border-gray-700 overflow-hidden flex flex-col">
                        <div className="bg-gray-700/50 h-40 flex items-center justify-center">
                          <ProductIcon className="w-16 h-16 text-gray-500" />
                        </div>

                        <div className="p-6 flex flex-col flex-grow">
                          <div className="flex-grow space-y-4">
                            <h4 className="text-xl font-bold text-white">{product.name}</h4>
                            <p className="text-gray-400 text-sm italic">{product.description}</p>
                            
                            <div className="pt-2 text-sm space-y-3">
                              <p><strong className="text-cyan-400 font-medium">{t('common.targetAudience')}:</strong> {product.targetAudience}</p>
                              <div>
                                  <strong className="text-cyan-400 font-medium">{t('common.sellingPoints')}:</strong>
                                  <ul className="list-disc list-inside ml-4 mt-1 text-gray-300">
                                  {product.sellingPoints.map((point, i) => <li key={i}>{point}</li>)}
                                  </ul>
                              </div>
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-2 gap-x-4">
                                  <p><strong className="text-cyan-400 font-medium">{t('common.priceRange')}:</strong> {product.priceRange}</p>
                                  <p><strong className="text-cyan-400 font-medium">{t('common.suppliers')}:</strong> {product.suppliers.join(', ')}</p>
                                  <p className="flex items-center gap-1.5"><DollarIcon className="w-4 h-4 text-green-400" /><strong className="font-medium text-gray-300">{t('common.profitabilityScore')}:</strong> <span className="font-bold">{product.profitabilityScore}/10</span></p>
                                  <p className="flex items-center gap-1.5"><ShieldCheckIcon className="w-4 h-4 text-blue-400" /><strong className="font-medium text-gray-300">{t('common.marketEntryDifficulty')}:</strong> <span className={getDifficultyColor(product.marketEntryDifficulty)}>{difficultyText}</span></p>
                              </div>
                            </div>
                          </div>
                          <div className="mt-6 text-right">
                              <button
                                  onClick={() => onAnalyzeProduct(product.name)}
                                  className="bg-cyan-600/50 text-cyan-200 text-xs font-semibold py-2 px-4 rounded-lg hover:bg-cyan-600/80 hover:text-white transition-all"
                              >
                                  {t('detailedAnalysis.analyzeProductButton')}
                              </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
};

export default DetailedAnalysisModal;
