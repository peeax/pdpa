/** @jsxImportSource theme-ui */
'use client';
// Port of gatsby-theme-andy/src/components/Header.js
import NextLink from 'next/link';
import { Box } from 'theme-ui';

export default function Header({ siteMetadata }) {
  return (
    <header>
      <Box py={2} px={3} sx={{ borderBottom: '1px solid', borderColor: 'gray' }}>
        <NextLink href="/" sx={{ fontWeight: 'bold', color: 'text', textDecoration: 'none' }}>
          {siteMetadata.title}
        </NextLink>
      </Box>
    </header>
  );
}
