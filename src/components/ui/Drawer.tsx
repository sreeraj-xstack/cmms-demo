'use client';

import React from 'react';
import { X } from 'lucide-react';

interface DrawerProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  badge?: React.ReactNode;
  children: React.ReactNode;
  maxWidth?: 'lg' | 'xl' | '2xl' | '3xl';
}

export function Drawer({
  isOpen,
  onClose,
  title,
  subtitle,
  badge,
  children,
  maxWidth = '3xl',
}: DrawerProps) {
  if (!isOpen) return null;

  const maxWidthClass = {
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    '2xl': 'max-w-2xl',
    '3xl': 'max-w-3xl',
  }[maxWidth];

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-slate-900/50 backdrop-blur-xs">
      <div className="absolute inset-0" onClick={onClose} />

      <div className={`relative w-full ${maxWidthClass} h-full bg-white shadow-2xl flex flex-col justify-between overflow-hidden animate-in slide-in-from-right duration-200 z-10`}>
        {/* Drawer Header */}
        <div className="p-6 border-b border-slate-100 bg-stone-50 space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {badge}
            </div>

            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <div>
            <h1 className="text-lg font-bold text-slate-900 leading-snug">{title}</h1>
            {subtitle && <p className="text-xs text-slate-500 font-medium">{subtitle}</p>}
          </div>
        </div>

        {/* Drawer Body */}
        <div className="flex-1 overflow-y-auto p-6">
          {children}
        </div>
      </div>
    </div>
  );
}
