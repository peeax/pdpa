'use client';
// Port of `react-stacked-pages-hook` (lib/hooks.js + contexts.js) with the
// Gatsby-specific bits replaced:
//   - window.___loader.loadPage(slug)  ->  fetch('/notes/<slug>.json')
//   - gatsby `navigate()`              ->  a `navigate` callback (history.pushState)
//   - gatsby `withPrefix()`            ->  identity (no path prefix)
// The scroll/obstruction physics are kept identical for visual parity.
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import throttle from 'lodash.throttle';
import isEqual from 'lodash.isequal';

const throttleTime = 16;
const obstructedOffset = 120;

// ---- Contexts ----
export const StackedPagesContext = createContext({
  stackedPages: [],
  stackedPageStates: {},
  navigateToStackedPage: () => {},
  highlightStackedPage: () => {},
});
export const StackedPagesIndexContext = createContext(0);
export const StackedPagesProvider = StackedPagesContext.Provider;
export const PageIndexProvider = StackedPagesIndexContext.Provider;

/**
 * Fetches the JSON data for a specific note/page.
 * Mirrors Gatsby's lazy loadPage functionality.
 * Link targets usually carry a leading slash (e.g. "/article-1"),
 * but JSON files are named by bare slug ("article-1.json").
 * 
 * @param {string} slug - The slug or path of the note to load.
 * @returns {Promise<Object|null>} The parsed JSON data for the note, or null if it fails.
 */
async function loadNote(slug) {
  const bare = String(slug).replace(/^\/+/, '').replace(/\/+$/, '');
  try {
    const url = `/notes/${encodeURIComponent(bare)}.json${process.env.NODE_ENV === 'development' ? `?t=${Date.now()}` : ''}`;
    const res = await fetch(url, { cache: process.env.NODE_ENV === 'development' ? 'no-store' : 'default' });
    if (!res.ok) return null;
    return await res.json();
  } catch (e) {
    return null;
  }
}

