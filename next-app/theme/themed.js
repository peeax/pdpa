'use client';
// theme-ui v0.16 no longer re-exports `Themed` from the top-level package.
// `@theme-ui/mdx` exposes the same set of themed HTML elements as `components`
// (h1..h6, p, a, ul, ol, li, blockquote, hr, em, strong, img, pre, code,
//  table, tr, th, td, ...), each applying theme.styles[tag]. We re-export it
// as `Themed` so call-sites read like the original gatsby-theme-andy code.
import { components } from '@theme-ui/mdx';

export const Themed = components;
export default components;
