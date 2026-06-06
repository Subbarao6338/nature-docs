'use client';

import React from 'react';
import { DocItem } from '@/types';
import { Download } from 'lucide-react';
import DOMPurify from 'dompurify';
import { downloadFile } from '@/lib/utils/download';

export const HtmlViewer = ({ doc }: { doc: DocItem }) => {
  const content = typeof doc.content === 'string'
    ? doc.content
    : doc.content instanceof ArrayBuffer
      ? new TextDecoder().decode(doc.content)
      : '<html><body>No content available</body></html>';

  const sanitizedHtml = typeof window !== 'undefined' ? DOMPurify.sanitize(content, { WHOLE_DOCUMENT: true }) : content;

  return (
    <div className="flex flex-col h-full bg-white">
      <div className="bg-surface px-6 py-2 border-b border-outline/10 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="px-2 py-0.5 bg-orange-500/10 text-orange-600 rounded text-[10px] font-bold uppercase">HTML</span>
        </div>
        <button
          onClick={() => doc.content && downloadFile(doc.name, doc.content, doc.type)}
          className="p-2 hover:bg-primary-container text-primary rounded-xl transition-colors"
          title="Download HTML"
        >
          <Download size={20} />
        </button>
      </div>

      <div className="flex-1 bg-white">
        <iframe
          srcDoc={sanitizedHtml}
          className="w-full h-full border-none"
          title={doc.name}
        />
      </div>
    </div>
  );
};
