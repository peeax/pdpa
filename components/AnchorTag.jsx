/** @jsxImportSource theme-ui */
'use client';
// Port of gatsby-theme-andy/src/components/MdxComponents.js (the `a` handler).
//  - external links  -> plain <a> (browser default styling, as in the original)
//  - internal + mobile (noPopups) -> full navigation via next/link
//  - internal + desktop -> Tippy popover + LinkToStacked (push onto the stack)
import NextLink from 'next/link';
import { LinkToStacked } from './LinkToStacked';
import Tippy from './Tippy';

export default function AnchorTag({ href, node, popups = {}, noPopups = false, children, ...restProps }) {
  if (!href) href = restProps.to;

  if (href && !href.match(/^http/)) {
    if (noPopups) {
      return (
        <NextLink {...restProps} href={href} sx={{ variant: 'links.internal' }}>
          {children}
        </NextLink>
      );
    }
    return (
      <Tippy content={popups[href.replace(/^\//, '')]} placement="right" animation="shift-away">
        <LinkToStacked {...restProps} to={href} sx={{ variant: 'links.internal' }}>
          {children}
        </LinkToStacked>
      </Tippy>
    );
  }

  return (
    <a {...restProps} href={href} sx={{ color: 'links', textDecoration: 'none', '&:hover': { textDecoration: 'underline' } }}>
      {children}
    </a>
  );
}
