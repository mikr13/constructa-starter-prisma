import { useCallback, useEffect, useMemo, useState } from 'react';
import { Settings } from 'lucide-react';
import { SettingsCard } from '../shared/SettingsCard';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '~/components/ui/select';
import { Label } from '~/components/ui/label';
import { logger } from '~/lib/logger';

type ModeChoice = 'privacy' | 'performance';

interface GeneralSettingsProps {
  readonly projectId: string | null;
}

export function GeneralSettings({ projectId }: GeneralSettingsProps) {
  const [mode, setMode] = useState<ModeChoice>('privacy');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch current policy when component mounts
  useEffect(() => {
    let aborted = false;
    async function loadPolicy() {
      if (!projectId) return;
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`/api/projects?id=${encodeURIComponent(projectId)}`);
        if (!res.ok) throw new Error(`load_failed:${res.status}`);
        const data = await res.json().catch(() => ({}));
        const storageMode = String(data?.policy?.storageMode || 'index-only');
        if (!aborted) setMode(storageMode === 'cloud-cache' ? 'performance' : 'privacy');
        logger.info('[UI] Loaded project policy', { projectId, storageMode });
      } catch (e: any) {
        const msg = e?.message || 'Failed to load policy';
        if (!aborted) setError(msg);
        logger.warn('[UI] Failed to load project policy', { projectId, error: msg });
      } finally {
        if (!aborted) setLoading(false);
      }
    }
    loadPolicy();
    return () => {
      aborted = true;
    };
  }, [projectId]);

  const helpText = useMemo(() => {
    return mode === 'performance'
      ? 'Stores your repo in Cloud Cache (R2) for faster search and file serving.'
      : 'Keeps server in Privacy Mode (index-only). Server search and file serving are disabled.';
  }, [mode]);

  const applyMode = useCallback(async (next: ModeChoice) => {
    setMode(next);
    if (!projectId) {
      logger.warn('[UI] Cannot update mode — no projectId');
      return;
    }
    const storageMode = next === 'performance' ? 'cloud-cache' : 'index-only';
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/projects?id=${encodeURIComponent(projectId)}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ storageMode }),
      });
      if (!res.ok) throw new Error(`save_failed:${res.status}`);
      logger.info('[UI] Project mode updated', { projectId, storageMode });
    } catch (e: any) {
      const msg = e?.message || 'Failed to update mode';
      setError(msg);
      logger.error('[UI] Failed to update project mode', { projectId, storageMode, error: msg });
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <h3 className="px-1 text-sm font-medium text-gray-900 dark:text-gray-100">
          Repository storage
        </h3>
        <SettingsCard
          icon={<Settings className="h-4 w-4" />}
          title="Storage preferences"
          description="Switch between privacy-focused indexing and full cloud cache serving for faster chats."
        >
          <div className="space-y-2">
            <Label htmlFor="mode-select">Privacy Mode</Label>
            <Select
              value={mode}
              onValueChange={(v: ModeChoice) => applyMode(v)}
              disabled={loading || !projectId}
            >
              <SelectTrigger id="mode-select">
                <SelectValue placeholder="Select mode" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="privacy">Privacy Mode</SelectItem>
                <SelectItem value="performance">Performance Mode</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-sm text-muted-foreground">
              {projectId ? helpText : 'No active project detected.'}
            </p>
            {error && <p className="text-xs text-destructive">{String(error)}</p>}
          </div>
        </SettingsCard>
      </div>
    </div>
  );
}