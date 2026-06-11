'use client';

import React from 'react';
import { DocItem } from '@/types';
import { Download } from 'lucide-react';
import MarkdownIt from 'markdown-it';
import DOMPurify from 'dompurify';
import hljs from 'highlight.js';
import 'highlight.js/styles/github-dark.css';
import { downloadFile } from '@/lib/utils/download';
import { getFileIconInfo } from '@/lib/utils/icons';
import { clsx } from 'clsx';

const md: MarkdownIt = new MarkdownIt({
  highlight: function (str, lang) {
    if (lang && hljs.getLanguage(lang)) {
      try {
        return '<pre><code class="hljs">' +
               hljs.highlight(str, { language: lang, ignoreIllegals: true }).value +
               '</code></pre>';
      } catch (__) {}
    }

    return '<pre><code class="hljs">' + md.utils.escapeHtml(str) + '</code></pre>';
  }
});

export const MarkdownViewer = ({ doc }: { doc: DocItem }) => {
  const content = typeof doc.content === 'string'
    ? doc.content
    : doc.content instanceof ArrayBuffer
      ? new TextDecoder().decode(doc.content)
      : '# No content available';

  const htmlContent = md.render(content);
  const sanitizedHtml = typeof window !== 'undefined' ? DOMPurify.sanitize(htmlContent) : htmlContent;

  return (
    <div className="flex flex-col h-full bg-surface">
      <div className="bg-surface px-6 py-2 border-b border-outline/10 flex items-center justify-between">
        <div className="flex items-center gap-3">
          {(() => {
            const iconInfo = getFileIconInfo(doc.type, doc.name);
            const Icon = iconInfo.icon;
            return (
              <>
                <div className={clsx("p-1.5 rounded-lg", iconInfo.bgColor, iconInfo.color)}>
                  <Icon size={16} />
                </div>
                <span className="text-xs font-bold uppercase tracking-wider text-on-surface-variant">
                  {iconInfo.label}
                </span>
              </>
            );
          })()}
        </div>
        <button
          onClick={() => doc.content && downloadFile(doc.name, doc.content, doc.type)}
          className="p-2 hover:bg-primary-container text-primary rounded-xl transition-colors"
          title="Download Markdown"
        >
          <Download size={20} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-6 md:p-12">
        <article
          className="prose dark:prose-invert max-w-3xl mx-auto prose-headings:text-primary prose-a:text-primary prose-img:rounded-2xl"
          dangerouslySetInnerHTML={{ __html: sanitizedHtml }}
        />
      </div>
    </div>
  );
};
