'use client';

import React from 'react';
import dynamic from 'next/dynamic';
import { X } from 'lucide-react';
import { useDocStore } from '@/store/useDocStore';
import { ViewerHeader } from './ViewerHeader';

const PdfViewer = dynamic(() => import('./PdfViewer').then(mod => mod.PdfViewer), { ssr: false });
const MarkdownViewer = dynamic(() => import('./MarkdownViewer').then(mod => mod.MarkdownViewer), { ssr: false });
const DocxViewer = dynamic(() => import('./DocxViewer').then(mod => mod.DocxViewer), { ssr: false });
const HtmlViewer = dynamic(() => import('./HtmlViewer').then(mod => mod.HtmlViewer), { ssr: false });

export const DocViewerSelector = () => {
  const { selectedDoc, setSelectedDoc } = useDocStore();

  if (!selectedDoc) return null;

  const type = selectedDoc.type.toLowerCase();
  const name = selectedDoc.name.toLowerCase();
  const isPdf = type.includes('pdf');
  const isMarkdown = type.includes('markdown') || type.includes('plain') || name.endsWith('.md') || name.endsWith('.txt');
  const isHtml = type.includes('html') || name.endsWith('.html');
  const isWord = type.includes('word') || type.includes('officedocument.wordprocessingml.document') || name.endsWith('.docx');

  const hasViewer = isPdf || isMarkdown || isHtml || isWord;

  return (
    <div className="fixed inset-0 z-50 bg-surface flex flex-col md:relative md:inset-auto md:flex-1 h-full">
      {!hasViewer && <ViewerHeader doc={selectedDoc} onClose={() => setSelectedDoc(null)} />}
      <div className="flex-1 overflow-hidden">
        {isPdf && <PdfViewer doc={selectedDoc} />}
        {isMarkdown && <MarkdownViewer doc={selectedDoc} />}
        {isHtml && <HtmlViewer doc={selectedDoc} />}
        {isWord && <DocxViewer doc={selectedDoc} />}

        {!hasViewer && (
          <div className="flex flex-col items-center justify-center h-full text-on-surface-variant p-6 text-center">
            <div className="p-6 bg-surface-variant/20 rounded-full mb-6">
              <X size={64} className="opacity-20" />
            </div>
            <h3 className="text-xl font-semibold text-on-surface">No viewer available</h3>
            <p className="mt-2 max-w-xs">We don&apos;t support previewing this file type yet. You can still download it using the button in the header.</p>
          </div>
        )}
      </div>
    </div>
  );
};
