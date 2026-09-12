import React, { useEffect, useRef, useState } from 'react';
import { Camera, Upload, X } from 'lucide-react';
import { cn } from '@/shared/lib/utils';

interface ImageUploadProps {
  value?: string | null;
  onChange: (url: string | null) => void;
  onUpload?: (file: File) => Promise<string>;
  file?: File | null;
  onFileChange?: (file: File | null) => void;
  disabled?: boolean;
  className?: string;
  size?: 'md' | 'lg' | 'featured';
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
  const isFeatured = size === 'featured';
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
        <div className={cn('relative', isFeatured ? 'w-full' : 'inline-block')}>
          <div
            role="button"
            tabIndex={disabled ? -1 : 0}
            aria-label="Cambiar imagen"
            onClick={() => !disabled && inputRef.current?.click()}
            onKeyDown={(e) => {
              if (!disabled && (e.key === 'Enter' || e.key === ' ')) {
                e.preventDefault();
                inputRef.current?.click();
              }
            }}
            className={cn(
              'relative flex items-center justify-center overflow-hidden cursor-pointer',
              isFeatured
                ? 'group w-full max-w-[400px] mx-auto aspect-[4/3] rounded-xl border border-slate-100 dark:border-border bg-slate-50 dark:bg-card/80 shadow-sm'
                : cn(
                    'rounded-lg border border-slate-200 dark:border-border bg-slate-50 dark:bg-card/80',
                    boxSizeClass
                  ),
              disabled && 'cursor-default'
            )}
          >
            <img
              src={displayUrl}
              alt="Preview"
              className={cn(
                'h-full w-full object-cover',
                isFeatured && 'transition-transform duration-300 group-hover:scale-105'
              )}
              onError={(e) => {
                (e.target as HTMLImageElement).style.opacity = '0.2';
              }}
            />
            {isFeatured && !disabled && (
              <span className="pointer-events-none absolute inset-0 flex items-end justify-center rounded-xl bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                <span className="pb-4 text-sm font-medium text-white flex items-center gap-2">
                  <Camera className="h-4 w-4" />
                  Cambiar imagen
                </span>
              </span>
            )}
          </div>
          {!disabled && (
            <button
              type="button"
              onClick={handleRemove}
              className={cn(
                'absolute flex items-center justify-center rounded-full bg-red-500 text-white hover:bg-red-600 transition-colors',
                isFeatured ? 'top-3 right-3 h-7 w-7' : '-top-2 -right-2 h-5 w-5'
              )}
            >
              <X className={isFeatured ? 'h-4 w-4' : 'h-3 w-3'} />
            </button>
          )}
          {isUploading && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
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
            'border border-dashed border-slate-300 dark:border-border',
            'text-slate-500 dark:text-muted-foreground hover:border-primary hover:text-primary/80 transition-colors',
            'disabled:opacity-50 disabled:cursor-not-allowed',
            isFeatured
              ? 'flex w-full max-w-[400px] mx-auto aspect-[4/3] flex-col items-center justify-center gap-2 rounded-xl bg-slate-50/60 dark:bg-card/40'
              : emptyAsBox
                ? cn('flex flex-col items-center justify-center gap-2 text-xs rounded-lg', boxSizeClass)
                : 'flex items-center gap-2 px-4 py-2 text-sm rounded-lg'
          )}
        >
          {isFeatured ? (
            <>
              <span className="flex h-11 w-11 items-center justify-center rounded-full bg-slate-100 dark:bg-card">
                <Upload className="h-5 w-5 text-slate-500 dark:text-muted-foreground" />
              </span>
              <span className="text-sm font-medium text-slate-600 dark:text-foreground">
                {isUploading ? 'Subiendo...' : 'Subir imagen'}
              </span>
            </>
          ) : (
            <>
              <Upload className={emptyAsBox ? 'h-5 w-5' : 'h-4 w-4'} />
              {isUploading ? 'Subiendo...' : emptyAsBox ? 'Subir' : 'Subir imagen'}
            </>
          )}
        </button>
      )}
    </div>
  );
};
