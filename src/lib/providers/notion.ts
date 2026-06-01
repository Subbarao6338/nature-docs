import { DocItem, Account } from '@/types';
import { DocumentProvider } from './base';
import { Client } from '@notionhq/client';

export class NotionProvider extends DocumentProvider {
  async listDocuments(account: Account): Promise<DocItem[]> {
    const token = account.accessToken || account.apiKey;
    if (!token) return [];

    const notion = new Client({ auth: token });

    try {
      const response = await notion.search({
        filter: { property: 'object', value: 'page' },
        sort: { direction: 'descending', timestamp: 'last_edited_time' }
      });

      return response.results.map((page: any) => ({
        id: page.id,
        name: page.properties?.title?.title?.[0]?.plain_text ||
              page.properties?.Name?.title?.[0]?.plain_text ||
              'Untitled',
        type: 'text/markdown',
        updatedAt: page.last_edited_time,
        source: 'notion',
        accountId: account.id
      }));
    } catch (error) {
      console.error('Notion fetch error:', error);
      return [];
    }
  }

  async getDocumentContent(doc: DocItem, account: Account): Promise<string | ArrayBuffer> {
    const token = account.accessToken || account.apiKey;
    if (!token) throw new Error('Missing Notion token');

    const notion = new Client({ auth: token });

    try {
      const blocks = await notion.blocks.children.list({ block_id: doc.id });

      // Extremely simple block to markdown conversion
      let markdown = '';
      for (const block of blocks.results as any[]) {
        if (block.type === 'paragraph') {
          markdown += block.paragraph.rich_text.map((t: any) => t.plain_text).join('') + '\n\n';
        } else if (block.type === 'heading_1') {
          markdown += '# ' + block.heading_1.rich_text.map((t: any) => t.plain_text).join('') + '\n\n';
        } else if (block.type === 'heading_2') {
          markdown += '## ' + block.heading_2.rich_text.map((t: any) => t.plain_text).join('') + '\n\n';
        }
        // Add more block types as needed
      }

      return markdown || '# No content in Notion page';
    } catch (error) {
      console.error('Failed to fetch Notion page content:', error);
      throw error;
    }
  }
}
