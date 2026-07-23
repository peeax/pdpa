import actStructure from '../content/act-structure.json';
import { buildTableOfContents } from './full-act.mjs';

export const TOC = buildTableOfContents(actStructure);
