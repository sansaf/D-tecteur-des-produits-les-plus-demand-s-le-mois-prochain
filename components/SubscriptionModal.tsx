import React from 'react';
import { XIcon, SparklesIcon } from './IconComponents';
import { useI18n } from '../hooks/useI18n';

interface SubscriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubscribe: () => void;
}

interface PlanProps {
  title: string;
  price: string;
  features: string[];
  recommended?: boolean;
  isCurrent?: boolean;
  onSelect?: () => void;
  t: (key: string) => string;
}

const Plan: React.FC<PlanProps> = ({ title, price, features, recommended = false, isCurrent = false, onSelect, t }) => (
    <div className={`relative bg-gray-900/50 border ${isCurrent ? 'border-cyan-500' : recommended ? 'border-amber-500' : 'border-gray-700'} rounded-xl p-8 flex flex-col`}>
        {recommended && (
            <div className="absolute top-0 -translate-y-1/2 left-1/2 -translate-x-1/2 bg-amber-500 text-gray-900 text-xs font-bold px-3 py-1 rounded-full uppercase">
                {t('subscriptionModal.recommended')}
            </div>
        )}
        <h3 className={`text-2xl font-bold ${isCurrent ? 'text-cyan-400' : recommended ? 'text-amber-400' : 'text-white'}`}>{title}</h3>
        <p className="text-4xl font-extrabold my-6">{price}<span className="text-base font-medium text-gray-400">/{t('subscriptionModal.month')}</span></p>
        <ul className="space-y-4 text-gray-300 flex-grow">
            {features.map((feature, i) => (
                <li key={i} className="flex items-start">
                    <SparklesIcon className="w-5 h-5 text-amber-400 mr-3 flex-shrink-0 mt-0.5" />
                    <span>{feature}</span>
                </li>
            ))}
        </ul>
        {isCurrent ? (
            <div className="mt-8 text-center w-full py-3 font-bold rounded-lg bg-gray-700 text-gray-300 cursor-default">
                {t('subscriptionModal.currentPlan')}
            </div>
        ) : (
            <button
                onClick={onSelect}
                className={`mt-8 w-full py-3 font-bold rounded-lg transition-transform duration-300 transform hover:scale-105 ${recommended ? 'bg-amber-500 text-gray-900 hover:bg-amber-400' : 'bg-cyan-600 text-white hover:bg-cyan-500'}`}
            >
                {t('subscriptionModal.choosePlan')}
            </button>
        )}
    </div>
);


const SubscriptionModal: React.FC<SubscriptionModalProps> = ({ isOpen, onClose, onSubscribe }) => {
  const { t } = useI18n();
  if (!isOpen) return null;

  const handleSubscription = () => {
    onSubscribe();
  };

  const plans = {
    free: {
      title: t('subscriptionModal.planFree.title'),
      price: "€0",
      features: [
        t('subscriptionModal.planFree.feature1'),
        t('subscriptionModal.planFree.feature2'),
        t('subscriptionModal.planFree.feature3'),
      ]
    },
    pro: {
      title: t('subscriptionModal.planPro.title'),
      price: "€49",
      features: [
        t('subscriptionModal.planPro.feature1'),
        t('subscriptionModal.planPro.feature2'),
        t('subscriptionModal.planPro.feature3'),
        t('subscriptionModal.planPro.feature4'),
        t('subscriptionModal.planPro.feature5'),
        t('subscriptionModal.planPro.feature6'),
      ]
    },
    enterprise: {
      title: t('subscriptionModal.planEnterprise.title'),
      price: "€199",
      features: [
        t('subscriptionModal.planEnterprise.feature1'),
        t('subscriptionModal.planEnterprise.feature2'),
        t('subscriptionModal.planEnterprise.feature3'),
        t('subscriptionModal.planEnterprise.feature4'),
        t('subscriptionModal.planEnterprise.feature5'),
      ]
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 backdrop-blur-sm flex justify-center items-center z-50 p-4" role="dialog" aria-modal="true" aria-labelledby="subscription-modal-title">
      <div className="bg-gray-800 border border-gray-700 rounded-2xl shadow-2xl w-full max-w-5xl max-h-[90vh] flex flex-col relative animate-fade-in-up">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors z-10">
          <XIcon className="w-8 h-8" />
        </button>
        <div className="p-8 sm:p-12 text-center">
            <h2 id="subscription-modal-title" className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-orange-500 mb-4">
                {t('subscriptionModal.title')}
            </h2>
            <p className="text-lg text-gray-400 max-w-2xl mx-auto">
                {t('subscriptionModal.subtitle')}
            </p>
        </div>
        <div className="p-8 pt-0 grid grid-cols-1 md:grid-cols-3 gap-8">
             <Plan 
                title={plans.free.title}
                price={plans.free.price}
                features={plans.free.features}
                isCurrent
                t={t}
            />
            <Plan 
                title={plans.pro.title}
                price={plans.pro.price}
                features={plans.pro.features}
                recommended
                onSelect={handleSubscription}
                t={t}
            />
             <Plan 
                title={plans.enterprise.title}
                price={plans.enterprise.price}
                features={plans.enterprise.features}
                onSelect={handleSubscription}
                t={t}
            />
        </div>
      </div>
    </div>
  );
};

export default SubscriptionModal;