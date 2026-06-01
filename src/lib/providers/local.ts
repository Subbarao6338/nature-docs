import { DocItem, Account } from '@/types';
import { DocumentProvider } from './base';

export class LocalProvider extends DocumentProvider {
  async listDocuments(account: Account): Promise<DocItem[]> {
    // For local, we might use browser storage or just rely on manual uploads
    // In a real app, this could be indexedDB
    return [];
  }

  async getDocumentContent(doc: DocItem, account: Account): Promise<string | ArrayBuffer> {
    if (doc.content) return doc.content;
    throw new Error('Local document content missing');
  }
}
