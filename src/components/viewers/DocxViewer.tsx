'use client';

import React, { useEffect, useState } from 'react';
import { DocItem } from '@/types';
import { Download } from 'lucide-react';
import mammoth from 'mammoth';

export const DocxViewer = ({ doc }: { doc: DocItem }) => {
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
          if (doc.content.startsWith('data:')) {
            const response = await fetch(doc.content);
            arrayBuffer = await response.arrayBuffer();
          } else {
            // Check if it's base64 but not data URL
            try {
              const binaryString = window.atob(doc.content);
              const bytes = new Uint8Array(binaryString.length);
              for (let i = 0; i < binaryString.length; i++) {
                bytes[i] = binaryString.charCodeAt(i);
              }
              arrayBuffer = bytes.buffer;
            } catch {
              // Not base64, treat as UTF-8 string (unlikely for docx)
              const encoder = new TextEncoder();
              arrayBuffer = encoder.encode(doc.content).buffer;
            }
          }
        } else if (doc.content instanceof ArrayBuffer) {
          arrayBuffer = doc.content;
        } else {
          throw new Error('Unsupported document content format');
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
    <div className="flex flex-col h-full bg-surface">
      <div className="bg-surface px-6 py-2 border-b border-outline/10 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="px-2 py-0.5 bg-blue-500/10 text-blue-600 rounded text-[10px] font-bold uppercase">Word</span>
        </div>
        <button className="p-2 hover:bg-primary-container text-primary rounded-xl transition-colors">
          <Download size={20} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-6 md:p-12">
        {loading ? (
          <div className="flex flex-col items-center justify-center h-full gap-4">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
            <p className="text-on-surface-variant font-medium">Converting Word document...</p>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center h-full text-red-500 gap-2">
            <p className="font-bold">Error</p>
            <p>{error}</p>
          </div>
        ) : (
          <article
            className="prose dark:prose-invert max-w-3xl mx-auto prose-headings:text-primary prose-a:text-primary"
            dangerouslySetInnerHTML={{ __html: htmlContent }}
          />
        )}
      </div>
    </div>
  );
};
