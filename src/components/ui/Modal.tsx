import { useEffect, type ReactNode } from 'react';

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  /** 모바일에서 하단 시트로 표시 (기본 true) */
  sheetOnMobile?: boolean;
}

export function Modal({ open, onClose, title, children, sheetOnMobile = true }: ModalProps) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [open, onClose]);

  if (!open) return null;

  const containerPos = sheetOnMobile
    ? 'items-end sm:items-center'
    : 'items-center';
  const panelShape = sheetOnMobile
    ? 'rounded-t-3xl sm:rounded-3xl'
    : 'rounded-3xl';

  return (
    <div
      className={`fixed inset-0 z-50 flex justify-center ${containerPos} animate-fade-in bg-black/40`}
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={title}
    >
      <div
        className={`w-full max-w-md animate-slide-up bg-white ${panelShape} p-5 shadow-2xl`}
        onClick={(e) => e.stopPropagation()}
        style={{ paddingBottom: 'calc(1.25rem + var(--safe-bottom))' }}
      >
        {title && (
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-bold text-gray-900">{title}</h2>
            <button
              onClick={onClose}
              aria-label="닫기"
              className="-mr-1 flex h-8 w-8 items-center justify-center rounded-full text-gray-400 transition-active hover:bg-gray-100"
            >
              ✕
            </button>
          </div>
        )}
        {children}
      </div>
    </div>
  );
}
