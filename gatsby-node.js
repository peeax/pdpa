const path = require('path');
const fs = require('fs');

exports.sourceNodes = ({ actions, createNodeId, createContentDigest }) => {
  const { createNode } = actions;
  const contentDir = path.join(__dirname, 'content');
  const dataPath = path.join(contentDir, 'highlights-data.json');

  if (!fs.existsSync(dataPath)) {
    return;
  }

  const highlights = JSON.parse(fs.readFileSync(dataPath, 'utf8'));

  highlights.forEach((item) => {
    const { slug, title, pdf, content } = item;
    if (!slug || !title) return;
    
    const node = {
      ...item,
      id: createNodeId(`HighlightNote-${slug}`),
      internal: {
        type: `HighlightNote`,
        contentDigest: createContentDigest(JSON.stringify(item)),
      },
    };

    createNode(node);
  });
};

exports.createPages = async ({ graphql, actions }) => {
  const { createPage } = actions;
  const templatePath = path.resolve('./src/templates/highlight-page.js');

  const result = await graphql(`
    query {
      allHighlightNote {
        nodes {
          slug
        }
      }
    }
  `);

  if (result.errors) {
    throw result.errors;
  }

  result.data.allHighlightNote.nodes.forEach((node) => {
    createPage({
      path: `/${node.slug}`,
      component: templatePath,
      context: {
        slug: node.slug,
      },
    });
  });
};

exports.onCreatePage = ({ page, actions }) => {
  const { createPage, deletePage } = actions;
  
  if (page.path.includes('\\')) {
    deletePage(page);
    let newPath = page.path.replace(/\\/g, '/');
    newPath = newPath.replace(/\/\//g, '/');
    createPage({
      ...page,
      path: newPath,
    });
  }
};

