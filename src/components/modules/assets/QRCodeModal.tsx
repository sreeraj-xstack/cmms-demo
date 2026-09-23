'use client';

import React from 'react';
import { Asset } from '@/types/asset';
import { X, QrCode, Printer, Copy, Check, Download, Layers } from 'lucide-react';
import { QRCodeSVG } from '@/components/common/QRCodeSVG';
import { generateQRPayload, parseQRPayload } from '@/lib/utils/qrUtils';

interface QRCodeModalProps {
  asset: Asset | null;
  onClose: () => void;
}

export function QRCodeModal({ asset, onClose }: QRCodeModalProps) {
  const [copied, setCopied] = React.useState(false);

  if (!asset) return null;

  // Auto-generate clean, structured QR code payload if current qr_code is empty/plain
  const parsed = parseQRPayload(asset.qr_code || '');
  const qrPayloadString = parsed.isStructured
    ? asset.qr_code!
    : generateQRPayload('asset', {
        id: asset.id,
        asset_tag: asset.asset_tag,
        name: asset.name,
        location: asset.location,
        category: asset.machine_type,
      });

  const handleCopy = () => {
    navigator.clipboard.writeText(qrPayloadString);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadSVG = () => {
    const svgElement = document.getElementById(`asset-qr-svg-${asset.id}`);
    if (!svgElement) return;

    const svgData = new XMLSerializer().serializeToString(svgElement);
    const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
    const svgUrl = URL.createObjectURL(svgBlob);

    const downloadLink = document.createElement('a');
    downloadLink.href = svgUrl;
    downloadLink.download = `QR_${asset.asset_tag}.svg`;
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
            <QrCode className="h-5 w-5 text-amber-500" />
            <h3 className="text-sm font-bold text-slate-900">Asset QR Tag & Payload</h3>
          </div>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-xl border border-slate-200 text-slate-400 hover:text-slate-700 hover:bg-stone-50 transition-all"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Tag Printable Visual Card */}
        <div className="rounded-2xl border-2 border-slate-900 bg-white p-5 text-center space-y-4 shadow-sm print:m-0 print:border-2">
          <div className="flex items-center justify-between border-b border-slate-200 pb-2">
            <div className="flex items-center gap-1.5">
              <img src="/xstack-logo.webp" alt="XStack Logo" className="h-4 w-4 object-contain" />
              <span className="text-[10px] font-extrabold text-slate-900 uppercase tracking-wider">XSTACK CMMS</span>
            </div>
            <span className="font-mono text-[10px] font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded border border-amber-400/40">
              {asset.asset_tag}
            </span>
          </div>

          {/* Real High-Resolution SVG QR Matrix */}
          <div className="mx-auto flex items-center justify-center">
            <div id={`asset-qr-svg-${asset.id}`}>
              <QRCodeSVG value={qrPayloadString} size={160} />
            </div>
          </div>

          <div className="space-y-0.5">
            <h4 className="text-xs font-bold text-slate-900">{asset.name}</h4>
            <p className="text-[11px] text-slate-500 font-medium">{asset.location}</p>
            <span className="inline-block text-[10px] font-semibold text-slate-400">
              Machine: {asset.machine_type}
            </span>
          </div>
        </div>

        {/* Controls */}
        <div className="grid grid-cols-3 gap-2 pt-1">
          <button
            onClick={handleCopy}
            title="Copy QR Payload JSON"
            className="flex items-center justify-center gap-1 rounded-xl border border-slate-200 bg-stone-50 py-2 text-[11px] font-semibold text-slate-700 hover:bg-stone-100 transition-all"
          >
            {copied ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5 text-slate-400" />}
            {copied ? 'Copied' : 'Payload'}
          </button>

          <button
            onClick={handleDownloadSVG}
            title="Download Vector SVG"
            className="flex items-center justify-center gap-1 rounded-xl border border-slate-200 bg-stone-50 py-2 text-[11px] font-semibold text-slate-700 hover:bg-stone-100 transition-all"
          >
            <Download className="h-3.5 w-3.5 text-slate-400" />
            SVG
          </button>

          <button
            onClick={handlePrint}
            className="flex items-center justify-center gap-1 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 py-2 text-[11px] font-bold transition-all shadow-xs"
          >
            <Printer className="h-3.5 w-3.5" />
            Print
          </button>
        </div>
      </div>
    </div>
  );
}
