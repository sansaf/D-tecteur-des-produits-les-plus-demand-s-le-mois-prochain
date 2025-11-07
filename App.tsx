import React, { useState, useCallback, useEffect, useRef } from 'react';
import PeriodSelector from './components/PeriodSelector';
import SectorCard from './components/SectorCard';
import LoadingSpinner from './components/LoadingSpinner';
import DetailedAnalysisModal from './components/DetailedAnalysisModal';
import ProductAnalysisModal from './components/ProductAnalysisModal';
import SubscriptionModal from './components/SubscriptionModal';
import UserSettingsModal from './components/UserSettingsModal';
import AuthModal from './components/AuthModal';
import Toast from './components/Toast';
import ToggleSwitch from './components/ToggleSwitch';
import { ReportData, DetailedSectorAnalysis, ProductAnalysis, User } from './types';
import { generateTrendReport, generateDetailedAnalysis, generateProductAnalysis } from './services/geminiService';
import { exportReportToCsv } from './utils/csvExporter';
import { DownloadIcon, BrainIcon, ChartPieIcon, DocumentReportIcon, ChevronDownIcon, ChevronUpIcon, RefreshIcon, CogIcon, ArrowRightOnRectangleIcon, ShareIcon } from './components/IconComponents';
import { useI18n } from './hooks/useI18n';

