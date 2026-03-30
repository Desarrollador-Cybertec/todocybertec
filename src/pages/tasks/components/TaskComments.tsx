import { HiOutlineChatAlt } from 'react-icons/hi';
import { FadeIn, StaggerList, StaggerItem } from '../../../components/ui';
import { formatDateTime } from '../../../utils';

interface Comment {
  id: number;
  comment: string;
  created_at: string;
  user?: { name?: string } | null;
}

export function TaskComments({ comments }: { comments: Comment[] }) {
  if (comments.length === 0) return null;

  return (
    <FadeIn delay={0.1} className="mt-6 rounded-sm border border-slate-200 dark:border-white/5 bg-white dark:bg-cyber-grafito p-6 shadow-sm">
      <h3 className="mb-4 flex items-center gap-2 font-semibold text-slate-900 dark:text-white">
        <HiOutlineChatAlt className="h-5 w-5 text-cyber-radar dark:text-cyber-radar-light" /> Comentarios
        <span className="rounded-full bg-cyber-radar/5 dark:bg-cyber-radar/20/30 px-2 py-0.5 text-xs font-medium text-cyber-radar dark:text-cyber-radar-light">{comments.length}</span>
      </h3>
      <StaggerList className="space-y-3">
        {comments.map((c) => (
          <StaggerItem key={c.id}>
            <div className="rounded-sm bg-slate-50 dark:bg-white/5 p-4 transition-colors hover:bg-slate-100 dark:hover:bg-white/10 text-slate-700 dark:text-slate-300">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="flex h-7 w-7 items-center justify-center rounded-full bg-cyber-radar/10 dark:bg-cyber-radar/20/40 text-xs font-medium text-cyber-radar dark:text-cyber-radar-light">{c.user?.name?.charAt(0) ?? '?'}</span>
                  <span className="text-sm font-medium text-slate-900 dark:text-white">{c.user?.name ?? 'Desconocido'}</span>
                </div>
                <span className="text-xs text-slate-400 dark:text-slate-500">{formatDateTime(c.created_at)}</span>
              </div>
              <p className="mt-2 pl-9 text-sm text-slate-700 dark:text-slate-300">{c.comment}</p>
            </div>
          </StaggerItem>
        ))}
      </StaggerList>
    </FadeIn>
  );
}
