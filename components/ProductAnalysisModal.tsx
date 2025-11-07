import React from 'react';
import { ProductAnalysis } from '../types';
import LoadingSpinner from './LoadingSpinner';
import { XIcon, DownloadIcon, ChartBarIcon, GlobeIcon, TargetIcon, LightbulbIcon, DollarIcon, SupplierIcon, ShieldExclamationIcon, ShareIcon } from './IconComponents';
import { exportProductAnalysisToCsv } from '../utils/csvExporter';
import { useI18n } from '../hooks/useI18n';

interface ProductAnalysisModalProps {
  isLoading: boolean;
  analysisData: ProductAnalysis | null;
  onClose: () => void;
  onShare: (shareData: {title: string, text: string}) => void;
}

const ProductAnalysisModal: React.FC<ProductAnalysisModalProps> = ({ isLoading, analysisData, onClose, onShare }) => {
  const { t } = useI18n();
  if (!analysisData && !isLoading) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-80 backdrop-blur-md flex justify-center items-center z-50 p-4">
      <div className="bg-gray-800 border border-gray-700 rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col">
        <div className="flex justify-between items-center p-6 border-b border-gray-700">
          <h2 className="text-3xl font-bold text-amber-400">{t('productAnalysis.title')}: <span className="text-white">{analysisData?.productName}</span></h2>
           <div className="flex items-center gap-4">
            {analysisData && (
              <>
                <button
                    onClick={() => onShare({
                        title: t('share.product.title'),
                        text: t('share.product.text', { productName: analysisData.productName })
                    })}
                    className="text-gray-400 hover:text-white transition-colors"
                    title={t('common.share')}
                >
                    <ShareIcon className="w-6 h-6" />
                </button>
                <button
                  onClick={() => exportProductAnalysisToCsv(analysisData, t)}
                  className="text-gray-400 hover:text-white transition-colors"
                  title={t('common.exportCsv')}
                >
                  <DownloadIcon className="w-6 h-6" />
                </button>
              </>
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
            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-semibold text-amber-300 mb-3 flex items-center gap-3"><ChartBarIcon className="w-6 h-6" />{t('productAnalysis.marketAnalysis')}</h3>
                <p className="text-gray-300 leading-relaxed whitespace-pre-wrap">{analysisData.marketAnalysis}</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                <div>
                  <h4 className="text-lg font-semibold text-amber-300 mb-2 flex items-center gap-2"><GlobeIcon className="w-5 h-5"/>{t('common.keyRegions')}</h4>
                  <ul className="list-disc list-inside text-gray-300 pl-2">
                    {analysisData.keyRegions.map((region, i) => <li key={i}>{region}</li>)}
                  </ul>
                </div>
                <div>
                  <h4 className="text-lg font-semibold text-amber-300 mb-2 flex items-center gap-2"><TargetIcon className="w-5 h-5"/>{t('common.targetAudience')}</h4>
                  <p className="text-gray-300">{analysisData.targetAudience}</p>
                </div>
                 <div>
                  <h4 className="text-lg font-semibold text-amber-300 mb-2 flex items-center gap-2"><LightbulbIcon className="w-5 h-5"/>{t('common.sellingPoints')}</h4>
                  <ul className="list-disc list-inside text-gray-300 pl-2">
                    {analysisData.sellingPoints.map((point, i) => <li key={i}>{point}</li>)}
                  </ul>
                </div>
                <div>
                  <h4 className="text-lg font-semibold text-amber-300 mb-2 flex items-center gap-2"><DollarIcon className="w-5 h-5"/>{t('common.priceRange')}</h4>
                  <p className="text-gray-300">{analysisData.priceRange}</p>
                </div>
                 <div>
                  <h4 className="text-lg font-semibold text-amber-300 mb-2 flex items-center gap-2"><SupplierIcon className="w-5 h-5"/>{t('common.potentialSuppliers')}</h4>
                  <ul className="list-disc list-inside text-gray-300 pl-2">
                    {analysisData.suppliers.map((supplier, i) => <li key={i}>{supplier}</li>)}
                  </ul>
                </div>
                <div>
                  <h4 className="text-lg font-semibold text-amber-300 mb-2 flex items-center gap-2"><ShieldExclamationIcon className="w-5 h-5"/>{t('common.risks')}</h4>
                  <ul className="list-disc list-inside text-gray-300 pl-2">
                    {analysisData.risks.map((risk, i) => <li key={i}>{risk}</li>)}
                  </ul>
                </div>
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
};

export default ProductAnalysisModal;