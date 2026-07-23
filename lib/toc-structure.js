import actStructure from '../content/act-structure.json';

function articleLabels(section) {
  if (section.startArticle == null) return [];
  return Array.from(
    { length: section.endArticle - section.startArticle + 1 },
    (_, index) => `ม${section.startArticle + index}`,
  );
}

export const TOC = actStructure.sections.reduce((toc, section) => {
  const item = {
    ...(section.headingLevel === 2
      ? { title: section.heading }
      : { subtitle: section.heading }),
    articles: articleLabels(section),
  };

  if (section.headingLevel === 2) {
    toc.push(item);
  } else {
    const parent = toc.at(-1);
    if (!parent) throw new Error(`TOC section "${section.heading}" has no parent chapter`);
    parent.sections = parent.sections || [];
    parent.sections.push(item);
  }
  return toc;
}, []);
