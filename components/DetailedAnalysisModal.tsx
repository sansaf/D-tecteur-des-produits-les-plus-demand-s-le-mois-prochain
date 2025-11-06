
import React from 'react';
import { DetailedSectorAnalysis } from '../types';
import { LightbulbIcon, ProductIcon, SupplierIcon } from './IconComponents';

interface DetailedAnalysisModalProps {
  analysisData: DetailedSectorAnalysis | null;
  isLoading: boolean;
  error: string | null;
  onClose: () => void;
}

const ModalLoadingSpinner: React.FC = () => (
    <div className="flex flex-col items-center justify-center space-y-4 p-8">
      <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-cyan-400"></div>
      <p className="text-lg text-cyan-200 font-semibold">Génération de l'analyse détaillée...</p>
    </div>
);

const ModalError: React.FC<{ message: string; onClose: () => void }> = ({ message, onClose }) => (
    <div className="p-8 text-center">
        <h2 id="modal-title" className="text-2xl font-bold text-red-400 mb-4">Erreur d'analyse</h2>
        <p className="text-red-300 mb-6">{message}</p>
        <button
            onClick={onClose}
            className="bg-red-600/50 text-red-200 font-semibold py-2 px-5 rounded-lg hover:bg-red-600/80 hover:text-white transition-colors duration-300"
        >
            Fermer
        </button>
    </div>
);

const DetailedAnalysisModal: React.FC<DetailedAnalysisModalProps> = ({ analysisData, isLoading, error, onClose }) => {
  return (
    <div 
      className="fixed inset-0 bg-black/70 backdrop-blur-sm flex justify-center items-center z-50 p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <div 
        className="bg-gray-800/80 border border-gray-700 rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto transform scale-95 animate-modal-enter"
        onClick={e => e.stopPropagation()}
      >
        {isLoading ? (
          <ModalLoadingSpinner />
        ) : error ? (
            <ModalError message={error} onClose={onClose} />
        ) : analysisData ? (
          <div className="p-6 sm:p-8">
            <div className="flex justify-between items-start mb-6">
              <div>
                <p className="text-sm text-cyan-400 uppercase tracking-wider">Analyse Détaillée</p>
                <h2 id="modal-title" className="text-3xl font-bold text-white">{analysisData.sectorName}</h2>
              </div>
              <button 
                onClick={onClose} 
                className="text-gray-400 hover:text-white transition-colors p-1 rounded-full bg-gray-700/50 hover:bg-gray-600/50"
                aria-label="Fermer la fenêtre modale"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="mb-8 p-4 bg-gray-900/50 rounded-lg border-l-4 border-cyan-500">
              <h3 className="text-xl font-semibold text-cyan-300 mb-2">Analyse du Marché</h3>
              <p className="text-gray-300 leading-relaxed">{analysisData.inDepthAnalysis}</p>
            </div>
            
            <div>
              <h3 className="text-xl font-semibold text-cyan-300 mb-4">Suggestions de Produits</h3>
              <div className="space-y-6">
                {analysisData.productSuggestions.map((product, index) => (
                  <div key={index} className="bg-gray-700/40 p-4 rounded-lg">
                    <div className="flex justify-between items-center mb-2">
                       <h4 className="text-lg font-bold text-white flex items-center gap-2">
                         <ProductIcon className="w-5 h-5 text-cyan-400"/>
                         {product.name}
                       </h4>
                       <span className="text-sm font-semibold text-green-300 bg-green-900/50 px-3 py-1 rounded-full">{product.priceRange}</span>
                    </div>
                    <div className="pl-7 mt-3 space-y-4">
                        <div>
                            <p className="text-sm text-gray-400"><strong className="font-medium text-gray-200">Public Cible :</strong> {product.targetAudience}</p>
                        </div>
                        <div>
                            <p className="text-sm font-medium text-gray-200 mb-1 flex items-center gap-2">
                                <LightbulbIcon className="w-4 h-4 text-cyan-400"/>
                                Arguments de Vente Clés :
                            </p>
                            <ul className="list-disc list-inside text-sm text-gray-300 space-y-1 pl-2">
                                {product.sellingPoints.map((point, i) => <li key={i}>{point}</li>)}
                            </ul>
                        </div>
                         <div>
                            <p className="text-sm font-medium text-gray-200 mb-1 flex items-center gap-2">
                                <SupplierIcon className="w-4 h-4 text-cyan-400"/>
                                Fournisseurs Potentiels :
                            </p>
                            <ul className="list-disc list-inside text-sm text-gray-300 space-y-1 pl-2">
                                {product.suppliers.map((supplier, i) => <li key={i}>{supplier}</li>)}
                            </ul>
                        </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : null}
      </div>
       <style>{`
          @keyframes modal-enter {
            from { opacity: 0; transform: scale(0.95) translateY(20px); }
            to { opacity: 1; transform: scale(1) translateY(0); }
          }
          .animate-modal-enter {
            animation: modal-enter 0.3s ease-out forwards;
          }
        `}</style>
    </div>
  );
};

export default DetailedAnalysisModal;
