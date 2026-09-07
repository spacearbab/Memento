import { useEffect, useRef, useState } from 'react';

// Measures a container element and returns [ref, size] where size is the
// largest square (in px) that fits entirely inside it, live-updating on
// resize via ResizeObserver. Returns size=null while `active` is false, so
// callers can fall back to their normal (non-square) CSS sizing at zero cost.
export default function useSquareFit(active) {
  const ref = useRef(null);
  const [size, setSize] = useState(null);

  useEffect(() => {
    if (!active || !ref.current) {
      setSize(null);
      return undefined;
    }
    const el = ref.current;
    const update = () => {
      const rect = el.getBoundingClientRect();
      setSize(Math.max(0, Math.floor(Math.min(rect.width, rect.height))));
    };
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, [active]);

  return [ref, size];
}
