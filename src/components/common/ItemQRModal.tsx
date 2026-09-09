'use client';

import React from 'react';
import { X, QrCode, Printer, Copy, Check, Download, ExternalLink } from 'lucide-react';
import { QRCodeSVG } from '@/components/common/QRCodeSVG';
import { generateItemQRUrl } from '@/lib/utils/qrUtils';

interface ItemQRModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  itemCode: string;
  itemName: string;
  location: string;
  itemType: 'asset' | 'spare_part' | 'tool';
  itemId: string;
  subText?: string;
}

export function ItemQRModal({
  isOpen,
  onClose,
  title,
  itemCode,
  itemName,
  location,
  itemType,
  itemId,
  subText,
}: ItemQRModalProps) {
  const [copied, setCopied] = React.useState(false);

  if (!isOpen) return null;

  const dynamicUrl = generateItemQRUrl(itemType, { id: itemId, code: itemCode });

  const handleCopyLink = () => {
    navigator.clipboard.writeText(dynamicUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadSVG = () => {
    const svgElement = document.getElementById(`qr-modal-svg-${itemId}`);
    if (!svgElement) return;

    const svgData = new XMLSerializer().serializeToString(svgElement);
    const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
    const svgUrl = URL.createObjectURL(svgBlob);

    const downloadLink = document.createElement('a');
    downloadLink.href = svgUrl;
    downloadLink.download = `QR_${itemCode}.svg`;
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
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
            <QrCode className="h-5 w-5 text-amber-600" />
            <h3 className="text-sm font-bold text-slate-900">{title}</h3>
          </div>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-xl border border-slate-200 text-slate-400 hover:text-slate-700 hover:bg-stone-50 transition-all"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Tag Card */}
        <div className="rounded-2xl border-2 border-slate-900 bg-white p-5 text-center space-y-4 shadow-xs print:m-0 print:border-2">
          <div className="flex items-center justify-between border-b border-slate-200 pb-2">
            <span className="text-[10px] font-extrabold text-slate-900 uppercase tracking-wider">SOBHA CMMS</span>
            <span className="font-mono text-[10px] font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded border border-amber-300">
              {itemCode}
            </span>
          </div>

          {/* Real High-Resolution Vector SVG QR Code */}
          <div className="mx-auto flex items-center justify-center">
            <div id={`qr-modal-svg-${itemId}`}>
              <QRCodeSVG value={dynamicUrl} size={160} />
            </div>
          </div>

          <div className="space-y-1">
            <h4 className="text-xs font-bold text-slate-900 leading-snug">{itemName}</h4>
            <p className="text-[11px] text-slate-500 font-medium">{location}</p>
            {subText && <p className="text-[10px] text-amber-800 font-semibold">{subText}</p>}
          </div>
        </div>

        {/* Dynamic Link URL Preview */}
        <div className="p-2.5 bg-stone-50 border border-slate-200 rounded-xl space-y-1">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
            Dynamic QR Web Link
          </span>
          <a
            href={dynamicUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[11px] font-mono font-bold text-amber-800 hover:underline truncate block flex items-center gap-1"
          >
            <ExternalLink className="w-3 h-3 text-amber-600 shrink-0" />
            <span className="truncate">{dynamicUrl}</span>
          </a>
        </div>

        {/* Action Controls */}
        <div className="grid grid-cols-3 gap-2 pt-1">
          <button
            onClick={handleCopyLink}
            className="flex items-center justify-center gap-1 rounded-xl border border-slate-200 bg-stone-50 py-2 text-[11px] font-semibold text-slate-700 hover:bg-stone-100 transition-all"
          >
            {copied ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5 text-slate-400" />}
            {copied ? 'Copied' : 'Copy Link'}
          </button>

          <button
            onClick={handleDownloadSVG}
            className="flex items-center justify-center gap-1 rounded-xl border border-slate-200 bg-stone-50 py-2 text-[11px] font-semibold text-slate-700 hover:bg-stone-100 transition-all"
          >
            <Download className="h-3.5 w-3.5 text-slate-400" />
            Download
          </button>

          <button
            onClick={handlePrint}
            className="flex items-center justify-center gap-1 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 py-2 text-[11px] font-bold transition-all shadow-xs"
          >
            <Printer className="h-3.5 w-3.5" />
            Print Tag
          </button>
        </div>
      </div>
    </div>
  );
}
