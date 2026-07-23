'use client';
// Port of gatsby-theme-andy/src/components/CustomLinkToStacked.js
// Renders a plain <a> (the original used Gatsby <Link>) and intercepts clicks
// to push the target onto the stack instead of doing a full navigation.
import { useCallback, useRef } from 'react';
import { useStackedPage } from '../lib/stacked';

export function LinkToStacked({ to, onClick, onMouseLeave, onMouseEnter, ref, ...restProps }) {
  const [, , , navigateToStackedPage, highlightStackedPage] = useStackedPage();
  const highlightTimer = useRef(null);

  const onClickHandler = useCallback(
    (ev) => {
      ev.preventDefault();
      if (onClick) onClick(ev);

      const isMac =
        typeof window !== 'undefined' &&
        window.navigator.platform.toUpperCase().indexOf('MAC') >= 0;

      // Override cmd+click (Mac) / ctrl+click (others) to open in a new tab
      if ((isMac && ev.metaKey) || (!isMac && ev.ctrlKey)) {
        window.open(to, '_blank', 'noopener,noreferrer');
      } else {
        navigateToStackedPage(to);
      }
    },
    [navigateToStackedPage, to, onClick]
  );

  const onMouseEnterHandler = useCallback(
    (ev) => {
      clearTimeout(highlightTimer.current);
      highlightTimer.current = setTimeout(() => highlightStackedPage(to, true), 80);
      if (onMouseEnter) onMouseEnter(ev);
    },
    [to, onMouseEnter, highlightStackedPage]
  );

  const onMouseLeaveHandler = useCallback(
    (ev) => {
      clearTimeout(highlightTimer.current);
      highlightStackedPage(to, false);
      if (onMouseLeave) onMouseLeave(ev);
    },
    [to, onMouseLeave, highlightStackedPage]
  );

  return (
    <a
      {...restProps}
      href={to}
      ref={ref}
      onClick={onClickHandler}
      onMouseEnter={onMouseEnterHandler}
      onMouseLeave={onMouseLeaveHandler}
    />
  );
}