function useScroll() {
  const containerRef = useRef(null);
  const [scroll, setScroll] = useState(0);
  const [width, setWidth] = useState(0);

  const scrollObserver = useCallback(() => {
    if (!containerRef.current) return;
    setScroll(containerRef.current.scrollLeft);
    setWidth(containerRef.current.getBoundingClientRect().width);
  }, [setScroll, setWidth, containerRef]);

  const throttledScrollObserver = throttle(scrollObserver, throttleTime);

  const setRef = useCallback((node) => {
    if (node) {
      node.addEventListener('scroll', throttledScrollObserver);
      containerRef.current = node;
      window.addEventListener('resize', throttledScrollObserver);
      throttledScrollObserver();
    } else if (containerRef.current) {
      containerRef.current.removeEventListener('scroll', throttledScrollObserver);
      window.removeEventListener('resize', throttledScrollObserver);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return [scroll, width, setRef, containerRef];
}

function getRoot(firstPage) {
  return firstPage ? [firstPage] : [];
}

export function useStackedPagesProvider({ location, firstPage, navigate, pageWidth = 625, obstructedPageWidth = 40 }) {
  const previousFirstPage = useRef(firstPage);
  const [scroll, containerWidth, setRef, containerRef] = useScroll();
  const [stackedPages, setStackedPages] = useState(getRoot(firstPage));
  const [stackedPageStates, setStackedPageStates] = useState(
    firstPage
      ? {
          [firstPage.slug]: {
            obstructed: false,
            highlighted: false,
            overlay: scroll > pageWidth - obstructedOffset,
            active: true,
          },
        }
      : {}
  );

  // slugs of the pages stacked after the first one, taken from ?stackedPages=...
  const stackedPagesSlugs = useMemo(() => {
    const params = new URLSearchParams((location.search || '').replace(/^\?/, ''));
    return params.getAll('stackedPages');
  }, [location]);

  // when the root page changes (navigating to a different first page), keep the tail
  useEffect(() => {
    if (isEqual(firstPage, previousFirstPage.current)) return;
    setStackedPages((pages) =>
      getRoot(firstPage).concat(previousFirstPage.current ? pages.slice(1) : pages)
    );
    previousFirstPage.current = firstPage;
  }, [firstPage]);

  // dynamically fetch the stacked notes listed in the query string
  useEffect(() => {
    let cancelled = false;
    Promise.all(stackedPagesSlugs.map((slug) => loadNote(slug))).then((data) => {
      if (cancelled) return;
      setStackedPages(
        getRoot(firstPage).concat(
          data
            .map((note, i) => ({ slug: stackedPagesSlugs[i], data: note }))
            .filter((x) => x.data)
        )
      );
    });
    return () => {
      cancelled = true;
    };
  }, [stackedPagesSlugs]); // eslint-disable-line react-hooks/exhaustive-deps

  // scroll the newest page into view
  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTo({
        top: 0,
        left: pageWidth * (stackedPages.length + 1),
        behavior: 'smooth',
      });
    }
  }, [stackedPages, containerRef]); // eslint-disable-line react-hooks/exhaustive-deps

  // recompute overlay/obstructed states on scroll or when pages change
  useEffect(() => {
    const acc = {};
    if (!containerRef.current) {
      setStackedPageStates(
        stackedPages.reduce((prev, x, i, a) => {
          prev[x.slug] = {
            overlay: true,
            obstructed: false,
            highlighted: false,
            active: i === a.length - 1,
          };
          return prev;
        }, acc)
      );
      return;
    }
    setStackedPageStates(
      stackedPages.reduce((prev, x, i, a) => {
        prev[x.slug] = {
          highlighted: false,
          overlay:
            scroll > Math.max(pageWidth * (i - 1) - (obstructedPageWidth * i - 2), 0) ||
            scroll < Math.max(0, pageWidth * (i - 2)),
          obstructed:
            scroll >
              Math.max(pageWidth * (i + 1) - obstructedOffset - obstructedPageWidth * (i - 1), 0) ||
            scroll + containerWidth < pageWidth * i + obstructedOffset,
          active: i === a.length - 1,
        };
        return prev;
      }, acc)
    );
  }, [stackedPages, containerRef, scroll, containerWidth]); // eslint-disable-line react-hooks/exhaustive-deps

  const navigateToStackedPage = useCallback(
    (to, index = 0) => {
      const existingPage = stackedPages.findIndex((x) => x.slug === to);
      if (existingPage !== -1 && containerRef && containerRef.current) {
        setStackedPageStates((states) => {
          if (!states[to]) return states;
          return Object.keys(states).reduce((prev, slug) => {
            prev[slug] = { ...states[slug], highlighted: false, active: slug === to };
            return prev;
          }, {});
        });
        containerRef.current.scrollTo({
          top: 0,
          left: pageWidth * existingPage - (obstructedPageWidth * existingPage - 1),
          behavior: 'smooth',
        });
        return;
      }
      const params = new URLSearchParams(window.location.search.replace(/^\?/, ''));
      params.delete('stackedPages');
      stackedPages
        .slice(1, index + 1)
        .map((x) => x.slug)
        .concat(to)
        .forEach((slug) => params.append('stackedPages', slug));
      const qs = params.toString();
      navigate(`${window.location.pathname}${qs ? `?${qs}` : ''}`);
    },
    [stackedPages, navigate, containerRef, pageWidth, obstructedPageWidth]
  );

  const highlightStackedPage = useCallback((slug, highlighted) => {
    setStackedPageStates((states) => {
      if (!states[slug]) return states;
      return {
        ...states,
        [slug]: {
          ...states[slug],
          highlighted: typeof highlighted !== 'undefined' ? highlighted : !states[slug].highlighted,
        },
      };
    });
  }, []);

  const contextValue = useMemo(
    () => ({ stackedPages, navigateToStackedPage, highlightStackedPage, stackedPageStates }),
    [stackedPages, navigateToStackedPage, highlightStackedPage, stackedPageStates]
  );

  return [contextValue, setRef];
}

export function useStackedPage() {
  const { stackedPages, stackedPageStates, navigateToStackedPage, highlightStackedPage } =
    useContext(StackedPagesContext);
  const index = useContext(StackedPagesIndexContext);
  const hookedNavigateToStackedPage = useCallback(
    (to) => navigateToStackedPage(to, index),
    [navigateToStackedPage, index]
  );
  const currentPage = stackedPages[index];
  return [
    currentPage,
    currentPage ? stackedPageStates[currentPage.slug] : {},
    index,
    hookedNavigateToStackedPage,
    highlightStackedPage,
  ];
}
