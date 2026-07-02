'use client';
// Replacement for @tippyjs/react that is compatible with React 19.
// Uses the imperative tippy.js API directly to avoid the deprecated
// React.cloneElement + element.ref pattern used by @tippyjs/react v4.
import { useEffect, useRef } from 'react';
import { createRoot } from 'react-dom/client';
import tippy from 'tippy.js';
import 'tippy.js/dist/tippy.css';
import 'tippy.js/animations/shift-away.css';

export default function ThemedTippy({
  children,
  content,
  placement = 'right',
  animation = 'shift-away',
  ...rest
}) {
  const spanRef = useRef(null);

  useEffect(() => {
    if (!spanRef.current) return;

    // If there is no popup content for this link, skip
    if (!content) return;

    // Render the React content into a detached DOM container
    const container = document.createElement('div');
    const root = createRoot(container);
    root.render(content);

    const instance = tippy(spanRef.current, {
      content: container,
      placement,
      animation,
      allowHTML: true,
      interactive: true,
      ...rest,
    });

    return () => {
      instance.destroy();
      setTimeout(() => root.unmount(), 0);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [content, placement, animation]);

  return (
    <span ref={spanRef} style={{ display: 'contents' }}>
      {children}
    </span>
  );
}
