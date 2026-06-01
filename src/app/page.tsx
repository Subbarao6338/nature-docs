'use client';

import { useEffect } from 'react';
import dynamic from 'next/dynamic';
import { Sidebar } from '@/components/Sidebar';
import { FileExplorer } from '@/components/FileExplorer';

const PdfViewer = dynamic(() => import('@/components/viewers/PdfViewer').then(mod => mod.PdfViewer), { ssr: false });
const MarkdownViewer = dynamic(() => import('@/components/viewers/MarkdownViewer').then(mod => mod.MarkdownViewer), { ssr: false });
const DocxViewer = dynamic(() => import('@/components/viewers/DocxViewer').then(mod => mod.DocxViewer), { ssr: false });
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
    setSelectedDoc,
    setSelectedAccount
  } = useDocStore();

  // Handle OAuth callbacks
  useEffect(() => {
    const fetchToken = async () => {
      const url = new URL(window.location.href);
      const source = url.searchParams.get('source');

      if (source && (source === 'gdrive' || source === 'notion')) {
        try {
          const res = await fetch(`/api/auth/token?source=${source}`);
          if (res.ok) {
            const { accessToken } = await res.json();
            const id = Math.random().toString(36).substring(7);
            const name = url.searchParams.get('workspaceName') || (source === 'gdrive' ? 'Google Drive' : 'Notion');

            addAccount({
              id,
              name,
              source: source as any,
              connected: true,
              accessToken
            });
            setSelectedAccount(id);
          }
        } catch (error) {
          console.error('Failed to fetch token from cookie:', error);
        } finally {
          // Clean up URL
          window.history.replaceState({}, document.title, "/");
        }
      }
    };

    fetchToken();
  }, [addAccount, setSelectedAccount]);

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
    if (selectedDoc.type.includes('word') || selectedDoc.name.endsWith('.docx')) {
      return <DocxViewer doc={selectedDoc} />;
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
