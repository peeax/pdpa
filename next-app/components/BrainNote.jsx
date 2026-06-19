/** @jsxImportSource theme-ui */
'use client';
// Port of the project's shadowed gatsby-theme-andy BrainNote
// (src/gatsby-theme-andy/components/BrainNote.js), including the HighlightNote
// branch (pdf embed / pre-wrap plain-text content).
import { Themed } from '../theme/themed';
import useWindowWidth from './useWindowWidth';
import MarkdownContent from './MarkdownContent';
import Popover from './Popover';
import Footer from './Footer';

export default function BrainNote({ note }) {
  const [width] = useWindowWidth();
  const noPopups = width < 768;

  // Build hover popovers for resolved outbound wiki-links that have an excerpt.
  const popups = {};
  (note.outboundReferenceNotes || [])
    .filter((reference) => !!reference.excerpt)
    .forEach((ln) => {
      popups[ln.slug] = <Popover reference={ln} />;
    });

  if (note.isHighlight) {
    return (
      <>
        <div sx={{ flex: '1' }}>
          <Themed.h1 sx={{ my: 3 }}>{note.title}</Themed.h1>

          {note.pdf && (
            <embed src={note.pdf} width="100%" height="800px" type="application/pdf" />
          )}

          {note.content && (
            <Themed.p sx={{ lineHeight: 'body', whiteSpace: 'pre-wrap' }}>{note.content}</Themed.p>
          )}
        </div>

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

      <Footer references={note.inboundReferenceNotes || []} />
    </>
  );
}
