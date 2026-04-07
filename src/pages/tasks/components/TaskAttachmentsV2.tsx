import { useState, useCallback, useEffect} from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  HiOutlinePaperClip,
  HiOutlineDownload,
  HiOutlineTrash,
  HiOutlineEye,
  HiOutlineRefresh,
  HiOutlineExclamationCircle,
  HiOutlineX,
  HiOutlineDocumentText,
  HiOutlinePhotograph,
} from 'react-icons/hi';
import { attachmentsApi } from '../../../api/attachments';
import { ApiError } from '../../../api/client';
import { useAuth } from '../../../context/useAuth';
import { ADMIN_ROLES, MANAGER_ROLES } from '../../../types/enums';
import type { Attachment, ProcessingStatus } from '../../../types/attachment';
import { FadeIn, StaggerList, StaggerItem, Badge } from '../../../components/ui';
import { ConfirmModal } from '../../../components/ui/ConfirmModal';

/* ── Helpers ── */

const IMAGE_EXTENSIONS = ['jpg', 'jpeg', 'png', 'webp', 'gif'];
const MAX_FILE_SIZE = 20 * 1024 * 1024; // 20 MB
const ALLOWED_EXTENSIONS = ['jpg', 'jpeg', 'png', 'webp', 'gif', 'pdf', 'doc', 'docx', 'xls', 'xlsx', 'zip'];

