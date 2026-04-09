import { useTheme } from '../../context/ThemeContext';
import { HiOutlineSun, HiOutlineMoon } from 'react-icons/hi';
import { AnimatePresence, m } from 'framer-motion';

export function DarkModeToggle() {
  const { dark, toggle } = useTheme();

  return (
    <button
      type="button"
      onClick={toggle}
      className="fixed bottom-4 right-4 z-50 flex h-10 w-10 items-center justify-center rounded-sm bg-cyber-navy shadow-lg shadow-cyber-navy/30 ring-1 ring-white/10 transition-colors hover:bg-cyber-navy-light dark:bg-cyber-radar dark:shadow-cyber-radar/30 dark:ring-cyber-radar/30 dark:hover:bg-cyber-radar-light text-white"
      aria-label={dark ? 'Activar modo claro' : 'Activar modo oscuro'}
    >
      <AnimatePresence mode="wait" initial={false}>
        {dark ? (
          <m.span
            key="sun"
            initial={{ rotate: -90, opacity: 0 }}
            animate={{ rotate: 0, opacity: 1 }}
            exit={{ rotate: 90, opacity: 0 }}
            transition={{ duration: 0.15 }}
          >
            <HiOutlineSun className="h-6 w-6 text-white" />
          </m.span>
        ) : (
          <m.span
            key="moon"
            initial={{ rotate: 90, opacity: 0 }}
            animate={{ rotate: 0, opacity: 1 }}
            exit={{ rotate: -90, opacity: 0 }}
            transition={{ duration: 0.15 }}
          >
            <HiOutlineMoon className="h-6 w-6 text-white" />
          </m.span>
        )}
      </AnimatePresence>
    </button>
  );
}
