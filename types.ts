
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
