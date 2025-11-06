
import { GoogleGenAI, Type } from "@google/genai";
import { ReportData, DetailedSectorAnalysis } from '../types';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const trendReportSchema = {
  type: Type.OBJECT,
  properties: {
    sectors: {
      type: Type.ARRAY,
      description: "Liste des secteurs de consommation.",
      items: {
        type: Type.OBJECT,
        properties: {
          sectorName: {
            type: Type.STRING,
            description: "Nom du secteur (ex: technologie, mode)."
          },
          products: {
            type: Type.ARRAY,
            description: "Les 3 produits les plus demandés dans ce secteur.",
            items: {
              type: Type.OBJECT,
              properties: {
                name: {
                  type: Type.STRING,
                  description: "Nom du produit."
                },
                demandRate: {
                  type: Type.NUMBER,
                  description: "Taux de demande estimé en pourcentage (ex: 15 pour 15%)."
                },
                regions: {
                  type: Type.STRING,
                  description: "Régions du monde où la demande sera la plus forte."
                },
                reasons: {
                  type: Type.STRING,
                  description: "Raisons clés de la demande (facteurs économiques, saisonniers, culturels, médiatiques)."
                }
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
      description: "Une analyse globale et synthétique des tendances du marché pour le mois prochain."
    }
  },
  required: ["sectors", "globalAnalysis"]
};

export async function generateTrendReport(): Promise<ReportData> {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: "Analyse les tendances de consommation mondiales et identifie les produits qui seront les plus demandés le mois prochain. Fournis une analyse pour 3 à 5 secteurs clés, avec 3 produits par secteur. Pour chaque produit, estime le taux de demande, les régions clés et les raisons de cette tendance. Termine par une analyse globale du marché.",
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
    throw new Error("Impossible de générer le rapport de tendances. L'API a peut-être renvoyé une réponse inattendue.");
  }
}

const detailedAnalysisSchema = {
    type: Type.OBJECT,
    properties: {
        sectorName: { type: Type.STRING, description: "Le nom du secteur analysé." },
        inDepthAnalysis: { type: Type.STRING, description: "Une analyse approfondie du secteur, couvrant les dynamiques du marché, les opportunités émergentes et les défis potentiels." },
        productSuggestions: {
            type: Type.ARRAY,
            description: "Une liste de 5 suggestions de produits spécifiques à vendre dans ce secteur.",
            items: {
                type: Type.OBJECT,
                properties: {
                    name: { type: Type.STRING, description: "Nom du produit suggéré." },
                    targetAudience: { type: Type.STRING, description: "Description du public cible pour ce produit." },
                    sellingPoints: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Arguments de vente clés pour le produit." },
                    priceRange: { type: Type.STRING, description: "Fourchette de prix suggérée (ex: '€50 - €150')." },
                    suppliers: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Une liste de 2-3 exemples de fournisseurs potentiels ou de pôles de fabrication pour ce produit." },
                },
                required: ["name", "targetAudience", "sellingPoints", "priceRange", "suppliers"]
            }
        }
    },
    required: ["sectorName", "inDepthAnalysis", "productSuggestions"]
};

export async function generateDetailedAnalysis(sectorName: string): Promise<DetailedSectorAnalysis> {
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-pro',
            contents: `Fournis une analyse détaillée pour le secteur "${sectorName}". L'analyse doit inclure une vue d'ensemble approfondie du marché, les opportunités, les défis. Suggère également 5 produits spécifiques à vendre, avec pour chacun : un public cible, des arguments de vente clés, une fourchette de prix, et une liste de 2-3 exemples des meilleurs fournisseurs ou pôles de fabrication.`,
            config: {
                responseMimeType: "application/json",
                responseSchema: detailedAnalysisSchema,
            },
        });
        const jsonText = response.text.trim();
        const data = JSON.parse(jsonText);
        return data as DetailedSectorAnalysis;
    } catch (error) {
        console.error(`Error generating detailed analysis for ${sectorName}:`, error);
        throw new Error(`Impossible de générer l'analyse détaillée pour le secteur ${sectorName}.`);
    }
}
