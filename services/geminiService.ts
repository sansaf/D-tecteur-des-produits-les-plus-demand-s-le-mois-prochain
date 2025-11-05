
import { GoogleGenAI, Type } from "@google/genai";
import { ReportData } from '../types';

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
      description: "Analyse globale de 150 mots maximum résumant les dynamiques du marché et les secteurs porteurs."
    }
  },
  required: ["sectors", "globalAnalysis"]
};


export const generateTrendReport = async (): Promise<ReportData> => {
    const monthNames = ["Janvier", "Février", "Mars", "Avril", "Mai", "Juin", "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre"];
    const now = new Date();
    // Get next month, handling year change
    const nextMonthDate = new Date(now.getFullYear(), now.getMonth() + 1, 1);
    const nextMonthName = monthNames[nextMonthDate.getMonth()];
    const year = nextMonthDate.getFullYear();

    const prompt = `
        En tant qu'expert international en analyse de tendances de consommation, identifie les produits qui seront les plus demandés dans le monde pour ${nextMonthName} ${year}.

        Tâche :
        - Classe les produits par secteur de consommation (technologie, maison & déco, beauté, mode, sport, alimentation, santé, divertissement).
        - Pour chaque secteur, donne les 3 produits les plus susceptibles d’être achetés, leur taux de demande estimé (en %), les régions du monde à plus forte demande, et les raisons clés.
        - Termine par une analyse globale (150 mots max) sur les dynamiques générales du marché et les secteurs les plus porteurs.

        Contraintes :
        - Ton professionnel, clair et synthétique.
        - Utilise des pourcentages crédibles basés sur des tendances observables.
        - Mets en évidence les signaux émergents (nouvelles habitudes, innovations, influence des réseaux sociaux).
        - Fournis la réponse exclusivement au format JSON en respectant le schéma fourni.
    `;
    
    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: trendReportSchema,
                temperature: 0.5,
            },
        });

        const jsonText = response.text.trim();
        const reportData: ReportData = JSON.parse(jsonText);
        return reportData;

    } catch (error) {
        console.error("Error generating trend report:", error);
        throw new Error("Impossible de générer le rapport. Veuillez vérifier votre connexion ou la clé API.");
    }
};
