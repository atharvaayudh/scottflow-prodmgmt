import React from 'react';
import { useCompanyBranding } from '@/hooks/use-company-branding';

interface DocumentHeaderProps {
  title?: string;
  showLogo?: boolean;
  className?: string;
}

export const DocumentHeader: React.FC<DocumentHeaderProps> = ({ 
  title, 
  showLogo = true, 
  className = '' 
}) => {
  const {
    companyName,
    companyCode,
    address,
    city,
    state,
    pincode,
    phone,
    email,
    website,
    gstin,
    pan,
    cin,
    headerLogo,
  } = useCompanyBranding();

  const fullAddress = [address, city, state, pincode].filter(Boolean).join(', ');

  return (
    <div className={`flex justify-between items-start ${className}`}>
      {/* Company Info */}
      <div className="flex-1">
        {showLogo && headerLogo && (
          <div className="mb-4">
            <img
              src={headerLogo}
              alt={`${companyName} Logo`}
              className="h-16 object-contain"
            />
          </div>
        )}
        
        <div className="space-y-1">
          <h1 className="text-2xl font-bold text-gray-900">{companyName}</h1>
          <p className="text-sm text-gray-600">Code: {companyCode}</p>
          
          {fullAddress && (
            <p className="text-sm text-gray-600">{fullAddress}</p>
          )}
          
          <div className="flex flex-wrap gap-4 text-xs text-gray-500 mt-2">
            {phone && <span>Tel: {phone}</span>}
            {email && <span>Email: {email}</span>}
            {website && <span>Web: {website}</span>}
          </div>
          
          <div className="flex flex-wrap gap-4 text-xs text-gray-500 mt-1">
            {gstin && <span>GSTIN: {gstin}</span>}
            {pan && <span>PAN: {pan}</span>}
            {cin && <span>CIN: {cin}</span>}
          </div>
        </div>
      </div>

      {/* Document Title */}
      {title && (
        <div className="text-right">
          <h2 className="text-xl font-semibold text-gray-900">{title}</h2>
        </div>
      )}
    </div>
  );
};

export default DocumentHeader;
