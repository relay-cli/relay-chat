export type MarkdownBlock =
  | {type: 'paragraph'; text: string}
  | {type: 'heading'; level: number; text: string}
  | {type: 'quote'; text: string}
  | {type: 'list'; ordered: boolean; items: readonly string[]}
  | {type: 'code'; language?: string; code: string}
  | {type: 'rule'};

export type InlineToken =
  | {type: 'text'; value: string}
  | {type: 'strong'; value: string}
  | {type: 'emphasis'; value: string}
  | {type: 'code'; value: string}
  | {type: 'link'; value: string; href: string};
