export type QueuedProgress = { lessonId: string; positionSeconds: number; timeSpentMinutes: number; idempotencyKey: string };
const KEY = 'kukekodes_offline_progress';

export function queueProgress(item: QueuedProgress): void {
  try {
    const current = JSON.parse(localStorage.getItem(KEY) || '[]') as QueuedProgress[];
    const next = current.filter((entry) => entry.idempotencyKey !== item.idempotencyKey);
    next.push(item);
    localStorage.setItem(KEY, JSON.stringify(next.slice(-100)));
  } catch { /* storage can be unavailable in private browsing */ }
}

export function getQueuedProgress(): QueuedProgress[] {
  try { return JSON.parse(localStorage.getItem(KEY) || '[]') as QueuedProgress[]; } catch { return []; }
}

export function clearQueuedProgress(idempotencyKey: string): void {
  const remaining = getQueuedProgress().filter((entry) => entry.idempotencyKey !== idempotencyKey);
  localStorage.setItem(KEY, JSON.stringify(remaining));
}
