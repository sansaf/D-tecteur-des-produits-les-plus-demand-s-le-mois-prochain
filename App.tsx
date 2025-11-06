
import React, { useState, useCallback } from 'react';
import { generateTrendReport, generateDetailedAnalysis } from './services/geminiService';
import { ReportData, DetailedSectorAnalysis } from './types';
import SectorCard from './components/SectorCard';
import LoadingSpinner from './components/LoadingSpinner';
import DetailedAnalysisModal from './components/DetailedAnalysisModal';

const App: React.FC = () => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [reportData, setReportData] = useState<ReportData | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [isModalLoading, setIsModalLoading] = useState<boolean>(false);
  const [modalData, setModalData] = useState<DetailedSectorAnalysis | null>(null);
  const [modalError, setModalError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  
  const handleGenerateReport = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    setReportData(null);
    try {
      const data = await generateTrendReport();
      setReportData(data);
    } catch (err: any) {
      setError(err.message || "Une erreur inattendue est survenue.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleAnalyzeSector = useCallback(async (sectorName: string) => {
    setIsModalOpen(true);
    setIsModalLoading(true);
    setModalData(null);
    setModalError(null);
    try {
      const data = await generateDetailedAnalysis(sectorName);
      setModalData(data);
    } catch (err: any) {
      setModalError(err.message || "Erreur lors de la génération de l'analyse détaillée.");
    } finally {
      setIsModalLoading(false);
    }
  }, []);

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setModalData(null);
    setModalError(null);
  };

  const getNextMonthName = () => {
    const monthNames = ["Janvier", "Février", "Mars", "Avril", "Mai", "Juin", "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre"];
    const now = new Date();
    const nextMonthDate = new Date(now.getFullYear(), now.getMonth() + 1, 1);
    return `${monthNames[nextMonthDate.getMonth()]} ${nextMonthDate.getFullYear()}`;
  };

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 p-4 sm:p-6 lg:p-8 relative overflow-hidden">
        <div className="absolute inset-0 bg-grid-gray-700/[0.2] [mask-image:linear-gradient(to_bottom,white_5%,transparent_90%)]"></div>
        <div className="absolute top-0 left-0 w-96 h-96 bg-cyan-500/10 rounded-full filter blur-3xl animate-pulse"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-blue-500/10 rounded-full filter blur-3xl animate-pulse delay-1000"></div>

        <main className="container mx-auto max-w-7xl relative z-10">
            <header className="text-center my-8 md:my-12">
                <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-blue-500 mb-2">
                    Analyseur de Tendances Mondiales
                </h1>
                <p className="text-lg md:text-xl text-gray-400 max-w-3xl mx-auto">
                    Découvrez les produits les plus demandés pour {getNextMonthName()} grâce à une analyse prédictive par IA.
                </p>
            </header>

            {!reportData && !isLoading && (
              <div className="text-center mt-12">
                  <button
                      onClick={handleGenerateReport}
                      disabled={isLoading}
                      className="bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold py-4 px-8 rounded-full shadow-lg hover:shadow-cyan-500/50 transform hover:scale-105 transition-all duration-300 ease-in-out text-lg focus:outline-none focus:ring-4 focus:ring-cyan-500/50"
                  >
                      {isLoading ? 'Analyse en cours...' : 'Générer le rapport de tendances'}
                  </button>
              </div>
            )}
            
            {isLoading && (
                <div className="flex justify-center items-center mt-16">
                    <LoadingSpinner />
                </div>
            )}

            {error && (
                <div className="text-center mt-16 bg-red-900/50 border border-red-700 text-red-300 px-4 py-3 rounded-lg max-w-2xl mx-auto">
                    <p className="font-bold">Erreur</p>
                    <p>{error}</p>
                </div>
            )}

            {reportData && (
                <div className="space-y-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {reportData.sectors.map((sector) => (
                            <SectorCard key={sector.sectorName} sector={sector} onAnalyze={handleAnalyzeSector} />
                        ))}
                    </div>
                    
                    <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-2xl p-6 shadow-lg">
                        <h3 className="text-2xl font-bold text-blue-400 mb-4">Analyse Globale du Marché</h3>
                        <p className="text-gray-300 leading-relaxed whitespace-pre-wrap">{reportData.globalAnalysis}</p>
                    </div>
                    
                    <div className="text-center pt-8">
                      <button
                          onClick={handleGenerateReport}
                          disabled={isLoading}
                          className="bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold py-3 px-6 rounded-full shadow-lg hover:shadow-cyan-500/50 transform hover:scale-105 transition-all duration-300 ease-in-out text-base focus:outline-none focus:ring-4 focus:ring-cyan-500/50"
                      >
                          {isLoading ? 'Analyse en cours...' : 'Régénérer le rapport'}
                      </button>
                    </div>
                </div>
            )}
        </main>
        {isModalOpen && (
            <DetailedAnalysisModal 
            isLoading={isModalLoading}
            analysisData={modalData}
            error={modalError}
            onClose={handleCloseModal}
            />
        )}
    </div>
  );
};

export default App;
