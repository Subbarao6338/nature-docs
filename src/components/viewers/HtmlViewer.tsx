'use client';

import React from 'react';
import { DocItem } from '@/types';
import { Download } from 'lucide-react';

export const HtmlViewer = ({ doc }: { doc: DocItem }) => {
  const content = typeof doc.content === 'string'
    ? doc.content
    : doc.content instanceof ArrayBuffer
      ? new TextDecoder().decode(doc.content)
      : '<html><body>No content available</body></html>';

  return (
    <div className="flex flex-col h-full bg-white">
      <div className="bg-surface px-6 py-2 border-b border-outline/10 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="px-2 py-0.5 bg-orange-500/10 text-orange-600 rounded text-[10px] font-bold uppercase">HTML</span>
        </div>
        <button className="p-2 hover:bg-primary-container text-primary rounded-xl transition-colors">
          <Download size={20} />
        </button>
      </div>

      <div className="flex-1 bg-white">
        <iframe
          srcDoc={content}
          className="w-full h-full border-none"
          title={doc.name}
        />
      </div>
    </div>
  );
};
