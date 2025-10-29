import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Upload, X, Image as ImageIcon, ExternalLink } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface ImageUploadProps {
  label?: string;
  value?: string;
  onChange: (url: string) => void;
  bucket?: string;
  folder?: string;
  disabled?: boolean;
  className?: string;
  previewSize?: 'sm' | 'md' | 'lg';
  showUrlInput?: boolean;
  accept?: string;
  maxSize?: number; // in MB
}

export const ImageUpload: React.FC<ImageUploadProps> = ({
  label = "Image",
  value = "",
  onChange,
  bucket = "product-images",
  folder = "uploads",
  disabled = false,
  className = "",
  previewSize = "md",
  showUrlInput = true,
  accept = "image/*",
  maxSize = 5
}) => {
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const previewSizes = {
    sm: "w-16 h-16",
    md: "w-32 h-32", 
    lg: "w-48 h-48"
  };

  const uploadImage = async (file: File) => {
    try {
      setUploading(true);

      // Validate file type
      if (!file.type.startsWith('image/')) {
        throw new Error('Please select an image file');
      }

      // Validate file size
      if (file.size > maxSize * 1024 * 1024) {
        throw new Error(`File size must be less than ${maxSize}MB`);
      }

      // Check if bucket exists
      const { data: buckets, error: bucketError } = await supabase.storage.listBuckets();
      if (bucketError) {
        console.error('Error listing buckets:', bucketError);
        // If we can't list buckets, try to proceed anyway - the upload will fail with a clearer error
        console.warn('Cannot list buckets due to permissions, attempting upload anyway...');
      } else {
        const targetBucket = buckets?.find(b => b.id === bucket);
        if (!targetBucket) {
          throw new Error(`${bucket} storage bucket not found. Please run the bucket creation script in Supabase SQL editor.`);
        }
      }

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
    } finally {
      setUploading(false);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const imageUrl = await uploadImage(file);
      onChange(imageUrl);
      toast({
        title: "Success",
        description: "Image uploaded successfully",
      });
    } catch (error) {
      // Error already handled in uploadImage
    }
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    
    const file = e.dataTransfer.files[0];
    if (!file) return;

    try {
      const imageUrl = await uploadImage(file);
      onChange(imageUrl);
      toast({
        title: "Success", 
        description: "Image uploaded successfully",
      });
    } catch (error) {
      // Error already handled in uploadImage
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
  };

  const removeImage = () => {
    onChange("");
  };

  const openImageInNewTab = () => {
    if (value) {
      window.open(value, '_blank');
    }
  };

  return (
    <div className={`space-y-2 ${className}`}>
      <Label>{label}</Label>
      
      {/* URL Input */}
      {showUrlInput && (
        <div className="flex gap-2">
          <Input
            placeholder="Image URL"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            disabled={disabled}
          />
          <span className="text-sm text-gray-500 self-center">OR</span>
        </div>
      )}

      {/* Upload Area */}
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
          onChange={handleFileChange}
          className="hidden"
          disabled={disabled}
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
                Drop an image here or click to browse
              </p>
              <p className="text-xs text-gray-500">
                Max size: {maxSize}MB
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Image Preview */}
      {value && (
        <div className="relative inline-block">
          <div className={`${previewSizes[previewSize]} rounded border bg-muted overflow-hidden`}>
            <img
              src={value}
              alt="Preview"
              className="w-full h-full object-contain"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
                const parent = e.currentTarget.parentElement;
                if (parent) {
                  parent.innerHTML = `
                    <div class="w-full h-full flex items-center justify-center">
                      <div class="text-center">
                        <svg class="h-8 w-8 text-gray-400 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                        </svg>
                        <p class="text-xs text-gray-500">Invalid Image</p>
                      </div>
                    </div>
                  `;
                }
              }}
            />
          </div>
          
          {/* Action Buttons */}
          <div className="absolute top-1 right-1 flex gap-1">
            <Button
              type="button"
              variant="secondary"
              size="sm"
              className="h-6 w-6 p-0"
              onClick={openImageInNewTab}
              title="Open in new tab"
            >
              <ExternalLink className="h-3 w-3" />
            </Button>
            <Button
              type="button"
              variant="destructive"
              size="sm"
              className="h-6 w-6 p-0"
              onClick={removeImage}
              disabled={disabled}
              title="Remove image"
            >
              <X className="h-3 w-3" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ImageUpload;
