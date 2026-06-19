import { notFound } from 'next/navigation';
import { getNote, ROOT_NOTE } from '../lib/build-notes.mjs';
import { SITE_TITLE } from '../lib/site';
import BrainNoteContainer from '../components/BrainNoteContainer';

// The root note ('about') is served at '/', mirroring gatsby-theme-andy's rootNote.
export default function HomePage() {
  const note = getNote(ROOT_NOTE);
  if (!note) notFound();
  return (
    <BrainNoteContainer slug={ROOT_NOTE} note={note} siteMetadata={{ title: SITE_TITLE }} />
  );
}
