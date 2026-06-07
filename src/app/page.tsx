'use client';

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { Sidebar } from '@/components/Sidebar';
import { FileExplorer } from '@/components/FileExplorer';
import { Menu, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { ExternalLink } from 'lucide-react';

const PdfViewer = dynamic(() => import('@/components/viewers/PdfViewer').then(mod => mod.PdfViewer), { ssr: false });
const MarkdownViewer = dynamic(() => import('@/components/viewers/MarkdownViewer').then(mod => mod.MarkdownViewer), { ssr: false });
const DocxViewer = dynamic(() => import('@/components/viewers/DocxViewer').then(mod => mod.DocxViewer), { ssr: false });
import { HtmlViewer } from '@/components/viewers/HtmlViewer';
import { useDocStore } from '@/store/useDocStore';
import { useAuthHandler } from '@/hooks/useAuthHandler';
import { useDocumentFetcher } from '@/hooks/useDocumentFetcher';
import { Toast, ToastType } from '@/components/Toast';

export default function Home() {
  const {
    selectedDoc,
    setSelectedDoc,
    theme,
    colorScheme,
  } = useDocStore();

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: ToastType; isVisible: boolean }>({
    message: '',
    type: 'info',
    isVisible: false
  });

  const showToast = (message: string, type: ToastType) => {
    setToast({ message, type, isVisible: true });
  };

  // Custom hooks for auth and document fetching
  useAuthHandler(showToast);
  useDocumentFetcher();

  // Apply theme attributes to document element
  useEffect(() => {
    const root = window.document.documentElement;

    const applyTheme = () => {
      let actualTheme = theme;
      if (theme === 'system') {
        actualTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
      }
      root.setAttribute('data-theme', actualTheme);
    };

    applyTheme();
    root.setAttribute('data-color-scheme', colorScheme);

    if (theme === 'system') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      const handleChange = () => applyTheme();
      mediaQuery.addEventListener('change', handleChange);
      return () => mediaQuery.removeEventListener('change', handleChange);
    }
  }, [theme, colorScheme]);

  const renderViewer = () => {
    if (!selectedDoc) return null;

    const getSourceUrl = () => {
      if (selectedDoc.source === 'gdrive') return `https://drive.google.com/file/d/${selectedDoc.id}/view`;
      if (selectedDoc.source === 'notion') return `https://notion.so/${selectedDoc.id.replace(/-/g, '')}`;
      return null;
    };

    const sourceUrl = getSourceUrl();

    return (
      <div className="fixed inset-0 z-50 bg-surface flex flex-col md:relative md:inset-auto md:flex-1 h-full">
        <div className="flex items-center justify-between p-4 border-b border-outline/20">
          <div className="flex items-center gap-3 flex-1 min-w-0 pr-4">
            <h2 className="text-lg font-medium truncate">{selectedDoc.name}</h2>
            {sourceUrl && (
              <a
                href={sourceUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="p-1.5 text-primary hover:bg-primary-container rounded-lg transition-colors shrink-0"
                title="Open in Source"
              >
                <ExternalLink size={18} />
              </a>
            )}
          </div>
          <button
            onClick={() => setSelectedDoc(null)}
            className="p-2 hover:bg-surface-variant rounded-full"
          >
            <X size={20} />
          </button>
        </div>
        <div className="flex-1 overflow-hidden">
          {selectedDoc.type.includes('pdf') && <PdfViewer doc={selectedDoc} />}
          {(selectedDoc.type.includes('markdown') || selectedDoc.name.endsWith('.md')) && <MarkdownViewer doc={selectedDoc} />}
          {(selectedDoc.type.includes('html') || selectedDoc.name.endsWith('.html')) && <HtmlViewer doc={selectedDoc} />}
          {(selectedDoc.type.includes('word') || selectedDoc.name.endsWith('.docx')) && <DocxViewer doc={selectedDoc} />}
        </div>
      </div>
    );
  };

  return (
    <div className="flex h-screen overflow-hidden bg-surface text-on-surface">
      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsSidebarOpen(true)}
        className="md:hidden fixed bottom-6 right-6 z-40 bg-primary text-on-primary p-4 rounded-2xl shadow-lg"
      >
        <Menu size={24} />
      </button>

      {/* Sidebar - Desktop */}
      <div className="hidden md:block">
        <Sidebar />
      </div>

      {/* Sidebar - Mobile */}
      <AnimatePresence>
        {isSidebarOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsSidebarOpen(false)}
              className="fixed inset-0 bg-black/50 z-40 md:hidden"
            />
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed inset-y-0 left-0 w-72 z-50 md:hidden"
            >
              <Sidebar />
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <div className="flex-1 flex flex-col min-w-0">
        <FileExplorer />
      </div>

      {selectedDoc && renderViewer()}

      <Toast
        message={toast.message}
        type={toast.type}
        isVisible={toast.isVisible}
        onClose={() => setToast(prev => ({ ...prev, isVisible: false }))}
      />
    </div>
  );
}
