import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { useDraft, useSaveDraft } from './hooks';
import { emptyDraft, nextStep, type Draft, type Step } from './onboarding';

/** State satu langkah onboarding; disimpan ke SQLite saat Lanjut (FL-1: bisa dilanjutkan). */
export function useOnboarding(step: Step) {
  const { draft, isPending } = useDraft();
  const save = useSaveDraft();
  const [local, setLocal] = useState<Draft>(draft ?? emptyDraft);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (!isPending && !loaded) {
      setLocal(draft ?? emptyDraft);
      setLoaded(true);
    }
  }, [isPending, loaded, draft]);

  const update = (patch: Partial<Draft>) => setLocal((d) => ({ ...d, ...patch }));

  const next = async (patch: Partial<Draft> = {}) => {
    const merged = { ...local, ...patch };
    const to = nextStep(merged, step);
    await save.mutateAsync({ ...merged, step: to });
    router.push(`/onboarding/${to}`);
  };

  return { draft: local, update, next, ready: loaded, saving: save.isPending };
}
