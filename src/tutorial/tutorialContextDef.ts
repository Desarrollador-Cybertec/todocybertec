import { createContext } from 'react';

export interface TutorialContextValue {
  /** Start a specific tutorial by id */
  startTutorial: (tutorialId: string) => void;
  /** Whether a tutorial is currently running */
  isRunning: boolean;
  /** Check whether a tutorial has been completed */
  isCompleted: (tutorialId: string) => boolean;
  /** Mark a tutorial as completed */
  markCompleted: (tutorialId: string) => void;
  /** Reset a tutorial so it can be replayed */
  resetTutorial: (tutorialId: string) => void;
  /** Reset all tutorials */
  resetAll: () => void;
  /** Whether the welcome tutorial has been shown for the current user */
  welcomeShown: boolean;
}

export const TutorialContext = createContext<TutorialContextValue | null>(null);
