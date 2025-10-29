import React from 'react';
import DocumentHeader from './DocumentHeader';
import DocumentFooter from './DocumentFooter';
import { useCompanyBranding } from '@/hooks/use-company-branding';

interface SampleDocumentProps {
  documentType?: 'invoice' | 'quotation' | 'order';
  documentNumber?: string;
  date?: string;
  className?: string;
}

export const SampleDocument: React.FC<SampleDocumentProps> = ({
  documentType = 'invoice',
  documentNumber = 'INV-001',
  date = new Date().toLocaleDateString(),
  className = ''
}) => {
  const { currencySymbol } = useCompanyBranding();

  const getDocumentTitle = () => {
    switch (documentType) {
      case 'invoice': return 'INVOICE';
      case 'quotation': return 'QUOTATION';
      case 'order': return 'PURCHASE ORDER';
      default: return 'DOCUMENT';
    }
  };

  return (
    <div className={`max-w-4xl mx-auto bg-white p-8 shadow-lg ${className}`}>
      {/* Document Header */}
      <DocumentHeader 
        title={getDocumentTitle()}
        showLogo={true}
        className="mb-8"
      />

      {/* Document Number and Date */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <p className="text-sm text-gray-600">
            <span className="font-semibold">Document No:</span> {documentNumber}
          </p>
        </div>
        <div>
          <p className="text-sm text-gray-600">
            <span className="font-semibold">Date:</span> {date}
          </p>
        </div>
      </div>

      {/* Customer Details */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Bill To:</h3>
        <div className="bg-gray-50 p-4 rounded">
          <p className="font-semibold">ABC Company Ltd.</p>
          <p className="text-sm text-gray-600">123 Business Street</p>
          <p className="text-sm text-gray-600">Mumbai, Maharashtra 400001</p>
          <p className="text-sm text-gray-600">GSTIN: 27ABCDE1234F1Z5</p>
        </div>
      </div>

      {/* Items Table */}
      <div className="mb-6">
        <table className="w-full border-collapse border border-gray-300">
          <thead>
            <tr className="bg-gray-50">
              <th className="border border-gray-300 px-4 py-2 text-left text-sm font-semibold">Item</th>
              <th className="border border-gray-300 px-4 py-2 text-left text-sm font-semibold">Description</th>
              <th className="border border-gray-300 px-4 py-2 text-center text-sm font-semibold">Qty</th>
              <th className="border border-gray-300 px-4 py-2 text-right text-sm font-semibold">Rate</th>
              <th className="border border-gray-300 px-4 py-2 text-right text-sm font-semibold">Amount</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="border border-gray-300 px-4 py-2 text-sm">001</td>
              <td className="border border-gray-300 px-4 py-2 text-sm">Cotton T-Shirt</td>
              <td className="border border-gray-300 px-4 py-2 text-center text-sm">100</td>
              <td className="border border-gray-300 px-4 py-2 text-right text-sm">{currencySymbol}250.00</td>
              <td className="border border-gray-300 px-4 py-2 text-right text-sm">{currencySymbol}25,000.00</td>
            </tr>
            <tr>
              <td className="border border-gray-300 px-4 py-2 text-sm">002</td>
              <td className="border border-gray-300 px-4 py-2 text-sm">Denim Jeans</td>
              <td className="border border-gray-300 px-4 py-2 text-center text-sm">50</td>
              <td className="border border-gray-300 px-4 py-2 text-right text-sm">{currencySymbol}800.00</td>
              <td className="border border-gray-300 px-4 py-2 text-right text-sm">{currencySymbol}40,000.00</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Totals */}
      <div className="flex justify-end mb-6">
        <div className="w-64">
          <div className="flex justify-between py-2 border-b border-gray-200">
            <span className="text-sm font-semibold">Subtotal:</span>
            <span className="text-sm">{currencySymbol}65,000.00</span>
          </div>
          <div className="flex justify-between py-2 border-b border-gray-200">
            <span className="text-sm font-semibold">GST (18%):</span>
            <span className="text-sm">{currencySymbol}11,700.00</span>
          </div>
          <div className="flex justify-between py-2 text-lg font-bold">
            <span>Total:</span>
            <span>{currencySymbol}76,700.00</span>
          </div>
        </div>
      </div>

      {/* Document Footer */}
      <DocumentFooter />
    </div>
  );
};

export default SampleDocument;
