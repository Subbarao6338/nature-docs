'use client';

import React, { useState } from 'react';
import { DocItem } from '@/types';
import { X, Maximize2, Download, ChevronLeft, ChevronRight } from 'lucide-react';
import { useDocStore } from '@/store/useDocStore';
import { Document, Page, pdfjs } from 'react-pdf';

// Set up the worker for react-pdf
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

export const PdfViewer = ({ doc }: { doc: DocItem }) => {
  const { setSelectedDoc } = useDocStore();
  const [numPages, setNumPages] = useState<number | null>(null);
  const [pageNumber, setPageNumber] = useState(1);

  function onDocumentLoadSuccess({ numPages }: { numPages: number }) {
    setNumPages(numPages);
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-5xl h-full max-h-[90vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden">
        <header className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-50 text-red-600 rounded-lg">
              <span className="font-bold text-xs">PDF</span>
            </div>
            <h3 className="font-semibold text-gray-900">{doc.name}</h3>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2 mr-4">
              <button
                disabled={pageNumber <= 1}
                onClick={() => setPageNumber(prev => prev - 1)}
                className="p-1 hover:bg-gray-100 disabled:opacity-30 rounded"
              >
                <ChevronLeft size={20} />
              </button>
              <span className="text-sm">Page {pageNumber} of {numPages || '--'}</span>
              <button
                disabled={numPages ? pageNumber >= numPages : true}
                onClick={() => setPageNumber(prev => prev + 1)}
                className="p-1 hover:bg-gray-100 disabled:opacity-30 rounded"
              >
                <ChevronRight size={20} />
              </button>
            </div>
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

        <div className="flex-1 bg-gray-100 overflow-y-auto p-8 flex justify-center">
          <div className="bg-white w-full max-w-3xl shadow-lg min-h-full p-4 flex flex-col items-center">
             <Document
               file={doc.url || doc.content}
               onLoadSuccess={onDocumentLoadSuccess}
               loading={<div className="p-20">Loading PDF...</div>}
             >
               <Page pageNumber={pageNumber} renderTextLayer={true} renderAnnotationLayer={true} />
             </Document>
          </div>
        </div>
      </div>
    </div>
  );
};
