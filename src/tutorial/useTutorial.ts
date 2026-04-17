import { useContext } from 'react';
import { TutorialContext, type TutorialContextValue } from './tutorialContextDef';

export function useTutorial(): TutorialContextValue {
  const ctx = useContext(TutorialContext);
  if (!ctx) {
    throw new Error('useTutorial debe usarse dentro de un TutorialProvider');
  }
  return ctx;
}
