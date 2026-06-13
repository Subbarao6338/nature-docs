'use client';

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { Sidebar } from '@/components/Sidebar';
import { FileExplorer } from '@/components/FileExplorer';
import { Menu, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

import { useDocStore } from '@/store/useDocStore';
import { useAuthHandler } from '@/hooks/useAuthHandler';
import { useDocumentFetcher } from '@/hooks/useDocumentFetcher';
import { Toast, ToastType } from '@/components/Toast';
import { DocViewerSelector } from '@/components/viewers/DocViewerSelector';

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
  useDocumentFetcher(showToast);

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

      <DocViewerSelector />

      <Toast
        message={toast.message}
        type={toast.type}
        isVisible={toast.isVisible}
        onClose={() => setToast(prev => ({ ...prev, isVisible: false }))}
      />
    </div>
  );
}
