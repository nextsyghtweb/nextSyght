import { useEffect, useRef, useState } from 'react';
import { prefersReducedMotion } from '../lib/device';

/**
 * Reveal – fades and slides its children into view the first time they
 * scroll onto the screen. Uses IntersectionObserver (cheap, no scroll handlers).
 *
 * <Reveal delay={120}>…</Reveal>   (delay in ms, handy for staggering cards)
 */
export default function Reveal({ as: Tag = 'div', delay = 0, className = '', children, ...rest }) {
  const ref = useRef(null);
  const [shown, setShown] = useState(false);
  // Once the entrance animation has finished we drop the reveal styles entirely,
  // so hover effects on cards are instant and don't inherit the stagger delay.
  const [settled, setSettled] = useState(false);

  useEffect(() => {
    if (!shown) return undefined;
    const id = setTimeout(() => setSettled(true), delay + 900);
    return () => clearTimeout(id);
  }, [shown, delay]);

  useEffect(() => {
    const el = ref.current;
    if (!el) return undefined;

    // No animation for reduced-motion users or very old browsers
    if (prefersReducedMotion() || !('IntersectionObserver' in window)) {
      setShown(true);
      return undefined;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setShown(true);
          observer.disconnect();
        }
      },
      { threshold: 0.12, rootMargin: '0px 0px -8% 0px' }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <Tag
      ref={ref}
      style={settled ? undefined : { transitionDelay: shown ? `${delay}ms` : '0ms' }}
      className={`${settled ? '' : `reveal ${shown ? 'reveal-in' : ''}`} ${className}`}
      {...rest}
    >
      {children}
    </Tag>
  );
}
