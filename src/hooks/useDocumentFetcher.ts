import { useEffect } from 'react';
import { useDocStore } from '@/store/useDocStore';
import { DocItem } from '@/types';
import { GDriveProvider } from '@/lib/providers/gdrive';
import { NotionProvider } from '@/lib/providers/notion';
import { MegaProvider } from '@/lib/providers/mega';
import { LocalProvider } from '@/lib/providers/local';

export const useDocumentFetcher = () => {
  const {
    selectedSource,
    selectedAccount,
    accounts,
    setDocuments,
    setLoading,
    refreshTrigger,
    selectedDoc,
    setSelectedDoc,
    documents
  } = useDocStore();

  // Fetch list of documents
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
  }, [selectedSource, selectedAccount, accounts, setDocuments, setLoading, refreshTrigger]);

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
          setDocuments(documents.map((d: DocItem) =>
            d.id === selectedDoc.id ? { ...d, content } : d
          ));
          setSelectedDoc({ ...selectedDoc, content });
        }
      } catch (error) {
        console.error('Failed to fetch document content:', error);
      }
    };

    fetchContent();
  }, [selectedDoc, accounts, setDocuments, setSelectedDoc]);
};
