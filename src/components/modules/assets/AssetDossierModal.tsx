'use client';

import React, { useState, useEffect } from 'react';
import { Modal } from '@/components/ui/Modal';
import { StatusBadge } from '@/components/ui/StatusBadge';
import {
  FileText,
  Upload,
  Cpu,
  History,
  ShieldCheck,
  Calendar,
  AlertTriangle,
  Clock,
  Download,
  Trash2,
  Plus,
  Sparkles,
  ExternalLink
} from 'lucide-react';
import { AssetDossierData, DocumentCategory, UploadAssetDocumentInput } from '@/types/assetDocument';
import { fetchMachineDossier, uploadAssetDocument, deleteAssetDocument } from '@/lib/services/assetDocumentService';

interface AssetDossierModalProps {
  isOpen: boolean;
  onClose: () => void;
  assetId: string | null;
}

export default function AssetDossierModal({ isOpen, onClose, assetId }: AssetDossierModalProps) {
  const [activeTab, setActiveTab] = useState<'specs' | 'documents' | 'history' | 'pm'>('specs');
  const [dossier, setDossier] = useState<AssetDossierData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [uploadError, setUploadError] = useState('');

  // Upload Form State
  const [showUploadForm, setShowUploadForm] = useState(false);
  const [docCategory, setDocCategory] = useState<DocumentCategory>('manual');
  const [docTitle, setDocTitle] = useState('');
  const [docDescription, setDocDescription] = useState('');
  const [docVersion, setDocVersion] = useState('v1.0');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    if (isOpen && assetId) {
      loadDossier(assetId);
    }
  }, [isOpen, assetId]);

  const loadDossier = async (id: string) => {
    setIsLoading(true);
    try {
      const data = await fetchMachineDossier(id);
      setDossier(data);
    } catch (err) {
      console.error('Error loading Machine Dossier:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!assetId || !selectedFile || !docTitle) {
      setUploadError('Please provide document title and select a file.');
      return;
    }

    setIsUploading(true);
    setUploadError('');

    try {
      const input: UploadAssetDocumentInput = {
        asset_id: assetId,
        category: docCategory,
        title: docTitle,
        description: docDescription || undefined,
        file: selectedFile,
        version: docVersion,
      };

      await uploadAssetDocument(input);
      setShowUploadForm(false);
      setDocTitle('');
      setDocDescription('');
      setSelectedFile(null);
      await loadDossier(assetId);
    } catch (err: any) {
      setUploadError(err.message || 'Failed to upload document.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleDeleteDoc = async (docId: string) => {
    if (!confirm('Are you sure you want to delete this technical document?')) return;
    try {
      await deleteAssetDocument(docId);
      if (assetId) await loadDossier(assetId);
    } catch (err) {
      console.error('Error deleting document:', err);
    }
  };

  const getCategoryBadge = (cat: DocumentCategory) => {
    switch (cat) {
      case 'electrical_plan':
        return <span className="px-2 py-0.5 text-[10px] bg-amber-500/10 text-amber-600 border border-amber-500/20 font-bold rounded-md">Electrical Schematics</span>;
      case 'hydraulic_plan':
        return <span className="px-2 py-0.5 text-[10px] bg-cyan-500/10 text-cyan-600 border border-cyan-500/20 font-bold rounded-md">Hydraulic Plan</span>;
      case 'manual':
        return <span className="px-2 py-0.5 text-[10px] bg-blue-500/10 text-blue-600 border border-blue-500/20 font-bold rounded-md">OEM Manual</span>;
      case 'failure_report':
        return <span className="px-2 py-0.5 text-[10px] bg-red-500/10 text-red-600 border border-red-500/20 font-bold rounded-md">Failure Report</span>;
      default:
        return <span className="px-2 py-0.5 text-[10px] bg-slate-500/10 text-slate-600 border border-slate-500/20 font-bold rounded-md">{cat}</span>;
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={dossier ? `Machine Dossier: ${dossier.name}` : 'Machine Dossier (Digital Twin)'}
      subtitle={dossier ? `Tag: ${dossier.asset_code} • Category: ${dossier.category || 'Woodworking'}` : 'Asset Vault & Historical Intelligence'}
      icon={<Cpu className="w-5 h-5" />}
      maxWidth="4xl"
    >
      <div className="p-6">
        {isLoading || !dossier ? (
          <div className="py-12 text-center text-slate-500">
            <Clock className="w-8 h-8 animate-spin mx-auto mb-2 text-amber-500" />
            Compiling Digital Twin Machine Dossier...
          </div>
        ) : (
          <div>
            {/* Header Tabs */}
            <div className="flex border-b border-slate-200 mb-6 gap-2">
              <button
                onClick={() => setActiveTab('specs')}
                className={`pb-3 px-3 text-xs font-bold transition-all border-b-2 flex items-center gap-1.5 ${
                  activeTab === 'specs'
                    ? 'border-amber-500 text-amber-600'
                    : 'border-transparent text-slate-500 hover:text-slate-900'
                }`}
              >
                <Cpu className="w-4 h-4" />
                Asset Specs
              </button>
              <button
                onClick={() => setActiveTab('documents')}
                className={`pb-3 px-3 text-xs font-bold transition-all border-b-2 flex items-center gap-1.5 ${
                  activeTab === 'documents'
                    ? 'border-amber-500 text-amber-600'
                    : 'border-transparent text-slate-500 hover:text-slate-900'
                }`}
              >
                <FileText className="w-4 h-4" />
                Technical Document Vault ({dossier.documents.length})
              </button>
              <button
                onClick={() => setActiveTab('history')}
                className={`pb-3 px-3 text-xs font-bold transition-all border-b-2 flex items-center gap-1.5 ${
                  activeTab === 'history'
                    ? 'border-amber-500 text-amber-600'
                    : 'border-transparent text-slate-500 hover:text-slate-900'
                }`}
              >
                <History className="w-4 h-4" />
                Failure Timeline & MTBF ({dossier.total_failures_count})
              </button>
            </div>

            {/* TAB 1: Asset Specs */}
            {activeTab === 'specs' && (
              <div className="space-y-6">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-stone-50 rounded-xl border border-slate-200">
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold uppercase block">Asset Status</span>
                    <StatusBadge status={dossier.status} />
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold uppercase block">Criticality</span>
                    <span className="text-xs font-bold text-slate-900 capitalize">{dossier.criticality}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold uppercase block">Serial Number</span>
                    <span className="text-xs font-mono font-bold text-slate-700">{dossier.serial_number || 'N/A'}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold uppercase block">Model Number</span>
                    <span className="text-xs font-bold text-slate-700">{dossier.model_number || 'N/A'}</span>
                  </div>
                </div>

                {/* Downtime Statistics */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl flex items-center gap-3">
                    <div className="p-3 bg-amber-500/20 text-amber-700 rounded-xl">
                      <Clock className="w-6 h-6" />
                    </div>
                    <div>
                      <span className="text-xs text-slate-600 font-medium">Total Unplanned Downtime</span>
                      <h4 className="text-xl font-black text-slate-900">{dossier.total_downtime_hours} Hours</h4>
                    </div>
                  </div>

                  <div className="p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-3">
                    <div className="p-3 bg-red-500/20 text-red-700 rounded-xl">
                      <AlertTriangle className="w-6 h-6" />
                    </div>
                    <div>
                      <span className="text-xs text-slate-600 font-medium">Historical Failure Events</span>
                      <h4 className="text-xl font-black text-slate-900">{dossier.total_failures_count} Breakdowns</h4>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: Technical Document Vault */}
            {activeTab === 'documents' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                    Uploaded Technical Schematics & OEM Documentation
                  </h4>
                  <button
                    onClick={() => setShowUploadForm(!showUploadForm)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-black bg-amber-500 hover:bg-amber-400 rounded-lg shadow-sm"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Upload Technical Document
                  </button>
                </div>

                {/* Upload Document Form */}
                {showUploadForm && (
                  <form onSubmit={handleFileUpload} className="p-4 bg-slate-50 border border-amber-300 rounded-xl space-y-3">
                    {uploadError && (
                      <p className="text-xs text-red-600 font-semibold">{uploadError}</p>
                    )}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 mb-1">Category</label>
                        <select
                          value={docCategory}
                          onChange={(e) => setDocCategory(e.target.value as DocumentCategory)}
                          className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-200 rounded-lg text-slate-900"
                        >
                          <option value="manual">OEM Operating Manual</option>
                          <option value="electrical_plan">Electrical & Wiring Plan</option>
                          <option value="hydraulic_plan">Hydraulic Schematic</option>
                          <option value="photo">Asset Photo / Spec Sheet</option>
                          <option value="compliance_doc">Safety Compliance</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 mb-1">Document Title *</label>
                        <input
                          type="text"
                          placeholder="e.g. Homag Edgebander Electrical Circuit Diagram"
                          value={docTitle}
                          onChange={(e) => setDocTitle(e.target.value)}
                          required
                          className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-200 rounded-lg text-slate-900"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">File Attachment (PDF / Image) *</label>
                      <input
                        type="file"
                        onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                        required
                        className="w-full text-xs text-slate-600 file:mr-3 file:py-1 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-amber-50 file:text-amber-700 hover:file:bg-amber-100"
                      />
                    </div>

                    <div className="flex justify-end gap-2 pt-2">
                      <button
                        type="button"
                        onClick={() => setShowUploadForm(false)}
                        className="px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-200 rounded-lg"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={isUploading}
                        className="px-4 py-1.5 text-xs font-bold text-black bg-amber-500 hover:bg-amber-400 rounded-lg shadow-sm"
                      >
                        {isUploading ? 'Uploading...' : 'Save & Attach to Asset'}
                      </button>
                    </div>
                  </form>
                )}

                {/* Documents Table */}
                {dossier.documents.length === 0 ? (
                  <div className="py-8 text-center text-xs text-slate-500 bg-slate-50 rounded-xl border border-dashed border-slate-300">
                    No technical schematics or manuals attached yet. Upload files to index them for AI Search.
                  </div>
                ) : (
                  <div className="space-y-2">
                    {dossier.documents.map((doc) => (
                      <div
                        key={doc.id}
                        className="p-3 bg-white border border-slate-200 rounded-xl flex items-center justify-between gap-3 hover:border-slate-300 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                            <FileText className="w-5 h-5" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <h5 className="text-xs font-bold text-slate-900">{doc.title}</h5>
                              {getCategoryBadge(doc.category)}
                            </div>
                            <p className="text-[11px] text-slate-500 mt-0.5">
                              Uploaded: {new Date(doc.created_at).toLocaleDateString()} • Version: {doc.version || 'v1.0'}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <a
                            href={doc.file_url}
                            target="_blank"
                            rel="noreferrer"
                            className="p-1.5 text-slate-500 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
                            title="View Document"
                          >
                            <ExternalLink className="w-4 h-4" />
                          </a>
                          <button
                            onClick={() => handleDeleteDoc(doc.id)}
                            className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Delete Document"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* TAB 3: Machine Failure History Timeline */}
            {activeTab === 'history' && (
              <div className="space-y-4">
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                  Historical Breakdown Timeline & Resolution Logs
                </h4>

                {dossier.failure_history.length === 0 ? (
                  <div className="py-8 text-center text-xs text-slate-500 bg-slate-50 rounded-xl border border-dashed border-slate-300">
                    No historical failure events recorded for this machine. Excellent reliability record.
                  </div>
                ) : (
                  <div className="relative pl-6 border-l-2 border-slate-200 space-y-6">
                    {dossier.failure_history.map((item) => (
                      <div key={item.id} className="relative">
                        {/* Timeline Bullet */}
                        <div className="absolute -left-[31px] top-0 w-4 h-4 rounded-full bg-amber-500 border-2 border-white shadow-sm" />

                        <div className="p-3.5 bg-stone-50 border border-slate-200 rounded-xl space-y-2">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-mono font-bold text-amber-700">{item.ticket_number}</span>
                              <h5 className="text-xs font-bold text-slate-900">{item.title}</h5>
                            </div>
                            <span className="text-[10px] text-slate-500 font-medium">
                              {new Date(item.created_at).toLocaleDateString()}
                            </span>
                          </div>

                          <p className="text-xs text-slate-600">{item.description}</p>

                          <div className="p-2.5 bg-white rounded-lg border border-slate-200 text-[11px] text-slate-700">
                            <span className="font-bold text-slate-900 block mb-0.5">Resolution Summary:</span>
                            {item.resolution_summary}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </Modal>
  );
}
