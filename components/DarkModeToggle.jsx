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
      aria-label={isDark ? 'สลับเป็น Light Mode' : 'สลับเป็น Dark Mode'}
      aria-checked={isDark}
      role="switch"
      title={isDark ? 'Light Mode' : 'Dark Mode'}
      onClick={toggle}
      sx={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '6px',
        cursor: 'pointer',
        border: 'none',
        bg: 'transparent',
        p: 0,
        flexShrink: 0,
        ':focus-visible': {
          outline: '2px solid',
          outlineColor: 'primary',
          outlineOffset: '3px',
          borderRadius: '999px',
        },
      }}
    >
      {/* Sun icon */}
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="14"
        height="14"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
        sx={{ color: isDark ? 'text-light' : 'primary', flexShrink: 0 }}
      >
        <circle cx="12" cy="12" r="5" />
        <line x1="12" y1="1" x2="12" y2="3" />
        <line x1="12" y1="21" x2="12" y2="23" />
        <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
        <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
        <line x1="1" y1="12" x2="3" y2="12" />
        <line x1="21" y1="12" x2="23" y2="12" />
        <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
        <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
      </svg>

      {/* Track */}
      <Box
        sx={{
          position: 'relative',
          width: '40px',
          height: '22px',
          borderRadius: '999px',
          bg: isDark ? 'primary' : 'gray',
          border: '1px solid',
          borderColor: isDark ? 'primary' : 'gray',
          transition: 'background-color 0.25s ease, border-color 0.25s ease',
          flexShrink: 0,
        }}
      >
        {/* Thumb */}
        <Box
          sx={{
            position: 'absolute',
            top: '2px',
            left: isDark ? '20px' : '2px',
            width: '16px',
            height: '16px',
            borderRadius: '50%',
            bg: 'background',
            boxShadow: '0 1px 3px rgba(0,0,0,0.3)',
            transition: 'left 0.25s ease',
          }}
        />
      </Box>

      {/* Moon icon */}
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="13"
        height="13"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
        sx={{ color: isDark ? 'primary' : 'text-light', flexShrink: 0 }}
      >
        <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
      </svg>
    </Box>
  );
}
