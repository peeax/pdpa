/** @jsxImportSource theme-ui */
'use client';
// Port of gatsby-theme-andy/src/components/Footer.js
import { Box } from 'theme-ui';
import { Themed } from '../theme/themed';
import ReferredBlock from './ReferredBlock';

export default function Footer({ references }) {
  return (
    <Box p={3} sx={{ borderRadius: 2 }} mb={2} bg="accent" color="text-light">
      <ReferredBlock references={references} />
      <p sx={{ m: 0, fontSize: 1 }}>
        หากพบข้อผิดพลาด หรือต้องการเสนอแนะ กรุณาติดต่อศูนย์{' '}
        <Themed.a
          sx={{ textDecoration: 'underline', color: 'text-light' }}
          href="https://si.mahidol.ac.th/data/contact"
        >
          SiData+
        </Themed.a>{' '}
        หรือ{' '}
        <Themed.a
          sx={{ textDecoration: 'underline', color: 'text-light' }}
          href="https://github.com/sidataplus/pdpa"
        >
          GitHub
        </Themed.a>{' '}
        นี้
      </p>
    </Box>
  );
}
