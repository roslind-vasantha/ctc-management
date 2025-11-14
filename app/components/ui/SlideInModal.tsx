'use client';

import { ReactNode, useEffect, useRef } from 'react';
import { X, ChevronLeft } from 'lucide-react';

interface SlideInModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPrevious?: () => void;
  onNext?: () => void;
  children: ReactNode;
}

export const SlideInModal = ({
  isOpen,
  onClose,
  onPrevious,
  onNext,
  children,
}: SlideInModalProps) => {
  const modalRef = useRef<HTMLDivElement>(null);
  const previousFocus = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (isOpen) {
      previousFocus.current = document.activeElement as HTMLElement;
      modalRef.current?.focus();
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
      previousFocus.current?.focus();
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;

      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'ArrowLeft' && onPrevious) {
        onPrevious();
      } else if (e.key === 'ArrowRight' && onNext) {
        onNext();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose, onPrevious, onNext]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex"
      role="dialog"
      aria-modal="true"
    >
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black bg-opacity-30"
        onClick={onClose}
      />

      {/* Modal */}
      <div
        ref={modalRef}
        className="ml-auto w-full max-w-[40%] h-full bg-white shadow-[-4px_0_16px_rgba(0,0,0,0.1)] overflow-y-auto relative"
        onClick={(e) => e.stopPropagation()}
        tabIndex={-1}
      >
        {/* Header with back and close */}
        <div className="sticky top-0 bg-white border-b border-[var(--border)] px-8 py-4 flex items-center justify-between z-10">
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-[var(--muted)] transition-colors flex items-center gap-2 text-[var(--text-color)]"
            aria-label="Close modal"
          >
            <ChevronLeft size={20} />
            <span className="text-sm font-medium">Profile Details</span>
          </button>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-[var(--muted)] transition-colors"
            aria-label="Close"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="px-8 py-6">{children}</div>
      </div>
    </div>
  );
};
