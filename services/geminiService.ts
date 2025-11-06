import { GoogleGenAI, Type } from "@google/genai";
import { ReportData, DetailedSectorAnalysis, ProductAnalysis } from '../types';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const getTrendReportSchema = (lang: 'fr' | 'en', numProducts: number) => ({
    type: Type.OBJECT,
    properties: {
      sectors: {
        type: Type.ARRAY,
        description: lang === 'fr' ? "Liste des secteurs de consommation." : "List of consumer sectors.",
        items: {
          type: Type.OBJECT,
          properties: {
            sectorName: {
              type: Type.STRING,
              description: lang === 'fr' ? "Nom du secteur (ex: technologie, mode)." : "Name of the sector (e.g., technology, fashion)."
            },
            products: {
              type: Type.ARRAY,
              description: lang === 'fr' ? `Les ${numProducts} produits les plus demandés dans ce secteur.` : `The ${numProducts} most in-demand products in this sector.`,
              items: {
                type: Type.OBJECT,
                properties: {
                  name: { type: Type.STRING, description: lang === 'fr' ? "Nom du produit." : "Product name." },
                  demandRate: { type: Type.NUMBER, description: lang === 'fr' ? "Taux de demande estimé en pourcentage (ex: 15 pour 15%)." : "Estimated demand rate as a percentage (e.g., 15 for 15%)." },
                  regions: { type: Type.STRING, description: lang === 'fr' ? "Régions du monde où la demande sera la plus forte." : "Regions of the world where demand will be strongest." },
                  reasons: { type: Type.STRING, description: lang === 'fr' ? "Raisons clés de la demande (facteurs économiques, saisonniers, culturels, médiatiques)." : "Key reasons for demand (economic, seasonal, cultural, media factors)." }
                },
                required: ["name", "demandRate", "regions", "reasons"]
              }
            }
          },
          required: ["sectorName", "products"]
        }
      },
      globalAnalysis: {
        type: Type.STRING,
        description: lang === 'fr' ? "Une analyse globale et synthétique des tendances du marché pour la période demandée." : "A global and synthetic analysis of market trends for the requested period."
      }
    },
    required: ["sectors", "globalAnalysis"]
});


export async function generateTrendReport(periodInMonths: number, subscription: 'free' | 'premium' = 'free', language: 'fr' | 'en'): Promise<ReportData> {
  const numProducts = subscription === 'premium' ? 20 : 3;
  const trendReportSchema = getTrendReportSchema(language, numProducts);
  
  const prompt = language === 'fr' ? 
    `Analyse les tendances de consommation mondiales et identifie les produits qui seront les plus demandés dans les ${periodInMonths} prochains mois. Fournis une analyse pour 3 à 5 secteurs clés, avec ${numProducts} produits par secteur. Pour chaque produit, estime le taux de demande, les régions clés et les raisons de cette tendance. Termine par une analyse globale du marché.` :
    `Analyze global consumer trends and identify the products that will be most in demand in the next ${periodInMonths} months. Provide an analysis for 3 to 5 key sectors, with ${numProducts} products per sector. For each product, estimate the demand rate, key regions, and the reasons for this trend. Conclude with a global market analysis.`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: trendReportSchema,
      },
    });

    const jsonText = response.text.trim();
    const data = JSON.parse(jsonText);
    return data as ReportData;

  } catch (error) {
    console.error("Error generating trend report:", error);
    throw new Error("Could not generate the trend report. The API may have returned an unexpected response.");
  }
}

const getDetailedAnalysisSchema = (lang: 'fr' | 'en') => ({
    type: Type.OBJECT,
    properties: {
        sectorName: { type: Type.STRING, description: lang === 'fr' ? "Le nom du secteur analysé." : "The name of the analyzed sector." },
        inDepthAnalysis: { type: Type.STRING, description: lang === 'fr' ? "Une analyse approfondie du secteur, couvrant les dynamiques du marché, les opportunités émergentes et les défis potentiels pour la période demandée." : "An in-depth analysis of the sector, covering market dynamics, emerging opportunities, and potential challenges for the requested period." },
        productSuggestions: {
            type: Type.ARRAY,
            description: lang === 'fr' ? "Une liste de 20 suggestions de produits spécifiques à vendre dans ce secteur." : "A list of 20 specific product suggestions to sell in this sector.",
            items: {
                type: Type.OBJECT,
                properties: {
                    name: { type: Type.STRING, description: lang === 'fr' ? "Nom du produit suggéré." : "Name of the suggested product." },
                    targetAudience: { type: Type.STRING, description: lang === 'fr' ? "Description du public cible pour ce produit." : "Description of the target audience for this product." },
                    sellingPoints: { type: Type.ARRAY, items: { type: Type.STRING }, description: lang === 'fr' ? "Arguments de vente clés pour le produit." : "Key selling points for the product." },
                    priceRange: { type: Type.STRING, description: lang === 'fr' ? "Fourchette de prix suggérée (ex: '€50 - €150')." : "Suggested price range (e.g., '$50 - $150')." },
                    suppliers: { type: Type.ARRAY, items: { type: Type.STRING }, description: lang === 'fr' ? "Une liste de 2-3 exemples de fournisseurs potentiels ou de pôles de fabrication pour ce produit." : "A list of 2-3 examples of potential suppliers or manufacturing hubs for this product." },
                },
                required: ["name", "targetAudience", "sellingPoints", "priceRange", "suppliers"]
            }
        }
    },
    required: ["sectorName", "inDepthAnalysis", "productSuggestions"]
});


