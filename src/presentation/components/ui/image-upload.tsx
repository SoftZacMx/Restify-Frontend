import React, { useRef, useState } from 'react';
import { Upload, X } from 'lucide-react';
import { cn } from '@/shared/lib/utils';

interface ImageUploadProps {
  value?: string | null;
  onChange: (url: string | null) => void;
  onUpload?: (file: File) => Promise<string>;
  disabled?: boolean;
  className?: string;
}

export const ImageUpload: React.FC<ImageUploadProps> = ({
  value,
  onChange,
  onUpload,
  disabled = false,
  className,
}) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const objectUrl = URL.createObjectURL(file);
    setPreview(objectUrl);

    if (onUpload) {
      setIsUploading(true);
      try {
        const url = await onUpload(file);
        onChange(url);
      } catch {
        setPreview(null);
      } finally {
        setIsUploading(false);
        URL.revokeObjectURL(objectUrl);
      }
    }

    if (inputRef.current) inputRef.current.value = '';
  };

  const handleRemove = () => {
    setPreview(null);
    onChange(null);
    if (inputRef.current) inputRef.current.value = '';
  };

  const displayUrl = preview || value;

  return (
    <div className={cn('space-y-2', className)}>
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        onChange={handleFileChange}
        className="hidden"
        disabled={disabled || isUploading}
      />

      {displayUrl ? (
        <div className="relative inline-block">
          <div className="h-24 w-24 rounded-lg border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-800/80 flex items-center justify-center overflow-hidden">
            <img
              src={displayUrl}
              alt="Preview"
              className="max-h-full max-w-full object-contain"
              onError={(e) => {
                (e.target as HTMLImageElement).style.opacity = '0.2';
              }}
            />
          </div>
          {!disabled && (
            <button
              type="button"
              onClick={handleRemove}
              className="absolute -top-2 -right-2 h-5 w-5 rounded-full bg-red-500 text-white flex items-center justify-center hover:bg-red-600 transition-colors"
            >
              <X className="h-3 w-3" />
            </button>
          )}
          {isUploading && (
            <div className="absolute inset-0 rounded-lg bg-black/50 flex items-center justify-center">
              <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent" />
            </div>
          )}
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={disabled || isUploading}
          className={cn(
            'flex items-center gap-2 px-4 py-2 rounded-lg border border-dashed border-slate-300 dark:border-slate-600',
            'text-sm text-slate-500 dark:text-slate-400 hover:border-blue-400 hover:text-blue-500 transition-colors',
            'disabled:opacity-50 disabled:cursor-not-allowed'
          )}
        >
          <Upload className="h-4 w-4" />
          {isUploading ? 'Subiendo...' : 'Subir imagen'}
        </button>
      )}
    </div>
  );
};
