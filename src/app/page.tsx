'use client';

import { useEffect } from 'react';
import dynamic from 'next/dynamic';
import { Sidebar } from '@/components/Sidebar';
import { FileExplorer } from '@/components/FileExplorer';

const PdfViewer = dynamic(() => import('@/components/viewers/PdfViewer').then(mod => mod.PdfViewer), { ssr: false });
const MarkdownViewer = dynamic(() => import('@/components/viewers/MarkdownViewer').then(mod => mod.MarkdownViewer), { ssr: false });
import { HtmlViewer } from '@/components/viewers/HtmlViewer';
import { useDocStore } from '@/store/useDocStore';
import { GDriveProvider } from '@/lib/providers/gdrive';
import { NotionProvider } from '@/lib/providers/notion';
import { MegaProvider } from '@/lib/providers/mega';
import { LocalProvider } from '@/lib/providers/local';

export default function Home() {
  const {
    selectedDoc,
    selectedSource,
    selectedAccount,
    accounts,
    setDocuments,
    setLoading,
    addAccount,
    documents,
    setSelectedDoc
  } = useDocStore();

  // Initialize with some dummy accounts for demo
  useEffect(() => {
    if (accounts.length === 0) {
      addAccount({ id: 'acc-1', name: 'Personal Drive', source: 'gdrive', connected: true, accessToken: 'demo' });
      addAccount({ id: 'acc-2', name: 'Work Notion', source: 'notion', connected: true, apiKey: 'demo' });
      addAccount({ id: 'acc-3', name: 'Cloud Storage', source: 'mega', connected: true });
    }
  }, [accounts.length, addAccount]);

  useEffect(() => {
    const fetchDocs = async () => {
      setLoading(true);
      try {
        let provider;
        switch (selectedSource) {
          case 'gdrive': provider = new GDriveProvider(); break;
          case 'notion': provider = new NotionProvider(); break;
          case 'mega': provider = new MegaProvider(); break;
          case 'local': provider = new LocalProvider(); break;
        }

        if (provider) {
          const account = accounts.find(a => a.id === selectedAccount) || accounts.find(a => a.source === selectedSource);
          if (account || selectedSource === 'local') {
            const docs = await provider.listDocuments(account || { id: 'local', name: 'Local', source: 'local', connected: true });
            setDocuments(docs);
          } else {
            setDocuments([]);
          }
        }
      } catch (error) {
        console.error('Failed to fetch docs:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDocs();
  }, [selectedSource, selectedAccount, accounts, setDocuments, setLoading]);

  // Fetch content when a document is selected
  useEffect(() => {
    const fetchContent = async () => {
      if (!selectedDoc || selectedDoc.content) return;

      try {
        let provider;
        switch (selectedDoc.source) {
          case 'gdrive': provider = new GDriveProvider(); break;
          case 'notion': provider = new NotionProvider(); break;
          case 'mega': provider = new MegaProvider(); break;
          case 'local': provider = new LocalProvider(); break;
        }

        if (provider) {
          const account = accounts.find(a => a.id === selectedDoc.accountId);
          const content = await provider.getDocumentContent(selectedDoc, account || { id: 'local', name: 'Local', source: 'local', connected: true });

          // Update the document in the list with its content
          const updatedDocs = documents.map(d =>
            d.id === selectedDoc.id ? { ...d, content } : d
          );
          setDocuments(updatedDocs);
          setSelectedDoc({ ...selectedDoc, content });
        }
      } catch (error) {
        console.error('Failed to fetch document content:', error);
      }
    };

    fetchContent();
  }, [selectedDoc, accounts, documents, setDocuments, setSelectedDoc]);

  const renderViewer = () => {
    if (!selectedDoc) return null;

    if (selectedDoc.type.includes('pdf')) {
      return <PdfViewer doc={selectedDoc} />;
    }
    if (selectedDoc.type.includes('markdown') || selectedDoc.name.endsWith('.md')) {
      return <MarkdownViewer doc={selectedDoc} />;
    }
    if (selectedDoc.type.includes('html') || selectedDoc.name.endsWith('.html')) {
      return <HtmlViewer doc={selectedDoc} />;
    }

    return null;
  };

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <FileExplorer />
      {renderViewer()}
    </div>
  );
}
