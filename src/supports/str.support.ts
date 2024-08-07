export const whatsappFormat = (text: string) => {
  // replace **text** to *text*
  text = text.replace(/\*\*(.*?)\*\*/g, '*$1*');
  // replace __text__ to _text_
  text = text.replace(/__(.*?)__/g, '_$1_');
  // replace [text](url) to *text* (url)
  text = text.replace(/\[(.*?)\]\((.*?)\)/g, '*$1* ($2)');
  // replace [text] to *text*
  text = text.replace(/\[(.*?)\]/g, '*$1*');
  // remove all headings (#)
  text = text.replace(/^#+/gm, '');
  return text;
};
