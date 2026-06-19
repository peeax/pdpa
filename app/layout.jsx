import './globals.css';
import 'tippy.js/dist/tippy.css';
import 'tippy.js/animations/shift-away.css';
import Providers from './Providers';

export const metadata = {
  title:
    'พ.ร.บ.คุ้มครองข้อมูลส่วนบุคคล พ.ศ. ๒๕๖๒ Thailand PDPA - SiData+ คณะแพทยศาสตร์ศิริราชพยาบาล',
  manifest: '/manifest.webmanifest',
  icons: { icon: '/favicon.png' },
};

export const viewport = {
  themeColor: '#006400',
};

export default function RootLayout({ children }) {
  return (
    <html lang="th">
      <head>
        <meta
          httpEquiv="Content-Security-Policy"
          content="default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' data: https://fonts.gstatic.com; img-src 'self' data: https:;"
        />
        <meta httpEquiv="X-Content-Type-Options" content="nosniff" />
      </head>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
