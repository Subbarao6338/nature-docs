'use client';

import React, { useEffect, useState } from 'react';
import { DocItem } from '@/types';
import { X, Maximize2, Download } from 'lucide-react';
import { useDocStore } from '@/store/useDocStore';
import mammoth from 'mammoth';

export const DocxViewer = ({ doc }: { doc: DocItem }) => {
  const { setSelectedDoc } = useDocStore();
  const [htmlContent, setHtmlContent] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const convertDocx = async () => {
      if (!doc.content) {
        setLoading(false);
        return;
      }

      try {
        let arrayBuffer: ArrayBuffer;
        if (typeof doc.content === 'string') {
          // If it's a string, it might be a data URL or base64
          if (doc.content.startsWith('data:')) {
             const response = await fetch(doc.content);
             arrayBuffer = await response.arrayBuffer();
          } else {
             // Assume it's a raw string, though DOCX shouldn't be
             const encoder = new TextEncoder();
             arrayBuffer = encoder.encode(doc.content).buffer;
          }
        } else {
          arrayBuffer = doc.content;
        }

        const result = await mammoth.convertToHtml({ arrayBuffer });
        setHtmlContent(result.value);
      } catch (err) {
        console.error('Error converting DOCX:', err);
        setError('Failed to convert DOCX to HTML');
      } finally {
        setLoading(false);
      }
    };

    convertDocx();
  }, [doc.content]);

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-5xl h-full max-h-[90vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden">
        <header className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
              <span className="font-bold text-xs">DOCX</span>
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

        <div className="flex-1 overflow-y-auto p-12 bg-white">
          {loading ? (
            <div className="flex items-center justify-center h-full">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center h-full text-red-500">
              <p>{error}</p>
            </div>
          ) : (
            <article
              className="prose prose-slate max-w-3xl mx-auto"
              dangerouslySetInnerHTML={{ __html: htmlContent }}
            />
          )}
        </div>
      </div>
    </div>
  );
};
