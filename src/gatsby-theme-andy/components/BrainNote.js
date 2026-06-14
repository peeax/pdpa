/** @jsx jsx */
import React from 'react';
import { MDXRenderer } from 'gatsby-plugin-mdx';
import { Styled, ThemeProvider, jsx } from 'theme-ui';

import useWindowWidth from 'gatsby-theme-andy/src/utils/useWindowWidth';
import components from 'gatsby-theme-andy/src/components/MdxComponents';
import Footer from './Footer';
import Popover from 'gatsby-theme-andy/src/components/Popover';

import theme from 'gatsby-theme-andy/src/theme';

const BrainNote = ({ note }) => {
  const [width] = useWindowWidth();

  const popups = {};
  if (note.outboundReferenceNotes) {
    note.outboundReferenceNotes
      .filter((reference) => !!reference.childMdx.excerpt)
      .forEach((ln, i) => {
        popups[ln.slug] = <Popover reference={ln} />;
      });
  }

  const AnchorTagWithPopups = (props) => (
    <components.a {...props} popups={popups} noPopups={width < 768} />
  );

  const isHighlightNote = note.pdf !== undefined || note.content !== undefined || !note.childMdx;

  if (isHighlightNote) {
    return (
      <ThemeProvider theme={theme} components={{ ...components, a: AnchorTagWithPopups }}>
        <div sx={{ flex: '1' }}>
          <Styled.h1 sx={{ my: 3 }}>{note.title}</Styled.h1>
          
          {note.pdf && (
            <embed src={note.pdf} width="100%" height="800px" type="application/pdf" />
          )}
          
          {note.content && (
            <Styled.p sx={{ lineHeight: 'body', whiteSpace: 'pre-wrap' }}>
              {note.content}
            </Styled.p>
          )}


        </div>

        <Footer references={note.inboundReferenceNotes || []} />
      </ThemeProvider>
    );
  }
  return (
    <ThemeProvider theme={theme} components={{ ...components, a: AnchorTagWithPopups }}>
      <div sx={{ flex: '1' }}>
        <Styled.h1 sx={{ my: 3 }}>{note.title}</Styled.h1>
        <MDXRenderer>{note.childMdx.body}</MDXRenderer>
      </div>

      <Footer references={note.inboundReferenceNotes || []} />
    </ThemeProvider>
  );
};

export default BrainNote;
