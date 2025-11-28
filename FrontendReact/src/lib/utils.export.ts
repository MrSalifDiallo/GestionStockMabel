import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';

export interface ExportColumn {
  header: string;
  accessor: string | ((row: any) => any);
}

export interface ExportOptions {
  title: string;
  columns: ExportColumn[];
  data: any[];
  filename?: string;
}

/**
 * Export data to PDF
 */
export function exportToPDF({ title, columns, data, filename }: ExportOptions) {
  const doc = new jsPDF();
  
  // Add title
  doc.setFontSize(16);
  doc.text(title, 14, 20);
  
  // Add date
  doc.setFontSize(10);
  doc.text(`Généré le: ${new Date().toLocaleDateString('fr-FR')}`, 14, 30);
  
  // Prepare table data
  const tableData = data.map((row) =>
    columns.map((col) => {
      if (typeof col.accessor === 'function') {
        return col.accessor(row);
      }
      return row[col.accessor] || '';
    })
  );
  
  const headers = columns.map((col) => col.header);
  
  // Add table
  autoTable(doc, {
    head: [headers],
    body: tableData,
    startY: 35,
    styles: { fontSize: 8 },
    headStyles: { fillColor: [66, 139, 202] },
  });
  
  // Save PDF
  const finalFilename = filename || `${title.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`;
  doc.save(finalFilename);
}

/**
 * Export data to Excel
 */
export function exportToExcel({ title, columns, data, filename }: ExportOptions) {
  // Prepare worksheet data
  const worksheetData = [
    // Header row
    columns.map((col) => col.header),
    // Data rows
    ...data.map((row) =>
      columns.map((col) => {
        if (typeof col.accessor === 'function') {
          return col.accessor(row);
        }
        return row[col.accessor] || '';
      })
    ),
  ];
  
  // Create workbook and worksheet
  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.aoa_to_sheet(worksheetData);
  
  // Set column widths
  const colWidths = columns.map(() => ({ wch: 20 }));
  ws['!cols'] = colWidths;
  
  // Add worksheet to workbook
  XLSX.utils.book_append_sheet(wb, ws, title.substring(0, 31)); // Excel sheet name max 31 chars
  
  // Save file
  const finalFilename = filename || `${title.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.xlsx`;
  XLSX.writeFile(wb, finalFilename);
}

/**
 * Export chart/image to PDF
 */
export function exportChartToPDF(title: string, imageDataUrl: string, filename?: string) {
  const doc = new jsPDF();
  
  // Add title
  doc.setFontSize(16);
  doc.text(title, 14, 20);
  
  // Add date
  doc.setFontSize(10);
  doc.text(`Généré le: ${new Date().toLocaleDateString('fr-FR')}`, 14, 30);
  
  // Add image
  const imgWidth = 180;
  const imgHeight = (imgWidth * 9) / 16; // 16:9 ratio
  doc.addImage(imageDataUrl, 'PNG', 14, 40, imgWidth, imgHeight);
  
  // Save PDF
  const finalFilename = filename || `${title.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`;
  doc.save(finalFilename);
}

