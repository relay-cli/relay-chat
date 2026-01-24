const maximumTitleLength = 54;

export const titleFromMessage = (content: string): string => {
  const compact = content.replace(/\s+/g, ' ').trim();
  if (compact === '') return 'New conversation';
  if (compact.length <= maximumTitleLength) return compact;
  return `${compact.slice(0, maximumTitleLength - 1).trimEnd()}…`;
};
