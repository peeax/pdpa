'use client';
// React-19-compatible Tippy wrapper.
// @tippyjs/react internally uses React.cloneElement(child, { ref }) to attach
// its ref, which triggers the "Accessing element.ref" warning in React 19.
// This replacement uses tippy.js directly via useRef + useEffect so no
// element.ref access is needed.
import { useEffect, useRef } from 'react';
import { createRoot } from 'react-dom/client';
import tippy from 'tippy.js';

export default function ThemedTippy({
  content,
  children,
  placement = 'right',
  animation = 'shift-away',
  touch = false,
}) {
  const triggerRef = useRef(null);
  const tippyRef = useRef(null);
  const rootRef = useRef(null);

  // Create the tippy instance once on mount
  useEffect(() => {
    const el = triggerRef.current;
    if (!el) return;

    // Create a detached DOM node that React will render into
    const container = document.createElement('div');
    rootRef.current = createRoot(container);

    tippyRef.current = tippy(el, {
      content: container,
      placement,
      animation,
      touch,
    });

    return () => {
      tippyRef.current?.destroy();
      tippyRef.current = null;
      // Defer unmount so React finishes its current render cycle first
      const root = rootRef.current;
      rootRef.current = null;
      setTimeout(() => root?.unmount(), 0);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Re-render React content into the tippy container whenever it changes
  useEffect(() => {
    rootRef.current?.render(content ?? null);
    if (tippyRef.current) {
      content ? tippyRef.current.enable() : tippyRef.current.disable();
    }
  }, [content]);

  return (
    <span ref={triggerRef} style={{ display: 'inline' }}>
      {children}
    </span>
  );
}
