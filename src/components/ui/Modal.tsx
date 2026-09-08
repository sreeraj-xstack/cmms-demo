'use client';

import React from 'react';
import { X } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  icon?: React.ReactNode;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl';
  children: React.ReactNode;
}

export function Modal({
  isOpen,
  onClose,
  title,
  subtitle,
  icon,
  maxWidth = '2xl',
  children,
}: ModalProps) {
  if (!isOpen) return null;

  const maxWidthClass = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    '2xl': 'max-w-2xl',
    '3xl': 'max-w-3xl',
    '4xl': 'max-w-4xl',
  }[maxWidth];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4 overflow-y-auto">
      <div className={`bg-white rounded-2xl shadow-2xl border border-slate-200 w-full ${maxWidthClass} my-8 overflow-hidden animate-in fade-in zoom-in-95 duration-150`}>
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-stone-50">
          <div className="flex items-center gap-2.5">
            {icon && <div className="p-2 bg-amber-500/10 rounded-lg text-amber-600">{icon}</div>}
            <div>
              <h2 className="text-base font-bold text-slate-900 leading-snug">{title}</h2>
              {subtitle && <p className="text-xs text-slate-500 font-medium">{subtitle}</p>}
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Modal Body */}
        {children}
      </div>
    </div>
  );
}
