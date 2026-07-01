/** @jsxImportSource theme-ui */
'use client';
// Port of gatsby-theme-andy/src/components/Header.js
import React from 'react';
import { Box, Flex } from 'theme-ui';
import DarkModeToggle from './DarkModeToggle';
import SearchModal from './SearchModal';

export default function Header({ siteMetadata, navigateToStackedPage }) {
  return (
    <header>
      <Flex py={2} px={3} sx={{ borderBottom: '1px solid', borderColor: 'gray', flexDirection: ['column', 'row'], alignItems: ['flex-start', 'center'], justifyContent: ['flex-start', 'space-between'], gap: [1, 2], minWidth: 0 }}>
        <Box
          as="a"
          href="/"
          sx={{
            fontWeight: 'bold', color: 'text', textDecoration: 'none',
            minWidth: 0,
            width: ['100%', 'auto'],
            whiteSpace: ['normal', 'nowrap'],
            overflow: ['visible', 'hidden'],
            textOverflow: ['clip', 'ellipsis'],
          }}
        >
          {siteMetadata.title}
        </Box>

        <Flex sx={{ alignItems: 'center', gap: 2, flexShrink: 0 }}>
          <DarkModeToggle />
          <Box sx={{ position: 'relative' }}>
            <SearchModal navigateToStackedPage={navigateToStackedPage} />
          </Box>
        </Flex>
      </Flex>
    </header>
  );
}