function isImage(ext: string) {
  return IMAGE_EXTENSIONS.includes(ext.toLowerCase());
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function statusBadgeVariant(status: ProcessingStatus): 'blue' | 'amber' | 'green' | 'red' {
  switch (status) {
    case 'pending': return 'blue';
    case 'processing': return 'amber';
    case 'ready': return 'green';
    case 'failed': return 'red';
  }
}

function validateFile(file: File): string | null {
  if (file.size > MAX_FILE_SIZE) return `El archivo excede el límite de ${MAX_FILE_SIZE / 1024 / 1024} MB.`;
  const ext = file.name.split('.').pop()?.toLowerCase() ?? '';
  if (!ALLOWED_EXTENSIONS.includes(ext)) return `Tipo no permitido (.${ext}). Tipos: ${ALLOWED_EXTENSIONS.join(', ')}.`;
  return null;
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

  // Reset state when attachment changes, derive initial loading from open state
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
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
        >
          <div className="absolute inset-0 bg-black/60" onClick={onClose} />
          <motion.div
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
                <HiOutlineX className="h-5 w-5" />
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
                    <HiOutlineDownload className="h-4 w-4" /> Descargar archivo
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
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/* ── Download Button (requests download signed URL) ── */

function DownloadButton({ attachmentId, label }: { attachmentId: number; label: string }) {
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
      <HiOutlineDownload className="h-4 w-4" />
      {loading ? 'Generando enlace…' : label}
    </button>
  );
}

/* ── Attachment Thumbnail ── */

function AttachmentThumbnail({
  attachment,
  onPreview,
  onDelete,
  canDelete,
}: {
  attachment: Attachment;
  onPreview: () => void;
  onDelete: () => void;
  canDelete: boolean;
}) {
  const [thumbUrl, setThumbUrl] = useState<string | null>(null);
  const imageFile = isImage(attachment.extension);
  const isReady = attachment.processing_status === 'ready';

  useEffect(() => {
    if (!isReady || !imageFile) return;
    attachmentsApi.getSignedUrl(attachment.id)
      .then((res) => setThumbUrl(res.url))
      .catch(() => { /* thumbnail load failure is non-critical */ });
  }, [attachment.id, isReady, imageFile]);

  return (
    <div className="group relative rounded-sm border border-slate-200 dark:border-white/5 bg-white dark:bg-cyber-grafito overflow-hidden shadow-sm transition-shadow hover:shadow-md">
      {/* Thumbnail area */}
      <button
        type="button"
        onClick={isReady ? onPreview : undefined}
        disabled={!isReady}
        className="flex h-32 w-full items-center justify-center bg-slate-50 dark:bg-white/5 disabled:cursor-not-allowed"
      >
        {imageFile && thumbUrl ? (
          <img src={thumbUrl} alt={attachment.original_name} className="h-full w-full object-cover" />
        ) : imageFile && isReady ? (
          <HiOutlineRefresh className="h-6 w-6 animate-spin text-slate-300 dark:text-slate-600" />
        ) : (
          <div className="flex flex-col items-center gap-1 text-slate-400 dark:text-slate-500">
            {imageFile ? <HiOutlinePhotograph className="h-8 w-8" /> : <HiOutlineDocumentText className="h-8 w-8" />}
            <span className="text-xs font-medium uppercase">{attachment.extension}</span>
          </div>
        )}
      </button>

      {/* Info */}
      <div className="px-3 py-2.5">
        <p className="truncate text-xs font-medium text-slate-900 dark:text-white" title={attachment.original_name}>
          {attachment.original_name}
        </p>
        <div className="mt-1 flex items-center gap-2">
          <span className="text-[10px] text-slate-400 dark:text-slate-500">{formatBytes(attachment.size_processed ?? attachment.size_original)}</span>
          {attachment.processing_status !== 'ready' && (
            <Badge variant={statusBadgeVariant(attachment.processing_status)} size="sm">
              {attachment.processing_status === 'pending' ? 'Pendiente' :
               attachment.processing_status === 'processing' ? 'Procesando' : 'Error'}
            </Badge>
          )}
        </div>
        <p className="mt-0.5 text-[10px] text-slate-400 dark:text-slate-500 truncate">
          {attachment.uploader?.name ?? 'Desconocido'}
        </p>
      </div>

      {/* Hover overlay actions */}
      {isReady && (
        <div className="absolute right-1.5 top-1.5 flex gap-1 opacity-0 transition-opacity group-hover:opacity-100">
          <button
            type="button"
            onClick={onPreview}
            className="rounded-lg bg-white/90 dark:bg-cyber-grafito/90 p-1.5 text-slate-600 dark:text-slate-400 shadow-sm hover:bg-white dark:hover:bg-white/5 hover:text-cyber-radar dark:hover:text-cyber-radar-light"
            title="Ver"
          >
            <HiOutlineEye className="h-4 w-4" />
          </button>
          {canDelete && (
            <button
              type="button"
              onClick={onDelete}
              className="rounded-lg bg-white/90 dark:bg-cyber-grafito/90 p-1.5 text-slate-600 dark:text-slate-400 shadow-sm hover:bg-white dark:hover:bg-white/5 hover:text-red-600 dark:hover:text-red-400"
              title="Eliminar"
            >
              <HiOutlineTrash className="h-4 w-4" />
            </button>
          )}
        </div>
      )}
    </div>
  );
}

/* ── Task Attachments Section (v2) ── */

export function TaskAttachmentsV2({
  taskId,
  requiresAttachment,
}: {
  taskId: number;
  requiresAttachment: boolean;
}) {
  const { user } = useAuth();
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [loading, setLoading] = useState(true);
  const [previewAttachment, setPreviewAttachment] = useState<Attachment | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Attachment | null>(null);
  const [deleting, setDeleting] = useState(false);

  const isSuperAdmin = user?.role.slug ? ADMIN_ROLES.includes(user.role.slug) : false;
  const isManager = user?.role.slug ? MANAGER_ROLES.includes(user.role.slug) : false;

  const loadAttachments = useCallback(async () => {
    try {
      const res = await attachmentsApi.listByTask(taskId);
      setAttachments(res.data);
    } catch {
      // silent fail, list stays empty
    } finally {
      setLoading(false);
    }
  }, [taskId]);

  useEffect(() => { loadAttachments(); }, [loadAttachments]);

  const canDeleteAttachment = (a: Attachment) => {
    if (isSuperAdmin) return true;
    if (isManager) return true; // manager can delete attachments from their areas
    return a.uploaded_by === Number(user?.id); // worker can only delete own
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await attachmentsApi.delete(deleteTarget.id);
      setAttachments((prev) => prev.filter((a) => a.id !== deleteTarget.id));
    } catch {
      // silent
    } finally {
      setDeleting(false);
      setDeleteTarget(null);
    }
  };

  const hasAttachments = attachments.length > 0;

  // Don't render anything until we know there are attachments to show
  if (!loading && !hasAttachments) return null;

  return (
    <>
      <FadeIn delay={0.15} className="mt-6 rounded-sm border border-slate-200 dark:border-white/5 bg-white dark:bg-cyber-grafito p-6 shadow-sm">
        <h3 className="mb-4 flex items-center gap-2 font-semibold text-slate-900 dark:text-white">
          <HiOutlinePaperClip className="h-5 w-5 text-cyber-navy dark:text-cyber-radar-light" />
          Adjuntos
          {hasAttachments && (
            <span className="rounded-full bg-cyber-navy/5 dark:bg-cyber-navy/20/30 px-2 py-0.5 text-xs font-medium text-cyber-navy dark:text-cyber-radar-light dark:text-cyber-radar-light">
              {attachments.length}
            </span>
          )}
          {requiresAttachment && (
            <Badge variant="amber" size="sm">Requerido</Badge>
          )}
        </h3>

        {loading ? (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-48 animate-pulse rounded-sm bg-slate-100 dark:bg-white/5" />
            ))}
          </div>
        ) : (
          <StaggerList className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {attachments.map((a) => (
              <StaggerItem key={a.id}>
                <AttachmentThumbnail
                  attachment={a}
                  onPreview={() => setPreviewAttachment(a)}
                  onDelete={() => setDeleteTarget(a)}
                  canDelete={canDeleteAttachment(a)}
                />
              </StaggerItem>
            ))}
          </StaggerList>
        )}
      </FadeIn>

      {/* Preview modal */}
      <AttachmentPreviewModal
        attachment={previewAttachment}
        open={!!previewAttachment}
        onClose={() => setPreviewAttachment(null)}
      />

      {/* Delete confirmation */}
      <ConfirmModal
        open={!!deleteTarget}
        title="Eliminar adjunto"
        message={`¿Estás seguro de eliminar "${deleteTarget?.original_name}"? Esta acción no se puede deshacer.`}
        confirmLabel={deleting ? 'Eliminando…' : 'Eliminar'}
        variant="danger"
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </>
  );
}

