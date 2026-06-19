/** @jsxImportSource theme-ui */
'use client';
// Ported from gatsby-theme-andy/src/components/Popover.js
import { Box } from 'theme-ui';
import { Themed } from '../theme/themed';

export default function Popover({ reference }) {
  return (
    <Box bg="background" p={3} sx={{ borderRadius: 2, boxShadow: '0 0 8px rgba(0, 0, 0, 0.125)' }}>
      <Themed.h3 sx={{ my: 3 }}>{reference.title}</Themed.h3>
      <Themed.p>{reference.excerpt}</Themed.p>
    </Box>
  );
}
