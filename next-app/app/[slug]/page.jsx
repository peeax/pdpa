import { notFound } from 'next/navigation';
import { getNote, getAllSlugs } from '../../lib/build-notes.mjs';
import { SITE_TITLE } from '../../lib/site';
import BrainNoteContainer from '../../components/BrainNoteContainer';

export const dynamicParams = false;

export function generateStaticParams() {
  return getAllSlugs().map((slug) => ({ slug }));
}

export function generateMetadata({ params }) {
  const note = getNote(params.slug);
  return { title: note ? `${note.title} - ${SITE_TITLE}` : SITE_TITLE };
}

export default function NotePage({ params }) {
  const note = getNote(params.slug);
  if (!note) notFound();
  return (
    <BrainNoteContainer slug={params.slug} note={note} siteMetadata={{ title: SITE_TITLE }} />
  );
}
