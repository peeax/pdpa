/** @jsxImportSource theme-ui */
'use client';
import React from 'react';
import { useColorMode, Flex, Box } from 'theme-ui';

export default function DarkModeToggle() {
  const [colorMode, setColorMode] = useColorMode();
  const isDark = colorMode === 'dark';

  return (
    <Flex
      sx={{
        border: '1px solid',
        borderColor: 'gray',
        borderRadius: '8px',
        overflow: 'hidden',
        flexShrink: 0,
      }}
    >
      {/* Light button */}
      <Box
        as="button"
        aria-label="สลับเป็น Light Mode"
        onClick={() => setColorMode('light')}
        sx={{
          display: 'flex', alignItems: 'center', gap: '5px',
          px: '14px', py: '8px',
          cursor: 'pointer', border: 'none',
          bg: isDark ? 'transparent' : 'text',
          color: isDark ? 'text-light' : 'background',
          fontSize: '13px', fontWeight: isDark ? 'normal' : 'bold',
          lineHeight: 1,
          ':focus-visible': { outline: '2px solid', outlineColor: 'primary', outlineOffset: '2px' },
        }}
      >
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <circle cx="12" cy="12" r="5" />
          <line x1="12" y1="1" x2="12" y2="3" /><line x1="12" y1="21" x2="12" y2="23" />
          <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" /><line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
          <line x1="1" y1="12" x2="3" y2="12" /><line x1="21" y1="12" x2="23" y2="12" />
          <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" /><line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
        </svg>
        Light
      </Box>

      {/* Dark button */}
      <Box
        as="button"
        aria-label="สลับเป็น Dark Mode"
        onClick={() => setColorMode('dark')}
        sx={{
          display: 'flex', alignItems: 'center', gap: '5px',
          px: '14px', py: '8px',
          cursor: 'pointer', border: 'none',
          bg: isDark ? 'text' : 'transparent',
          color: isDark ? 'background' : 'text-light',
          fontSize: '13px', fontWeight: isDark ? 'bold' : 'normal',
          lineHeight: 1,
          ':focus-visible': { outline: '2px solid', outlineColor: 'primary', outlineOffset: '2px' },
        }}
      >
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
        </svg>
        Dark
      </Box>
    </Flex>
  );
}
