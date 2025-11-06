import React, { useState, useCallback, useEffect, useRef } from 'react';
import PeriodSelector from './components/PeriodSelector';
import SectorCard from './components/SectorCard';
import LoadingSpinner from './components/LoadingSpinner';
import DetailedAnalysisModal from './components/DetailedAnalysisModal';
import ProductAnalysisModal from './components/ProductAnalysisModal';
import SubscriptionModal from './components/SubscriptionModal';
import { ReportData, DetailedSectorAnalysis, ProductAnalysis } from './types';
import { generateTrendReport, generateDetailedAnalysis, generateProductAnalysis } from './services/geminiService';
import { exportReportToCsv } from './utils/csvExporter';
import { DownloadIcon, GoogleIcon, BrainIcon, ChartPieIcon, DocumentReportIcon } from './components/IconComponents';
import { useI18n } from './hooks/useI18n';

interface User {
  name: string;
  picture: string;
  subscription: 'free' | 'premium';
}

function App() {
  const { t, lang, setLang } = useI18n();
  const mainAppRef = useRef<HTMLElement>(null);

  const [selectedPeriod, setSelectedPeriod] = useState<number>(3);
  const [reportData, setReportData] = useState<ReportData | null>(null);
  const [isLoadingReport, setIsLoadingReport] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  
  const [isSubscriptionModalOpen, setIsSubscriptionModalOpen] = useState(false);
  const [pendingAction, setPendingAction] = useState<{ type: 'analyze_sector', payload: string } | null>(null);

  const [detailedAnalysisModal, setDetailedAnalysisModal] = useState<{
    isOpen: boolean;
    data: DetailedSectorAnalysis | null;
    isLoading: boolean;
  }>({ isOpen: false, data: null, isLoading: false });

  const [productAnalysisModal, setProductAnalysisModal] = useState<{
    isOpen: boolean;
    data: ProductAnalysis | null;
    isLoading: boolean;
  }>({ isOpen: false, data: null, isLoading: false });

   useEffect(() => {
    const storedUser = localStorage.getItem('trend-analyzer-user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  useEffect(() => {
    if (user?.subscription === 'premium' && pendingAction?.type === 'analyze_sector') {
      handleAnalyzeSector(pendingAction.payload, true);
      setPendingAction(null);
    }
  }, [user, pendingAction]);


  const handleLogin = () => {
    const mockUser: User = {
      name: 'Demo User',
      picture: `https://api.dicebear.com/8.x/avataaars/svg?seed=demo-user`,
      subscription: 'free',
    };
    setUser(mockUser);
    localStorage.setItem('trend-analyzer-user', JSON.stringify(mockUser));
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('trend-analyzer-user');
  };
  
  const handleSubscribe = () => {
    if (user) {
        const updatedUser = { ...user, subscription: 'premium' as const };
        setUser(updatedUser);
        localStorage.setItem('trend-analyzer-user', JSON.stringify(updatedUser));
        setIsSubscriptionModalOpen(false);
    }
  };

  const handleGenerateReport = useCallback(async () => {
    setIsLoadingReport(true);
    setError(null);
    setReportData(null);
    try {
      const data = await generateTrendReport(selectedPeriod, user?.subscription ?? 'free', lang);
      setReportData(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred.');
    } finally {
      setIsLoadingReport(false);
    }
  }, [selectedPeriod, user, lang]);

  const handleAnalyzeSector = useCallback(async (sectorName: string, force: boolean = false) => {
    if (!force && user?.subscription !== 'premium') {
      setPendingAction({ type: 'analyze_sector', payload: sectorName });
      setIsSubscriptionModalOpen(true);
      return;
    }

    setDetailedAnalysisModal({ isOpen: true, data: null, isLoading: true });
    try {
      const data = await generateDetailedAnalysis(sectorName, selectedPeriod, lang);
      setDetailedAnalysisModal({ isOpen: true, data: data, isLoading: false });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred while analyzing the sector.');
      setDetailedAnalysisModal({ isOpen: false, data: null, isLoading: false });
    }
  }, [selectedPeriod, user, lang]);

  const handleAnalyzeProduct = useCallback(async (productName: string) => {
    setDetailedAnalysisModal({ isOpen: false, data: null, isLoading: false });
    setProductAnalysisModal({ isOpen: true, data: null, isLoading: true });

    try {
      const data = await generateProductAnalysis(productName, selectedPeriod, lang);
      setProductAnalysisModal({ isOpen: true, data: data, isLoading: false });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred while analyzing the product.');
      setProductAnalysisModal({ isOpen: false, data: null, isLoading: false });
    }
  }, [selectedPeriod, lang]);

  const handleScrollToApp = () => {
    mainAppRef.current?.scrollIntoView({ behavior: 'smooth' });
  };


  return (
    <div className="min-h-screen bg-gray-900 text-white font-sans">
      <div className="container mx-auto px-4 py-8">
        <header className="flex items-center justify-between mb-10 flex-wrap gap-4">
          <div className="text-left">
            <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-600">
              {t('header.title')}
            </h1>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center bg-gray-800 rounded-full">
                <button onClick={() => setLang('fr')} className={`px-3 py-1 text-sm font-semibold rounded-full ${lang === 'fr' ? 'bg-cyan-500 text-white' : 'text-gray-400'}`}>FR</button>
                <button onClick={() => setLang('en')} className={`px-3 py-1 text-sm font-semibold rounded-full ${lang === 'en' ? 'bg-cyan-500 text-white' : 'text-gray-400'}`}>EN</button>
            </div>
            {user ? (
              <div className="flex items-center gap-4">
                <div className="text-right">
                    <p className="font-semibold text-white">{user.name}</p>
                    <div className={`text-xs font-bold px-2 py-0.5 rounded-full inline-block ${user.subscription === 'premium' ? 'bg-amber-500/20 text-amber-300' : 'bg-gray-700 text-gray-300'}`}>
                        {user.subscription === 'premium' ? t('subscription.statusPremium') : t('subscription.statusFree')}
                    </div>
                    {user.subscription === 'free' && (
                         <button onClick={() => setIsSubscriptionModalOpen(true)} className="text-xs text-cyan-400 hover:underline">{t('subscription.upgrade')}</button>
                    )}
                </div>
                <img src={user.picture} alt={user.name} className="w-12 h-12 rounded-full border-2 border-cyan-400 object-cover" />
                <button
                  onClick={handleLogout}
                  className="px-4 py-2 bg-gray-700 text-gray-300 font-semibold rounded-lg hover:bg-gray-600 transition-colors"
                >
                  {t('login.logout')}
                </button>
              </div>
            ) : (
              <button
                onClick={handleLogin}
                className="inline-flex items-center gap-3 px-5 py-2.5 bg-white text-gray-800 font-semibold rounded-lg shadow-md hover:bg-gray-200 transition-colors"
              >
                <GoogleIcon className="w-5 h-5" />
                <span>{t('login.button')}</span>
              </button>
            )}
          </div>
        </header>

         {/* Hero Section */}
        <section className="text-center py-20 sm:py-32">
            <div 
                className="absolute top-0 left-0 w-full h-full bg-grid-gray-700/[0.2] [mask-image:radial-gradient(ellipse_50%_50%_at_50%_50%,#000_60%,transparent_100%)] z-0"
                style={{
                    backgroundSize: '40px 40px'
                }}>
            </div>
            <div className="relative z-10">
                <h2 className="text-5xl sm:text-7xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-400">
                    {t('home.title')}
                </h2>
                <p className="mt-6 max-w-3xl mx-auto text-lg sm:text-xl text-gray-300 leading-relaxed">
                    {t('home.subtitle')}
                </p>
                <button 
                    onClick={handleScrollToApp}
                    className="mt-10 px-8 py-4 bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold rounded-full shadow-lg hover:scale-105 transform transition-transform duration-300">
                    {t('home.cta')}
                </button>

                <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-12 max-w-5xl mx-auto">
                    <div className="flex flex-col items-center">
                        <div className="bg-gray-800/50 p-4 rounded-full border border-cyan-500/50">
                            <BrainIcon className="w-8 h-8 text-cyan-400" />
                        </div>
                        <h3 className="mt-4 text-xl font-bold">{t('home.feature1.title')}</h3>
                        <p className="mt-2 text-gray-400">{t('home.feature1.description')}</p>
                    </div>
                    <div className="flex flex-col items-center">
                        <div className="bg-gray-800/50 p-4 rounded-full border border-cyan-500/50">
                           <ChartPieIcon className="w-8 h-8 text-cyan-400" />
                        </div>
                        <h3 className="mt-4 text-xl font-bold">{t('home.feature2.title')}</h3>
                        <p className="mt-2 text-gray-400">{t('home.feature2.description')}</p>
                    </div>
                    <div className="flex flex-col items-center">
                        <div className="bg-gray-800/50 p-4 rounded-full border border-cyan-500/50">
                            <DocumentReportIcon className="w-8 h-8 text-cyan-400" />
                        </div>
                        <h3 className="mt-4 text-xl font-bold">{t('home.feature3.title')}</h3>
                        <p className="mt-2 text-gray-400">{t('home.feature3.description')}</p>
                    </div>
                </div>
            </div>
        </section>


        <main id="main-app" ref={mainAppRef} className="pt-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold">{t('app.title')}</h2>
            <p className="text-gray-400">{t('app.subtitle')}</p>
          </div>
          <div className="flex flex-col items-center gap-6 mb-12">
            <PeriodSelector selectedPeriod={selectedPeriod} onPeriodChange={setSelectedPeriod} />
            <button
              onClick={handleGenerateReport}
              disabled={isLoadingReport}
              className="px-8 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold rounded-full shadow-lg hover:scale-105 transform transition-transform duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:scale-100"
            >
              {isLoadingReport ? t('generateReport.loading') : t('generateReport.button')}
            </button>
          </div>

          {error && <div className="text-center bg-red-900/50 border border-red-700 text-red-300 p-4 rounded-lg mb-8">{error}</div>}

          {isLoadingReport && <LoadingSpinner />}

          {reportData && (
            <div className="space-y-10">
                <div className="text-center p-8 bg-gray-800/50 rounded-2xl border border-gray-700">
                    <h2 className="text-3xl font-bold text-cyan-300 mb-4">{t('globalAnalysis.title')}</h2>
                    <p className="text-gray-300 max-w-4xl mx-auto leading-relaxed">{reportData.globalAnalysis}</p>
                    <button
                        onClick={() => exportReportToCsv(reportData, selectedPeriod, t)}
                        className="mt-6 inline-flex items-center gap-2 text-sm bg-gray-700 text-gray-300 hover:bg-gray-600 hover:text-white font-semibold py-2 px-4 rounded-lg transition-colors"
                    >
                        <DownloadIcon className="w-5 h-5" />
                        {t('globalAnalysis.exportButton')}
                    </button>
                </div>
              <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8">
                {reportData.sectors.map((sector) => (
                  <SectorCard 
                    key={sector.sectorName} 
                    sector={sector} 
                    onAnalyze={handleAnalyzeSector}
                    isPremiumFeature={true}
                    isPremiumUser={user?.subscription === 'premium'}
                   />
                ))}
              </div>
            </div>
          )}

        </main>
      </div>

      {detailedAnalysisModal.isOpen && (
        <DetailedAnalysisModal
          isLoading={detailedAnalysisModal.isLoading}
          analysisData={detailedAnalysisModal.data}
          onClose={() => setDetailedAnalysisModal({ isOpen: false, data: null, isLoading: false })}
          onAnalyzeProduct={handleAnalyzeProduct}
        />
      )}

      {productAnalysisModal.isOpen && (
        <ProductAnalysisModal
          isLoading={productAnalysisModal.isLoading}
          analysisData={productAnalysisModal.data}
          onClose={() => setProductAnalysisModal({ isOpen: false, data: null, isLoading: false })}
        />
      )}

      <SubscriptionModal
        isOpen={isSubscriptionModalOpen}
        onClose={() => setIsSubscriptionModalOpen(false)}
        onSubscribe={handleSubscribe}
      />
    </div>
  );
}

export default App;