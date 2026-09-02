'use client';

import React, { useState } from 'react';
import { AttachmentFileType } from '@/types/breakdownTicket';
import { uploadAttachmentFile } from '@/lib/services/breakdownTicketService';
import { UploadCloud, Image, Mic, Video, X, Loader2 } from 'lucide-react';

interface MediaUploaderProps {
  onMediaUploaded: (media: { file_url: string; file_type: AttachmentFileType; file_name: string }) => void;
  uploadedMedia: { file_url: string; file_type: AttachmentFileType; file_name: string }[];
  onRemoveMedia: (index: number) => void;
}

export function MediaUploader({ onMediaUploaded, uploadedMedia, onRemoveMedia }: MediaUploaderProps) {
  const [uploading, setUploading] = useState(false);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const mime = file.type.toLowerCase();
      const ext = file.name.split('.').pop()?.toLowerCase() || '';

      let fileType: AttachmentFileType = 'photo';
      if (mime.startsWith('audio/') || ['mp3', 'wav', 'webm', 'ogg', 'm4a'].includes(ext)) {
        fileType = 'audio';
      } else if (mime.startsWith('video/') || ['mp4', 'mov', 'avi', 'mkv'].includes(ext)) {
        fileType = 'video';
      } else {
        fileType = 'photo';
      }

      try {
        const publicUrl = await uploadAttachmentFile(file);
        onMediaUploaded({
          file_url: publicUrl,
          file_type: fileType,
          file_name: file.name,
        });
      } catch (err) {
        console.error('File upload error:', err);
      }
    }

    setUploading(false);
    e.target.value = '';
  };

  const getMediaIcon = (type: AttachmentFileType) => {
    switch (type) {
      case 'photo':
        return <Image className="h-4 w-4 text-amber-600" />;
      case 'audio':
        return <Mic className="h-4 w-4 text-amber-600" />;
      case 'video':
        return <Video className="h-4 w-4 text-amber-600" />;
    }
  };

  return (
    <div className="space-y-3">
      <label className="font-semibold text-slate-700 block text-xs">
        Media Attachments (Photos, Voice Notes, Video Clips)
      </label>

      {/* Dropzone */}
      <label className="flex flex-col items-center justify-center w-full h-24 rounded-2xl border-2 border-dashed border-slate-200 bg-stone-50 hover:bg-amber-500/5 hover:border-amber-400 cursor-pointer transition-all p-3 text-center">
        {uploading ? (
          <div className="flex items-center gap-2 text-xs font-semibold text-amber-800">
            <Loader2 className="h-4 w-4 animate-spin text-amber-600" />
            Uploading Media File...
          </div>
        ) : (
          <div className="space-y-1">
            <UploadCloud className="h-5 w-5 text-slate-400 mx-auto" />
            <p className="text-xs font-semibold text-slate-700">Click or Drag to Upload Files</p>
            <p className="text-[10px] text-slate-400">
              Supports <span className="font-semibold text-slate-600">.HEIC, .MP3, .JPG, .PNG, .WAV, .MP4</span> files
            </p>
          </div>
        )}
        <input
          type="file"
          multiple
          accept="image/*,audio/*,video/*,.heic,.heif,.mp3,.wav,.mp4"
          onChange={handleFileChange}
          disabled={uploading}
          className="hidden"
        />
      </label>

      {/* Uploaded File List */}
      {uploadedMedia.length > 0 && (
        <div className="space-y-2">
          <span className="text-[11px] font-bold text-slate-600 block">Attached Media Files ({uploadedMedia.length})</span>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {uploadedMedia.map((media, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between gap-2 rounded-xl border border-slate-200 bg-white p-2.5 shadow-xs text-xs"
              >
                <div className="flex items-center gap-2 overflow-hidden">
                  <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-50 border border-amber-300 flex-shrink-0">
                    {getMediaIcon(media.file_type)}
                  </div>
                  <span className="font-semibold text-slate-800 truncate" title={media.file_name}>
                    {media.file_name}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => onRemoveMedia(idx)}
                  className="flex h-6 w-6 items-center justify-center rounded-md border border-slate-200 text-slate-400 hover:text-red-600 hover:bg-stone-50 transition-all flex-shrink-0"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
