import React from 'react';
import { cn } from '../../lib/utils';

interface MarkdownProps {
  content: string;
  className?: string;
}

export function Markdown({ content, className }: MarkdownProps) {
  const lines = content.split('\n');
  const elements: React.ReactNode[] = [];
  
  let inCodeBlock = false;
  let codeBlockLang = '';
  let codeBlockContent: string[] = [];
  let inList = false;
  let listItems: React.ReactNode[] = [];

  const flushList = () => {
    if (inList && listItems.length > 0) {
      elements.push(
        <ul key={`list-${elements.length}`} className="list-disc list-outside ml-4 mb-4 space-y-1">
          {listItems}
        </ul>
      );
      listItems = [];
      inList = false;
    }
  };

  const parseInline = (text: string): React.ReactNode[] => {
    // Simple inline parsing for **bold** and `code`
    // Use a more robust split logic or simply regex match/replace
    // For now, let's just make sure we handle the segments correctly
    const parts = text.split(/(\*\*.*?\*\*|`.*?`)/g);
    return parts.map((part, index) => {
      if (part.startsWith('**') && part.endsWith('**') && part.length >= 4) {
        return <strong key={index} className="font-bold text-foreground">{part.slice(2, -2)}</strong>;
      }
      if (part.startsWith('`') && part.endsWith('`') && part.length >= 2) {
        return <code key={index} className="bg-muted px-1.5 py-0.5 rounded text-xs font-mono text-primary border border-border/50">{part.slice(1, -1)}</code>;
      }
      return part;
    });
  };

  lines.forEach((line, i) => {
    // Code Blocks
    if (line.trim().startsWith('```')) {
      if (inCodeBlock) {
        // End code block
        elements.push(
          <div key={`code-${i}`} className="mb-4 rounded-md overflow-hidden border bg-muted/50">
            {codeBlockLang && (
              <div className="bg-muted px-3 py-1 text-xs text-muted-foreground border-b flex justify-between">
                <span>{codeBlockLang}</span>
              </div>
            )}
            <pre className="p-3 text-xs overflow-x-auto custom-scrollbar font-mono">
              <code>{codeBlockContent.join('\n')}</code>
            </pre>
          </div>
        );
        inCodeBlock = false;
        codeBlockContent = [];
        codeBlockLang = '';
      } else {
        // Start code block
        flushList();
        inCodeBlock = true;
        codeBlockLang = line.trim().slice(3).trim();
      }
      return;
    }

    if (inCodeBlock) {
      codeBlockContent.push(line);
      return;
    }

    // Headlines
    if (line.startsWith('# ')) {
      flushList();
      elements.push(<h1 key={`h1-${i}`} className="text-xl font-bold mt-6 mb-3 text-foreground">{parseInline(line.slice(2))}</h1>);
      return;
    }
    if (line.startsWith('## ')) {
      flushList();
      elements.push(<h2 key={`h2-${i}`} className="text-lg font-bold mt-5 mb-2 text-foreground">{parseInline(line.slice(3))}</h2>);
      return;
    }
    if (line.startsWith('### ')) {
      flushList();
      elements.push(<h3 key={`h3-${i}`} className="text-base font-semibold mt-4 mb-2 text-foreground">{parseInline(line.slice(4))}</h3>);
      return;
    }

    // Lists
    const trimmed = line.trim();
    if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
      inList = true;
      const content = trimmed.substring(2);
      // Check for indentation level
      const indent = line.search(/\S|$/);
      const isNested = indent >= 2;
      
      listItems.push(
        <li 
          key={`li-${i}`} 
          className={cn(
            "text-sm text-foreground/80 leading-relaxed",
            isNested && "ml-4 font-normal"
          )}
        >
          {parseInline(content)}
        </li>
      );
      return;
    }
    
    // Numbered Lists (Simple check)
    if (/^\d+\.\s/.test(trimmed)) {
       flushList();
       elements.push(
         <div key={`p-${i}`} className="mb-2 text-sm text-foreground font-semibold mt-4">
           {parseInline(trimmed)}
         </div>
       );
       return;
    }

    flushList();

    // Empty lines
    if (!line.trim()) {
      return;
    }

    // Paragraphs
    elements.push(<p key={`p-${i}`} className="mb-2 text-sm text-foreground/80 leading-relaxed">{parseInline(line)}</p>);
  });

  // Flush remaining
  flushList();

  return <div className={cn("markdown-content", className)}>{elements}</div>;
}
