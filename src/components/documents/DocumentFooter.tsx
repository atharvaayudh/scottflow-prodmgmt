import React from 'react';
import { useCompanyBranding } from '@/hooks/use-company-branding';

interface DocumentFooterProps {
  className?: string;
}

export const DocumentFooter: React.FC<DocumentFooterProps> = ({ className = '' }) => {
  const {
    authorizedSignatory,
    authorizedSignatoryName,
    authorizedSignatoryDesignation,
    footerText,
    termsConditions,
  } = useCompanyBranding();

  return (
    <div className={`mt-8 pt-4 border-t border-gray-200 ${className}`}>
      {/* Authorized Signatory */}
      <div className="flex justify-between items-end">
        <div className="flex-1">
          {termsConditions && (
            <div className="mb-4">
              <h4 className="text-sm font-semibold text-gray-900 mb-2">Terms & Conditions:</h4>
              <p className="text-xs text-gray-600 leading-relaxed">{termsConditions}</p>
            </div>
          )}
          
          {footerText && (
            <p className="text-sm text-gray-600">{footerText}</p>
          )}
        </div>

        {/* Signature Section */}
        <div className="text-center ml-8">
          {authorizedSignatory && (
            <div className="mb-2">
              <img
                src={authorizedSignatory}
                alt="Authorized Signatory"
                className="h-16 object-contain mx-auto"
              />
            </div>
          )}
          
          <div className="border-t border-gray-400 w-32 mx-auto mb-2"></div>
          
          <div className="text-xs text-gray-600">
            <p className="font-semibold">{authorizedSignatoryName}</p>
            <p>{authorizedSignatoryDesignation}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DocumentFooter;
