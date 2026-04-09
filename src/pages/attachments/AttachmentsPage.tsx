import { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  HiOutlinePaperClip,
  HiOutlineEye,
  HiOutlineTrash,
  HiOutlineDownload,
  HiOutlineDocumentText,
  HiOutlinePhotograph,
  HiOutlineChevronLeft,
  HiOutlineChevronRight,
  HiOutlineSearch,
} from 'react-icons/hi';
import { attachmentsApi } from '../../api/attachments';
import { areasApi } from '../../api/areas';
import type { Attachment } from '../../types/attachment';
import type { Area } from '../../types/area';
import { PageTransition, FadeIn, Badge } from '../../components/ui';
import { SkeletonList } from '../../components/ui';
import { ConfirmModal } from '../../components/ui/ConfirmModal';
import { AttachmentPreviewModal } from '../tasks/components/AttachmentPreview';
import { formatDate } from '../../utils';

/* ── Helpers ── */

const IMAGE_EXTENSIONS = ['jpg', 'jpeg', 'png', 'webp', 'gif'];

function isImage(ext: string) {
  return IMAGE_EXTENSIONS.includes(ext.toLowerCase());
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

/* ── Main Page ── */

export function AttachmentsPage() {
  const [areas, setAreas] = useState<Area[]>([]);
  const [selectedAreaId, setSelectedAreaId] = useState<number | null>(null);
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState('');
  const [previewAttachment, setPreviewAttachment] = useState<Attachment | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Attachment | null>(null);
  const [deleting, setDeleting] = useState(false);

  // Load areas
  useEffect(() => {
    areasApi.listAll().then(setAreas).catch(() => {});
  }, []);

  const loadAttachments = useCallback(async () => {
    setLoading(true);
    try {
      if (!selectedAreaId) {
        setAttachments([]);
        setTotal(0);
        setLastPage(1);
        setLoading(false);
        return;
      }
      const params = `page=${page}&per_page=20`;
      const res = await attachmentsApi.listByArea(selectedAreaId, params);
      setAttachments(res.data);
      setTotal(res.meta.total);
      setLastPage(res.meta.last_page);
    } catch {
      setAttachments([]);
    } finally {
      setLoading(false);
    }
  }, [selectedAreaId, page]);

  useEffect(() => { loadAttachments(); }, [loadAttachments]);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await attachmentsApi.delete(deleteTarget.id);
      setAttachments((prev) => prev.filter((a) => a.id !== deleteTarget.id));
      setTotal((t) => t - 1);
    } catch {
      // silent
    } finally {
      setDeleting(false);
      setDeleteTarget(null);
    }
  };

  const handleDownload = async (id: number) => {
    try {
      const { url } = await attachmentsApi.getSignedUrl(id, true);
      window.open(url, '_blank', 'noopener');
    } catch {
      // silent
    }
  };

  // Client-side filter by name
  const filtered = search
    ? attachments.filter((a) => a.original_name.toLowerCase().includes(search.toLowerCase()))
    : attachments;

  return (
    <PageTransition>
      <div className="mx-auto max-w-6xl space-y-6">
        {/* Header */}
        <FadeIn className="flex flex-wrap items-center justify-between gap-4 rounded-sm border border-slate-200 dark:border-white/5 bg-white dark:bg-cyber-grafito px-6 py-5 shadow-sm">
          <div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Adjuntos</h2>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              Vista general de archivos adjuntos por área.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <select
              value={selectedAreaId ?? ''}
              onChange={(e) => { setSelectedAreaId(e.target.value ? Number(e.target.value) : null); setPage(1); }}
              className="rounded-sm bg-white dark:bg-cyber-grafito text-slate-900 dark:text-white border border-slate-300 dark:border-white/10 px-4 py-2.5 text-sm focus:border-cyber-radar focus:outline-none"
            >
              <option value="">Seleccionar área</option>
              {areas.map((a) => (
                <option key={a.id} value={a.id}>{a.name}</option>
              ))}
            </select>
          </div>
        </FadeIn>

        {!selectedAreaId ? (
          <FadeIn className="flex flex-col items-center justify-center rounded-sm border border-slate-200 dark:border-white/5 bg-white dark:bg-cyber-grafito py-16 shadow-sm">
            <HiOutlinePaperClip className="mb-3 h-12 w-12 text-slate-300 dark:text-slate-600" />
            <p className="text-sm text-slate-500 dark:text-slate-400">Selecciona un área para ver sus adjuntos.</p>
          </FadeIn>
        ) : loading ? (
          <SkeletonList />
        ) : (
          <FadeIn className="rounded-sm border border-slate-200 dark:border-white/5 bg-white dark:bg-cyber-grafito shadow-sm">
            {/* Toolbar */}
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 dark:border-white/5 px-6 py-4">
              <div className="flex items-center gap-2">
                <HiOutlinePaperClip className="h-6 w-6 text-cyber-navy dark:text-cyber-radar-light" />
                <h3 className="font-semibold text-slate-900 dark:text-white">
                  {total} archivo{total !== 1 ? 's' : ''}
                </h3>
              </div>
              <div className="relative">
                <HiOutlineSearch className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400 dark:text-slate-500" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Buscar por nombre…"
                  className="rounded-sm bg-white dark:bg-cyber-grafito border border-slate-200 dark:border-white/10 py-2 pl-9 pr-4 text-sm text-slate-900 dark:text-white focus:border-cyber-radar focus:outline-none"
                />
              </div>
            </div>

            {/* Table */}
            {filtered.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <HiOutlinePaperClip className="mb-2 h-10 w-10 text-slate-300 dark:text-slate-600" />
                <p className="text-sm text-slate-500 dark:text-slate-400">No hay archivos disponibles.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="border-b border-slate-200 dark:border-white/5 text-xs uppercase tracking-wider text-slate-400 dark:text-slate-500">
                    <tr>
                      <th className="px-6 py-3 font-medium">Archivo</th>
                      <th className="px-6 py-3 font-medium">Tipo</th>
                      <th className="px-6 py-3 font-medium">Tamaño</th>
                      <th className="px-6 py-3 font-medium">Subido por</th>
                      <th className="px-6 py-3 font-medium">Contexto</th>
                      <th className="px-6 py-3 font-medium">Fecha</th>
                      <th className="px-6 py-3 font-medium">Estado</th>
                      <th className="px-6 py-3 font-medium">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50 dark:divide-white/5">
                    {filtered.map((a) => (
                      <tr key={a.id} className="transition-colors hover:bg-slate-50 dark:hover:bg-white/5/50">
                        <td className="px-6 py-3">
                          <div className="flex items-center gap-3">
                            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-50 dark:bg-white/5">
                              {isImage(a.extension) ? (
                                <HiOutlinePhotograph className="h-5 w-5 text-cyber-navy dark:text-cyber-radar-light" />
                              ) : (
                                <HiOutlineDocumentText className="h-5 w-5 text-slate-400 dark:text-slate-500" />
                              )}
                            </div>
                            <div className="min-w-0">
                              <p className="truncate font-medium text-slate-900 dark:text-white" title={a.original_name}>
                                {a.original_name}
                              </p>
                              <p className="text-xs text-slate-400 dark:text-slate-500">.{a.extension}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-3 text-slate-500 dark:text-slate-400">{a.mime_type}</td>
                        <td className="px-6 py-3 text-slate-500 dark:text-slate-400">{formatBytes(a.size_processed ?? a.size_original)}</td>
                        <td className="px-6 py-3 text-slate-700 dark:text-slate-300">{a.uploader?.name ?? 'Desconocido'}</td>
                        <td className="px-6 py-3">
                          {a.task_id ? (
                            <Link to={`/tasks/${a.task_id}`} className="text-cyber-radar dark:text-cyber-radar-light hover:underline">
                              Tarea #{a.task_id}
                            </Link>
                          ) : (
                            <span className="text-slate-400 dark:text-slate-500">Área</span>
                          )}
                        </td>
                        <td className="px-6 py-3 text-slate-500 dark:text-slate-400">{formatDate(a.created_at)}</td>
                        <td className="px-6 py-3">
                          <Badge
                            variant={a.processing_status === 'ready' ? 'green' : a.processing_status === 'failed' ? 'red' : 'amber'}
                            size="sm"
                          >
                            {a.processing_status === 'ready' ? 'Listo' : a.processing_status === 'failed' ? 'Error' : 'Procesando'}
                          </Badge>
                        </td>
                        <td className="px-6 py-3">
                          <div className="flex items-center gap-1">
                            {a.processing_status === 'ready' && (
                              <>
                                <button
                                  type="button"
                                  onClick={() => setPreviewAttachment(a)}
                                  className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 dark:hover:bg-white/10 hover:text-cyber-radar dark:hover:text-cyber-radar-light"
                                  title="Ver"
                                >
                                  <HiOutlineEye className="h-5 w-5" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleDownload(a.id)}
                                  className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 dark:hover:bg-white/10 hover:text-green-600 dark:hover:text-green-400"
                                  title="Descargar"
                                >
                                  <HiOutlineDownload className="h-5 w-5" />
                                </button>
                              </>
                            )}
                            <button
                              type="button"
                              onClick={() => setDeleteTarget(a)}
                              className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 dark:hover:bg-white/10 hover:text-red-600 dark:hover:text-red-400"
                              title="Eliminar"
                            >
                              <HiOutlineTrash className="h-5 w-5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Pagination */}
            {lastPage > 1 && (
              <div className="flex items-center justify-between border-t border-slate-200 dark:border-white/5 px-6 py-3">
                <p className="text-xs text-slate-400 dark:text-slate-500">
                  Página {page} de {lastPage} · {total} archivo{total !== 1 ? 's' : ''}
                </p>
                <div className="flex gap-1">
                  <button
                    type="button"
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page <= 1}
                    className="rounded-lg border border-slate-200 dark:border-white/10 p-1.5 text-slate-500 dark:text-slate-400 disabled:opacity-30 hover:bg-slate-50 dark:hover:bg-white/5"
                  >
                    <HiOutlineChevronLeft className="h-5 w-5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setPage((p) => Math.min(lastPage, p + 1))}
                    disabled={page >= lastPage}
                    className="rounded-lg border border-slate-200 dark:border-white/10 p-1.5 text-slate-500 dark:text-slate-400 disabled:opacity-30 hover:bg-slate-50 dark:hover:bg-white/5"
                  >
                    <HiOutlineChevronRight className="h-5 w-5" />
                  </button>
                </div>
              </div>
            )}
          </FadeIn>
        )}
      </div>

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
    </PageTransition>
  );
}
