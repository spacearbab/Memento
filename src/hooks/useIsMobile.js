import { useEffect, useState } from 'react';

// Tracks a max-width media query so components can pick lighter/less extreme
// visual parameters (3D bend, drag speed, shader scale…) on small screens
// instead of just relying on CSS to squeeze a desktop layout down.
export default function useIsMobile(breakpoint = 640) {
  const query = `(max-width: ${breakpoint}px)`;
  const [isMobile, setIsMobile] = useState(
    () => typeof window !== 'undefined' && window.matchMedia(query).matches
  );

  useEffect(() => {
    const mq = window.matchMedia(query);
    const onChange = () => setIsMobile(mq.matches);
    onChange();
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, [query]);

  return isMobile;
}
