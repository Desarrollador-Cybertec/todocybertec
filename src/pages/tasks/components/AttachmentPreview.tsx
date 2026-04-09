import { useState, useEffect } from 'react';
import { AnimatePresence, m } from 'framer-motion';
import {
  HiOutlineDownload,
  HiOutlineExclamationCircle,
  HiOutlineRefresh,
  HiOutlineX,
  HiOutlineDocumentText,
} from 'react-icons/hi';
import { attachmentsApi } from '../../../api/attachments';
import { ApiError } from '../../../api/client';
import type { Attachment } from '../../../types/attachment';

const IMAGE_EXTENSIONS = ['jpg', 'jpeg', 'png', 'webp', 'gif'];

function isImage(ext: string) {
  return IMAGE_EXTENSIONS.includes(ext.toLowerCase());
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

/* ── Download Button ── */

export function DownloadButton({ attachmentId, label }: { attachmentId: number; label: string }) {
  const [loading, setLoading] = useState(false);

  const handleDownload = async () => {
    setLoading(true);
    try {
      const { url } = await attachmentsApi.getSignedUrl(attachmentId, true);
      window.open(url, '_blank', 'noopener');
    } catch {
      // silent fail — user can retry
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      type="button"
      onClick={handleDownload}
      disabled={loading}
      className="inline-flex items-center gap-1.5 rounded-sm bg-cyber-radar px-4 py-2 text-sm font-medium text-white hover:bg-cyber-radar-light disabled:opacity-50"
    >
      <HiOutlineDownload className="h-5 w-5" />
      {loading ? 'Generando enlace…' : label}
    </button>
  );
}

/* ── Attachment Preview Modal ── */

export function AttachmentPreviewModal({
  attachment,
  open,
  onClose,
}: {
  attachment: Attachment | null;
  open: boolean;
  onClose: () => void;
}) {
  const [url, setUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const attachmentId = open && attachment ? attachment.id : null;

  useEffect(() => {
    if (attachmentId == null) return;
    let cancelled = false;
    attachmentsApi.getSignedUrl(attachmentId)
      .then((res) => { if (!cancelled) { setUrl(res.url); setLoading(false); } })
      .catch((err) => {
        if (!cancelled) { setError(err instanceof ApiError ? err.data.message : 'No se pudo cargar el archivo'); setLoading(false); }
      });
    return () => {
      cancelled = true;
      setUrl(null);
      setLoading(true);
      setError('');
    };
  }, [attachmentId]);

  if (!attachment) return null;

  const imageFile = isImage(attachment.extension);

  return (
    <AnimatePresence>
      {open && (
        <m.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
        >
          <div className="absolute inset-0 bg-black/60" onClick={onClose} onKeyDown={(e) => e.key === 'Enter' && onClose()} role="button" tabIndex={0} aria-label="Cerrar" />
          <m.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="relative w-full max-w-3xl rounded-sm bg-white dark:bg-cyber-grafito shadow-xl overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-white/5 px-6 py-4">
              <div className="min-w-0 flex-1">
                <h3 className="truncate text-lg font-semibold text-slate-900 dark:text-white">{attachment.original_name}</h3>
                <p className="text-xs text-slate-400 dark:text-slate-500">
                  {formatBytes(attachment.size_processed ?? attachment.size_original)} · Subido por {attachment.uploader?.name ?? 'Desconocido'}
                </p>
              </div>
              <button type="button" onClick={onClose} className="ml-4 rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5 hover:text-slate-600 dark:hover:text-slate-300">
                <HiOutlineX className="h-6 w-6" />
              </button>
            </div>

            {/* Body */}
            <div className="flex items-center justify-center bg-slate-50 dark:bg-white/5 p-6" style={{ minHeight: 300 }}>
              {loading && (
                <div className="flex flex-col items-center gap-2 text-slate-400 dark:text-slate-500">
                  <HiOutlineRefresh className="h-8 w-8 animate-spin" />
                  <span className="text-sm">Cargando vista previa…</span>
                </div>
              )}
              {error && (
                <div className="flex flex-col items-center gap-2 text-red-500 dark:text-red-400">
                  <HiOutlineExclamationCircle className="h-8 w-8" />
                  <span className="text-sm">{error}</span>
                </div>
              )}
              {!loading && !error && url && imageFile && (
                <img src={url} alt={attachment.original_name} className="max-h-[60vh] max-w-full rounded-lg object-contain" />
              )}
              {!loading && !error && url && !imageFile && (
                <div className="flex flex-col items-center gap-3 text-slate-500 dark:text-slate-400">
                  <HiOutlineDocumentText className="h-16 w-16" />
                  <p className="text-sm">Vista previa no disponible para este tipo de archivo.</p>
                  <a
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 rounded-sm bg-cyber-radar px-4 py-2 text-sm font-medium text-white hover:bg-cyber-radar-light"
                  >
                    <HiOutlineDownload className="h-5 w-5" /> Descargar archivo
                  </a>
                </div>
              )}
            </div>

            {/* Footer */}
            {url && (
              <div className="flex justify-end gap-2 border-t border-slate-200 dark:border-white/5 px-6 py-3">
                <DownloadButton attachmentId={attachment.id} label="Descargar" />
              </div>
            )}
          </m.div>
        </m.div>
      )}
    </AnimatePresence>
  );
}
