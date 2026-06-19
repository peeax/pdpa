/** @jsxImportSource theme-ui */
'use client';
// Port of gatsby-theme-andy/src/components/Header.js
import React from 'react';
import dynamic from 'next/dynamic';
import { Box, Flex } from 'theme-ui';

// Lazy load the SearchModal to reduce initial bundle size, since it includes fuse.js and fetches the index.
const SearchModal = dynamic(() => import('./SearchModal'), { ssr: false });

export default function Header({ siteMetadata, navigateToStackedPage }) {
  return (
    <header>
      <Flex py={2} px={3} sx={{ borderBottom: '1px solid', borderColor: 'gray', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box as="a" href="/" sx={{ fontWeight: 'bold', color: 'text', textDecoration: 'none' }}>
          {siteMetadata.title}
        </Box>
        
        <Box sx={{ position: 'relative' }}>
          <SearchModal navigateToStackedPage={navigateToStackedPage} />
        </Box>
      </Flex>
    </header>
  );
}
