export interface ProductTrend {
  name: string;
  demandRate: number;
  regions: string;
  reasons: string;
}

export interface Sector {
  sectorName: string;
  products: ProductTrend[];
}

export interface ReportData {
  sectors: Sector[];
  globalAnalysis: string;
}

export interface DetailedProductSuggestion {
  name: string;
  targetAudience: string;
  sellingPoints: string[];
  priceRange: string;
  suppliers: string[];
}

export interface DetailedSectorAnalysis {
  sectorName:string;
  inDepthAnalysis: string;
  productSuggestions: DetailedProductSuggestion[];
}

export interface ProductAnalysis {
  productName: string;
  marketAnalysis: string;
  keyRegions: string[];
  targetAudience: string;
  sellingPoints: string[];
  priceRange: string;
  suppliers: string[];
  risks: string[];
}