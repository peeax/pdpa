'use client';

import { ThemeUIProvider } from 'theme-ui';
import EmotionRegistry from './EmotionRegistry';
import theme from '../theme';

export default function Providers({ children }) {
  return (
    <EmotionRegistry>
      <ThemeUIProvider theme={theme}>{children}</ThemeUIProvider>
    </EmotionRegistry>
  );
}
