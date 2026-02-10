declare module 'react-syntax-highlighter' {
  import { Component } from 'react';
  export interface SyntaxHighlighterProps {
    language?: string;
    style?: any;
    children?: string | string[];
    customStyle?: any;
    codeTagProps?: any;
    useInlineStyles?: boolean;
    showLineNumbers?: boolean;
    showInlineLineNumbers?: boolean;
    startingLineNumber?: number;
    lineNumberContainerStyle?: any;
    lineNumberStyle?: any | ((lineNumber: number) => any);
    wrapLines?: boolean;
    wrapLongLines?: boolean;
    lineProps?: any | ((lineNumber: number) => any);
    renderer?: (props: { rows: any[]; stylesheet: any; useInlineStyles: boolean }) => any;
    PreTag?: string | Component<any>;
    CodeTag?: string | Component<any>;
    [key: string]: any;
  }
  export class Light extends Component<SyntaxHighlighterProps> {
    static registerLanguage(name: string, func: any): void;
  }
  export default class SyntaxHighlighter extends Component<SyntaxHighlighterProps> {}
}

declare module 'react-syntax-highlighter/dist/esm/styles/prism' {
  export const vscDarkPlus: any;
  export const oneDark: any;
  export const oneLight: any;
  export const vs: any;
  export const atomDark: any;
  export const base16AteliersulphurpoolLight: any;
  export const cb: any;
  export const coldarkCold: any;
  export const coldarkDark: any;
  export const coy: any;
  export const coyWithoutShadows: any;
  export const darcula: any;
  export const dark: any;
  export const dracula: any;
  export const duotoneDark: any;
  export const duotoneEarth: any;
  export const duotoneForest: any;
  export const duotoneLight: any;
  export const duotoneSea: any;
  export const duotoneSpace: any;
  export const funky: any;
  export const ghcolors: any;
  export const gruvboxDark: any;
  export const gruvboxLight: any;
  export const holiTheme: any;
  export const hopscotch: any;
  export const lucario: any;
  export const materialDark: any;
  export const materialLight: any;
  export const materialOceanic: any;
  export const nightOwl: any;
  export const nord: any;
  export const okaidia: any;
  export const pojoaque: any;
  export const prism: any;
  export const shadesOfPurple: any;
  export const solarizedDarkAtom: any;
  export const solarizedlight: any;
  export const synthwave84: any;
  export const tomorrow: any;
  export const twilight: any;
  export const xonokai: any;
  export const zTouch: any;
}

declare module 'react-syntax-highlighter/dist/esm/languages/prism/tsx' {
  const tsx: any;
  export default tsx;
}

declare module 'react-syntax-highlighter/dist/esm/languages/prism/typescript' {
  const typescript: any;
  export default typescript;
}

declare module 'react-syntax-highlighter/dist/esm/languages/prism/javascript' {
  const javascript: any;
  export default javascript;
}

declare module 'react-syntax-highlighter/dist/esm/languages/prism/rust' {
  const rust: any;
  export default rust;
}

declare module 'react-syntax-highlighter/dist/esm/languages/prism/json' {
  const json: any;
  export default json;
}

declare module 'react-syntax-highlighter/dist/esm/languages/prism/css' {
  const css: any;
  export default css;
}

declare module 'react-syntax-highlighter/dist/esm/languages/prism/markdown' {
  const markdown: any;
  export default markdown;
}

declare module 'react-syntax-highlighter/dist/esm/languages/prism/python' {
  const python: any;
  export default python;
}

declare module 'react-syntax-highlighter/dist/esm/languages/prism/go' {
  const go: any;
  export default go;
}

declare module 'react-syntax-highlighter/dist/esm/languages/prism/java' {
  const java: any;
  export default java;
}

declare module 'react-syntax-highlighter/dist/esm/languages/prism/c' {
  const c: any;
  export default c;
}

declare module 'react-syntax-highlighter/dist/esm/languages/prism/cpp' {
  const cpp: any;
  export default cpp;
}