/* ── Upload Form (v2) ── */

export function UploadFormPanelV2({
  taskId,
  areaId,
  onUploaded,
  onClose,
}: {
  taskId?: number;
  areaId?: number;
  onUploaded: () => void;
  onClose: () => void;
}) {
  const [file, setFile] = useState<File | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0] ?? null;
    if (selected) {
      const error = validateFile(selected);
      if (error) { setFileError(error); setFile(null); return; }
    }
    setFileError(null);
    setFile(selected);
  };

  const handleUpload = async () => {
    if (!file || uploading) return;
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      if (taskId) formData.append('task_id', String(taskId));
      if (areaId) formData.append('area_id', String(areaId));
      await attachmentsApi.upload(formData);
      onUploaded();
      setFile(null);
    } catch (err) {
      setFileError(err instanceof ApiError ? err.data.message : 'Error al subir el archivo');
    } finally {
      setUploading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
      exit={{ opacity: 0, height: 0 }}
      className="mt-4 overflow-hidden"
    >
      <div className="rounded-sm border border-slate-200 dark:border-white/5 bg-white dark:bg-cyber-grafito p-6 shadow-sm">
        <h3 className="mb-3 font-semibold text-slate-900 dark:text-white">Subir archivo</h3>
        <div className="space-y-3">
          <div className="flex items-center justify-center rounded-sm border-2 border-dashed border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 p-6 transition-colors hover:border-cyber-radar/30 dark:hover:border-cyber-radar">
            <label className="flex cursor-pointer flex-col items-center gap-2 text-center">
              <HiOutlinePaperClip className="h-8 w-8 text-slate-400 dark:text-slate-500" />
              <span className="text-sm text-slate-600 dark:text-slate-400">
                {file ? file.name : 'Selecciona o arrastra un archivo'}
              </span>
              <input
                type="file"
                accept={ALLOWED_EXTENSIONS.map(e => `.${e}`).join(',')}
                onChange={handleFileChange}
                className="hidden"
              />
              {file && (
                <span className="text-xs text-slate-400 dark:text-slate-500">{formatBytes(file.size)}</span>
              )}
            </label>
          </div>
          {fileError && <p className="text-sm text-red-500 dark:text-red-400">{fileError}</p>}
          <p className="text-xs text-slate-400 dark:text-slate-500">
            Máx. 20 MB. Tipos: {ALLOWED_EXTENSIONS.join(', ')}
          </p>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={handleUpload}
              disabled={!file || uploading}
              className="rounded-sm bg-cyber-radar px-4 py-2 text-sm font-medium text-white hover:bg-cyber-radar-light disabled:opacity-50"
            >
              {uploading ? 'Subiendo…' : 'Subir'}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="rounded-sm bg-white dark:bg-cyber-grafito border border-slate-200 dark:border-white/10 px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/5"
            >
              Cancelar
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
