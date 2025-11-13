'use client';

import { useState, useRef, DragEvent, ChangeEvent } from 'react';
import { Upload, FileText, X } from 'lucide-react';

interface FileUploadProps {
  label?: string;
  helperText?: string;
  accept?: string;
  maxSize?: number; // in MB
  onFileSelect: (file: File | null) => void;
  value?: File | null;
  fullWidth?: boolean;
}

export const FileUpload = ({
  label,
  helperText,
  accept,
  maxSize = 25,
  onFileSelect,
  value,
  fullWidth = false,
}: FileUploadProps) => {
  const [isDragging, setIsDragging] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);

    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFile(files[0]);
    }
  };

  const handleFileInput = (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFile(files[0]);
    }
  };

  const handleFile = (file: File) => {
    const fileSizeMB = file.size / (1024 * 1024);

    if (fileSizeMB > maxSize) {
      alert(`File size exceeds ${maxSize}MB limit`);
      return;
    }

    onFileSelect(file);

    // Simulate upload progress
    setUploadProgress(0);
    const interval = setInterval(() => {
      setUploadProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + 10;
      });
    }, 100);
  };

  const handleRemoveFile = () => {
    onFileSelect(null);
    setUploadProgress(0);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className={`${fullWidth ? 'w-full' : ''}`}>
      {label && (
        <label className="block text-xs font-normal text-[var(--text-color)] mb-1.5">
          {label}
        </label>
      )}

      <div
        onClick={!value ? handleClick : undefined}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`
          relative border-2 border-dashed rounded-lg p-6 text-center transition-colors
          ${isDragging ? 'border-[var(--primary)] bg-[var(--info-bg)]' : 'border-[var(--border)] bg-[var(--input-bg)]'}
          ${!value ? 'cursor-pointer hover:border-[var(--primary)]' : ''}
        `}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept={accept}
          onChange={handleFileInput}
          className="hidden"
        />

        {!value ? (
          <>
            <Upload className="w-8 h-8 mx-auto mb-3 text-[var(--primary)]" />
            <p className="text-sm text-[var(--primary)] font-medium mb-1">
              Click to Upload{' '}
              <span className="text-[var(--muted-foreground)]">or drag and drop</span>
            </p>
            <p className="text-xs text-[var(--muted-foreground)]">
              (Max. File Size: {maxSize} MB)
            </p>
          </>
        ) : (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <FileText className="w-5 h-5 text-[var(--text-color)]" />
                <div className="text-left">
                  <p className="text-sm font-medium text-[var(--text-color)]">
                    {value.name}
                  </p>
                  <p className="text-xs text-[var(--muted-foreground)]">
                    {(value.size / 1024).toFixed(2)} KB
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleRemoveFile();
                }}
                className="p-1 hover:bg-[var(--muted)] rounded transition-colors"
              >
                <X className="w-5 h-5 text-[var(--muted-foreground)]" />
              </button>
            </div>

            {uploadProgress > 0 && uploadProgress < 100 && (
              <div className="space-y-1">
                <div className="w-full bg-[var(--muted)] rounded-full h-1.5">
                  <div
                    className="bg-[var(--primary)] h-1.5 rounded-full transition-all duration-300"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
                <p className="text-xs text-[var(--muted-foreground)] text-right">
                  {uploadProgress}%
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      {helperText && (
        <p className="mt-1.5 text-xs text-[var(--muted-foreground)]">{helperText}</p>
      )}
    </div>
  );
};
