import React from 'react';
import { graphql } from 'gatsby';
import BrainNoteContainer from 'gatsby-theme-andy/src/components/BrainNoteContainer';

const HighlightPage = (props) => {
  return (
    <BrainNoteContainer
      note={props.data.brainNote}
      location={props.location}
      slug={props.pageContext.slug}
      siteMetadata={props.data.site.siteMetadata}
    />
  );
};

export default HighlightPage;

export const query = graphql`
  query HighlightNoteBySlug($slug: String!) {
    brainNote: highlightNote(slug: { eq: $slug }) {
      slug
      title
      pdf
      content
    }
    site {
      siteMetadata {
        title
      }
    }
  }
`;