function App() {
  const { t, lang, setLang } = useI18n();
  const mainAppRef = useRef<HTMLElement>(null);

  const [selectedPeriod, setSelectedPeriod] = useState<number>(3);
  const [reportData, setReportData] = useState<ReportData | null>(null);
  const [isLoadingReport, setIsLoadingReport] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  
  const [isSubscriptionModalOpen, setIsSubscriptionModalOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [pendingAction, setPendingAction] = useState<{ type: 'analyze_sector', payload: string } | null>(null);
  
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [toastType, setToastType] = useState<'info' | 'success'>('info');

  const [isAdvancedOptionsOpen, setIsAdvancedOptionsOpen] = useState(false);
  const [customRegions, setCustomRegions] = useState('');
  const [customKeywords, setCustomKeywords] = useState('');
  const [customExcludedKeywords, setCustomExcludedKeywords] = useState('');
  const [customIndustries, setCustomIndustries] = useState('');
  const [generationMode, setGenerationMode] = useState<'reliable' | 'creative'>('reliable');

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

  const handleAnalyzeSector = useCallback(async (sectorName: string, force: boolean = false) => {
    if (!user) {
      setIsAuthModalOpen(true);
      return;
    }
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

  useEffect(() => {
    if (user?.subscription === 'premium' && pendingAction?.type === 'analyze_sector') {
      handleAnalyzeSector(pendingAction.payload, true);
      setPendingAction(null);
    }
    // FIX: Add handleAnalyzeSector to the dependency array to prevent stale closures.
  }, [user, pendingAction, handleAnalyzeSector]);


  const handleAuthSuccess = (authenticatedUser: User) => {
    setUser(authenticatedUser);
    localStorage.setItem('trend-analyzer-user', JSON.stringify(authenticatedUser));
    setIsAuthModalOpen(false);
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

  const handleSaveSettings = (updatedUser: User) => {
    setUser(updatedUser);
    localStorage.setItem('trend-analyzer-user', JSON.stringify(updatedUser));
  };

  const handleResetAdvancedOptions = () => {
    setCustomRegions('');
    setCustomKeywords('');
    setCustomExcludedKeywords('');
    setCustomIndustries('');
    setGenerationMode('reliable');
  };

  const handleGenerateReport = useCallback(async () => {
    setIsLoadingReport(true);
    setError(null);
    setReportData(null);
    try {
       const options = {
        regions: customRegions,
        keywords: customKeywords,
        excludedKeywords: customExcludedKeywords,
        industries: customIndustries,
        generationMode: generationMode,
      };
      const data = await generateTrendReport(selectedPeriod, user?.subscription ?? 'free', lang, options);
      setReportData(data);

      if (user?.notificationsEnabled && user?.email) {
          setToastType('info');
          setToastMessage(t('notifications.reportReady', { email: user.email }));
      }

    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred.');
    } finally {
      setIsLoadingReport(false);
    }
  }, [selectedPeriod, user, lang, customRegions, customKeywords, customExcludedKeywords, customIndustries, generationMode, t]);

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
  
  const handleShare = useCallback(async (shareData: {title: string, text: string}) => {
    const url = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({
          title: shareData.title,
          text: shareData.text,
          url: url,
        });
      } catch (error) {
        console.error('Error sharing:', error);
      }
    } else {
      try {
        await navigator.clipboard.writeText(url);
        setToastType('success');
        setToastMessage(t('notifications.linkCopied'));
      } catch (err) {
        console.error('Failed to copy: ', err);
      }
    }
  }, [t]);

  const Footer = () => (
    <footer className="mt-24 py-8 border-t border-gray-800 text-center text-gray-500 text-sm">
        <div className="flex justify-center gap-6 mb-4">
            <a href="#" className="hover:text-gray-300 transition-colors">{t('footer.about')}</a>
            <a href="#" className="hover:text-gray-300 transition-colors">{t('footer.contact')}</a>
            <a href="#" className="hover:text-gray-300 transition-colors">{t('footer.privacy')}</a>
            <a href="#" className="hover:text-gray-300 transition-colors">{t('footer.terms')}</a>
        </div>
        <p>{t('footer.copyright', { year: new Date().getFullYear() })}</p>
    </footer>
  );

  return (
    <div className="min-h-screen bg-gray-900 text-white font-sans flex flex-col">
      <div className="container mx-auto px-4 py-8 flex-grow">
        <header className="flex items-center justify-between mb-10 flex-wrap gap-4">
          <div className="text-left">
            <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-600">
              {t('header.title')}
            </h1>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center bg-gray-800 rounded-full">
                <button onClick={() => setLang('fr')} disabled={isLoadingReport} className={`px-3 py-1 text-sm font-semibold rounded-full disabled:opacity-50 disabled:cursor-not-allowed ${lang === 'fr' ? 'bg-cyan-500 text-white' : 'text-gray-400'}`}>FR</button>
                <button onClick={() => setLang('en')} disabled={isLoadingReport} className={`px-3 py-1 text-sm font-semibold rounded-full disabled:opacity-50 disabled:cursor-not-allowed ${lang === 'en' ? 'bg-cyan-500 text-white' : 'text-gray-400'}`}>EN</button>
            </div>
            {user ? (
              <div className="flex items-center gap-3">
                <div className="text-right">
                    <p className="font-semibold text-white">{user.name}</p>
                    <div className={`text-xs font-bold px-2 py-0.5 rounded-full inline-block ${user.subscription === 'premium' ? 'bg-amber-500/20 text-amber-300' : 'bg-gray-700 text-gray-300'}`}>
                        {user.subscription === 'premium' ? t('subscription.statusPremium') : t('subscription.statusFree')}
                    </div>
                    {user.subscription === 'free' && (
                         <button onClick={() => setIsSubscriptionModalOpen(true)} disabled={isLoadingReport} className="text-xs text-cyan-400 hover:underline disabled:opacity-50 disabled:cursor-not-allowed disabled:no-underline">{t('subscription.upgrade')}</button>
                    )}
                </div>
                <img src={user.picture} alt={user.name} className="w-12 h-12 rounded-full border-2 border-cyan-400 object-cover" />
                 <button onClick={() => setIsSettingsModalOpen(true)} disabled={isLoadingReport} className="p-2 rounded-full bg-gray-700/50 hover:bg-gray-600/80 text-gray-300 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed" title={t('userSettings.title')}>
                    <CogIcon className="w-6 h-6" />
                </button>
                <button
                  onClick={handleLogout}
                  disabled={isLoadingReport}
                  className="px-4 py-2 bg-gray-700 text-gray-300 font-semibold rounded-lg hover:bg-gray-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {t('login.logout')}
                </button>
              </div>
            ) : (
              <button
                onClick={() => setIsAuthModalOpen(true)}
                disabled={isLoadingReport}
                className="inline-flex items-center gap-3 px-5 py-2.5 bg-cyan-600 text-white font-semibold rounded-lg shadow-md hover:bg-cyan-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ArrowRightOnRectangleIcon className="w-5 h-5" />
                <span>{t('header.loginSignup')}</span>
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
            <PeriodSelector selectedPeriod={selectedPeriod} onPeriodChange={setSelectedPeriod} disabled={isLoadingReport} />
            
             <div className="w-full max-w-4xl">
                <button
                    onClick={() => setIsAdvancedOptionsOpen(!isAdvancedOptionsOpen)}
                    disabled={isLoadingReport}
                    className="flex items-center justify-center gap-2 text-sm text-cyan-400 hover:text-cyan-300 w-full text-center py-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {t('app.advancedOptions.title')}
                    {isAdvancedOptionsOpen ? <ChevronUpIcon className="w-4 h-4" /> : <ChevronDownIcon className="w-4 h-4" />}
                </button>
                {isAdvancedOptionsOpen && (
                    <div className="mt-4 p-6 bg-gray-800/50 border border-gray-700 rounded-lg space-y-4 animate-fade-in-down">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label htmlFor="customRegions" className="block text-sm font-medium text-gray-300 mb-1">{t('app.advancedOptions.regionsLabel')}</label>
                                <input
                                    type="text"
                                    id="customRegions"
                                    value={customRegions}
                                    onChange={(e) => setCustomRegions(e.target.value)}
                                    placeholder={t('app.advancedOptions.regionsPlaceholder')}
                                    disabled={isLoadingReport}
                                    className="w-full bg-gray-900/70 border border-gray-600 rounded-md px-3 py-2 text-white focus:ring-cyan-500 focus:border-cyan-500 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                                />
                            </div>
                            <div>
                                <label htmlFor="customIndustries" className="block text-sm font-medium text-gray-300 mb-1">{t('app.advancedOptions.industriesLabel')}</label>
                                <input
                                    type="text"
                                    id="customIndustries"
                                    value={customIndustries}
                                    onChange={(e) => setCustomIndustries(e.target.value)}
                                    placeholder={t('app.advancedOptions.industriesPlaceholder')}
                                    disabled={isLoadingReport}
                                    className="w-full bg-gray-900/70 border border-gray-600 rounded-md px-3 py-2 text-white focus:ring-cyan-500 focus:border-cyan-500 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                                />
                            </div>
                            <div>
                                <label htmlFor="customKeywords" className="block text-sm font-medium text-gray-300 mb-1">{t('app.advancedOptions.keywordsLabel')}</label>
                                <input
                                    type="text"
                                    id="customKeywords"
                                    value={customKeywords}
                                    onChange={(e) => setCustomKeywords(e.target.value)}
                                    placeholder={t('app.advancedOptions.keywordsPlaceholder')}
                                    disabled={isLoadingReport}
                                    className="w-full bg-gray-900/70 border border-gray-600 rounded-md px-3 py-2 text-white focus:ring-cyan-500 focus:border-cyan-500 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                                />
                            </div>
                             <div>
                                <label htmlFor="customExcludedKeywords" className="block text-sm font-medium text-gray-300 mb-1">{t('app.advancedOptions.excludedKeywordsLabel')}</label>
                                <input
                                    type="text"
                                    id="customExcludedKeywords"
                                    value={customExcludedKeywords}
                                    onChange={(e) => setCustomExcludedKeywords(e.target.value)}
                                    placeholder={t('app.advancedOptions.excludedKeywordsPlaceholder')}
                                    disabled={isLoadingReport}
                                    className="w-full bg-gray-900/70 border border-gray-600 rounded-md px-3 py-2 text-white focus:ring-cyan-500 focus:border-cyan-500 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                                />
                            </div>
                        </div>
                        <div className="border-t border-gray-700/50 pt-4 flex justify-between items-center">
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">{t('app.advancedOptions.generationMode.label')}</label>
                                <ToggleSwitch
                                    value={generationMode}
                                    onChange={setGenerationMode}
                                    option1={{ label: t('app.advancedOptions.generationMode.reliable'), value: 'reliable' }}
                                    option2={{ label: t('app.advancedOptions.generationMode.creative'), value: 'creative' }}
                                    disabled={isLoadingReport}
                                />
                            </div>
                            <div className="text-right">
                                <button
                                    onClick={handleResetAdvancedOptions}
                                    disabled={isLoadingReport}
                                    className="inline-flex items-center gap-2 text-xs text-gray-400 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <RefreshIcon className="w-4 h-4" />
                                    {t('app.advancedOptions.resetButton')}
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>

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
                    <div className="mt-6 flex justify-center items-center gap-4">
                        <button
                            onClick={() => exportReportToCsv(reportData, selectedPeriod, t)}
                            className="inline-flex items-center gap-2 text-sm bg-gray-700 text-gray-300 hover:bg-gray-600 hover:text-white font-semibold py-2 px-4 rounded-lg transition-colors"
                        >
                            <DownloadIcon className="w-5 h-5" />
                            {t('globalAnalysis.exportButton')}
                        </button>
                        <button
                            onClick={() => handleShare({
                                title: t('share.mainReport.title'),
                                text: t('share.mainReport.text', { period: selectedPeriod })
                            })}
                            className="inline-flex items-center gap-2 text-sm bg-gray-700 text-gray-300 hover:bg-gray-600 hover:text-white font-semibold py-2 px-4 rounded-lg transition-colors"
                        >
                            <ShareIcon className="w-5 h-5" />
                            {t('common.share')}
                        </button>
                    </div>
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

      <Footer />

      {detailedAnalysisModal.isOpen && (
        <DetailedAnalysisModal
          isLoading={detailedAnalysisModal.isLoading}
          analysisData={detailedAnalysisModal.data}
          onClose={() => setDetailedAnalysisModal({ isOpen: false, data: null, isLoading: false })}
          onAnalyzeProduct={handleAnalyzeProduct}
          onShare={handleShare}
        />
      )}

      {productAnalysisModal.isOpen && (
        <ProductAnalysisModal
          isLoading={productAnalysisModal.isLoading}
          analysisData={productAnalysisModal.data}
          onClose={() => setProductAnalysisModal({ isOpen: false, data: null, isLoading: false })}
          onShare={handleShare}
        />
      )}

      <SubscriptionModal
        isOpen={isSubscriptionModalOpen}
        onClose={() => setIsSubscriptionModalOpen(false)}
        onSubscribe={handleSubscribe}
      />

      <AuthModal 
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onAuthSuccess={handleAuthSuccess}
      />

      {user && (
        <UserSettingsModal
            isOpen={isSettingsModalOpen}
            user={user}
            onClose={() => setIsSettingsModalOpen(false)}
            onSave={handleSaveSettings}
        />
      )}

      {toastMessage && <Toast message={toastMessage} onClose={() => setToastMessage(null)} type={toastType} />}

    </div>
  );
}

export default App;