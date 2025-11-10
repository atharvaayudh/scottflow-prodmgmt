import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Upload, X, Image as ImageIcon, ExternalLink, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface ImageFile {
  id: string;
  url: string;
  file?: File;
  name?: string;
  size?: number;
  uploading?: boolean;
}

interface MultiImageUploadProps {
  label?: string;
  value?: string[]; // Array of URLs
  onChange: (urls: string[]) => void;
  bucket?: string;
  folder?: string;
  disabled?: boolean;
  className?: string;
  maxFiles?: number;
  maxSize?: number; // in MB
  accept?: string;
  allowAllFiles?: boolean; // If true, accepts all file types, not just images
}

export const MultiImageUpload: React.FC<MultiImageUploadProps> = ({
  label = "Images",
  value = [],
  onChange,
  bucket = "order-images",
  folder = "uploads",
  disabled = false,
  className = "",
  maxFiles = 10,
  maxSize = 10,
  accept = "image/*",
  allowAllFiles = false
}) => {
  const [uploading, setUploading] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState<{ [key: string]: number }>({});
  const [selectedMainImage, setSelectedMainImage] = useState<number>(0);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  // Set main image when value changes
  useEffect(() => {
    if (value.length > 0 && selectedMainImage >= value.length) {
      setSelectedMainImage(0);
    }
  }, [value.length, selectedMainImage]);

  const uploadImage = async (file: File): Promise<string> => {
    try {
      // Validate file type (only if allowAllFiles is false)
      if (!allowAllFiles && !file.type.startsWith('image/')) {
        throw new Error('Please select an image file');
      }

      // Validate file size
      if (file.size > maxSize * 1024 * 1024) {
        throw new Error(`File size must be less than ${maxSize}MB`);
      }

      // Skip bucket existence check - proceed directly to upload
      // The upload will fail with a clearer error if the bucket doesn't exist or has permission issues

      // Generate unique filename
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = `${folder}/${fileName}`;

      // Upload file
      const { error: uploadError } = await supabase.storage
        .from(bucket)
        .upload(filePath, file);

      if (uploadError) {
        throw new Error(`Upload failed: ${uploadError.message}`);
      }

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from(bucket)
        .getPublicUrl(filePath);

      return publicUrl;
    } catch (error) {
      console.error('Error uploading image:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to upload image';
      toast({
        title: "Upload Error",
        description: errorMessage,
        variant: "destructive",
      });
      throw error;
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    // Check max files limit
    if (value.length + files.length > maxFiles) {
      toast({
        title: "Upload Error",
        description: `Maximum ${maxFiles} files allowed. You can upload ${maxFiles - value.length} more file(s).`,
        variant: "destructive",
      });
      return;
    }

    // Upload all files in parallel for better performance
    setUploading('batch');
    const uploadPromises = files.map(async (file, index) => {
      const fileId = `file-${Date.now()}-${index}`;
      try {
        setUploadProgress(prev => ({ ...prev, [fileId]: 0 }));
        const imageUrl = await uploadImage(file);
        setUploadProgress(prev => ({ ...prev, [fileId]: 100 }));
        return imageUrl;
      } catch (error) {
        setUploadProgress(prev => {
          const newState = { ...prev };
          delete newState[fileId];
          return newState;
        });
        return null;
      }
    });

    const results = await Promise.all(uploadPromises);
    const successfulUploads = results.filter((url): url is string => url !== null);
    
    if (successfulUploads.length > 0) {
      onChange([...value, ...successfulUploads]);
      toast({
        title: "Success",
        description: `${successfulUploads.length} image(s) uploaded successfully`,
      });
    }

    setUploading(null);
    setUploadProgress({});

    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    
    const files = allowAllFiles 
      ? Array.from(e.dataTransfer.files)
      : Array.from(e.dataTransfer.files).filter(f => f.type.startsWith('image/'));
    if (files.length === 0) return;

    // Check max files limit
    if (value.length + files.length > maxFiles) {
      toast({
        title: "Upload Error",
        description: `Maximum ${maxFiles} files allowed. You can upload ${maxFiles - value.length} more file(s).`,
        variant: "destructive",
      });
      return;
    }

    // Upload all files in parallel
    setUploading('batch');
    const uploadPromises = files.map(async (file, index) => {
      const fileId = `file-${Date.now()}-${index}`;
      try {
        setUploadProgress(prev => ({ ...prev, [fileId]: 0 }));
        const imageUrl = await uploadImage(file);
        setUploadProgress(prev => ({ ...prev, [fileId]: 100 }));
        return imageUrl;
      } catch (error) {
        setUploadProgress(prev => {
          const newState = { ...prev };
          delete newState[fileId];
          return newState;
        });
        return null;
      }
    });

    const results = await Promise.all(uploadPromises);
    const successfulUploads = results.filter((url): url is string => url !== null);
    
    if (successfulUploads.length > 0) {
      onChange([...value, ...successfulUploads]);
      toast({
        title: "Success",
        description: `${successfulUploads.length} image(s) uploaded successfully`,
      });
    }

    setUploading(null);
    setUploadProgress({});
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
  };

  const removeImage = (index: number) => {
    const newUrls = value.filter((_, i) => i !== index);
    onChange(newUrls);
  };

  const openImageInNewTab = (url: string) => {
    window.open(url, '_blank');
  };

  return (
    <div className={`space-y-2 ${className}`}>
      <Label>{label} ({value.length}/{maxFiles})</Label>
      
      {/* Upload Area */}
      {value.length < maxFiles && (
        <div
          className={`
            border-2 border-dashed rounded-lg p-4 text-center transition-colors
            ${dragOver ? 'border-primary bg-primary/5' : 'border-gray-300'}
            ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:border-primary/50'}
          `}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onClick={() => !disabled && fileInputRef.current?.click()}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept={accept}
            multiple
            onChange={handleFileChange}
            className="hidden"
            disabled={disabled || uploading !== null}
          />
          
          {uploading ? (
            <div className="space-y-2">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
              <p className="text-sm text-gray-600">Uploading...</p>
            </div>
          ) : (
            <div className="space-y-2">
              <Upload className="h-8 w-8 text-gray-400 mx-auto" />
              <div>
                <p className="text-sm text-gray-600">
                  Drop {allowAllFiles ? 'files' : 'images'} here or click to browse
                </p>
                <p className="text-xs text-gray-500">
                  You can select multiple {allowAllFiles ? 'files' : 'images'} at once ({maxFiles} max, {maxSize}MB each)
                </p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Amazon-style Image Gallery or File List */}
      {value.length > 0 && (
        <div className="space-y-4">
          {/* Main Image/File Display */}
          <div className="relative w-full aspect-square max-w-md mx-auto rounded-lg border bg-muted overflow-hidden group">
            {allowAllFiles && !value[selectedMainImage]?.match(/\.(jpg|jpeg|png|gif|webp|svg)$/i) ? (
              // Show file icon for non-image files
              <div className="w-full h-full flex flex-col items-center justify-center p-8">
                <div className="text-6xl mb-4">📄</div>
                <p className="text-sm text-gray-600 text-center break-all">
                  {value[selectedMainImage]?.split('/').pop() || 'File'}
                </p>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="mt-4"
                  onClick={() => window.open(value[selectedMainImage], '_blank')}
                >
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Open File
                </Button>
              </div>
            ) : (
              <img
                src={value[selectedMainImage]}
                alt={`Main ${allowAllFiles ? 'file' : 'image'} ${selectedMainImage + 1}`}
                className="w-full h-full object-contain"
                onError={(e) => {
                  e.currentTarget.src = '';
                  e.currentTarget.alt = 'Failed to load';
                }}
              />
            )}
            
            {/* Overlay Actions on Main Image */}
            <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
              <Button
                type="button"
                variant="secondary"
                size="sm"
                className="h-8 w-8 p-0"
                onClick={(e) => {
                  e.stopPropagation();
                  openImageInNewTab(value[selectedMainImage]);
                }}
                title="Open in new tab"
              >
                <ExternalLink className="h-4 w-4" />
              </Button>
              <Button
                type="button"
                variant="destructive"
                size="sm"
                className="h-8 w-8 p-0"
                onClick={(e) => {
                  e.stopPropagation();
                  const newUrls = value.filter((_, i) => i !== selectedMainImage);
                  onChange(newUrls);
                  if (selectedMainImage >= newUrls.length && newUrls.length > 0) {
                    setSelectedMainImage(newUrls.length - 1);
                  }
                }}
                disabled={disabled}
                title="Remove image"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Thumbnail Strip */}
          {value.length > 1 && (
            <div className="flex gap-2 overflow-x-auto pb-2">
              {value.map((url, index) => {
                const isImage = url.match(/\.(jpg|jpeg|png|gif|webp|svg)$/i) || (!allowAllFiles);
                const fileName = url.split('/').pop() || `File ${index + 1}`;
                
                return (
                  <button
                    key={index}
                    type="button"
                    onClick={() => setSelectedMainImage(index)}
                    className={`
                      flex-shrink-0 relative w-20 h-20 rounded border-2 overflow-hidden transition-all
                      ${index === selectedMainImage 
                        ? 'border-primary ring-2 ring-primary ring-offset-2' 
                        : 'border-gray-300 hover:border-primary/50'
                      }
                    `}
                  >
                    {isImage ? (
                      <img
                        src={url}
                        alt={`Thumbnail ${index + 1}`}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.currentTarget.src = '';
                        }}
                      />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center bg-muted p-1">
                        <div className="text-2xl mb-0.5">📄</div>
                        <p className="text-[8px] text-gray-600 text-center truncate w-full" title={fileName}>
                          {fileName.length > 10 ? fileName.substring(0, 8) + '..' : fileName}
                        </p>
                      </div>
                    )}
                    {index === selectedMainImage && (
                      <div className="absolute inset-0 bg-primary/20"></div>
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default MultiImageUpload;
