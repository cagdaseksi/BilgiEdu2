import { useCallback, useEffect, useRef, useState } from 'react';
import { createAsyncStorage } from '@react-native-async-storage/async-storage';
import { TOTAL_LEVELS } from '../game/engine';

export type Result = { stars: number; moves: number };
export type Progress = { version: 1; completed: Record<string, Result> };
export const emptyProgress = (): Progress => ({ version: 1, completed: {} });
const storage = createAsyncStorage('arrow-puzzle');
const KEY = 'progress-v1';

export function parseProgress(raw: string | null): Progress {
  if (!raw) {
    return emptyProgress();
  }
  try {
    const value = JSON.parse(raw);
    if (
      value?.version !== 1 ||
      !value.completed ||
      typeof value.completed !== 'object'
    ) {
      return emptyProgress();
    }
    const completed: Progress['completed'] = {};
    for (const [key, result] of Object.entries(value.completed)) {
      const index = Number(key);
      const r = result as Result | null;
      if (
        Number.isInteger(index) &&
        index >= 0 &&
        index < TOTAL_LEVELS &&
        r &&
        Number.isInteger(r.stars) &&
        r.stars >= 1 &&
        r.stars <= 3 &&
        Number.isInteger(r.moves) &&
        r.moves > 0
      ) {
        completed[String(index)] = { stars: r.stars, moves: r.moves };
      }
    }
    return { version: 1, completed };
  } catch {
    return emptyProgress();
  }
}

export function nextLevel(progress: Progress) {
  let index = 0;
  while (index < TOTAL_LEVELS - 1 && progress.completed[String(index)]) {
    index++;
  }
  return index;
}

export function useProgress() {
  const [progress, setProgress] = useState<Progress>(emptyProgress);
  const [ready, setReady] = useState(false);
  const [storageError, setStorageError] = useState(false);
  const writes = useRef(Promise.resolve());
  const skipInitialWrite = useRef(true);
  useEffect(() => {
    let active = true;
    storage
      .getItem(KEY)
      .then(raw => {
        if (active) {
          setProgress(parseProgress(raw));
        }
      })
      .catch(() => {
        if (active) {
          setStorageError(true);
        }
      })
      .finally(() => {
        if (active) {
          setReady(true);
        }
      });
    return () => {
      active = false;
    };
  }, []);
  useEffect(() => {
    if (!ready) {
      return;
    }
    if (skipInitialWrite.current) {
      skipInitialWrite.current = false;
      return;
    }
    writes.current = writes.current
      .then(() => storage.setItem(KEY, JSON.stringify(progress)))
      .then(() => setStorageError(false))
      .catch(() => setStorageError(true));
  }, [progress, ready]);
  const complete = useCallback((index: number, result: Result) => {
    setProgress(previous => {
      const best = previous.completed[String(index)];
      return {
        ...previous,
        completed: {
          ...previous.completed,
          [index]: {
            stars: Math.max(best?.stars ?? 0, result.stars),
            moves: Math.min(best?.moves ?? Infinity, result.moves),
          },
        },
      };
    });
  }, []);
  const reset = useCallback(() => setProgress(emptyProgress()), []);
  return { progress, ready, storageError, complete, reset };
}
