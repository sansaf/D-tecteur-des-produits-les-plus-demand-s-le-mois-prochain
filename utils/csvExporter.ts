import { ReportData, DetailedSectorAnalysis, ProductAnalysis } from '../types';

type TFunction = (key: string, replacements?: Record<string, string | number>) => string;

function escapeCsvCell(cell: string | number | string[]): string {
  const cellStr = Array.isArray(cell) ? cell.join('; ') : String(cell);
  if (cellStr.includes(',') || cellStr.includes('"') || cellStr.includes('\n')) {
    return `"${cellStr.replace(/"/g, '""')}"`;
  }
  return cellStr;
}

function downloadCsv(csvContent: string, filename: string) {
  const blob = new Blob([`\uFEFF${csvContent}`], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement("a");
  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}

export function exportReportToCsv(data: ReportData, period: number, t: TFunction) {
  const headers = [
    t('csv.report.sector'),
    t('csv.report.product'),
    t('csv.report.demandRate'),
    t('csv.report.profitabilityScore'),
    t('csv.report.keyRegions'),
    t('csv.report.reasons'),
    t('csv.report.suppliers')
  ].join(',');
  let csvRows = [headers];

  data.sectors.forEach(sector => {
    sector.products.forEach(product => {
      const row = [
        escapeCsvCell(sector.sectorName),
        escapeCsvCell(product.name),
        escapeCsvCell(product.demandRate),
        escapeCsvCell(product.profitabilityScore),
        escapeCsvCell(product.regions),
        escapeCsvCell(product.reasons),
        escapeCsvCell(product.suppliers)
      ].join(',');
      csvRows.push(row);
    });
  });
  
  csvRows.push('');
  csvRows.push(`"${t('csv.report.globalAnalysis')}"`);
  csvRows.push(escapeCsvCell(data.globalAnalysis));

  const csvContent = csvRows.join('\n');
  const filename = t('csv.report.filename', { period });
  downloadCsv(csvContent, filename);
}

export function exportDetailedAnalysisToCsv(data: DetailedSectorAnalysis, t: TFunction) {
  let csvRows = [`"${t('csv.detailed.inDepthAnalysis')}"`];
  csvRows.push(escapeCsvCell(data.inDepthAnalysis));
  csvRows.push('');
  const headers = [
    t('csv.detailed.productSuggestions'),
    t('csv.detailed.description'),
    t('csv.detailed.targetAudience'),
    t('csv.detailed.sellingPoints'),
    t('csv.detailed.priceRange'),
    t('csv.detailed.potentialSuppliers'),
    t('csv.detailed.profitabilityScore'),
    t('csv.detailed.marketEntryDifficulty')
  ].join(',');
  csvRows.push(headers);

  data.productSuggestions.forEach(product => {
    const row = [
      escapeCsvCell(product.name),
      escapeCsvCell(product.description),
      escapeCsvCell(product.targetAudience),
      escapeCsvCell(product.sellingPoints.join('; ')),
      escapeCsvCell(product.priceRange),
      escapeCsvCell(product.suppliers.join('; ')),
      escapeCsvCell(product.profitabilityScore),
      escapeCsvCell(product.marketEntryDifficulty)
    ].join(',');
    csvRows.push(row);
  });
  
  const csvContent = csvRows.join('\n');
  const filename = t('csv.detailed.filename', { sectorName: data.sectorName });
  downloadCsv(csvContent, filename);
}


export function exportProductAnalysisToCsv(data: ProductAnalysis, t: TFunction) {
  const headers = [
    t('csv.product.product'),
    t('csv.product.marketAnalysis'),
    t('csv.product.keyRegions'),
    t('csv.product.targetAudience'),
    t('csv.product.sellingPoints'),
    t('csv.product.priceRange'),
    t('csv.product.suppliers'),
    t('csv.product.risks')
  ];
  
  const values = [
    data.productName,
    data.marketAnalysis,
    data.keyRegions.join('; '),
    data.targetAudience,
    data.sellingPoints.join('; '),
    data.priceRange,
    data.suppliers.join('; '),
    data.risks.join('; ')
  ];

  let csvContent = headers.map(escapeCsvCell).join(',') + '\n';
  csvContent += values.map(escapeCsvCell).join(',');
  
  const filename = t('csv.product.filename', { productName: data.productName });
  downloadCsv(csvContent, filename);
}