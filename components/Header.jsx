/** @jsxImportSource theme-ui */
'use client';
// Port of gatsby-theme-andy/src/components/Header.js
import React, { useState, useEffect } from 'react';
import { Box, Flex, Button } from 'theme-ui';
import SearchModal from './SearchModal';

export default function Header({ siteMetadata, navigateToStackedPage }) {
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setIsSearchOpen(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <header>
      <Flex py={2} px={3} sx={{ borderBottom: '1px solid', borderColor: 'gray', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box as="a" href="/" sx={{ fontWeight: 'bold', color: 'text', textDecoration: 'none' }}>
          {siteMetadata.title}
        </Box>
        
        <Box sx={{ position: 'relative' }}>
          <Button 
            onClick={() => setIsSearchOpen(prev => !prev)}
            sx={{ 
              display: 'flex', alignItems: 'center', gap: 2, 
              bg: 'white', color: 'black', cursor: 'pointer', 
              py: 1, px: 2, fontSize: 1, borderRadius: 0, 
              border: '1px solid', borderColor: '#ccc',
              boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
              '&:hover': { bg: '#f9f9f9' }
            }}
          >
            ค้นหา <Box as="span" sx={{ fontSize: 0, color: 'gray', bg: '#f5f5f5', px: 1, borderRadius: 0, border: '1px solid', borderColor: '#e0e0e0' }}>Ctrl+K</Box>
          </Button>
          <SearchModal 
            isOpen={isSearchOpen} 
            onClose={() => setIsSearchOpen(false)} 
            navigateToStackedPage={navigateToStackedPage} 
          />
        </Box>
      </Flex>
    </header>
  );
}