export async function generateDetailedAnalysis(sectorName: string, periodInMonths: number, language: 'fr' | 'en'): Promise<DetailedSectorAnalysis> {
    const prompt = language === 'fr' ?
        `Fournis une analyse détaillée pour le secteur "${sectorName}" pour les ${periodInMonths} prochains mois. L'analyse doit inclure une vue d'ensemble approfondie du marché, les opportunités, les défis. Suggère également 20 produits spécifiques à vendre, avec pour chacun : un public cible, des arguments de vente clés, une fourchette de prix, et une liste de 2-3 exemples des meilleurs fournisseurs ou pôles de fabrication.` :
        `Provide a detailed analysis for the "${sectorName}" sector for the next ${periodInMonths} months. The analysis should include an in-depth market overview, opportunities, and challenges. Also, suggest 20 specific products to sell, each with: a target audience, key selling points, a price range, and a list of 2-3 examples of top suppliers or manufacturing hubs.`;
    
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-pro',
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: getDetailedAnalysisSchema(language),
            },
        });
        const jsonText = response.text.trim();
        const data = JSON.parse(jsonText);
        return data as DetailedSectorAnalysis;
    } catch (error) {
        console.error(`Error generating detailed analysis for ${sectorName}:`, error);
        throw new Error(`Could not generate the detailed analysis for the ${sectorName} sector.`);
    }
}

const getProductAnalysisSchema = (lang: 'fr' | 'en') => ({
    type: Type.OBJECT,
    properties: {
        productName: { type: Type.STRING, description: lang === 'fr' ? "Le nom du produit analysé." : "The name of the analyzed product." },
        marketAnalysis: { type: Type.STRING, description: lang === 'fr' ? "Une analyse approfondie du marché pour ce produit, couvrant son potentiel, la demande attendue, et les tendances actuelles pour la période demandée." : "An in-depth market analysis for this product, covering its potential, expected demand, and current trends for the requested period." },
        keyRegions: { type: Type.ARRAY, items: { type: Type.STRING }, description: lang === 'fr' ? "Les régions ou pays clés où la demande pour ce produit est la plus forte." : "The key regions or countries where demand for this product is strongest." },
        targetAudience: { type: Type.STRING, description: lang === 'fr' ? "Description détaillée du public cible principal pour ce produit." : "Detailed description of the primary target audience for this product." },
        sellingPoints: { type: Type.ARRAY, items: { type: Type.STRING }, description: lang === 'fr' ? "Les 3 à 5 arguments de vente les plus percutants pour commercialiser le produit." : "The 3 to 5 most impactful selling points for marketing the product." },
        priceRange: { type: Type.STRING, description: lang === 'fr' ? "Fourchette de prix de vente au détail suggérée (ex: '€100 - €250')." : "Suggested retail price range (e.g., '$100 - $250')." },
        suppliers: { type: Type.ARRAY, items: { type: Type.STRING }, description: lang === 'fr' ? "Une liste de 2-3 exemples de fournisseurs, fabricants ou plateformes de sourcing pertinents pour ce produit." : "A list of 2-3 examples of relevant suppliers, manufacturers, or sourcing platforms for this product." },
        risks: { type: Type.ARRAY, items: { type: Type.STRING }, description: lang === 'fr' ? "Les principaux risques ou défis associés à la vente de ce produit (concurrence, logistique, réglementations, etc.)." : "The main risks or challenges associated with selling this product (competition, logistics, regulations, etc.)." }
    },
    required: ["productName", "marketAnalysis", "keyRegions", "targetAudience", "sellingPoints", "priceRange", "suppliers", "risks"]
});


export async function generateProductAnalysis(productName: string, periodInMonths: number, language: 'fr' | 'en'): Promise<ProductAnalysis> {
    const prompt = language === 'fr' ?
        `Fournis une analyse de marché complète pour le produit "${productName}" pour les ${periodInMonths} prochains mois. Je veux une analyse détaillée de son potentiel, les régions clés à forte demande, le public cible, 3-5 arguments de vente clés, une fourchette de prix, 2-3 fournisseurs potentiels, et les risques ou défis principaux.` :
        `Provide a comprehensive market analysis for the product "${productName}" for the next ${periodInMonths} months. I want a detailed analysis of its potential, key high-demand regions, target audience, 3-5 key selling points, a price range, 2-3 potential suppliers, and the main risks or challenges.`;

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-pro',
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: getProductAnalysisSchema(language),
            },
        });
        const jsonText = response.text.trim();
        const data = JSON.parse(jsonText);
        return data as ProductAnalysis;
    } catch (error) {
        console.error(`Error generating product analysis for ${productName}:`, error);
        throw new Error(`Could not generate the analysis for the product ${productName}.`);
    }
}