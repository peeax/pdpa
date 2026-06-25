// Ported verbatim from the original gatsby-theme-andy shadowed theme
// (src/gatsby-theme-andy/themes.js) so colors, spacing, type scale and
// element styles render identically under theme-ui.
const theme = {
  initialColorModeName: 'light',
  useColorSchemeMediaQuery: true,
  colors: {
    text: '#333',
    'text-light': '#718096',
    background: '#fff',
    primary: '#3182ce',
    links: '#3182ce',
    gray: '#dadada',
    accent: '#fafafc',
    modes: {
      dark: {
        text: '#e2e8f0',
        'text-light': '#a0aec0',
        background: '#1a202c',
        primary: '#63b3ed',
        links: '#63b3ed',
        gray: '#4a5568',
        accent: '#2d3748',
      },
    },
  },
  breakpoints: ['640px', '768px', '1024px', '1280px'],
  space: [0, 4, 8, 16, 32, 64, 128, 256, 512],
  borders: [0, 1, 2, 3, 4],
  radii: [0, 4, 8, 16, 32, 64, 128, 256, 512],
  fonts: {
    body:
      'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", sans-serif',
    heading: 'inherit',
    monospace: 'Menlo, monospace',
  },
  fontSizes: [12, 14, 16, 20, 24, 32, 48, 64, 96],
  fontWeights: {
    body: 400,
    heading: 700,
    bold: 700,
  },
  lineHeights: {
    body: 1.5,
    heading: 1.125,
  },
  links: {
    internal: {
      color: 'links',
      textDecoration: 'none',
      px: '2px',
      mx: '-2px',
      borderRadius: 1,
      ':hover': {
        bg: 'accent',
        textDecoration: 'underline',
      },
      ':focus': {
        bg: 'accent',
      },
    },
  },
  styles: {
    root: {
      fontFamily: 'body',
      lineHeight: 'body',
      fontWeight: 'body',
    },
    h1: {
      color: 'text',
      fontFamily: 'heading',
      lineHeight: 'heading',
      fontWeight: 'heading',
      fontSize: 5,
    },
    h2: {
      color: 'text',
      fontFamily: 'heading',
      lineHeight: 'heading',
      fontWeight: 'heading',
      fontSize: 4,
    },
    h3: {
      color: 'text',
      fontFamily: 'heading',
      lineHeight: 'heading',
      fontWeight: 'heading',
      fontSize: 3,
    },
    h4: {
      color: 'text',
      fontFamily: 'heading',
      lineHeight: 'heading',
      fontWeight: 'heading',
      fontSize: 2,
    },
    h5: {
      color: 'text',
      fontFamily: 'heading',
      lineHeight: 'heading',
      fontWeight: 'heading',
      fontSize: 1,
    },
    h6: {
      color: 'text',
      fontFamily: 'heading',
      lineHeight: 'heading',
      fontWeight: 'heading',
      fontSize: 0,
    },
    p: {
      color: 'text',
    },
    a: {
      color: 'links',
      textDecoration: 'none',
      ':hover': {
        textDecoration: 'underline',
      },
    },
    pre: {
      fontFamily: 'monospace',
      overflowX: 'auto',
      code: {
        color: 'inherit',
      },
    },
    code: {
      fontFamily: 'monospace',
      fontSize: 'inherit',
    },
    table: {
      width: '100%',
      borderCollapse: 'separate',
      borderSpacing: 0,
    },
    th: {
      textAlign: 'left',
      borderBottomStyle: 'solid',
    },
    td: {
      textAlign: 'left',
      borderBottomStyle: 'solid',
    },
    img: {
      maxWidth: '100%',
    },
  },
};

export default theme;
