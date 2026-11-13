import { useLayoutEffect, useRef, useState } from 'react';

const STITCH = 12; // stitch length, px (keep in step with .stitches span in styles.css)
const GAP = 7;     // space between stitches, px
const TOTAL_MS = 1100; // whole row takes about this long, however wide the title is

// Wraps text with a dashed underline that is "sewn" in one stitch at a time, left to right.
// Draws exactly as many whole stitches as fit the text's width.
export default function Stitched({ children }) {
  const ref = useRef(null);
  const [count, setCount] = useState(0);

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return undefined;
    const measure = () => setCount(Math.max(1, Math.floor((el.offsetWidth + GAP) / (STITCH + GAP))));
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const step = count ? Math.min(55, TOTAL_MS / count) : 0;

  return (
    <span className="stitched" ref={ref}>
      {children}
      <span className="stitches" aria-hidden="true">
        {Array.from({ length: count }, (_, i) => (
          <span key={i} style={{ animationDelay: `${Math.round(250 + i * step)}ms` }} />
        ))}
      </span>
    </span>
  );
}
