import { useEffect, useState } from 'react';

// Preloads every URL in `urls` and reports real progress (0..1) as they
// actually finish loading — not a fake timer. Speed genuinely follows the
// network: fast connections finish fast, slow ones finish slow. A failed
// image still counts as "settled" so one broken file can't hang the loader
// forever.
//
// Deliberately has NO "already started, skip re-running" guard: React 18's
// StrictMode intentionally mounts effects twice in development (run,
// cleanup, run again) to surface exactly this kind of bug. A guard that
// persists across that cleanup (e.g. a ref set on the first run) causes the
// real, surviving effect invocation to bail out before ever attaching an
// onload/onerror listener — which is why this used to get stuck at 0%
// forever even on a fast local server. Every run is self-contained instead:
// it creates its own images/listeners and the cleanup tears down only that
// run's own listeners, which is safe to call twice.
export default function useImagePreload(urls) {
  const [loaded, setLoaded] = useState(0);
  const total = urls.length;
  const key = urls.join('|');

  useEffect(() => {
    setLoaded(0);
    if (total === 0) return undefined;

    let cancelled = false;
    let settled = 0;

    const onSettle = () => {
      if (cancelled) return;
      settled += 1;
      setLoaded(settled);
    };

    const images = urls.map(src => {
      const img = new Image();
      img.onload = onSettle;
      img.onerror = onSettle;
      img.src = src;
      return img;
    });

    return () => {
      cancelled = true;
      images.forEach(img => {
        img.onload = null;
        img.onerror = null;
      });
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key, total]);

  const progress = total === 0 ? 1 : loaded / total;
  return { progress, loaded, total, done: loaded >= total };
}
