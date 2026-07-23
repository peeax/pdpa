const DISCLOSURE_PATTERN =
  /<details>\s*<summary>\s*([\s\S]*?)\s*<\/summary>\s*([\s\S]*?)\s*<\/details>/g;

function plainText(value) {
  return value
    .replace(/<\/?strong>/g, '')
    .replace(/[*_#]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

export function formatDisclosureMarkup(source) {
  return String(source).replace(
    DISCLOSURE_PATTERN,
    (_, label, body) => {
      const formattedLabel = plainText(label);
      let formattedBody = body.trim();
      const firstHeading = formattedBody.match(/^#{1,6}\s+(.+?)(?:\r?\n|$)/);
      if (firstHeading && plainText(firstHeading[1]) === formattedLabel) {
        formattedBody = formattedBody.slice(firstHeading[0].length).trim();
      }

      return (
        `<details>\n<summary>${formattedLabel}</summary>\n\n` +
        `${formattedBody}\n\n</details>`
      );
    }
  );
}
