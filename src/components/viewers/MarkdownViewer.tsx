'use client';

import React from 'react';
import { DocItem } from '@/types';
import { Download } from 'lucide-react';
import MarkdownIt from 'markdown-it';

const md = new MarkdownIt();

export const MarkdownViewer = ({ doc }: { doc: DocItem }) => {
  const content = typeof doc.content === 'string'
    ? doc.content
    : doc.content instanceof ArrayBuffer
      ? new TextDecoder().decode(doc.content)
      : '# No content available';

  const htmlContent = md.render(content);

  return (
    <div className="flex flex-col h-full bg-surface">
      <div className="bg-surface px-6 py-2 border-b border-outline/10 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="px-2 py-0.5 bg-primary/10 text-primary rounded text-[10px] font-bold uppercase">Markdown</span>
        </div>
        <button className="p-2 hover:bg-primary-container text-primary rounded-xl transition-colors">
          <Download size={20} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-6 md:p-12">
        <article
          className="prose dark:prose-invert max-w-3xl mx-auto prose-headings:text-primary prose-a:text-primary prose-img:rounded-2xl"
          dangerouslySetInnerHTML={{ __html: htmlContent }}
        />
      </div>
    </div>
  );
};
