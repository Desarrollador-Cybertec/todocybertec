import { useState, useRef, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { m, AnimatePresence } from 'framer-motion';
import { HiOutlineQuestionMarkCircle, HiOutlineRefresh } from 'react-icons/hi';
import { useAuth } from '../context/useAuth';
import { useTutorial } from './useTutorial';
import { getTutorialsForRole, type TutorialDef } from './tutorialSteps';
import type { RoleType } from '../types/enums';

function getRouteModule(path: string | null): string {
  if (!path) return '';
  return path.split('/')[1] ?? '';
}

function getTutorialModule(t: TutorialDef): string {
  if (t.module) return t.module;
  return getRouteModule(t.startRoute);
}

function TutorialItem({
  t,
  onStart,
  isCompleted,
}: {
  t: TutorialDef;
  onStart: () => void;
  isCompleted: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onStart}
      className="flex w-full items-start gap-3 rounded-md px-3 py-2.5 text-left transition-colors hover:bg-white/5 group"
    >
      <span className="mt-0.5 text-lg shrink-0">{t.icon}</span>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-white truncate">{t.title}</span>
          {isCompleted && (
            <span className="shrink-0 text-[10px] font-medium text-emerald-400 bg-emerald-400/10 px-1.5 py-0.5 rounded">
              ✓ Completado
            </span>
          )}
        </div>
        <p className="mt-0.5 text-xs text-white/40 line-clamp-2 group-hover:text-white/60 transition-colors">
          {t.description}
        </p>
      </div>
    </button>
  );
}


export function TutorialMenu() {
  const { user } = useAuth();
  const location = useLocation();
  const { startTutorial, isCompleted, resetAll, isRunning } = useTutorial();
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const role = user?.role?.slug as RoleType | undefined;
  const tutorials = role ? getTutorialsForRole(role) : [];

  const currentModule = getRouteModule(location.pathname);
  const isDetailPage = location.pathname.split('/').length > 2; // e.g. /tasks/123 → true, /tasks → false

  const pageTutorials = tutorials.filter((t) => {
    if (getTutorialModule(t) !== currentModule) return false;
    // Tutorials with no startRoute (run in-place) only show on detail pages,
    // not on module root (list), because they point to detail-page elements.
    if (!t.startRoute && t.module) return isDetailPage;
    return true;
  });

  // Close on click outside
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    if (open) document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [open]);

  // Close on Escape
  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false);
    }
    if (open) document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [open]);


  if (!role) return null;

  const completedCount = tutorials.filter((t) => isCompleted(t.id)).length;
  const progress = tutorials.length > 0 ? Math.round((completedCount / tutorials.length) * 100) : 0;

  function handleStart(id: string) {
    setOpen(false);
    startTutorial(id);
  }

  return (
    <div ref={menuRef} className="fixed bottom-[60px] right-4 z-50">
      {/* Trigger button */}
      <button
        id="tutorial-trigger-btn"
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        disabled={isRunning}
        className="relative flex h-10 w-10 items-center justify-center rounded-sm bg-cyber-navy shadow-lg shadow-cyber-navy/30 ring-1 ring-white/10 transition-colors hover:bg-cyber-navy-light dark:bg-cyber-grafito dark:shadow-black/30 dark:ring-white/10 dark:hover:bg-white/10 text-white disabled:opacity-40"
        aria-label="Tutoriales y ayuda"
      >
        <HiOutlineQuestionMarkCircle className="h-6 w-6" />
        {completedCount < tutorials.length && (
          <span className="absolute -top-1.5 -right-1.5 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-cyber-radar px-1 text-[9px] font-bold text-white">
            {tutorials.length - completedCount}
          </span>
        )}
      </button>

      {/* Dropdown panel */}
      <AnimatePresence>
        {open && (
          <m.div
            initial={{ opacity: 0, y: 8, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.96 }}
            transition={{ duration: 0.15 }}
            className="absolute bottom-full right-0 z-50 mb-2 w-72 max-h-[70vh] overflow-y-auto rounded-lg border border-white/10 bg-cyber-navy dark:bg-cyber-grafito shadow-2xl shadow-black/40"
          >
            {/* Header */}
            <div className="sticky top-0 border-b border-white/10 bg-cyber-navy/95 dark:bg-cyber-grafito/95 backdrop-blur-sm px-4 py-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-white">Centro de Tutoriales</h3>
                <button
                  type="button"
                  onClick={resetAll}
                  className="flex items-center gap-1 rounded px-2 py-1 text-[11px] text-white/40 hover:bg-white/10 hover:text-white transition-colors"
                  title="Reiniciar todos los tutoriales"
                >
                  <HiOutlineRefresh className="h-3.5 w-3.5" />
                  Reiniciar
                </button>
              </div>
              {/* Progress bar */}
              <div className="mt-2">
                <div className="flex items-center justify-between text-[11px] text-white/40 mb-1">
                  <span>Progreso</span>
                  <span>{completedCount}/{tutorials.length} completados</span>
                </div>
                <div className="h-1.5 rounded-full bg-white/10 overflow-hidden">
                  <m.div
                    className="h-full rounded-full bg-cyber-radar"
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    transition={{ duration: 0.4, ease: 'easeOut' }}
                  />
                </div>
              </div>
            </div>

            <div className="p-2 space-y-0.5">
              {pageTutorials.length > 0 ? (
                pageTutorials.map((t) => (
                  <TutorialItem
                    key={t.id}
                    t={t}
                    isCompleted={isCompleted(t.id)}
                    onStart={() => handleStart(t.id)}
                  />
                ))
              ) : (
                <p className="px-4 py-6 text-center text-xs text-white/30">
                  No hay tutoriales para esta página.
                </p>
              )}
            </div>
          </m.div>
        )}
      </AnimatePresence>
    </div>
  );
}
