import { useState } from 'react';
import { HiOutlineChatAlt, HiOutlineChevronLeft, HiOutlineChevronRight } from 'react-icons/hi';
import { FadeIn, StaggerList, StaggerItem } from '../../../components/ui';
import { formatDateTime } from '../../../utils';
import { CommentType } from '../../../types/enums';

const PAGE_SIZE = 5;

interface Comment {
  id: number;
  comment: string;
  type?: string;
  type_label?: string;
  created_at: string;
  user?: { name?: string } | null;
}

const COMMENT_TYPE_BADGE: Record<string, { label: string; className: string }> = {
  [CommentType.CANCELLATION_NOTE]: {
    label: 'Nota de cancelación',
    className: 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400 ring-1 ring-inset ring-orange-200 dark:ring-orange-800',
  },
  [CommentType.REOPEN_NOTE]: {
    label: 'Nota de reapertura',
    className: 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 ring-1 ring-inset ring-amber-200 dark:ring-amber-800',
  },
  [CommentType.REJECTION_NOTE]: {
    label: 'Nota de rechazo',
    className: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 ring-1 ring-inset ring-red-200 dark:ring-red-800',
  },
  [CommentType.COMPLETION_NOTE]: {
    label: 'Nota de cierre',
    className: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 ring-1 ring-inset ring-green-200 dark:ring-green-800',
  },
};

export function TaskComments({ comments }: { comments: Comment[] }) {
  const [page, setPage] = useState(1);

  if (comments.length === 0) return null;

  // Most recent first
  const sorted = [...comments].sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
  );

  const lastPage = Math.max(1, Math.ceil(sorted.length / PAGE_SIZE));
  const pageComments = sorted.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <FadeIn delay={0.1} className="mt-6 rounded-sm border border-slate-200 dark:border-white/5 bg-white dark:bg-cyber-grafito p-6 shadow-sm">
      <h3 className="mb-4 flex items-center gap-2 font-semibold text-slate-900 dark:text-white">
        <HiOutlineChatAlt className="h-6 w-6 text-cyber-radar dark:text-cyber-radar-light" /> Comentarios
        <span className="rounded-full bg-cyber-radar/5 dark:bg-cyber-radar/20/30 px-2 py-0.5 text-xs font-medium text-cyber-radar dark:text-cyber-radar-light">{comments.length}</span>
      </h3>
      <StaggerList className="space-y-3">
        {pageComments.map((c) => {
          const badge = c.type ? COMMENT_TYPE_BADGE[c.type] : undefined;
          const badgeLabel = c.type_label ?? badge?.label;
          return (
            <StaggerItem key={c.id}>
              <div className="rounded-sm bg-slate-50 dark:bg-white/5 p-4 transition-colors hover:bg-slate-100 dark:hover:bg-white/10 text-slate-700 dark:text-slate-300">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="flex h-7 w-7 items-center justify-center rounded-full bg-cyber-radar/10 dark:bg-cyber-radar/20/40 text-xs font-medium text-cyber-radar dark:text-cyber-radar-light">{c.user?.name?.charAt(0) ?? '?'}</span>
                    <span className="text-sm font-medium text-slate-900 dark:text-white">{c.user?.name ?? 'Desconocido'}</span>
                    {badge && badgeLabel && (
                      <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${badge.className}`}>
                        {badgeLabel}
                      </span>
                    )}
                  </div>
                  <span className="text-xs text-slate-400 dark:text-slate-500">{formatDateTime(c.created_at)}</span>
                </div>
                <p className="mt-2 pl-9 text-sm text-slate-700 dark:text-slate-300">{c.comment}</p>
              </div>
            </StaggerItem>
          );
        })}
      </StaggerList>

      {lastPage > 1 && (
        <div className="mt-4 flex items-center justify-between border-t border-slate-100 dark:border-white/5 pt-4">
          <span className="text-xs text-slate-400 dark:text-slate-500">
            Página {page} de {lastPage}
          </span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="inline-flex items-center gap-1 rounded-lg border border-slate-200 dark:border-white/10 bg-white dark:bg-cyber-grafito px-3 py-1.5 text-xs text-slate-700 dark:text-slate-300 transition-colors hover:bg-slate-50 dark:hover:bg-white/5 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <HiOutlineChevronLeft className="h-5 w-5" /> Anterior
            </button>
            <button
              type="button"
              onClick={() => setPage((p) => Math.min(lastPage, p + 1))}
              disabled={page === lastPage}
              className="inline-flex items-center gap-1 rounded-lg border border-slate-200 dark:border-white/10 bg-white dark:bg-cyber-grafito px-3 py-1.5 text-xs text-slate-700 dark:text-slate-300 transition-colors hover:bg-slate-50 dark:hover:bg-white/5 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Siguiente <HiOutlineChevronRight className="h-5 w-5" />
            </button>
          </div>
        </div>
      )}
    </FadeIn>
  );
}
