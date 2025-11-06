import React from 'react';
import { DetailedSectorAnalysis } from '../types';
import LoadingSpinner from './LoadingSpinner';
import { XIcon, DownloadIcon, ProductIcon, ChartBarIcon, LightbulbIcon } from './IconComponents';
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
                  {analysisData.productSuggestions.map((product, index) => (
                    <div key={index} className="bg-gray-900/50 p-6 rounded-lg border border-gray-700 space-y-4 flex flex-col">
                        <div className="flex-grow space-y-4">
                            <h4 className="text-xl font-bold text-white flex items-center gap-2"><ProductIcon className="w-5 h-5 text-cyan-400"/> {product.name}</h4>
                            <p><strong className="text-cyan-400">{t('common.targetAudience')}:</strong> {product.targetAudience}</p>
                            <div>
                                <strong className="text-cyan-400">{t('common.sellingPoints')}:</strong>
                                <ul className="list-disc list-inside ml-4 mt-1 text-gray-300">
                                {product.sellingPoints.map((point, i) => <li key={i}>{point}</li>)}
                                </ul>
                            </div>
                            <p><strong className="text-cyan-400">{t('common.priceRange')}:</strong> {product.priceRange}</p>
                            <p><strong className="text-cyan-400">{t('common.suppliers')}:</strong> {product.suppliers.join(', ')}</p>
                        </div>
                        <div className="mt-4 text-right">
                            <button
                                onClick={() => onAnalyzeProduct(product.name)}
                                className="bg-cyan-600/50 text-cyan-200 text-xs font-semibold py-2 px-4 rounded-lg hover:bg-cyan-600/80 hover:text-white transition-all"
                            >
                                {t('detailedAnalysis.analyzeProductButton')}
                            </button>
                        </div>
                    </div>
                  ))}
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