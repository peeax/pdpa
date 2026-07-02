/** @jsxImportSource theme-ui */
'use client';
import React from 'react';
import { useColorMode, Box } from 'theme-ui';

export default function DarkModeToggle() {
  const [colorMode, setColorMode] = useColorMode();
  const isDark = colorMode === 'dark';

  const toggle = () => setColorMode(isDark ? 'light' : 'dark');

  return (
    <Box
      as="button"
      onClick={toggle}
      aria-label={isDark ? 'สลับเป็น Light Mode' : 'สลับเป็น Dark Mode'}
      title={isDark ? 'Light Mode' : 'Dark Mode'}
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: '36px',
        height: '36px',
        border: '1px solid rgba(246,244,247,0.4)',
        borderRadius: '8px',
        bg: 'transparent',
        color: '#f6f4f7',
        cursor: 'pointer',
        flexShrink: 0,
        ':hover': { borderColor: '#28c6b5', color: '#28c6b5' },
        ':focus-visible': { outline: '2px solid #28c6b5', outlineOffset: '2px' },
      }}
    >
      {isDark ? (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <circle cx="12" cy="12" r="5" />
          <line x1="12" y1="1" x2="12" y2="3" /><line x1="12" y1="21" x2="12" y2="23" />
          <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" /><line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
          <line x1="1" y1="12" x2="3" y2="12" /><line x1="21" y1="12" x2="23" y2="12" />
          <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" /><line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
        </svg>
      ) : (
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
        </svg>
      )}
    </Box>
  );
}
