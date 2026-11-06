"use client";

import React, { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { filesApi, getApiErrorMessage } from "@/lib/api";
import { X } from "lucide-react";

/**
 * Props for the {@link UploadFileModal} component.
 */
interface UploadFileModalProps {
  /** The target domain entity category (e.g. "project", "task"). */
  entityType: string;
  /** Primary key ID of the parent entity. */
  entityId: number;
  /** Callback fired when modal is dismissed. */
  onClose: () => void;
  /** Callback fired upon successful upload. */
  onSuccess: () => void;
}

/**
 * Modal dialog for uploading binary attachments and linking them to domain entities.
 */
export function UploadFileModal({ entityType, entityId, onClose, onSuccess }: UploadFileModalProps) {
  const [file, setFile] = useState<File | null>(null);
  const [errorMsg, setErrorMsg] = useState("");

  const uploadMutation = useMutation({
    mutationFn: async () => {
      if (!file) throw new Error("Please select a file to upload.");
      return filesApi.upload(entityType, entityId, file);
    },
    onSuccess: () => onSuccess(),
    onError: (err: unknown) => setErrorMsg(getApiErrorMessage(err, "Failed to upload file")),
  });

  return (
    <div className="fixed inset-0 bg-black/75 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-sm w-full p-6 space-y-4 shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <h2 className="text-base font-bold text-white">Upload Project Document</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>
        {errorMsg && (
          <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-400 text-xs rounded-xl">
            {errorMsg}
          </div>
        )}
        <div className="text-xs space-y-2">
          <p className="text-slate-400">Supported: PDF, Excel, Word, Images, TXT, CSV (Max 16MB)</p>
          <input
            type="file"
            onChange={(e) => setFile(e.target.files?.[0] || null)}
            className="w-full text-slate-300 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-blue-600 file:text-white hover:file:bg-blue-500"
          />
        </div>
        <div className="flex justify-end gap-3 pt-3 border-t border-slate-800">
          <button onClick={onClose} className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs">
            Cancel
          </button>
          <button
            onClick={() => uploadMutation.mutate()}
            disabled={!file || uploadMutation.isPending}
            className="px-5 py-2 rounded-xl bg-blue-600 text-white text-xs font-bold"
          >
            {uploadMutation.isPending ? "Uploading..." : "Upload"}
          </button>
        </div>
      </div>
    </div>
  );
}
