import { HiOutlinePaperClip } from 'react-icons/hi';
import { FadeIn, StaggerList, StaggerItem, Badge } from '../../../components/ui';

interface Attachment {
  id: number;
  file_name: string;
  attachment_type: string;
  user?: { name?: string } | null;
}

export function TaskAttachments({ attachments }: { attachments: Attachment[] }) {
  if (attachments.length === 0) return null;

  return (
    <FadeIn delay={0.15} className="mt-6 rounded-sm border border-slate-200 dark:border-white/5 bg-white dark:bg-cyber-grafito p-6 shadow-sm">
      <h3 className="mb-4 flex items-center gap-2 font-semibold text-slate-900 dark:text-white">
        <HiOutlinePaperClip className="h-5 w-5 text-cyber-navy dark:text-cyber-radar-light" /> Adjuntos
        <span className="rounded-full bg-cyber-navy/5 dark:bg-cyber-navy/20/30 px-2 py-0.5 text-xs font-medium text-cyber-navy dark:text-cyber-radar-light dark:text-cyber-radar-light">{attachments.length}</span>
      </h3>
      <StaggerList className="space-y-2">
        {attachments.map((a) => (
          <StaggerItem key={a.id}>
            <div className="flex items-center justify-between rounded-sm bg-slate-50 dark:bg-white/5 p-4 transition-colors hover:bg-slate-100 dark:hover:bg-white/10 text-slate-700 dark:text-slate-300">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-cyber-navy/5 dark:bg-cyber-navy/20/30">
                  <HiOutlinePaperClip className="h-4 w-4 text-cyber-navy dark:text-cyber-radar-light" />
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-900 dark:text-white">{a.file_name}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">{a.user?.name ?? 'Desconocido'} · <Badge variant="gray" size="sm">{a.attachment_type}</Badge></p>
                </div>
              </div>
            </div>
          </StaggerItem>
        ))}
      </StaggerList>
    </FadeIn>
  );
}
