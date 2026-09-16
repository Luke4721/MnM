import type { RecentEnquiry } from '../../types/dashboard';

/**
 * Escapes a field for CSV format by enclosing in double quotes if it contains
 * commas, quotes, or newlines, and escaping internal quotes.
 */
function escapeCsvCell(value: any): string {
  if (value === null || value === undefined) return '';
  const stringValue = String(value);
  if (
    stringValue.includes(',') ||
    stringValue.includes('"') ||
    stringValue.includes('\n') ||
    stringValue.includes('\r')
  ) {
    return `"${stringValue.replace(/"/g, '""')}"`;
  }
  return stringValue;
}

/**
 * Exports enquiries to a downloaded CSV file.
 */
export function exportEnquiriesToCsv(enquiries: RecentEnquiry[], filename = 'mnm-enquiries-export.csv'): boolean {
  if (!enquiries || enquiries.length === 0) return false;

  const headers = [
    'Enquiry ID',
    'Customer Name',
    'Email Address',
    'Phone Number',
    'Interested Destination',
    'Query Date',
    'Status',
    'Group Size',
    'Budget Tier',
    'Customer Message / Notes',
  ];

  const rows = enquiries.map((enq) => [
    escapeCsvCell(enq.id),
    escapeCsvCell(enq.name),
    escapeCsvCell(enq.email || (enq.contact.includes('@') ? enq.contact : '')),
    escapeCsvCell(enq.phone || (!enq.contact.includes('@') ? enq.contact : '')),
    escapeCsvCell(enq.destination),
    escapeCsvCell(enq.date),
    escapeCsvCell(enq.status.toUpperCase()),
    escapeCsvCell(enq.travelers || '2 Travelers'),
    escapeCsvCell(enq.budget || 'Standard'),
    escapeCsvCell(enq.message || ''),
  ]);

  const csvContent = [
    headers.join(','),
    ...rows.map((r) => r.join(',')),
  ].join('\r\n');

  // Prepend UTF-8 BOM so Excel and other spreadsheet viewers render correctly
  const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);

  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);

  return true;
}
