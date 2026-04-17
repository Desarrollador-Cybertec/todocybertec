import { useState, useCallback, useEffect, useRef, type ReactNode } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { driver, type Driver } from 'driver.js';
import { useAuth } from '../context/useAuth';
import { ALL_TUTORIALS, getTutorialsForRole } from './tutorialSteps';
import { TutorialContext } from './tutorialContextDef';

const STORAGE_KEY = 'sintyc_tutorials';

interface CompletionMap {
  [tutorialId: string]: boolean;
}

function loadCompleted(userId: string | number): CompletionMap {
  try {
    const raw = localStorage.getItem(`${STORAGE_KEY}_${userId}`);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function saveCompleted(userId: string | number, map: CompletionMap) {
  localStorage.setItem(`${STORAGE_KEY}_${userId}`, JSON.stringify(map));
}

export function TutorialProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const driverRef = useRef<Driver | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [completed, setCompleted] = useState<CompletionMap>({});
  const [welcomeShown, setWelcomeShown] = useState(true);

  // Load completion state when user changes
  useEffect(() => {
    if (user?.id) {
      const map = loadCompleted(user.id);
      setCompleted(map);
      setWelcomeShown(!!map['welcome']);
    }
  }, [user?.id]);

  const markCompleted = useCallback(
    (tutorialId: string) => {
      if (!user?.id) return;
      setCompleted((prev) => {
        const next = { ...prev, [tutorialId]: true };
        saveCompleted(user.id, next);
        if (tutorialId === 'welcome') setWelcomeShown(true);
        return next;
      });
    },
    [user?.id],
  );

  const isCompleted = useCallback(
    (tutorialId: string) => !!completed[tutorialId],
    [completed],
  );

  const resetTutorial = useCallback(
    (tutorialId: string) => {
      if (!user?.id) return;
      setCompleted((prev) => {
        const next = { ...prev };
        delete next[tutorialId];
        saveCompleted(user.id, next);
        if (tutorialId === 'welcome') setWelcomeShown(false);
        return next;
      });
    },
    [user?.id],
  );

  const resetAll = useCallback(() => {
    if (!user?.id) return;
    setCompleted({});
    setWelcomeShown(false);
    saveCompleted(user.id, {});
  }, [user?.id]);

  const startTutorial = useCallback(
    (tutorialId: string) => {
      if (!user?.role?.slug) return;

      const def = ALL_TUTORIALS.find((t) => t.id === tutorialId);
      if (!def) return;

      // Navigate to the start route if needed
      if (def.startRoute && location.pathname !== def.startRoute) {
        navigate(def.startRoute);
        // Wait for navigation + DOM to settle
        setTimeout(() => runDriver(def.steps, tutorialId), 400);
        return;
      }

      runDriver(def.steps, tutorialId);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [user?.role?.slug, location.pathname, navigate],
  );

  const runDriver = useCallback(
    (steps: typeof ALL_TUTORIALS[number]['steps'], tutorialId: string) => {
      // Destroy any existing driver
      if (driverRef.current) {
        driverRef.current.destroy();
      }

      const d = driver({
        showProgress: true,
        animate: true,
        allowClose: true,
        overlayColor: 'rgba(0, 0, 0, 0.65)',
        stagePadding: 8,
        stageRadius: 8,
        popoverClass: 'sintyc-tutorial-popover',
        nextBtnText: 'Siguiente →',
        prevBtnText: '← Anterior',
        doneBtnText: '¡Entendido!',
        progressText: '{{current}} de {{total}}',
        steps,
        onDestroyed: () => {
          setIsRunning(false);
          markCompleted(tutorialId);
        },
      });

      driverRef.current = d;
      setIsRunning(true);
      d.drive();
    },
    [markCompleted],
  );

  // Auto-show welcome tutorial on first login
  useEffect(() => {
    if (!user?.id || !user?.role?.slug) return;
    if (welcomeShown) return;
    if (isRunning) return;

    const role = user.role.slug;
    const tutorials = getTutorialsForRole(role);
    const welcome = tutorials.find((t) => t.id === 'welcome');
    if (!welcome) return;

    // Small delay to let the layout render
    const timer = setTimeout(() => {
      startTutorial('welcome');
    }, 800);

    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id, user?.role?.slug, welcomeShown]);

  return (
    <TutorialContext.Provider
      value={{
        startTutorial,
        isRunning,
        isCompleted,
        markCompleted,
        resetTutorial,
        resetAll,
        welcomeShown,
      }}
    >
      {children}
    </TutorialContext.Provider>
  );
}
