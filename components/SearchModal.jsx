/** @jsxImportSource theme-ui */
'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Box, Flex, Input, Text, Spinner } from 'theme-ui';

export default function SearchModal({ navigateToStackedPage }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [indexData, setIndexData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const inputRef = useRef(null);
  const resultsRef = useRef(null);

  useEffect(() => {
    if (isOpen && !indexData) {
      setLoading(true);
      fetch('/search-index.json' + (process.env.NODE_ENV === 'development' ? `?t=${Date.now()}` : ''))
        .then(res => res.json())
        .then(data => {
          setIndexData(data);
          setLoading(false);
        })
        .catch(err => {
          console.error('Error fetching search index:', err);
          setLoading(false);
        });
    }
  }, [isOpen, indexData]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setIsOpen(true);
        if (inputRef.current) inputRef.current.focus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  useEffect(() => {
    if (!query || !indexData) {
      setResults([]);
      return;
    }

    const buildSearchRegexStr = (q) => {
      let escaped = q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      escaped = escaped.replace(/\s+/g, '\\s*');
      escaped = escaped.replace(/([^0-9๐-๙\s\\])(?=[0-9๐-๙])/g, '$1\\s*');
      escaped = escaped.replace(/([0-9๐-๙])(?=[^0-9๐-๙\s\\])/g, '$1\\s*');
      return escaped.replace(/[0-9๐-๙]/g, match => {
        const map = {
          '0': '[0๐]', '๐': '[0๐]', '1': '[1๑]', '๑': '[1๑]',
          '2': '[2๒]', '๒': '[2๒]', '3': '[3๓]', '๓': '[3๓]',
          '4': '[4๔]', '๔': '[4๔]', '5': '[5๕]', '๕': '[5๕]',
          '6': '[6๖]', '๖': '[6๖]', '7': '[7๗]', '๗': '[7๗]',
          '8': '[8๘]', '๘': '[8๘]', '9': '[9๙]', '๙': '[9๙]'
        };
        return map[match] || match;
      });
    };

    const regexStr = buildSearchRegexStr(query);
    const testRegex = new RegExp(regexStr, 'i');
    
    const escapeHtml = (unsafe) => {
      return unsafe
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
    };

    const matches = indexData
      .map(item => {
        let score = 0;
        const titleMatch = testRegex.test(item.title);
        const textMatch = testRegex.test(item.text);
        
        if (titleMatch) score += 10;
        if (textMatch) score += 1;

        if (score > 0) {
          let snippet = '';
          const markTemplate = '<span style="color: #3182ce; font-weight: bold;">$1</span>';
          let highlightedTitle = escapeHtml(item.title).replace(new RegExp(`(${regexStr})`, 'gi'), markTemplate);

          if (textMatch) {
            const matchIndex = item.text.search(testRegex);
            const start = Math.max(0, matchIndex - 30);
            const end = Math.min(item.text.length, matchIndex + query.length + 30);
            const rawSnippet = (start > 0 ? '...' : '') + item.text.substring(start, end) + (end < item.text.length ? '...' : '');
            snippet = escapeHtml(rawSnippet).replace(new RegExp(`(${regexStr})`, 'gi'), markTemplate);
          }
          return { ...item, score, snippet, highlightedTitle };
        }
        return null;
      })
      .filter(Boolean)
      .sort((a, b) => b.score - a.score)
      .slice(0, 20);

    const groups = [];
    const articles = matches.filter(m => m.type === 'article');
    const highlights = matches.filter(m => m.type === 'highlight');
    const others = matches.filter(m => m.type === 'other');

    if (articles.length > 0) groups.push({ label: 'หมวดมาตรา', items: articles });
    if (highlights.length > 0) groups.push({ label: 'หมวดคำอธิบาย', items: highlights });
    if (others.length > 0) groups.push({ label: 'หมวดอื่นๆ', items: others });

    const flatResults = [];
    groups.forEach(g => {
      flatResults.push({ isHeader: true, label: g.label });
      g.items.forEach(item => flatResults.push({ isItem: true, ...item }));
    });

    setResults(flatResults);
    setSelectedIndex(flatResults.findIndex(r => r.isItem));
  }, [query, indexData]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!isOpen) return;
      if (e.key === 'Escape') {
        setIsOpen(false);
        if (inputRef.current) inputRef.current.blur();
        e.preventDefault();
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex(prev => {
          let next = prev + 1;
          while (next < results.length && !results[next].isItem) next++;
          return next < results.length ? next : prev;
        });
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex(prev => {
          let next = prev - 1;
          while (next >= 0 && !results[next].isItem) next--;
          return next >= 0 ? next : prev;
        });
      } else if (e.key === 'Enter') {
        e.preventDefault();
        const selected = results[selectedIndex];
        if (selected && selected.isItem) {
          setIsOpen(false);
          setQuery('');
          if (inputRef.current) inputRef.current.blur();
          navigateToStackedPage(selected.slug);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, results, selectedIndex, navigateToStackedPage]);

  useEffect(() => {
    if (resultsRef.current) {
      const activeEl = resultsRef.current.querySelector('.selected');
      if (activeEl) {
        activeEl.scrollIntoView({ block: 'nearest' });
      }
    }
  }, [selectedIndex]);

  return (
    <Box sx={{ position: 'relative' }}>
      <Flex sx={{ alignItems: 'center', bg: 'white', border: '1px solid', borderColor: '#ccc', px: 2, py: 1 }}>
        <Input
          ref={inputRef}
          placeholder="พิมพ์คำค้นหา..."
          value={query}
          onFocus={() => setIsOpen(true)}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
          }}
          sx={{
            border: 'none',
            outline: 'none',
            fontSize: 2,
            p: 1,
            width: ['150px', '200px'],
            backgroundColor: 'transparent',
            '&:focus': { outline: 'none' },
          }}
        />
        <Box sx={{ display: 'flex', alignItems: 'center', color: 'text-light', px: 2 }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8"></circle>
            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
          </svg>
        </Box>
      </Flex>
      
      {isOpen && (
        <>
          <Box
            onClick={() => setIsOpen(false)}
            sx={{
              position: 'fixed',
              top: 0, left: 0, right: 0, bottom: 0,
              zIndex: 999, // click catcher
            }}
          />
          {query.trim().length > 0 && (
            <Box
              onClick={(e) => e.stopPropagation()}
              sx={{
                position: 'absolute',
                top: '100%',
                right: 0,
                mt: 1,
                width: ['calc(100vw - 32px)', '400px', '450px'],
                backgroundColor: 'background',
                borderRadius: 0,
                boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
                border: '1px solid',
                borderColor: 'muted',
                overflow: 'hidden',
                display: 'flex',
                flexDirection: 'column',
                maxHeight: '70vh',
                zIndex: 1000,
              }}
            >
              {loading && (
                <Flex sx={{ p: 3, justifyContent: 'center' }}>
                  <Spinner size={24} />
                </Flex>
              )}

              <Box ref={resultsRef} sx={{ overflowY: 'auto', p: 2 }}>
                {query && results.length === 0 && !loading && (
                  <Text sx={{ p: 3, color: 'text-light', textAlign: 'center' }}>ไม่พบผลลัพธ์</Text>
                )}

                {results.map((item, i) => {
                  if (item.isHeader) {
                    return (
                      <Text
                        key={`header-${i}`}
                        sx={{
                          px: 3, pt: 3, pb: 1,
                          fontSize: 1, fontWeight: 'bold', color: 'text',
                          textTransform: 'uppercase', letterSpacing: 0.5,
                        }}
                      >
                        {item.label}
                      </Text>
                    );
                  }

                  const isSelected = i === selectedIndex;

                  return (
                    <Box
                      key={`item-${item.slug}-${i}`}
                      className={isSelected ? 'selected' : ''}
                      onMouseEnter={() => setSelectedIndex(i)}
                      onClick={() => {
                        setIsOpen(false);
                        setQuery('');
                        if (inputRef.current) inputRef.current.blur();
                        navigateToStackedPage(item.slug);
                      }}
                      sx={{
                        px: 3, py: 2, mx: 2, my: 1,
                        borderRadius: 0, cursor: 'pointer',
                        backgroundColor: isSelected ? 'muted' : 'transparent',
                        borderLeft: isSelected ? '3px solid #3182ce' : '3px solid transparent',
                        '&:hover': {
                          backgroundColor: 'muted',
                        },
                      }}
                    >
                      <Text sx={{ fontWeight: 'bold', display: 'block', mb: 1, color: isSelected ? '#3182ce' : 'text' }} dangerouslySetInnerHTML={{ __html: item.highlightedTitle || item.title }} />
                      {item.snippet && (
                        <Text
                          sx={{
                            fontSize: 1, color: 'text', opacity: 0.8,
                            display: '-webkit-box', WebkitLineClamp: 2,
                            WebkitBoxOrient: 'vertical', overflow: 'hidden',
                          }}
                          dangerouslySetInnerHTML={{ __html: item.snippet }}
                        />
                      )}
                    </Box>
                  );
                })}
              </Box>
            </Box>
          )}
        </>
      )}
    </Box>
  );
}
