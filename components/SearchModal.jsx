/** @jsxImportSource theme-ui */
'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Box, Flex, Input, Text, Spinner } from 'theme-ui';

export default function SearchModal({ isOpen, onClose, navigateToStackedPage }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [indexData, setIndexData] = useState(null);
  const [loading, setLoading] = useState(false);

  const inputRef = useRef(null);
  const resultsRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setSelectedIndex(0);
      setResults([]);
      if (!indexData) {
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
      setTimeout(() => {
        if (inputRef.current) inputRef.current.focus();
      }, 50);
    }
  }, [isOpen]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!query || !indexData) {
      setResults([]);
      return;
    }

    const buildSearchRegexStr = (q) => {
      // 1. Escape special regex characters
      let escaped = q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      
      // 2. Treat any spaces typed by user as optional spaces
      escaped = escaped.replace(/\s+/g, '\\s*');
      
      // 3. Insert optional spaces between Text and Numbers (e.g. "มาตรา1" -> "มาตรา\s*1")
      escaped = escaped.replace(/([^0-9๐-๙\s\\])(?=[0-9๐-๙])/g, '$1\\s*');
      escaped = escaped.replace(/([0-9๐-๙])(?=[^0-9๐-๙\s\\])/g, '$1\\s*');

      // 4. Map Arabic and Thai numerals
      return escaped.replace(/[0-9๐-๙]/g, match => {
        const map = {
          '0': '[0๐]', '๐': '[0๐]',
          '1': '[1๑]', '๑': '[1๑]',
          '2': '[2๒]', '๒': '[2๒]',
          '3': '[3๓]', '๓': '[3๓]',
          '4': '[4๔]', '๔': '[4๔]',
          '5': '[5๕]', '๕': '[5๕]',
          '6': '[6๖]', '๖': '[6๖]',
          '7': '[7๗]', '๗': '[7๗]',
          '8': '[8๘]', '๘': '[8๘]',
          '9': '[9๙]', '๙': '[9๙]'
        };
        return map[match] || match;
      });
    };

    const regexStr = buildSearchRegexStr(query);
    const testRegex = new RegExp(regexStr, 'i');
    
    // Simple filter and scoring
    const matches = indexData
      .map(item => {
        let score = 0;
        const titleMatch = testRegex.test(item.title);
        const textMatch = testRegex.test(item.text);
        
        if (titleMatch) score += 10;
        if (textMatch) score += 1;

        if (score > 0) {
          // Find context snippet
          let snippet = '';
          if (textMatch) {
            const matchIndex = item.text.search(testRegex);
            const start = Math.max(0, matchIndex - 30);
            const end = Math.min(item.text.length, matchIndex + query.length + 30);
            snippet = (start > 0 ? '...' : '') + 
                      item.text.substring(start, end) + 
                      (end < item.text.length ? '...' : '');
            
            // Minimal highlight replacement
            snippet = snippet.replace(new RegExp(`(${regexStr})`, 'gi'), '«$1»');
          }

          return { ...item, score, snippet };
        }
        return null;
      })
      .filter(Boolean)
      .sort((a, b) => b.score - a.score)
      .slice(0, 20); // limit to 20 results

    // Group results
    const groups = [];
    const articles = matches.filter(m => m.type === 'article');
    const highlights = matches.filter(m => m.type === 'highlight');
    const others = matches.filter(m => m.type === 'other');

    if (articles.length > 0) groups.push({ label: 'หมวดมาตรา (Articles)', items: articles });
    if (highlights.length > 0) groups.push({ label: 'หมวดไฮไลต์ / คำอธิบาย (Highlights)', items: highlights });
    if (others.length > 0) groups.push({ label: 'หมวดอื่นๆ (Others)', items: others });

    // Flatten for keyboard navigation
    const flatResults = [];
    groups.forEach(g => {
      flatResults.push({ isHeader: true, label: g.label });
      g.items.forEach(item => flatResults.push({ isItem: true, ...item }));
    });

    setResults(flatResults);
    setSelectedIndex(flatResults.findIndex(r => r.isItem)); // select first item
  }, [query, indexData]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!isOpen) return;
      if (e.key === 'Escape') {
        onClose();
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
          onClose();
          navigateToStackedPage(selected.slug);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, results, selectedIndex, onClose, navigateToStackedPage]);

  // Scroll active item into view
  useEffect(() => {
    if (resultsRef.current) {
      const activeEl = resultsRef.current.querySelector('.selected');
      if (activeEl) {
        activeEl.scrollIntoView({ block: 'nearest' });
      }
    }
  }, [selectedIndex]);

  if (!isOpen) return null;

  return (
    <>
      <Box
        onClick={onClose}
        sx={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: 999, // invisible click-catcher
        }}
      />
      <Box
        onClick={(e) => e.stopPropagation()}
        sx={{
          position: 'absolute',
          top: '100%',
          right: 0,
          mt: 2,
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
        <Flex sx={{ p: 3, borderBottom: '1px solid', borderColor: 'muted', alignItems: 'center' }}>
          <Input
            ref={inputRef}
            placeholder="พิมพ์คำค้นหา..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            sx={{
              border: 'none',
              outline: 'none',
              fontSize: 2,
              p: 1,
              width: '100%',
              flex: 1,
              backgroundColor: 'transparent',
              '&:focus': { outline: 'none' },
            }}
          />
          {loading && <Spinner size={24} />}
        </Flex>

        <Box ref={resultsRef} sx={{ overflowY: 'auto', p: 2 }}>
          {query && results.length === 0 && !loading && (
            <Text sx={{ p: 3, color: 'gray', textAlign: 'center' }}>ไม่พบผลลัพธ์</Text>
          )}

          {results.map((item, i) => {
            if (item.isHeader) {
              return (
                <Text
                  key={`header-${i}`}
                  sx={{
                    px: 3,
                    pt: 3,
                    pb: 1,
                    fontSize: 1,
                    fontWeight: 'bold',
                    color: 'gray',
                    textTransform: 'uppercase',
                    letterSpacing: 0.5,
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
                onClick={() => {
                  onClose();
                  navigateToStackedPage(item.slug);
                }}
                sx={{
                  px: 3,
                  py: 2,
                  mx: 2,
                  my: 1,
                  borderRadius: 0,
                  cursor: 'pointer',
                  backgroundColor: isSelected ? 'highlight' : 'transparent',
                  '&:hover': {
                    backgroundColor: isSelected ? 'highlight' : 'muted',
                  },
                }}
              >
                <Text sx={{ fontWeight: 'bold', display: 'block', mb: 1 }}>{item.title}</Text>
                {item.snippet && (
                  <Text
                    sx={{
                      fontSize: 1,
                      color: 'text',
                      opacity: 0.8,
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden',
                    }}
                  >
                    {item.snippet}
                  </Text>
                )}
              </Box>
            );
          })}
          
          {!query && (
            <Box sx={{ p: 4, textAlign: 'center', color: 'gray' }}>
              <Text>พิมพ์คำค้นหาเพื่อเริ่มค้นหา</Text>
              <Flex sx={{ justifyContent: 'center', mt: 3, gap: 2 }}>
                <Text sx={{ fontSize: 1, bg: 'muted', px: 2, py: 1, borderRadius: 0 }}>ลูกศรขึ้น/ลง เพื่อเลือก</Text>
                <Text sx={{ fontSize: 1, bg: 'muted', px: 2, py: 1, borderRadius: 0 }}>Enter เพื่อตกลง</Text>
                <Text sx={{ fontSize: 1, bg: 'muted', px: 2, py: 1, borderRadius: 0 }}>Esc เพื่อปิด</Text>
              </Flex>
            </Box>
          )}
        </Box>
      </Box>
    </>
  );
}
