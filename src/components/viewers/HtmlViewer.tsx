'use client';

import React from 'react';
import { DocItem } from '@/types';
import { X, Maximize2, Download } from 'lucide-react';
import { useDocStore } from '@/store/useDocStore';

export const HtmlViewer = ({ doc }: { doc: DocItem }) => {
  const { setSelectedDoc } = useDocStore();
  const content = typeof doc.content === 'string' ? doc.content : '<html><body>No content available</body></html>';

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-5xl h-full max-h-[90vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden">
        <header className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-orange-50 text-orange-600 rounded-lg">
              <span className="font-bold text-xs">HTML</span>
            </div>
            <h3 className="font-semibold text-gray-900">{doc.name}</h3>
          </div>
          <div className="flex items-center gap-2">
            <button className="p-2 hover:bg-gray-100 rounded-lg text-gray-500 transition-colors">
              <Download size={20} />
            </button>
            <button className="p-2 hover:bg-gray-100 rounded-lg text-gray-500 transition-colors">
              <Maximize2 size={20} />
            </button>
            <div className="w-px h-6 bg-gray-200 mx-2" />
            <button
              onClick={() => setSelectedDoc(null)}
              className="p-2 hover:bg-red-50 hover:text-red-600 rounded-lg text-gray-500 transition-colors"
            >
              <X size={20} />
            </button>
          </div>
        </header>

        <div className="flex-1 bg-white overflow-hidden">
          <iframe
            srcDoc={content}
            className="w-full h-full border-none"
            title={doc.name}
          />
        </div>
      </div>
    </div>
  );
};
