/** @jsxImportSource theme-ui */
'use client';
// Port of the project's shadowed gatsby-theme-andy BrainNote
// (src/gatsby-theme-andy/components/BrainNote.js), including the HighlightNote
// branch (pdf embed / pre-wrap plain-text content).
import { useMemo } from 'react';
import { Themed } from '../theme/themed';
import useWindowWidth from './useWindowWidth';
import MarkdownContent from './MarkdownContent';
import Popover from './Popover';
import Footer from './Footer';
import OfficialDisclaimer from './OfficialDisclaimer';
import { MOBILE_BREAKPOINT } from '../lib/constants';

/**
 * Renders a single note as either a Highlight (pre-wrap text / PDF) or a
 * regular markdown note with hover popovers for outbound wiki-links.
 *
 * @param {Object} props
 * @param {Object} props.note - Note data from build-notes.mjs. Shape:
 *   - slug {string}
 *   - title {string}
 *   - isHighlight {boolean} - true for highlight/announcement notes
 *   - body {string}         - linkified markdown (regular notes only)
 *   - content {string}      - raw pre-wrap text (highlight notes only)
 *   - pdf {string}          - local PDF path (highlight notes only)
 *   - main_pdf_link {string}- official PDF URL (highlight notes only)
 *   - outboundReferenceNotes {Array} - notes this note links to
 *   - inboundReferenceNotes  {Array} - notes that link to this note
 */
export default function BrainNote({ note }) {
  const [width] = useWindowWidth();
  const noPopups = width < MOBILE_BREAKPOINT;

  // Build hover popovers for resolved outbound wiki-links that have an excerpt.
  // Memoised so the <Popover> elements are not recreated on every render.
  const popups = useMemo(() => {
    const acc = {};
    (note.outboundReferenceNotes || [])
      .filter((ref) => !!ref.excerpt)
      .forEach((ln) => {
        acc[ln.slug] = <Popover reference={ln} />;
      });
    return acc;
  }, [note.outboundReferenceNotes]);

  // Highlight notes show pre-wrapped plain text (or a PDF embed) instead of markdown.
  if (note.isHighlight) {
    return (
      <>
        <div sx={{ flex: '1' }}>
          <Themed.h1 sx={{ my: 3 }}>{note.title}</Themed.h1>
          {note.content && (
            <Themed.p sx={{ lineHeight: 'body', whiteSpace: 'pre-wrap' }}>{note.content}</Themed.p>
          )}
        </div>
        <OfficialDisclaimer isHighlight={true} pdf={note.pdf} mainPdfLink={note.main_pdf_link} />
        <Footer references={note.inboundReferenceNotes || []} />
      </>
    );
  }

  return (
    <>
      <div sx={{ flex: '1' }}>
        <Themed.h1 sx={{ my: 3 }}>{note.title}</Themed.h1>
        <MarkdownContent body={note.body} popups={popups} noPopups={noPopups} />
      </div>
      {note.slug === 'about' && <OfficialDisclaimer />}
      <Footer references={note.inboundReferenceNotes || []} />
    </>
  );
}
