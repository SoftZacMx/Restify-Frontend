import React, { useEffect, useRef, useState } from 'react';
import { Upload, X } from 'lucide-react';
import { cn } from '@/shared/lib/utils';

interface ImageUploadProps {
  value?: string | null;
  onChange: (url: string | null) => void;
  onUpload?: (file: File) => Promise<string>;
  file?: File | null;
  onFileChange?: (file: File | null) => void;
  disabled?: boolean;
  className?: string;
  size?: 'md' | 'lg';
  emptyAsBox?: boolean;
}

export const ImageUpload: React.FC<ImageUploadProps> = ({
  value,
  onChange,
  onUpload,
  file,
  onFileChange,
  disabled = false,
  className,
  size = 'md',
  emptyAsBox = false,
}) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const isDeferred = !!onFileChange;

  useEffect(() => {
    if (!isDeferred) return;
    if (!file) {
      setPreview(null);
      return;
    }
    const objectUrl = URL.createObjectURL(file);
    setPreview(objectUrl);
    return () => URL.revokeObjectURL(objectUrl);
  }, [file, isDeferred]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (inputRef.current) inputRef.current.value = '';
    if (!selected) return;

    if (onFileChange) {
      onFileChange(selected);
      return;
    }

    const objectUrl = URL.createObjectURL(selected);
    setPreview(objectUrl);

    if (onUpload) {
      setIsUploading(true);
      try {
        const url = await onUpload(selected);
        onChange(url);
      } catch {
        setPreview(null);
      } finally {
        setIsUploading(false);
        URL.revokeObjectURL(objectUrl);
      }
    }
  };

  const handleRemove = () => {
    onFileChange?.(null);
    setPreview(null);
    onChange(null);
    if (inputRef.current) inputRef.current.value = '';
  };

  const displayUrl = preview || value;
  const boxSizeClass = size === 'lg' ? 'h-40 w-40' : 'h-24 w-24';

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
          <div
            className={cn(
              'rounded-lg border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-800/80 flex items-center justify-center overflow-hidden',
              boxSizeClass
            )}
          >
            <img
              src={displayUrl}
              alt="Preview"
              className="h-full w-full object-cover"
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
            'rounded-lg border border-dashed border-slate-300 dark:border-slate-600',
            'text-slate-500 dark:text-slate-400 hover:border-blue-400 hover:text-blue-500 transition-colors',
            'disabled:opacity-50 disabled:cursor-not-allowed',
            emptyAsBox
              ? cn('flex flex-col items-center justify-center gap-2 text-xs', boxSizeClass)
              : 'flex items-center gap-2 px-4 py-2 text-sm'
          )}
        >
          <Upload className={emptyAsBox ? 'h-5 w-5' : 'h-4 w-4'} />
          {isUploading ? 'Subiendo...' : emptyAsBox ? 'Subir' : 'Subir imagen'}
        </button>
      )}
    </div>
  );
};
