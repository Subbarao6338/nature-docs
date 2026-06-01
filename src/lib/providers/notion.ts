import { DocItem, Account } from '@/types';
import { DocumentProvider } from './base';
import { Client } from '@notionhq/client';

export class NotionProvider extends DocumentProvider {
  async listDocuments(account: Account): Promise<DocItem[]> {
    if (!account.apiKey) return [];

    const notion = new Client({ auth: account.apiKey });

    try {
      // Placeholder for searching pages/databases in Notion
      return [
        {
          id: 'n1',
          name: 'Notion Notes.md',
          type: 'text/markdown',
          updatedAt: new Date().toISOString(),
          source: 'notion',
          accountId: account.id
        }
      ];
    } catch (error) {
      console.error('Notion fetch error:', error);
      return [];
    }
  }

  async getDocumentContent(doc: DocItem, account: Account): Promise<string | ArrayBuffer> {
    // Placeholder for fetching page content from Notion and converting to markdown
    return '# Sample Notion Content';
  }
}
