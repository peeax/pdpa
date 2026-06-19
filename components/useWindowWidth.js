'use client';
// Ported from gatsby-theme-andy/src/utils/useWindowWidth.js
import React from 'react';

const getWindowWidth = () => (typeof window === 'undefined' ? undefined : window.innerWidth);

export default function useWindowWidth() {
  // Start undefined so the first client render matches the server render
  // (no hydration mismatch); the real width is measured after mount.
  const [width, setWidth] = React.useState(undefined);

  React.useEffect(() => {
    const handleResize = () => setWidth(getWindowWidth());
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return [width];
}
