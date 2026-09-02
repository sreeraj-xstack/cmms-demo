'use client';

import React from 'react';
import { Asset } from '@/types/asset';
import { X, QrCode, Printer, Copy, Check, ShieldCheck } from 'lucide-react';

interface QRCodeModalProps {
  asset: Asset | null;
  onClose: () => void;
}

export function QRCodeModal({ asset, onClose }: QRCodeModalProps) {
  const [copied, setCopied] = React.useState(false);

  if (!asset) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(asset.qr_code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4">
      <div className="w-full max-w-sm rounded-2xl border border-slate-200 bg-white p-6 shadow-xl space-y-5 animate-in fade-in zoom-in duration-150">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <QrCode className="h-5 w-5 text-amber-500" />
            <h3 className="text-sm font-bold text-slate-900">Asset QR Code Tag</h3>
          </div>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-xl border border-slate-200 text-slate-400 hover:text-slate-700 hover:bg-stone-50 transition-all"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Tag Printable Visual Card */}
        <div className="rounded-2xl border-2 border-slate-900 bg-white p-6 text-center space-y-4 shadow-sm print:m-0 print:border-2">
          <div className="flex items-center justify-between border-b border-slate-200 pb-2">
            <span className="text-[10px] font-bold text-slate-900 uppercase tracking-wider">SOBHA CMMS</span>
            <span className="font-mono text-[10px] font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded border border-amber-400/40">
              {asset.asset_tag}
            </span>
          </div>

          {/* QR Box Visual Simulation */}
          <div className="mx-auto flex h-36 w-36 items-center justify-center rounded-2xl border-2 border-slate-900 bg-slate-50 p-2 shadow-inner">
            <div className="h-full w-full flex flex-col items-center justify-center border border-dashed border-slate-400 rounded-xl bg-white p-2">
              <QrCode className="h-16 w-16 text-slate-900 mb-1" />
              <span className="font-mono text-[9px] font-bold text-slate-800 truncate max-w-[110px]">
                {asset.qr_code}
              </span>
            </div>
          </div>

          <div className="space-y-0.5">
            <h4 className="text-xs font-bold text-slate-900">{asset.name}</h4>
            <p className="text-[11px] text-slate-500 font-medium">{asset.location}</p>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-2 pt-2">
          <button
            onClick={handleCopy}
            className="flex-1 flex items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-stone-50 py-2 text-xs font-semibold text-slate-700 hover:bg-stone-100 transition-all"
          >
            {copied ? <Check className="h-3.5 w-3.5 text-amber-600" /> : <Copy className="h-3.5 w-3.5 text-slate-400" />}
            {copied ? 'Payload Copied' : 'Copy Payload'}
          </button>

          <button
            onClick={handlePrint}
            className="flex-1 flex items-center justify-center gap-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 py-2 text-xs font-bold transition-all shadow-xs"
          >
            <Printer className="h-3.5 w-3.5" />
            Print Tag
          </button>
        </div>
      </div>
    </div>
  );
}
